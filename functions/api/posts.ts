import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger, isLocalDevelopment } from './_shared'
import { API_CONFIG } from './config'
import { NotionDatabaseQueryResponse, getTitle, getSlug, getTags, getDate } from './types/notion'

interface Env {
  DB?: D1Database
  NOTION_API_KEY?: string
  NOTION_DATABASE_ID?: string
}

interface PostRow {
  id: string
  title: string
  slug: string
  tags: string
  date: string | null
}

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB, NOTION_API_KEY, NOTION_DATABASE_ID } = context.env
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  const url = new URL(context.request.url)
  const isLocalDev = isLocalDevelopment(url)

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'posts')
    if (!allowed) {
      return rateLimitResponse(corsHeaders)
    }
  }

  // Prefer D1 CMS posts once at least one post has been imported
  if (DB) {
    try {
      const countRow = await DB.prepare('SELECT COUNT(*) AS total FROM posts').first<{ total: number }>()
      if (Number(countRow?.total ?? 0) > 0) {
        const { results } = await DB.prepare(
          'SELECT id, title, slug, tags, date FROM posts WHERE published = 1 ORDER BY COALESCE(date, created_at) DESC, created_at DESC',
        ).all<PostRow>()

        const posts = (results ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          tags: parseTags(row.tags),
          date: row.date,
        }))

        return new Response(JSON.stringify(posts), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
            'Cache-Control': isLocalDev ? 'no-store' : 'public, max-age=60',
          },
        })
      }
    } catch (err) {
      logger.warn('D1 posts read failed, falling back to Notion', {
        endpoint: 'posts',
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
    const response = await fetch(
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
            property: 'Published',
            checkbox: { equals: true },
          },
          sorts: [{ property: 'Date', direction: 'descending' }],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Notion API error', { endpoint: 'posts', status: response.status, detail: errorText })
      return errorResponse(500, 'Failed to fetch posts', corsHeaders)
    }

    const data = await response.json() as NotionDatabaseQueryResponse

    const posts = data.results.map((page) => ({
      id: page.id,
      title: getTitle(page),
      slug: getSlug(page),
      tags: getTags(page),
      date: getDate(page),
    }))

    const jsonResponse = new Response(JSON.stringify(posts), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        'Cache-Control': isLocalDev ? 'no-store' : `public, max-age=${API_CONFIG.CACHE_TTL.LIST}`,
      },
    })

    // Store in cache (non-blocking, skip in local development)
    if (!isLocalDev) {
      context.waitUntil(cache.put(cacheKey, jsonResponse.clone()))
    }

    return jsonResponse
  } catch (error) {
    logger.error('Unexpected error', { endpoint: 'posts', detail: String(error) })
    return errorResponse(500, 'An unexpected error occurred', corsHeaders)
  }
}
