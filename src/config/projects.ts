export interface ProjectStats {
  visibility?: 'public' | 'private'
  status?: 'active' | 'on hiatus' | 'archived'
  commits?: number
  started?: string
  language?: string
}

export interface Project {
  slug: string
  name: string
  description: string
  url?: string
  repo?: string
  note?: string
  why?: string
  stats?: ProjectStats
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
    why: 'started as a collab with a friend who creates matcha content — i wanted an easy way to pull up her picks while walking around toronto. it never quite got off the ground and is on hiatus for now, though i plan to revisit it.',
    stats: {
      visibility: 'public',
      status: 'on hiatus',
      commits: 375,
      started: '2025-09',
      language: 'typescript',
    },
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
    note: 'personal website and blog built with react, typescript, and cloudflare pages, backed by notion for writing and recipes.',
    why: 'a custom notion-backed site felt cleaner than an off-the-shelf blog template — i wanted to build it myself for fun, and keeping drafts in notion keeps me organized (though i may swap the setup in the future).',
    stats: {
      visibility: 'public',
      status: 'active',
      commits: 93,
      started: '2025-08',
      language: 'typescript',
    },
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
    description: 'agent task coordination engine.',
    note: 'python runtime with rest api, mcp adapter, and sqlite task state for coordinating multi-agent workflows.',
    why: 'i needed a single place to track ideas and plans across an ever-growing list of side projects and personal tools. the bigger goal is building toward an autonomous software factory at home — i have more ideas than time to steer them, and it doubles as a sandbox for exploring ai tooling and where engineering is headed.',
    stats: {
      visibility: 'private',
      status: 'active',
      commits: 32,
      started: '2026-10',
      language: 'python',
    },
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
    description: 'instagram analytics tracker.',
    note: 'private dashboard tracking impressions, follower growth trends, post metrics, and composed analytics.',
    why: 'built for more control over raw social data, inspired by workflows where ai agents analyze metrics to suggest content improvements. i wanted a visualizer for key and composed metrics alongside fast, flexible text exports ready to drop straight into a chatbot.',
    stats: {
      visibility: 'private',
      status: 'active',
      commits: 197,
      started: '2026-04',
      language: 'typescript',
    },
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
    why: 'i wanted full control over the brewing workflow without ads or bloat — something simple i could self-host locally.',
    stats: {
      visibility: 'private',
      status: 'active',
      commits: 8,
      started: '2026-10',
      language: 'javascript',
    },
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
    description: 'homelab container deployment tool.',
    note: 'declarative deployment cli that orchestrates unraid containers, isolated release inputs, and backup checkpoints.',
    why: 'built to standardize homelab deployments and remove manual friction. unambiguous, declarative tooling also works far more reliably when ai agents are running deployments.',
    stats: {
      visibility: 'private',
      status: 'active',
      commits: 181,
      started: '2026-03',
      language: 'shell',
    },
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
    description: 'self-hosted server & tailnet infra.',
    note: 'nas storage, container workloads, local git mirrors, and a private npm registry.',
    why: 'home servers are fun — it started as a media server, and once i had spare compute sitting around it made sense to host my own homelab tools on it too.',
    stats: {
      visibility: 'private',
      status: 'active',
    },
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
    description: 'personal cli tools and homelab utilities.',
    note: 'focused single-purpose tools featuring vball tracker, keg-watch, keg-wm, kegrun, and drinkiediary.',
    why: 'it is fun to scratch my own itch and solve personal day-to-day problems with small, purpose-built software tools quickly.',
    stats: {
      visibility: 'private',
      status: 'active',
      commits: 176,
      started: '2026-03',
      language: 'typescript',
    },
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
