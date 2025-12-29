import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger } from './_shared'
import { NotionDatabaseQueryResponse, getTitle, getSlug, getTags, getDate } from './types/notion'

interface Env {
  NOTION_API_KEY: string
  NOTION_DATABASE_ID: string
}

const CACHE_TTL = 300 // 5 minutes

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { NOTION_API_KEY, NOTION_DATABASE_ID } = context.env
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return errorResponse(500, 'Server configuration error', corsHeaders)
  }

  const url = new URL(context.request.url)
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'posts')
    if (!allowed) {
      return rateLimitResponse(corsHeaders)
    }
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
          'Notion-Version': '2022-06-28',
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
        'Cache-Control': isLocalDev ? 'no-store' : `public, max-age=${CACHE_TTL}`,
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
