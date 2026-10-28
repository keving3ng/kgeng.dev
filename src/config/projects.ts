export interface Project {
  name: string
  description: string
  url?: string
  note?: string
}

export const projects: Project[] = [
  {
    name: 'matchamap',
    description: 'a community platform for matcha lovers.',
    url: 'https://matchamap.club',
    note: 'discover matcha spots, share reviews, and connect with fellow enthusiasts.',
  },
  {
    name: 'kgeng.dev',
    description: 'this site.',
    url: 'https://kgeng.dev',
    note: 'personal website and blog built with react, typescript, and cloudflare pages.',
  },
]
