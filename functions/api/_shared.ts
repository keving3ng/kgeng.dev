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
