interface Env {
  NOTION_API_KEY: string
  IMAGES: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const blockId = context.params.blockId as string
  const { NOTION_API_KEY, IMAGES } = context.env

  // 1. Check R2 cache first
  try {
    const cached = await IMAGES.get(blockId)
    if (cached) {
      return new Response(cached.body, {
        headers: {
          'Content-Type': cached.httpMetadata?.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
  } catch (e) {
    // R2 not available or error, continue to fetch from Notion
    console.error('R2 cache error:', e)
  }

  // 2. Fetch block from Notion to get fresh image URL
  const blockResponse = await fetch(
    `https://api.notion.com/v1/blocks/${blockId}`,
    {
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    }
  )

  if (!blockResponse.ok) {
    return new Response('Block not found', { status: 404 })
  }

  const block = (await blockResponse.json()) as {
    type: string
    image?: {
      type: 'file' | 'external'
      file?: { url: string }
      external?: { url: string }
    }
  }

  if (block.type !== 'image' || !block.image) {
    return new Response('Not an image block', { status: 400 })
  }

  const imageUrl =
    block.image.type === 'file'
      ? block.image.file?.url
      : block.image.external?.url

  if (!imageUrl) {
    return new Response('No image URL found', { status: 404 })
  }

  // 3. Fetch the actual image
  const imageResponse = await fetch(imageUrl)

  if (!imageResponse.ok) {
    return new Response('Failed to fetch image', { status: 502 })
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg'

  // 4. Cache in R2 (non-blocking)
  try {
    context.waitUntil(
      IMAGES.put(blockId, imageBuffer, {
        httpMetadata: { contentType },
      })
    )
  } catch (e) {
    console.error('R2 cache write error:', e)
  }

  // 5. Return the image
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
