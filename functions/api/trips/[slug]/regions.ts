import { errorResponse, logger } from '../../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
  slugify,
} from '../_helpers'

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestPost: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const tripSlug = String(params.slug ?? '').trim()
  try {
    const trip = await env.DB!.prepare('SELECT id FROM trips WHERE slug = ?')
      .bind(tripSlug)
      .first<{ id: string }>()
    if (!trip) return errorResponse(404, 'trip not found', corsHeaders)

    const body = (await request.json()) as {
      name?: string
      slug?: string
      summary?: string
      color?: string
      mapRegionKeys?: string[]
      centerLat?: number | null
      centerLng?: number | null
    }

    const name = body.name?.trim().toLowerCase()
    const slug = slugify(body.slug || name || '')
    if (!name || !slug) {
      return errorResponse(400, 'region name is required', corsHeaders)
    }

    const maxRow = await env.DB!.prepare(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM regions WHERE trip_id = ?',
    )
      .bind(trip.id)
      .first<{ max_order: number }>()

    const id = `reg-${crypto.randomUUID().slice(0, 8)}`
    const color = body.color?.trim() || '#10b981'
    const mapKeys = JSON.stringify(Array.isArray(body.mapRegionKeys) ? body.mapRegionKeys : [])
    const sortOrder = Number(maxRow?.max_order ?? -1) + 1

    await env.DB!.prepare(
      `INSERT INTO regions (id, trip_id, slug, name, summary, color, map_region_keys, center_lat, center_lng, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        trip.id,
        slug,
        name,
        body.summary?.trim().toLowerCase() || null,
        color,
        mapKeys,
        body.centerLat ?? null,
        body.centerLng ?? null,
        sortOrder,
      )
      .run()

    return jsonResponse(
      {
        id,
        tripId: trip.id,
        slug,
        name,
        summary: body.summary?.trim().toLowerCase() || null,
        color,
        mapRegionKeys: Array.isArray(body.mapRegionKeys) ? body.mapRegionKeys : [],
        centerLat: body.centerLat ?? null,
        centerLng: body.centerLng ?? null,
        sortOrder,
        spots: [],
      },
      201,
      corsHeaders,
    )
  } catch (err) {
    logger.error('Failed to create region', { tripSlug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to create region', corsHeaders)
  }
}

export const onRequestPatch: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const tripSlug = String(params.slug ?? '').trim()
  try {
    const trip = await env.DB!.prepare('SELECT id FROM trips WHERE slug = ?')
      .bind(tripSlug)
      .first<{ id: string }>()
    if (!trip) return errorResponse(404, 'trip not found', corsHeaders)

    const body = (await request.json()) as {
      id?: string
      name?: string
      summary?: string | null
      color?: string
      mapRegionKeys?: string[]
      centerLat?: number | null
      centerLng?: number | null
      orderedIds?: string[]
    }

    if (Array.isArray(body.orderedIds)) {
      const stmts = body.orderedIds.map((regionId, idx) =>
        env.DB!.prepare('UPDATE regions SET sort_order = ? WHERE id = ? AND trip_id = ?').bind(
          idx,
          regionId,
          trip.id,
        ),
      )
      if (stmts.length > 0) await env.DB!.batch(stmts)
      return jsonResponse({ ok: true }, 200, corsHeaders)
    }

    if (!body.id) {
      return errorResponse(400, 'region id is required', corsHeaders)
    }

    await env.DB!.prepare(
      `UPDATE regions
       SET name = COALESCE(?, name),
           summary = COALESCE(?, summary),
           color = COALESCE(?, color),
           map_region_keys = COALESCE(?, map_region_keys),
           center_lat = COALESCE(?, center_lat),
           center_lng = COALESCE(?, center_lng)
       WHERE id = ? AND trip_id = ?`,
    )
      .bind(
        body.name !== undefined ? body.name.trim().toLowerCase() : null,
        body.summary !== undefined ? (body.summary?.trim().toLowerCase() || '') : null,
        body.color ?? null,
        body.mapRegionKeys !== undefined ? JSON.stringify(body.mapRegionKeys) : null,
        body.centerLat ?? null,
        body.centerLng ?? null,
        body.id,
        trip.id,
      )
      .run()

    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to update region', { tripSlug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to update region', corsHeaders)
  }
}

export const onRequestDelete: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const tripSlug = String(params.slug ?? '').trim()
  const url = new URL(request.url)
  const regionId = url.searchParams.get('id')
  if (!regionId) return errorResponse(400, 'region id is required', corsHeaders)

  try {
    await env.DB!.prepare(
      'DELETE FROM regions WHERE id = ? AND trip_id IN (SELECT id FROM trips WHERE slug = ?)',
    )
      .bind(regionId, tripSlug)
      .run()
    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to delete region', { tripSlug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to delete region', corsHeaders)
  }
}
