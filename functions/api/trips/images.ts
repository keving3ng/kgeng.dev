import { errorResponse, logger } from '../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from './_helpers'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB

function extForMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  }
  return map[mime] ?? 'bin'
}

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestPost: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  if (!env.IMAGES) {
    return errorResponse(503, 'image storage not configured', corsHeaders)
  }

  try {
    const form = await request.formData()
    const spotId = String(form.get('spotId') ?? '').trim()
    const caption = String(form.get('caption') ?? '').trim().toLowerCase() || null
    const file = form.get('file')

    if (!spotId || !(file instanceof File)) {
      return errorResponse(400, 'spotId and image file are required', corsHeaders)
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return errorResponse(400, 'unsupported image type', corsHeaders)
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return errorResponse(400, 'image exceeds 10mb limit', corsHeaders)
    }

    const spot = await env.DB!.prepare('SELECT id FROM spots WHERE id = ?')
      .bind(spotId)
      .first<{ id: string }>()
    if (!spot) {
      return errorResponse(404, 'spot not found', corsHeaders)
    }

    const id = `img-${crypto.randomUUID().slice(0, 8)}`
    const r2Key = `trips/${spotId}/${id}.${extForMime(file.type)}`

    await env.IMAGES.put(r2Key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    })

    const maxRow = await env.DB!.prepare(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM spot_images WHERE spot_id = ?',
    )
      .bind(spotId)
      .first<{ max_order: number }>()
    const sortOrder = Number(maxRow?.max_order ?? -1) + 1

    await env.DB!.prepare(
      'INSERT INTO spot_images (id, spot_id, r2_key, caption, sort_order) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(id, spotId, r2Key, caption, sortOrder)
      .run()

    return jsonResponse(
      {
        id,
        spotId,
        r2Key,
        url: `/api/trips/media/${encodeURIComponent(r2Key)}`,
        caption,
        sortOrder,
      },
      201,
      corsHeaders,
    )
  } catch (err) {
    logger.error('Failed to upload trip image', { error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to upload image', corsHeaders)
  }
}

export const onRequestDelete: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, { requireAuth: true })
  if (error) return error

  const url = new URL(request.url)
  const imageId = url.searchParams.get('id')
  if (!imageId) return errorResponse(400, 'image id is required', corsHeaders)

  try {
    const img = await env.DB!.prepare('SELECT id, r2_key FROM spot_images WHERE id = ?')
      .bind(imageId)
      .first<{ id: string; r2_key: string }>()

    if (!img) return errorResponse(404, 'image not found', corsHeaders)

    if (env.IMAGES) {
      await env.IMAGES.delete(img.r2_key)
    }
    await env.DB!.prepare('DELETE FROM spot_images WHERE id = ?').bind(imageId).run()

    return jsonResponse({ ok: true }, 200, corsHeaders)
  } catch (err) {
    logger.error('Failed to delete trip image', { error: err instanceof Error ? err.message : 'unknown' })
    return errorResponse(500, 'failed to delete image', corsHeaders)
  }
}
