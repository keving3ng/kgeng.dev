/**
 * API Configuration Constants
 *
 * Centralized configuration for the API layer.
 * Update these values here rather than in individual endpoint files.
 */

export const API_CONFIG = {
  /** Notion API version to use for all requests */
  NOTION_API_VERSION: '2022-06-28',

  /** Cache TTL values in seconds */
  CACHE_TTL: {
    /** List endpoints (posts, recipes) */
    LIST: 300, // 5 minutes
    /** Detail endpoints (posts/[slug], recipes/[id]) */
    DETAIL: 3600, // 1 hour
  },

  /** Rate limiting configuration */
  RATE_LIMIT: {
    /** Maximum requests per window */
    MAX_REQUESTS: 60,
    /** Window duration in seconds */
    WINDOW_SECONDS: 60,
  },

  /** Notion API pagination */
  NOTION_PAGE_SIZE: 100,
} as const
