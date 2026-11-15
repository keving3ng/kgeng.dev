import { paths, toolsIndexPath } from './paths'

export interface PromptSegment {
  label: string
  /** Route to navigate to; `null` for the current (last) segment. */
  to: string | null
}

/** Clickable breadcrumb segments for the `kgeng@dev:~/…$` prompt. */
export function promptSegments(pathname: string): PromptSegment[] {
  if (pathname === paths.home) return [{ label: '~', to: null }]
  if (pathname.startsWith('/post/')) {
    return [
      { label: '~', to: paths.home },
      { label: 'writing', to: paths.writing },
      { label: pathname.slice('/post/'.length), to: null },
    ]
  }
  if (pathname === paths.cv) {
    return [
      { label: '~', to: paths.home },
      { label: 'about', to: paths.about },
      { label: 'cv', to: null },
    ]
  }
  if (pathname.startsWith('/tools/')) {
    return [
      { label: '~', to: paths.home },
      { label: 'tools', to: toolsIndexPath },
      { label: pathname.slice('/tools/'.length), to: null },
    ]
  }
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean)
  return [
    { label: '~', to: paths.home },
    ...parts.map((part, i) => ({
      label: part,
      to: i < parts.length - 1 ? `/${parts.slice(0, i + 1).join('/')}` : null,
    })),
  ]
}

/** Shell-style working directory for the current route (e.g. `~/work`). */
export function promptPath(pathname: string): string {
  return promptSegments(pathname)
    .map((s) => s.label)
    .join('/')
}

/** Parent route for `← cd ..` back navigation on subpages. */
export function parentPath(pathname: string): string | null {
  if (pathname === paths.home) return null
  if (pathname === paths.recipes) return paths.picks
  if (pathname.startsWith('/post/')) return paths.writing
  if (pathname === paths.cv) return paths.about
  return paths.home
}
