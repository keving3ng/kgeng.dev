import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger, isLocalDevelopment } from '../_shared'

interface Env {
  DB?: D1Database
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
  const { DB } = context.env
  const slug = context.params.slug as string
  const url = new URL(context.request.url)
  const isLocalDev = isLocalDevelopment(url)
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (!DB) {
    return errorResponse(503, 'posts database not configured', corsHeaders)
  }

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'posts-slug')
    if (!allowed) {
      return rateLimitResponse(corsHeaders)
    }
  }

  try {
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
  } catch (error) {
    logger.error('Failed to fetch post from CMS', { endpoint: 'posts/slug', slug, detail: String(error) })
    return errorResponse(500, 'Failed to fetch post', corsHeaders)
  }
}
