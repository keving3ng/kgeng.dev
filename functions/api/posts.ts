import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse } from './_shared'

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
      const error = await response.text()
      console.error('Notion API error:', response.status, error)
      return errorResponse(500, 'Failed to fetch posts', corsHeaders)
    }

    const data = await response.json() as { results: any[] }

    const posts = data.results.map((page: any) => ({
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || 'Untitled',
      slug: page.properties.Slug?.rich_text?.[0]?.plain_text || page.id,
      tags:
        page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      date: page.properties.Date?.date?.start || null,
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
    console.error('Notion API error:', error)
    return errorResponse(500, 'An unexpected error occurred', corsHeaders)
  }
}
