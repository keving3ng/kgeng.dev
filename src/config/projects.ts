export interface Project {
  slug: string
  name: string
  description: string
  url?: string
  repo?: string
  note?: string
  /** Last updated date in YYYY-MM or YYYY-MM-DD format. */
  updatedAt?: string
  /** Compact ASCII art badge shown in the project detail header. */
  asciiIcon?: string
  stack?: string[]
  highlights?: string[]
  body?: string[]
}

export const projects: Project[] = [
  {
    slug: 'matchamap',
    name: 'matchamap',
    description: 'a community platform for matcha lovers.',
    url: 'https://matchamap.club',
    note: 'discover matcha spots, share reviews, and connect with fellow enthusiasts.',
    updatedAt: '2026-08',
    stack: ['react', 'typescript', 'maps'],
    asciiIcon: [
      '  ~ ~ ',
      ' |___|)',
      " '---' ",
    ].join('\n'),
  },
  {
    slug: 'kgeng-dev',
    name: 'kgeng.dev',
    description: 'this site.',
    url: 'https://kgeng.dev',
    repo: 'https://github.com/keving3ng/kgeng.dev',
    note: 'personal website and blog built with react, typescript, and cloudflare pages.',
    updatedAt: '2026-11',
    stack: ['react', 'typescript', 'tailwind', 'cloudflare pages', 'notion'],
    asciiIcon: [
      '┌─────┐',
      '│ >_  │',
      '└─────┘',
    ].join('\n'),
  },
  {
    slug: 'workbench',
    name: 'workbench',
    description: 'personal agent task coordination and workflow engine.',
    note: 'python runtime with rest api, mcp adapter, and sqlite task state.',
    updatedAt: '2026-10',
    stack: ['python', 'sqlite', 'mcp'],
    asciiIcon: [
      '┌─┬─┬─┐',
      '│■│ │■│',
      '└─┴─┴─┘',
    ].join('\n'),
  },
  {
    slug: 'vivisualizer',
    name: 'vivisualizer',
    description: 'instagram analytics and media insights tracker.',
    note: 'private dashboard tracking impressions, follower growth trends, and post metrics.',
    updatedAt: '2026-05',
    asciiIcon: [
      '    █ ',
      '  █ █ ',
      '█ █ █ ',
    ].join('\n'),
  },
  {
    slug: 'overpour',
    name: 'overpour',
    description: 'pourover coffee brew tracker and timer.',
    note: 'ratio calculators, extraction recipes, and brew logging.',
    updatedAt: '2026-03',
    asciiIcon: [
      ' \\   / ',
      '  \\_/  ',
      '  |_|  ',
    ].join('\n'),
  },
  {
    slug: 'keg-tool',
    name: 'keg tool/jonas-config workflow',
    description: 'declarative homelab service deployment and container lifecycle tool.',
    note: 'orchestrates unraid containers, isolated release inputs, and backup checkpoints.',
    updatedAt: '2026-09',
    asciiIcon: [
      ' ┌───┐ ',
      ' ├─═─┤ ',
      ' └───┘ ',
    ].join('\n'),
  },
  {
    slug: 'keglab',
    name: 'jonas/keglab setup',
    description: 'self-hosted home server and private tailnet infrastructure.',
    note: 'nas storage, container workloads, local git mirrors, and private npm registry.',
    updatedAt: '2026-09',
    asciiIcon: [
      ' [===] ',
      ' [===] ',
      ' [o o] ',
    ].join('\n'),
  },
  {
    slug: 'personal-utilities',
    name: 'personal utilities',
    description: 'collection of focused personal tools and homelab utilities.',
    note: 'featuring vball tracker, keg-watch, keg-wm, kegrun, and drinkiediary.',
    updatedAt: '2026-07',
    asciiIcon: [
      ' ┌───┐ ',
      ' │ + │ ',
      ' └───┘ ',
    ].join('\n'),
  },
]

export function findProject(slug: string | undefined): Project | undefined {
  if (!slug) return undefined
  return projects.find((p) => p.slug === slug)
}
