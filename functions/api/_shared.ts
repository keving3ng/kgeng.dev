// Shared utilities for API security

const ALLOWED_ORIGINS = [
  'https://kgeng.dev',
  'https://www.kgeng.dev',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
]

/**
 * Get CORS headers with origin validation
 */
export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
  }
}

/**
 * Allowed domains for image proxying
 */
const ALLOWED_IMAGE_DOMAINS = [
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3.us-west-2.amazonaws.com',
  'secure.notion-static.com',
  'images.unsplash.com',
]

/**
 * Validate that an image URL is from an allowed domain
 */
export function isAllowedImageUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl)
    return ALLOWED_IMAGE_DOMAINS.some(domain =>
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

/**
 * Create a JSON error response with sanitized message
 */
export function errorResponse(
  status: number,
  publicMessage: string,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ error: publicMessage }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  )
}

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  maxRequests: 60,      // requests per window
  windowSeconds: 60,    // 1 minute window
}

/**
 * Simple rate limiter using Cloudflare Cache API
 * Returns true if request should be allowed, false if rate limited
 */
export async function checkRateLimit(
  request: Request,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const cacheKey = `https://rate-limit.internal/${endpoint}/${ip}`
  const cache = caches.default

  try {
    const cached = await cache.match(cacheKey)
    let count = 1

    if (cached) {
      const data = await cached.json() as { count: number }
      count = data.count + 1
    }

    const remaining = Math.max(0, RATE_LIMIT.maxRequests - count)
    const allowed = count <= RATE_LIMIT.maxRequests

    // Update the cache with new count
    const response = new Response(JSON.stringify({ count }), {
      headers: {
        'Cache-Control': `max-age=${RATE_LIMIT.windowSeconds}`,
        'Content-Type': 'application/json',
      },
    })
    await cache.put(cacheKey, response)

    return { allowed, remaining }
  } catch {
    // On cache error, allow the request
    return { allowed: true, remaining: RATE_LIMIT.maxRequests }
  }
}

/**
 * Create a 429 rate limit response
 */
export function rateLimitResponse(headers: Record<string, string> = {}): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(RATE_LIMIT.windowSeconds),
        ...headers,
      },
    }
  )
}
