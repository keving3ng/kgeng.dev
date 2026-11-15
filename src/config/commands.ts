import type { ThemeId } from './themes'
import { mainNav } from './navigation'
import { paths, postsIndexPath, projectsIndexPath, toolsIndexPath } from './paths'
import { filterRows, type IndexRow, type RowType } from './indexRows'

export interface CommandContext {
  rows: IndexRow[]
}

export interface CommandResult {
  output: string[]
  /** Internal route to navigate to. */
  navigate?: string
  /** External URL to open in a new tab. */
  open?: string
  clear?: boolean
  theme?: ThemeId | 'toggle'
}

interface Command {
  name: string
  help: string
  run: (args: string[], ctx: CommandContext) => CommandResult
}

const DIRS: Record<string, { path: string; type: RowType | null }> = {
  work: { path: projectsIndexPath, type: 'project' },
  writing: { path: postsIndexPath, type: 'post' },
  tools: { path: toolsIndexPath, type: 'tool' },
  picks: { path: paths.picks, type: null },
  recipes: { path: paths.recipes, type: null },
  about: { path: paths.about, type: null },
  cv: { path: paths.cv, type: null },
}

function normalizeDir(arg: string): string {
  return arg.replace(/^~?\/?/, '').replace(/\/$/, '')
}

function findRow(name: string, rows: IndexRow[]): IndexRow | undefined {
  const q = name.toLowerCase()
  return rows.find((r) => r.name.toLowerCase() === q)
}

const commands: Command[] = [
  {
    name: 'help',
    help: 'list commands',
    run: () => ({
      output: ['commands:', ...commandList().map((c) => `  ${c.name.padEnd(8)} ${c.help}`)],
    }),
  },
  {
    name: 'ls',
    help: 'ls [dir] - list things',
    run: ([arg], { rows }) => {
      if (!arg || arg === '~' || arg === '/') {
        return { output: [...mainNav.map((n) => `${n.label}/`), 'cv/'] }
      }
      const dir = DIRS[normalizeDir(arg)]
      if (!dir) return { output: [`ls: ${arg}: no such file or directory`] }
      if (dir.type === null) return { output: [] }
      const matches = filterRows(rows, dir.type)
      return { output: matches.length ? matches.map((r) => r.name) : ['(empty)'] }
    },
  },
  {
    name: 'cd',
    help: 'cd <dir> - go somewhere',
    run: ([arg]) => {
      if (!arg || arg === '~' || arg === '/') return { output: [], navigate: paths.home }
      const dir = DIRS[normalizeDir(arg)]
      if (!dir) return { output: [`cd: no such file or directory: ${arg}`] }
      return { output: [], navigate: dir.path }
    },
  },
  {
    name: 'cat',
    help: 'cat <name> - describe a project, tool or post',
    run: (args, { rows }) => {
      if (args.length === 0) return { output: ['cat: missing file operand'] }
      const row = findRow(args.join(' '), rows)
      if (!row) return { output: [`cat: ${args.join(' ')}: no such file`] }
      return { output: [`${row.name} [${row.type}]`, row.description || '(no description)'] }
    },
  },
  {
    name: 'open',
    help: 'open <name> - open a project, tool or post',
    run: (args, { rows }) => {
      if (args.length === 0) return { output: ['open: missing operand'] }
      const row = findRow(args.join(' '), rows)
      if (!row) return { output: [`open: ${args.join(' ')}: no such file`] }
      if (!row.href) return { output: [`open: ${row.name}: nothing to open`] }
      return row.external ? { output: [`opening ${row.href}`], open: row.href } : { output: [], navigate: row.href }
    },
  },
  {
    name: 'whoami',
    help: 'who is this',
    run: () => ({ output: ['kevin geng. product engineer @ faire.'] }),
  },
  {
    name: 'theme',
    help: 'theme [light|dark] - switch theme',
    run: ([arg]) => {
      if (!arg) return { output: ['theme toggled.'], theme: 'toggle' }
      if (arg === 'light' || arg === 'dark') return { output: [`theme: ${arg}`], theme: arg }
      return { output: [`theme: unknown theme '${arg}' (light|dark)`] }
    },
  },
  { name: 'clear', help: 'clear the screen', run: () => ({ output: [], clear: true }) },
  { name: 'vim', help: '', run: () => ({ output: ['you are now stuck in vim. (:q! to leave. just kidding, there is no escape.)'] }) },
  { name: 'exit', help: '', run: () => ({ output: ['there is no escape. try `cd ~`.'] }) },
  { name: 'sudo', help: '', run: () => ({ output: ['kevin is not in the sudoers file. this incident will be reported.'] }) },
  {
    name: 'rm',
    help: '',
    run: (args) => ({
      output: [args.join(' ').includes('-rf') ? 'nice try.' : 'rm: permission denied. (it is my website.)'],
    }),
  },
]

function commandList(): Command[] {
  return commands.filter((c) => c.help)
}

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/)
  if (!name) return { output: [] }
  const command = commands.find((c) => c.name === name.toLowerCase())
  if (!command) return { output: [`command not found: ${name}`] }
  return command.run(args, ctx)
}
