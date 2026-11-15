// Centralized navigation configuration (URLs must match `config/paths.ts`)

import { paths, toolsIndexPath } from './paths'

export interface NavLink {
  label: string
  url: string
}

export const socialLinks: NavLink[] = [
  { label: 'GitHub', url: 'https://github.com/keving3ng' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/keving3ng' },
]

export const tools: NavLink[] = [
  { label: 'splits', url: paths.tools.splits },
  { label: 'recipeer', url: paths.tools.recipeer },
]

export const lists: NavLink[] = [
  { label: 'picks', url: paths.picks },
  { label: 'recipes', url: paths.recipes },
]

/** Top-level "directories" shown as header tabs (desktop) and in the mobile menu. */
export const mainNav: NavLink[] = [
  { label: 'work', url: paths.work },
  { label: 'writing', url: paths.writing },
  { label: 'tools', url: toolsIndexPath },
  { label: 'picks', url: paths.picks },
  { label: 'about', url: paths.about },
]
