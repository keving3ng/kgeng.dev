/**
 * Canonical URL paths for the client app. Use these instead of string literals
 * so routes stay aligned with `routes.tsx` and React Router.
 */
export const paths = {
  home: '/',
  work: '/work',
  writing: '/writing',
  about: '/about',
  cv: '/cv',
  tools: {
    splits: '/tools/splits',
    recipeer: '/tools/recipeer',
  },
  picks: '/picks',
  recipes: '/picks/recipes',
  test: '/test',
} as const

/** Legacy paths that redirect to their new homes. */
export const legacyRedirects: Record<string, string> = {
  '/blog': paths.writing,
  '/projects': paths.work,
  '/recipes': paths.recipes,
}

/** Index filtered to tools (the `tools` tab has no page of its own). */
export const toolsIndexPath = `${paths.home}?type=tool`

/** Permalink path for a blog post (matches `/post/:slug`). */
export function postPath(slug: string): string {
  return `/post/${encodeURIComponent(slug)}`
}
