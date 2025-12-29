import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger, fetchNotionBlockChildren } from '../_shared'
import { NotionPage, NotionBlock, getTitle, getTags, getUrl, getNotes } from '../types/notion'

interface Env {
  NOTION_API_KEY: string
  NOTION_RECIPES_DATABASE_ID: string
}

const CACHE_TTL = 3600 // 1 hour

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { NOTION_API_KEY, NOTION_RECIPES_DATABASE_ID } = context.env
  const id = context.params.id as string
  const url = new URL(context.request.url)
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (!NOTION_API_KEY || !NOTION_RECIPES_DATABASE_ID) {
    return errorResponse(500, 'Server configuration error', corsHeaders)
  }

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'recipes-id')
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
    // Fetch the page directly by ID
    const pageResponse = await fetch(
      `https://api.notion.com/v1/pages/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      }
    )

    if (!pageResponse.ok) {
      if (pageResponse.status === 404) {
        return errorResponse(404, 'Recipe not found', corsHeaders)
      }
      const errorText = await pageResponse.text()
      logger.error('Notion API error', { endpoint: 'recipes/id', status: pageResponse.status, id, detail: errorText })
      return errorResponse(500, 'Failed to fetch recipe', corsHeaders)
    }

    const page = await pageResponse.json() as NotionPage

    // Fetch all page blocks with pagination
    let fetchError: { status: number; detail: string } | null = null
    const allBlocks = await fetchNotionBlockChildren({
      blockId: page.id,
      apiKey: NOTION_API_KEY,
      onError: (status, detail) => {
        fetchError = { status, detail }
        logger.error('Failed to fetch blocks', { endpoint: 'recipes/id', status, id, detail })
      },
    })

    // If we got an error on the first page (no blocks), return error
    if (fetchError && allBlocks.length === 0) {
      return errorResponse(500, 'Failed to fetch content', corsHeaders)
    }

    // Helper to fetch children for nested blocks
    const fetchAllChildren = async (blockId: string) => {
      return fetchNotionBlockChildren({
        blockId,
        apiKey: NOTION_API_KEY,
        onError: (status, detail) => {
          logger.warn('Failed to fetch block children', { endpoint: 'recipes/id', status, blockId, detail })
        },
      })
    }

    // Recursively fetch children for ALL blocks that have them
    const enrichBlocksWithChildren = async (blocks: NotionBlock[]): Promise<NotionBlock[]> => {
      return Promise.all(
        blocks.map(async (block) => {
          if (block.has_children) {
            const children = await fetchAllChildren(block.id)
            const enrichedChildren = await enrichBlocksWithChildren(children)
            return { ...block, children: enrichedChildren }
          }
          return block
        })
      )
    }

    const enrichedBlocks = await enrichBlocksWithChildren(allBlocks)

    const recipe = {
      id: page.id,
      name: getTitle(page, 'Recipe Name'),
      url: getUrl(page),
      notes: getNotes(page),
      tags: getTags(page),
      blocks: enrichedBlocks,
    }

    const jsonResponse = new Response(JSON.stringify(recipe), {
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
    logger.error('Unexpected error', { endpoint: 'recipes/id', id, detail: String(error) })
    return errorResponse(500, 'An unexpected error occurred', corsHeaders)
  }
}
