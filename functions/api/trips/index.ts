import { errorResponse, logger } from '../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
  slugify,
} from './_helpers'

interface TripRow {
  id: string
  slug: string
  title: string
  subtitle: string | null
  country: string
  created_at: string
  updated_at: string
  region_count?: number
  spot_count?: number
}

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestGet: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env)
  if (error) return error

  try {
    const { results } = await env.DB!.prepare(`
      SELECT
        t.id,
        t.slug,
        t.title,
        t.subtitle,
        t.country,
        t.created_at,
        t.updated_at,
        (SELECT COUNT(*) FROM regions r WHERE r.trip_id = t.id) AS region_count,
        (SELECT COUNT(*) FROM spots s JOIN regions r ON s.region_id = r.id WHERE r.trip_id = t.id) AS spot_count
      FROM trips t
      ORDER BY t.created_at DESC
    `).all<TripRow>()

    const trips = (results ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      subtitle: t.subtitle,
      country: t.country,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      regionCount: Number(t.region_count ?? 0),
      spotCount: Number(t.spot_count ?? 0),
    }))

    return jsonResponse(trips, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to list trips', { error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to fetch trips', corsHeaders)
  }
}

export const onRequestPost: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  try {
    const body = (await request.json()) as {
      title?: string
      slug?: string
      subtitle?: string
      country?: string
    }

    const title = body.title?.trim().toLowerCase()
    const slug = slugify(body.slug || title || '')
    if (!title || !slug) {
      return errorResponse(400, 'title is required', corsHeaders)
    }

    const id = `trip-${crypto.randomUUID().slice(0, 8)}`
    const country = body.country?.trim().toLowerCase() || 'taiwan'
    const subtitle = body.subtitle?.trim().toLowerCase() || null

    await env.DB!.prepare(
      'INSERT INTO trips (id, slug, title, subtitle, country) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(id, slug, title, subtitle, country)
      .run()

    return jsonResponse({ id, slug, title, subtitle, country }, 201, corsHeaders)
  } catch (err) {
    logger.error('Failed to create trip', { error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to create trip', corsHeaders)
  }
}
