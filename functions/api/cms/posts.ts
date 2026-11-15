import { errorResponse, logger } from '../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from '../trips/_helpers'

interface CmsPostRow {
  id: string
  notion_page_id: string | null
  title: string
  slug: string
  tags: string
  date: string | null
  published: number
  block_count: number
  synced_at: string
  created_at: string
  updated_at: string
}

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestGet: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  try {
    const { results } = await env.DB!.prepare(`
      SELECT id, notion_page_id, title, slug, tags, date, published,
             json_array_length(blocks) AS block_count,
             synced_at, created_at, updated_at
      FROM posts
      ORDER BY COALESCE(date, created_at) DESC, created_at DESC
    `).all<CmsPostRow>()

    const posts = (results ?? []).map((row) => ({
      id: row.id,
      notionPageId: row.notion_page_id,
      title: row.title,
      slug: row.slug,
      tags: parseTags(row.tags),
      date: row.date,
      published: Boolean(row.published),
      blockCount: Number(row.block_count ?? 0),
      syncedAt: row.synced_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return jsonResponse(posts, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to list CMS posts', { error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to list posts', corsHeaders)
  }
}

export const onRequestDelete: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const url = new URL(request.url)
  const id = url.searchParams.get('id')?.trim()
  if (!id) {
    return errorResponse(400, 'post id is required', corsHeaders)
  }

  try {
    await env.DB!.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to delete CMS post', { error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to delete post', corsHeaders)
  }
}
