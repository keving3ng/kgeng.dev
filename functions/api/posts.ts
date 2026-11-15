import { getCorsHeaders, errorResponse, checkRateLimit, rateLimitResponse, logger, isLocalDevelopment } from './_shared'

interface Env {
  DB?: D1Database
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
  const { DB } = context.env
  const requestOrigin = context.request.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (!DB) {
    return errorResponse(503, 'posts database not configured', corsHeaders)
  }

  const url = new URL(context.request.url)
  const isLocalDev = isLocalDevelopment(url)

  // Rate limiting (skip in local development)
  if (!isLocalDev) {
    const { allowed } = await checkRateLimit(context.request, 'posts')
    if (!allowed) {
      return rateLimitResponse(corsHeaders)
    }
  }

  try {
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
  } catch (error) {
    logger.error('Failed to fetch posts from CMS', { endpoint: 'posts', detail: String(error) })
    return errorResponse(500, 'Failed to fetch posts', corsHeaders)
  }
}
