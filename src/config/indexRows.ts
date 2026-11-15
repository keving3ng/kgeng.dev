import { projects } from './projects'
import { tools } from './navigation'
import { paths, postPath, projectPath } from './paths'
import type { Post } from '../types/post'

export type RowType = 'project' | 'tool' | 'post' | 'page'

export const ROW_TYPES: RowType[] = ['project', 'tool', 'post', 'page']

export interface IndexRow {
  id: string
  name: string
  type: RowType
  description: string
  date?: string | null
  /** Internal route or external URL; rows without one render as plain text. */
  href?: string
  external?: boolean
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** Formats an ISO date (`YYYY-MM` or `YYYY-MM-DD`) as lowercase `mmm yyyy` without timezone drift. */
export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const match = /^(\d{4})-(\d{2})/.exec(dateString.trim())
  if (match) {
    const year = match[1]
    const month = MONTHS[Number(match[2]) - 1]
    if (month) return `${month} ${year}`
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .toLowerCase()
}

const toolMeta: Record<string, { description: string; date: string }> = {
  splits: { description: 'intentionally rigid splitting calculator.', date: '2025-01' },
  recipeer: { description: 'see ingredient quantities inline in recipe instructions.', date: '2025-02' },
}

const pageRows: IndexRow[] = [
  { id: 'page:picks', name: 'picks', type: 'page', description: 'things i\'ve enjoyed and would recommend.', date: '2026-11', href: paths.picks },
  { id: 'page:recipes', name: 'recipes', type: 'page', description: 'a collection of recipes i\'ve saved.', date: '2026-11', href: paths.recipes },
  { id: 'page:about', name: 'about', type: 'page', description: 'a little more about me.', date: '2026-11', href: paths.about },
  { id: 'page:cv', name: 'cv', type: 'page', description: 'experience, education, and background.', date: '2026-11', href: paths.cv },
]

/** Unified rows for the home index: projects, tools, posts and pages. */
export function buildIndexRows(posts: Post[]): IndexRow[] {
  return [
    ...projects.map((p): IndexRow => ({
      id: `project:${p.slug}`,
      name: p.name,
      type: 'project',
      description: p.description,
      date: p.updatedAt ?? null,
      href: projectPath(p.slug),
    })),
    ...tools.map((t): IndexRow => ({
      id: `tool:${t.label}`,
      name: t.label,
      type: 'tool',
      description: toolMeta[t.label]?.description ?? '',
      date: toolMeta[t.label]?.date ?? null,
      href: t.url,
    })),
    ...posts.map((p): IndexRow => ({
      id: `post:${p.slug}`,
      name: p.title.toLowerCase(),
      type: 'post',
      description: p.tags.join(', '),
      date: p.date,
      href: postPath(p.slug),
    })),
    ...pageRows,
  ]
}

export function parseRowType(value: string | null): RowType | null {
  return ROW_TYPES.find((t) => t === value) ?? null
}

export function filterRows(rows: IndexRow[], type: RowType | null, query = ''): IndexRow[] {
  const q = query.trim().toLowerCase()
  return rows.filter(
    (r) =>
      (type === null || r.type === type) &&
      (q === '' || `${r.name} ${r.description} ${r.type}`.toLowerCase().includes(q)),
  )
}
