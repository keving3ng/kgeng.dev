// Centralized navigation configuration (URLs must match `config/paths.ts`)

import { paths } from './paths'

export interface NavLink {
  label: string
  url: string
}

export const socialLinks: NavLink[] = [
  { label: 'GitHub', url: 'https://github.com/keving3ng' },
  { label: 'Twitter', url: 'https://twitter.com/keving3ng' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/keving3ng' },
]

export const tools: NavLink[] = [
  { label: 'splits', url: paths.tools.splits },
  { label: 'recipeer', url: paths.tools.recipeer },
  { label: 'boba', url: paths.tools.boba },
]

export const lists: NavLink[] = [
  { label: 'projects', url: paths.projects },
  { label: 'games', url: paths.games },
  { label: 'picks', url: paths.picks },
  { label: 'recipes', url: paths.recipes },
]
