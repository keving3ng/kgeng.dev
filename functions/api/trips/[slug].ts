import { errorResponse, logger } from '../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from './_helpers'

interface TripRow {
  id: string
  slug: string
  title: string
  subtitle: string | null
  country: string
  created_at: string
  updated_at: string
}

interface RegionRow {
  id: string
  trip_id: string
  slug: string
  name: string
  summary: string | null
  color: string
  map_region_keys: string
  center_lat: number | null
  center_lng: number | null
  sort_order: number
}

interface SpotRow {
  id: string
  region_id: string
  name: string
  bucket: 'recommended' | 'visited' | 'saved'
  category: string | null
  note: string | null
  url: string | null
  lat: number | null
  lng: number | null
  sort_order: number
  created_at: string
}

interface SpotImageRow {
  id: string
  spot_id: string
  r2_key: string
  caption: string | null
  sort_order: number
  created_at: string
}

function parseKeys(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestGet: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env)
  if (error) return error

  const slug = String(params.slug ?? '').trim()
  if (!slug) {
    return errorResponse(400, 'trip slug is required', corsHeaders)
  }

  try {
    const trip = await env.DB!.prepare(
      'SELECT id, slug, title, subtitle, country, created_at, updated_at FROM trips WHERE slug = ?',
    )
      .bind(slug)
      .first<TripRow>()

    if (!trip) {
      return errorResponse(404, 'trip not found', corsHeaders)
    }

    const { results: regionRows } = await env.DB!.prepare(
      'SELECT * FROM regions WHERE trip_id = ? ORDER BY sort_order ASC, name ASC',
    )
      .bind(trip.id)
      .all<RegionRow>()

    const { results: spotRows } = await env.DB!.prepare(`
      SELECT s.*
      FROM spots s
      JOIN regions r ON s.region_id = r.id
      WHERE r.trip_id = ?
      ORDER BY s.sort_order ASC, s.created_at ASC
    `)
      .bind(trip.id)
      .all<SpotRow>()

    const { results: imageRows } = await env.DB!.prepare(`
      SELECT si.*
      FROM spot_images si
      JOIN spots s ON si.spot_id = s.id
      JOIN regions r ON s.region_id = r.id
      WHERE r.trip_id = ?
      ORDER BY si.sort_order ASC, si.created_at ASC
    `)
      .bind(trip.id)
      .all<SpotImageRow>()

    const imagesBySpot = new Map<string, Array<{
      id: string
      spotId: string
      r2Key: string
      url: string
      caption: string | null
      sortOrder: number
    }>>()

    for (const img of imageRows ?? []) {
      const list = imagesBySpot.get(img.spot_id) ?? []
      list.push({
        id: img.id,
        spotId: img.spot_id,
        r2Key: img.r2_key,
        url: `/api/trips/media/${encodeURIComponent(img.r2_key)}`,
        caption: img.caption,
        sortOrder: img.sort_order,
      })
      imagesBySpot.set(img.spot_id, list)
    }

    const spotsByRegion = new Map<string, Array<{
      id: string
      regionId: string
      name: string
      bucket: 'recommended' | 'visited' | 'saved'
      category: string | null
      note: string | null
      url: string | null
      lat: number | null
      lng: number | null
      sortOrder: number
      images: ReturnType<typeof imagesBySpot.get>
    }>>()

    for (const s of spotRows ?? []) {
      const list = spotsByRegion.get(s.region_id) ?? []
      list.push({
        id: s.id,
        regionId: s.region_id,
        name: s.name,
        bucket: s.bucket,
        category: s.category,
        note: s.note,
        url: s.url,
        lat: s.lat,
        lng: s.lng,
        sortOrder: s.sort_order,
        images: imagesBySpot.get(s.id) ?? [],
      })
      spotsByRegion.set(s.region_id, list)
    }

    const regions = (regionRows ?? []).map((r) => ({
      id: r.id,
      tripId: r.trip_id,
      slug: r.slug,
      name: r.name,
      summary: r.summary,
      color: r.color,
      mapRegionKeys: parseKeys(r.map_region_keys),
      centerLat: r.center_lat,
      centerLng: r.center_lng,
      sortOrder: r.sort_order,
      spots: spotsByRegion.get(r.id) ?? [],
    }))

    return jsonResponse(
      {
        trip: {
          id: trip.id,
          slug: trip.slug,
          title: trip.title,
          subtitle: trip.subtitle,
          country: trip.country,
          createdAt: trip.created_at,
          updatedAt: trip.updated_at,
        },
        regions,
      },
      200,
      corsHeaders,
    )
  } catch (err) {
    logger.error('Failed to fetch trip', { slug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to fetch trip', corsHeaders)
  }
}

export const onRequestPatch: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const slug = String(params.slug ?? '').trim()
  try {
    const body = (await request.json()) as { title?: string; subtitle?: string | null }
    await env.DB!.prepare(
      `UPDATE trips
       SET title = COALESCE(?, title),
           subtitle = ?,
           updated_at = datetime('now')
       WHERE slug = ?`,
    )
      .bind(body.title?.trim().toLowerCase() ?? null, body.subtitle?.trim().toLowerCase() ?? null, slug)
      .run()

    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to update trip', { slug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to update trip', corsHeaders)
  }
}

export const onRequestDelete: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const slug = String(params.slug ?? '').trim()
  try {
    await env.DB!.prepare('DELETE FROM trips WHERE slug = ?').bind(slug).run()
    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to delete trip', { slug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to delete trip', corsHeaders)
  }
}
