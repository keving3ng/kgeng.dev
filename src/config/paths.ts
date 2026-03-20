/**
 * Canonical URL paths for the client app. Use these instead of string literals
 * so routes stay aligned with `routes.tsx` and React Router.
 */
export const paths = {
  home: '/',
  blog: '/blog',
  about: '/about',
  cv: '/cv',
  tools: {
    splits: '/tools/splits',
    recipeer: '/tools/recipeer',
    boba: '/tools/boba',
  },
  picks: '/picks',
  projects: '/projects',
  recipes: '/recipes',
  games: '/games',
} as const

/** Permalink path for a blog post (matches `/post/:slug`). */
export function postPath(slug: string): string {
  return `/post/${encodeURIComponent(slug)}`
}

/** Path for a mini-game under `/games/:slug`. */
export function gamePath(slug: string): string {
  return `/games/${encodeURIComponent(slug)}`
}
