import { errorResponse, checkRateLimit, getCorsHeaders } from '../../_shared'
import { TripsEnv } from '../_helpers'

export const onRequestGet: PagesFunction<TripsEnv> = async ({ request, env, params }) => {
  const corsHeaders = getCorsHeaders(request.headers.get('Origin'))
  const rateLimit = await checkRateLimit(request, new URL(request.url))
  if (!rateLimit.allowed) {
    return errorResponse(429, 'rate limit exceeded', corsHeaders)
  }

  if (!env.IMAGES) {
    return errorResponse(503, 'image storage not configured', corsHeaders)
  }

  const rawKey = String(params.key ?? '').trim()
  const key = decodeURIComponent(rawKey)
  if (!key || !key.startsWith('trips/')) {
    return errorResponse(400, 'invalid media key', corsHeaders)
  }

  const object = await env.IMAGES.get(key)
  if (!object) {
    return errorResponse(404, 'image not found', corsHeaders)
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...corsHeaders,
    },
  })
}
