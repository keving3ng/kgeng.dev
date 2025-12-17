// Centralized navigation configuration

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
  { label: 'splits', url: '/tools/splits' },
  { label: 'recipeer', url: '/tools/recipeer' },
]

export const lists: NavLink[] = [
  { label: 'projects', url: '/projects' },
  { label: 'picks', url: '/picks' },
  { label: 'recipes', url: '/recipes' },
]
