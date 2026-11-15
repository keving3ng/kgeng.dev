import { getCorsHeaders, errorResponse, checkRateLimit, logger } from '../_shared'

export interface TripsEnv {
  DB?: D1Database
  IMAGES?: R2Bucket
  ADMIN_SECRET?: string
}

export function getTripCorsHeaders(request: Request): Record<string, string> {
  return {
    ...getCorsHeaders(request.headers.get('Origin')),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function handleOptions(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getTripCorsHeaders(request),
  })
}

export function jsonResponse(
  data: unknown,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0
    const cb = i < b.length ? b.charCodeAt(i) : 0
    diff |= ca ^ cb
  }
  return diff === 0
}

export function verifyAdmin(
  request: Request,
  env: TripsEnv,
  corsHeaders: Record<string, string>,
): Response | null {
  if (!env.ADMIN_SECRET) {
    logger.warn('ADMIN_SECRET not configured', { endpoint: new URL(request.url).pathname })
    return errorResponse(503, 'cms editing is not configured', corsHeaders)
  }

  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token || !timingSafeEqual(token, env.ADMIN_SECRET)) {
    return errorResponse(401, 'invalid passcode', corsHeaders)
  }

  return null
}

export async function guardRequest(
  request: Request,
  env: TripsEnv,
  options: { requireAuth?: boolean; requireDb?: boolean } = {},
): Promise<{ corsHeaders: Record<string, string>; error?: Response }> {
  const corsHeaders = getTripCorsHeaders(request)
  const url = new URL(request.url)

  const rateLimit = await checkRateLimit(request, url)
  if (!rateLimit.allowed) {
    return {
      corsHeaders,
      error: errorResponse(429, 'rate limit exceeded', corsHeaders),
    }
  }

  if (options.requireAuth) {
    const authErr = verifyAdmin(request, env, corsHeaders)
    if (authErr) return { corsHeaders, error: authErr }
  }

  if (options.requireDb !== false && !env.DB) {
    logger.warn('D1 DB binding not configured', { endpoint: url.pathname })
    return {
      corsHeaders,
      error: errorResponse(503, 'trips database not configured', corsHeaders),
    }
  }

  return { corsHeaders }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
