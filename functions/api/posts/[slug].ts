import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse } from '../_shared'

interface Env {
  NOTION_API_KEY: string
  NOTION_DATABASE_ID: string
}

const CACHE_TTL = 3600 // 1 hour

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { NOTION_API_KEY, NOTION_DATABASE_ID } = context.env
  const slug = context.params.slug as string
  const url = new URL(context.request.url)
  const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'posts-slug')
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
    // Find the page by slug
    const queryResponse = await fetch(
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
            and: [
              { property: 'Slug', rich_text: { equals: slug } },
              { property: 'Published', checkbox: { equals: true } },
            ],
          },
        }),
      }
    )

    if (!queryResponse.ok) {
      const error = await queryResponse.text()
      console.error('Notion API error:', error)
      return errorResponse(500, 'Failed to fetch post', corsHeaders)
    }

    const queryData = await queryResponse.json() as { results: any[] }

    if (queryData.results.length === 0) {
      return errorResponse(404, 'Post not found', corsHeaders)
    }

    const page = queryData.results[0]

    // Fetch all page blocks with pagination
    const allBlocks: any[] = []
    let blocksCursor: string | undefined = undefined

    do {
      const blocksUrl = blocksCursor
        ? `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100&start_cursor=${blocksCursor}`
        : `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`

      const blocksResponse = await fetch(blocksUrl, {
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      })

      if (!blocksResponse.ok) {
        const error = await blocksResponse.text()
        console.error('Notion API error:', error)
        return errorResponse(500, 'Failed to fetch content', corsHeaders)
      }

      const blocksData = (await blocksResponse.json()) as {
        results: any[]
        has_more: boolean
        next_cursor: string | null
      }

      allBlocks.push(...blocksData.results)
      blocksCursor = blocksData.has_more ? (blocksData.next_cursor ?? undefined) : undefined
    } while (blocksCursor)

    // Fetch all blocks with pagination support
    const fetchAllChildren = async (blockId: string): Promise<any[]> => {
      const allChildren: any[] = []
      let cursor: string | undefined = undefined

      do {
        const url = cursor
          ? `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100&start_cursor=${cursor}`
          : `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        })

        if (!response.ok) {
          const error = await response.text()
          console.error(`Failed to fetch children for block ${blockId}:`, response.status, error)
          break // Return partial results rather than failing completely
        }

        const data = (await response.json()) as {
          results: any[]
          has_more: boolean
          next_cursor: string | null
        }

        allChildren.push(...data.results)
        cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined
      } while (cursor)

      return allChildren
    }

    // Recursively fetch children for ALL blocks that have them
    const enrichBlocksWithChildren = async (blocks: any[]): Promise<any[]> => {
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

    const post = {
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || 'Untitled',
      slug: page.properties.Slug?.rich_text?.[0]?.plain_text || page.id,
      tags:
        page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      date: page.properties.Date?.date?.start || null,
      blocks: enrichedBlocks,
    }

    const jsonResponse = new Response(JSON.stringify(post), {
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
