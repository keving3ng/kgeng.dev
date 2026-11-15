import { paths } from './paths'

/** Shell-style working directory for the current route (e.g. `~/work`). */
export function promptPath(pathname: string): string {
  if (pathname === paths.home) return '~'
  if (pathname.startsWith('/post/')) return `~/writing/${pathname.slice('/post/'.length)}`
  if (pathname === paths.cv) return '~/about/cv'
  if (pathname.startsWith('/tools/')) return `~${pathname}`
  return `~${pathname.replace(/\/$/, '')}`
}
