import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger, isLocalDevelopment, enrichBlocksWithChildren, fetchNotionBlockChildren } from '../_shared'
import { API_CONFIG } from '../config'
import { NotionDatabaseQueryResponse, getTitle, getSlug, getTags, getDate } from '../types/notion'

interface Env {
  DB?: D1Database
  NOTION_API_KEY?: string
  NOTION_DATABASE_ID?: string
}

interface PostDetailRow {
  id: string
  title: string
  slug: string
  tags: string
  date: string | null
  blocks: string
}

function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB, NOTION_API_KEY, NOTION_DATABASE_ID } = context.env
  const slug = context.params.slug as string
  const url = new URL(context.request.url)
  const isLocalDev = isLocalDevelopment(url)
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'posts-slug')
    if (!allowed) {
      return rateLimitResponse(corsHeaders)
    }
  }

  // Prefer D1 CMS posts once at least one post has been imported
  if (DB) {
    try {
      const countRow = await DB.prepare('SELECT COUNT(*) AS total FROM posts').first<{ total: number }>()
      if (Number(countRow?.total ?? 0) > 0) {
        const row = await DB.prepare(
          'SELECT id, title, slug, tags, date, blocks FROM posts WHERE slug = ? AND published = 1',
        )
          .bind(slug)
          .first<PostDetailRow>()

        if (!row) {
          return errorResponse(404, 'Post not found', corsHeaders)
        }

        const post = {
          id: row.id,
          title: row.title,
          slug: row.slug,
          tags: parseJsonArray<string>(row.tags).filter((x) => typeof x === 'string'),
          date: row.date,
          blocks: parseJsonArray(row.blocks),
        }

        return new Response(JSON.stringify(post), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
            'Cache-Control': isLocalDev ? 'no-store' : 'public, max-age=60',
          },
        })
      }
    } catch (err) {
      logger.warn('D1 post detail read failed, falling back to Notion', {
        endpoint: 'posts/slug',
        slug,
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return errorResponse(500, 'Server configuration error', corsHeaders)
  }

  const cacheKey = new Request(context.request.url)
  const cache = caches.default

  // Check cache first (skip in local development for fresh content)
  if (!isLocalDev) {
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      return cachedResponse
    }
  }

  try {
    // Find the page by slug
    const queryResponse = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': API_CONFIG.NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Slug', rich_text: { equals: slug } },
              { property: 'Published', checkbox: { equals: true } },
            ],
          },
        }),
      }
    )

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      logger.error('Notion API error', { endpoint: 'posts/slug', status: queryResponse.status, slug, detail: errorText })
      return errorResponse(500, 'Failed to fetch post', corsHeaders)
    }

    const queryData = await queryResponse.json() as NotionDatabaseQueryResponse

    if (queryData.results.length === 0) {
      return errorResponse(404, 'Post not found', corsHeaders)
    }

    const page = queryData.results[0]

    // Fetch all page blocks with pagination
    let fetchError: { status: number; detail: string } | null = null
    const allBlocks = await fetchNotionBlockChildren({
      blockId: page.id,
      apiKey: NOTION_API_KEY,
      onError: (status, detail) => {
        fetchError = { status, detail }
        logger.error('Failed to fetch blocks', { endpoint: 'posts/slug', status, slug, detail })
      },
    })

    // If we got an error on the first page (no blocks), return error
    if (fetchError && allBlocks.length === 0) {
      return errorResponse(500, 'Failed to fetch content', corsHeaders)
    }

    // Recursively fetch children for all blocks
    const enrichedBlocks = await enrichBlocksWithChildren(allBlocks, {
      apiKey: NOTION_API_KEY,
      onError: (status, blockId, detail) => {
        logger.warn('Failed to fetch block children', { endpoint: 'posts/slug', status, blockId, detail })
      },
    })

    const post = {
      id: page.id,
      title: getTitle(page),
      slug: getSlug(page),
      tags: getTags(page),
      date: getDate(page),
      blocks: enrichedBlocks,
    }

    const jsonResponse = new Response(JSON.stringify(post), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        'Cache-Control': isLocalDev ? 'no-store' : `public, max-age=${API_CONFIG.CACHE_TTL.DETAIL}`,
      },
    })

    // Store in cache (non-blocking, skip in local development)
    if (!isLocalDev) {
      context.waitUntil(cache.put(cacheKey, jsonResponse.clone()))
    }

    return jsonResponse
  } catch (error) {
    logger.error('Unexpected error', { endpoint: 'posts/slug', slug, detail: String(error) })
    return errorResponse(500, 'An unexpected error occurred', corsHeaders)
  }
}
