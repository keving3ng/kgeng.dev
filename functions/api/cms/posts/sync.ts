import { errorResponse, logger } from '../../_shared'
import {
  SyncedNotionPost,
  fetchNotionPageById,
  fetchNotionPostPages,
  fetchNotionPostWithBlocks,
} from '../../posts/_notion'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from '../../trips/_helpers'

interface SyncEnv extends TripsEnv {
  NOTION_API_KEY?: string
  NOTION_DATABASE_ID?: string
}

export const onRequestOptions: PagesFunction<SyncEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestPost: PagesFunction<SyncEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  if (!env.NOTION_API_KEY || !env.NOTION_DATABASE_ID) {
    return errorResponse(503, 'notion integration is not configured', corsHeaders)
  }

  try {
    let notionPageId: string | undefined
    try {
      const body = (await request.json()) as { notionPageId?: string }
      notionPageId = body.notionPageId?.trim() || undefined
    } catch {
      // Empty body means sync all posts
    }

    const pages = notionPageId
      ? [await fetchNotionPageById(env.NOTION_API_KEY, notionPageId)]
      : await fetchNotionPostPages(env.NOTION_API_KEY, env.NOTION_DATABASE_ID)

    // Fetch blocks in small batches to respect Notion API rate limits
    const syncedPosts: SyncedNotionPost[] = []
    const batchSize = 3
    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize)
      const results = await Promise.all(
        batch.map((page) => fetchNotionPostWithBlocks(env.NOTION_API_KEY!, page)),
      )
      syncedPosts.push(...results)
    }

    const { results: existingRows } = await env.DB!.prepare(
      'SELECT notion_page_id FROM posts WHERE notion_page_id IS NOT NULL',
    ).all<{ notion_page_id: string }>()
    const existingSet = new Set((existingRows ?? []).map((r) => r.notion_page_id))

    let created = 0
    let updated = 0
    for (const post of syncedPosts) {
      if (existingSet.has(post.notionPageId)) updated++
      else created++
    }

    const statements = syncedPosts.map((post) =>
      env.DB!.prepare(`
        INSERT INTO posts (id, notion_page_id, title, slug, tags, date, published, blocks, synced_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(notion_page_id) DO UPDATE SET
          title = excluded.title,
          slug = excluded.slug,
          tags = excluded.tags,
          date = excluded.date,
          published = excluded.published,
          blocks = excluded.blocks,
          synced_at = datetime('now'),
          updated_at = datetime('now')
      `).bind(
        post.id,
        post.notionPageId,
        post.title,
        post.slug,
        JSON.stringify(post.tags),
        post.date,
        post.published ? 1 : 0,
        JSON.stringify(post.blocks),
      ),
    )

    if (statements.length > 0) {
      await env.DB!.batch(statements)
    }

    return jsonResponse(
      {
        synced: syncedPosts.length,
        created,
        updated,
      },
      200,
      corsHeaders,
    )
  } catch (err) {
    logger.error('Failed to sync posts from Notion', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return errorResponse(500, 'failed to sync posts from notion', corsHeaders)
  }
}
