import { errorResponse, logger } from '../../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from '../_helpers'

type SpotBucket = 'recommended' | 'visited' | 'saved'

const VALID_BUCKETS = new Set<SpotBucket>(['recommended', 'visited', 'saved'])

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestPost: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const tripSlug = String(params.slug ?? '').trim()
  try {
    const body = (await request.json()) as {
      regionId?: string
      name?: string
      bucket?: SpotBucket
      category?: string
      note?: string
      url?: string
      lat?: number | null
      lng?: number | null
    }

    const regionId = body.regionId?.trim()
    const name = body.name?.trim().toLowerCase()
    const bucket = body.bucket ?? 'recommended'

    if (!regionId || !name || !VALID_BUCKETS.has(bucket)) {
      return errorResponse(400, 'regionId, name, and valid bucket are required', corsHeaders)
    }

    const region = await env.DB!.prepare(
      'SELECT r.id FROM regions r JOIN trips t ON r.trip_id = t.id WHERE r.id = ? AND t.slug = ?',
    )
      .bind(regionId, tripSlug)
      .first<{ id: string }>()

    if (!region) {
      return errorResponse(404, 'region not found', corsHeaders)
    }

    const maxRow = await env.DB!.prepare(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM spots WHERE region_id = ? AND bucket = ?',
    )
      .bind(regionId, bucket)
      .first<{ max_order: number }>()

    const id = `spot-${crypto.randomUUID().slice(0, 8)}`
    const sortOrder = Number(maxRow?.max_order ?? -1) + 1
    const category = body.category?.trim().toLowerCase() || null
    const note = body.note?.trim().toLowerCase() || null
    const spotUrl = body.url?.trim() || null

    await env.DB!.prepare(
      `INSERT INTO spots (id, region_id, name, bucket, category, note, url, lat, lng, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, regionId, name, bucket, category, note, spotUrl, body.lat ?? null, body.lng ?? null, sortOrder)
      .run()

    return jsonResponse(
      {
        id,
        regionId,
        name,
        bucket,
        category,
        note,
        url: spotUrl,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        sortOrder,
        images: [],
      },
      201,
      corsHeaders,
    )
  } catch (err) {
    logger.error('Failed to create spot', { tripSlug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to create spot', corsHeaders)
  }
}

export const onRequestPatch: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const tripSlug = String(params.slug ?? '').trim()
  try {
    const body = (await request.json()) as {
      id?: string
      name?: string
      bucket?: SpotBucket
      category?: string | null
      note?: string | null
      url?: string | null
      lat?: number | null
      lng?: number | null
      reorder?: Array<{ id: string; bucket: SpotBucket; sortOrder: number }>
    }

    if (Array.isArray(body.reorder)) {
      const validItems = body.reorder.filter((item) => item.id && VALID_BUCKETS.has(item.bucket))
      const stmts = validItems.map((item) =>
        env.DB!.prepare(
          `UPDATE spots SET bucket = ?, sort_order = ?
           WHERE id = ? AND region_id IN (
             SELECT r.id FROM regions r JOIN trips t ON r.trip_id = t.id WHERE t.slug = ?
           )`,
        ).bind(item.bucket, item.sortOrder, item.id, tripSlug),
      )
      if (stmts.length > 0) await env.DB!.batch(stmts)
      return jsonResponse({ ok: true }, 200, corsHeaders)
    }

    if (!body.id) {
      return errorResponse(400, 'spot id is required', corsHeaders)
    }
    if (body.bucket !== undefined && !VALID_BUCKETS.has(body.bucket)) {
      return errorResponse(400, 'invalid bucket', corsHeaders)
    }

    await env.DB!.prepare(
      `UPDATE spots
       SET name = COALESCE(?, name),
           bucket = COALESCE(?, bucket),
           category = COALESCE(?, category),
           note = COALESCE(?, note),
           url = COALESCE(?, url),
           lat = COALESCE(?, lat),
           lng = COALESCE(?, lng)
       WHERE id = ? AND region_id IN (
         SELECT r.id FROM regions r JOIN trips t ON r.trip_id = t.id WHERE t.slug = ?
       )`,
    )
      .bind(
        body.name !== undefined ? body.name.trim().toLowerCase() : null,
        body.bucket ?? null,
        body.category !== undefined ? (body.category?.trim().toLowerCase() || '') : null,
        body.note !== undefined ? (body.note?.trim().toLowerCase() || '') : null,
        body.url !== undefined ? (body.url?.trim() || '') : null,
        body.lat ?? null,
        body.lng ?? null,
        body.id,
        tripSlug,
      )
      .run()

    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to update spot', { tripSlug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to update spot', corsHeaders)
  }
}

export const onRequestDelete: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const tripSlug = String(params.slug ?? '').trim()
  const url = new URL(request.url)
  const spotId = url.searchParams.get('id')
  if (!spotId) return errorResponse(400, 'spot id is required', corsHeaders)

  try {
    if (env.IMAGES) {
      const { results: imgs } = await env.DB!.prepare(
        'SELECT r2_key FROM spot_images WHERE spot_id = ?',
      )
        .bind(spotId)
        .all<{ r2_key: string }>()
      for (const img of imgs ?? []) {
        await env.IMAGES.delete(img.r2_key)
      }
    }

    await env.DB!.prepare(
      `DELETE FROM spots WHERE id = ? AND region_id IN (
        SELECT r.id FROM regions r JOIN trips t ON r.trip_id = t.id WHERE t.slug = ?
      )`,
    )
      .bind(spotId, tripSlug)
      .run()

    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to delete spot', { tripSlug, error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to delete spot', corsHeaders)
  }
}
