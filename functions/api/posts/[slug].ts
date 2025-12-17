interface Env {
  NOTION_API_KEY: string
  NOTION_DATABASE_ID: string
}

const CACHE_TTL = 3600 // 1 hour

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { NOTION_API_KEY, NOTION_DATABASE_ID } = context.env
  const slug = context.params.slug as string
  const cacheKey = new Request(context.request.url)
  const cache = caches.default

  // Check cache first
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    return cachedResponse
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
      return new Response(JSON.stringify({ error: 'Failed to fetch post' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const queryData = await queryResponse.json() as { results: any[] }

    if (queryData.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const page = queryData.results[0]

    // Fetch page blocks (content is written directly in the database entry's page body)
    const blocksResponse = await fetch(
      `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`,
      {
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      }
    )

    if (!blocksResponse.ok) {
      const error = await blocksResponse.text()
      console.error('Notion API error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch content' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const blocksData = await blocksResponse.json() as { results: any[] }

    const post = {
      id: page.id,
      title: page.properties.Title?.title?.[0]?.plain_text || 'Untitled',
      slug: page.properties.Slug?.rich_text?.[0]?.plain_text || page.id,
      tags:
        page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      date: page.properties.Date?.date?.start || null,
      blocks: blocksData.results,
    }

    const jsonResponse = new Response(JSON.stringify(post), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    })

    // Store in cache (non-blocking)
    context.waitUntil(cache.put(cacheKey, jsonResponse.clone()))

    return jsonResponse
  } catch (error) {
    console.error('Notion API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
