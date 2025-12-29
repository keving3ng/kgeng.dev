import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger, isLocalDevelopment } from './_shared'
import { API_CONFIG } from './config'
import { NotionDatabaseQueryResponse, NotionBlockChildrenResponse, NotionBlock, getTitle, getTags, getUrl, getNotes } from './types/notion'

interface Env {
  NOTION_API_KEY: string
  NOTION_RECIPES_DATABASE_ID: string
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { NOTION_API_KEY, NOTION_RECIPES_DATABASE_ID } = context.env
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (!NOTION_API_KEY || !NOTION_RECIPES_DATABASE_ID) {
    return errorResponse(500, 'Server configuration error', corsHeaders)
  }

  const url = new URL(context.request.url)
  const isLocalDev = isLocalDevelopment(url)

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'recipes')
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
      `https://api.notion.com/v1/databases/${NOTION_RECIPES_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': API_CONFIG.NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Notion API error', { endpoint: 'recipes', status: response.status, detail: errorText })
      return errorResponse(500, 'Failed to fetch recipes', corsHeaders)
    }

    const data = await response.json() as NotionDatabaseQueryResponse

    // Check if each recipe has meaningful content (not just bookmarks or empty blocks)
    const checkHasContent = async (pageId: string): Promise<boolean> => {
      try {
        const blocksResponse = await fetch(
          `https://api.notion.com/v1/blocks/${pageId}/children?page_size=10`,
          {
            headers: {
              Authorization: `Bearer ${NOTION_API_KEY}`,
              'Notion-Version': API_CONFIG.NOTION_API_VERSION,
            },
          }
        )
        if (!blocksResponse.ok) return false
        const blocksData = await blocksResponse.json() as NotionBlockChildrenResponse

        // Filter out bookmark blocks and empty paragraphs - these don't count as content
        const meaningfulBlocks = blocksData.results.filter((block: NotionBlock) => {
          // Skip bookmark blocks (link previews)
          if (block.type === 'bookmark') return false
          // Skip link_preview blocks
          if (block.type === 'link_preview') return false
          // Skip empty paragraph blocks
          if (block.type === 'paragraph') {
            const paragraph = block.paragraph as { rich_text?: unknown[] } | undefined
            const richText = paragraph?.rich_text || []
            if (richText.length === 0) return false
          }
          return true
        })

        return meaningfulBlocks.length > 0
      } catch {
        return false
      }
    }

    const recipes = await Promise.all(
      data.results.map(async (page) => ({
        id: page.id,
        name: getTitle(page, 'Recipe Name'),
        url: getUrl(page),
        notes: getNotes(page),
        tags: getTags(page),
        hasContent: await checkHasContent(page.id),
      }))
    )

    const jsonResponse = new Response(JSON.stringify(recipes), {
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
    logger.error('Unexpected error', { endpoint: 'recipes', detail: String(error) })
    return errorResponse(500, 'An unexpected error occurred', corsHeaders)
  }
}
