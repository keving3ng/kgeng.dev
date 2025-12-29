// Shared utilities for API security

import { API_CONFIG } from './config'
import { NotionBlock } from './types/notion'

/**
 * Structured logger for consistent log formatting
 */
type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  endpoint?: string
  status?: number
  blockId?: string
  [key: string]: unknown
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  })
}

export const logger = {
  info: (message: string, context?: LogContext): void => {
    console.log(formatLog('info', message, context))
  },
  warn: (message: string, context?: LogContext): void => {
    console.warn(formatLog('warn', message, context))
  },
  error: (message: string, context?: LogContext): void => {
    console.error(formatLog('error', message, context))
  },
}

const ALLOWED_ORIGINS = [
  'https://kgeng.dev',
  'https://www.kgeng.dev',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
]

/**
 * Check if request is from local development environment
 */
export function isLocalDevelopment(url: URL): boolean {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
}

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
 * Rate limiting configuration (from centralized config)
 */
const RATE_LIMIT = {
  maxRequests: API_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  windowSeconds: API_CONFIG.RATE_LIMIT.WINDOW_SECONDS,
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

/**
 * Notion API pagination response type
 */
interface NotionPaginatedResponse<T> {
  results: T[]
  has_more: boolean
  next_cursor: string | null
}

/**
 * Options for fetching Notion block children
 */
interface FetchBlockChildrenOptions {
  blockId: string
  apiKey: string
  onError?: (status: number, error: string) => void
}

/**
 * Fetch all children of a Notion block with pagination
 * Returns all results, handling pagination automatically
 */
export async function fetchNotionBlockChildren<T = unknown>(
  options: FetchBlockChildrenOptions
): Promise<T[]> {
  const { blockId, apiKey, onError } = options
  const allResults: T[] = []
  let cursor: string | undefined = undefined

  do {
    const url = cursor
      ? `https://api.notion.com/v1/blocks/${blockId}/children?page_size=${API_CONFIG.NOTION_PAGE_SIZE}&start_cursor=${cursor}`
      : `https://api.notion.com/v1/blocks/${blockId}/children?page_size=${API_CONFIG.NOTION_PAGE_SIZE}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': API_CONFIG.NOTION_API_VERSION,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      onError?.(response.status, errorText)
      break // Return partial results
    }

    const data = (await response.json()) as NotionPaginatedResponse<T>
    allResults.push(...data.results)
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined
  } while (cursor)

  return allResults
}

/**
 * Options for enriching blocks with children
 */
interface EnrichBlocksOptions {
  apiKey: string
  onError?: (status: number, blockId: string, error: string) => void
}

/**
 * Recursively fetch and attach children for all blocks that have them.
 * This is used by detail endpoints (posts/[slug], recipes/[id]).
 */
export async function enrichBlocksWithChildren(
  blocks: NotionBlock[],
  options: EnrichBlocksOptions
): Promise<NotionBlock[]> {
  const { apiKey, onError } = options

  return Promise.all(
    blocks.map(async (block) => {
      if (block.has_children) {
        const children = await fetchNotionBlockChildren<NotionBlock>({
          blockId: block.id,
          apiKey,
          onError: (status, detail) => {
            onError?.(status, block.id, detail)
          },
        })
        const enrichedChildren = await enrichBlocksWithChildren(children, options)
        return { ...block, children: enrichedChildren }
      }
      return block
    })
  )
}
