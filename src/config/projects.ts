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
  {
    name: 'workbench',
    description: 'personal agent task coordination and workflow engine.',
    note: 'python runtime with rest api, mcp adapter, and sqlite task state.',
  },
  {
    name: 'vivisualizer',
    description: 'instagram analytics and media insights tracker.',
    note: 'private dashboard tracking impressions, follower growth trends, and post metrics.',
  },
  {
    name: 'overpour',
    description: 'pourover coffee brew tracker and timer.',
    note: 'ratio calculators, extraction recipes, and brew logging.',
  },
  {
    name: 'keg tool/jonas-config workflow',
    description: 'declarative homelab service deployment and container lifecycle tool.',
    note: 'orchestrates unraid containers, isolated release inputs, and backup checkpoints.',
  },
  {
    name: 'jonas/keglab setup',
    description: 'self-hosted home server and private tailnet infrastructure.',
    note: 'nas storage, container workloads, local git mirrors, and private npm registry.',
  },
  {
    name: 'personal utilities',
    description: 'collection of focused personal tools and homelab utilities.',
    note: 'featuring vball tracker, keg-watch, keg-wm, kegrun, and drinkiediary.',
  },
]
