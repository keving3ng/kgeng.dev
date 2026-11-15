/**
 * Canonical URL paths for the client app. Use these instead of string literals
 * so routes stay aligned with `routes.tsx` and React Router.
 */
export const paths = {
  home: '/',
  writing: '/writing',
  about: '/about',
  cv: '/cv',
  tools: {
    splits: '/tools/splits',
    recipeer: '/tools/recipeer',
  },
  picks: '/picks',
  recipes: '/picks/recipes',
  trips: '/trips',
  cms: '/cms',
  test: '/test',
} as const

/** Index filtered to projects (there is no standalone `/work` list page). */
export const projectsIndexPath = `${paths.home}?type=project`

/** Index filtered to tools (the `tools` tab has no page of its own). */
export const toolsIndexPath = `${paths.home}?type=tool`

/** Legacy paths that redirect to their new homes. */
export const legacyRedirects: Record<string, string> = {
  '/blog': paths.writing,
  '/work': projectsIndexPath,
  '/projects': projectsIndexPath,
  '/recipes': paths.recipes,
}

/** Permalink path for a blog post (matches `/post/:slug`). */
export function postPath(slug: string): string {
  return `/post/${encodeURIComponent(slug)}`
}

/** Permalink path for a trip (matches `/trips/:slug`). */
export function tripPath(slug: string): string {
  return `/trips/${encodeURIComponent(slug)}`
}

/** Permalink path for a project detail page (matches `/work/:slug`). */
export function projectPath(slug: string): string {
  return `/work/${encodeURIComponent(slug)}`
}

/** Permalink path for a recipe detail page (matches `/picks/recipes/:id`). */
export function recipePath(id: string): string {
  return `/picks/recipes/${encodeURIComponent(id)}`
}
