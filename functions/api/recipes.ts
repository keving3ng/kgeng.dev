import { getCorsHeaders, errorResponse } from './_shared'

interface Env {
  NOTION_API_KEY: string
  NOTION_RECIPES_DATABASE_ID: string
}

const CACHE_TTL = 300 // 5 minutes

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { NOTION_API_KEY, NOTION_RECIPES_DATABASE_ID } = context.env
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (!NOTION_API_KEY || !NOTION_RECIPES_DATABASE_ID) {
    return errorResponse(500, 'Server configuration error', corsHeaders)
  }

  const url = new URL(context.request.url)
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

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
      `https://api.notion.com/v1/databases/${NOTION_RECIPES_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Notion API error:', response.status, error)
      return errorResponse(500, 'Failed to fetch recipes', corsHeaders)
    }

    const data = await response.json() as { results: any[] }

    const recipes = data.results.map((page: any) => ({
      id: page.id,
      name: page.properties['Recipe Name']?.title?.[0]?.plain_text || 'Untitled',
      url: page.properties['Link']?.url || null,
      notes: page.properties['Notes']?.rich_text?.[0]?.plain_text || null,
      tags: page.properties['Tags']?.multi_select?.map((tag: any) => tag.name) || [],
    }))

    const jsonResponse = new Response(JSON.stringify(recipes), {
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
