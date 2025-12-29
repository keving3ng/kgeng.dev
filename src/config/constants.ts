/**
 * Client-side Configuration Constants
 *
 * Centralized configuration for the React app.
 * Update these values here rather than in individual component files.
 */

/** Refresh interval for dev mode data fetching (ms) */
export const DEV_REFRESH_INTERVAL = 30000 // 30 seconds

/** Timeout for copy-to-clipboard feedback (ms) */
export const COPY_FEEDBACK_TIMEOUT = 2000

/** Standard date format options for displaying post dates */
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)
}
