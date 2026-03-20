export const QUICK_RUN_SCORES_KEY = 'kgeng.quickrun.v1'

export type QuickRunMode = 'normal' | 'hard' | 'frenzy'

export interface QuickRunScore {
  ms: number
  at: string
  levelId: string
  mode: QuickRunMode
}

/** Max stored runs per level (normal + hard share this list; mode distinguishes rows). */
const MAX_SCORES_PER_LEVEL = 5

function parseScores(raw: string | null): QuickRunScore[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(
      (row): row is QuickRunScore =>
        row !== null &&
        typeof row === 'object' &&
        typeof (row as QuickRunScore).ms === 'number' &&
        typeof (row as QuickRunScore).at === 'string' &&
        typeof (row as QuickRunScore).levelId === 'string' &&
        ((row as QuickRunScore).mode === 'normal' ||
          (row as QuickRunScore).mode === 'hard' ||
          (row as QuickRunScore).mode === 'frenzy')
    )
  } catch {
    return []
  }
}

/** All runs in storage (across levels). */
export function loadQuickRunScores(): QuickRunScore[] {
  if (typeof localStorage === 'undefined') return []
  return parseScores(localStorage.getItem(QUICK_RUN_SCORES_KEY))
}

/** Best times for a single level, fastest first. */
export function scoresForLevel(levelId: string): QuickRunScore[] {
  return loadQuickRunScores()
    .filter((s) => s.levelId === levelId)
    .sort((a, b) => a.ms - b.ms)
    .slice(0, MAX_SCORES_PER_LEVEL)
}

export function recordQuickRunScore(entry: QuickRunScore): QuickRunScore[] {
  if (typeof localStorage === 'undefined') return [entry]
  const all = loadQuickRunScores()
  const others = all.filter((s) => s.levelId !== entry.levelId)
  const forLevel = all.filter((s) => s.levelId === entry.levelId)
  const merged = [...forLevel, entry].sort((a, b) => a.ms - b.ms).slice(0, MAX_SCORES_PER_LEVEL)
  const next = [...others, ...merged]
  localStorage.setItem(QUICK_RUN_SCORES_KEY, JSON.stringify(next))
  return merged
}

export function clearQuickRunScoresForLevel(levelId: string): void {
  if (typeof localStorage === 'undefined') return
  const next = loadQuickRunScores().filter((s) => s.levelId !== levelId)
  localStorage.setItem(QUICK_RUN_SCORES_KEY, JSON.stringify(next))
}

/** Remove all per-level quick run scores (all levels, both modes). */
export function clearAllQuickRunScores(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(QUICK_RUN_SCORES_KEY)
}

export const QUICK_RUN_OVERALL_KEY = 'kgeng.quickrun.overall.v1'

export interface OverallRunScore {
  ms: number
  at: string
  mode: QuickRunMode
}

const MAX_OVERALL_SCORES = 10

function parseOverallScores(raw: string | null): OverallRunScore[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(
      (row): row is OverallRunScore =>
        row !== null &&
        typeof row === 'object' &&
        typeof (row as OverallRunScore).ms === 'number' &&
        typeof (row as OverallRunScore).at === 'string' &&
        ((row as OverallRunScore).mode === 'normal' || (row as OverallRunScore).mode === 'hard')
    )
  } catch {
    return []
  }
}

export function loadOverallRunScores(): OverallRunScore[] {
  if (typeof localStorage === 'undefined') return []
  return parseOverallScores(localStorage.getItem(QUICK_RUN_OVERALL_KEY))
}

export function overallScoresForMode(mode: QuickRunMode): OverallRunScore[] {
  return loadOverallRunScores()
    .filter((s) => s.mode === mode)
    .sort((a, b) => a.ms - b.ms)
    .slice(0, MAX_OVERALL_SCORES)
}

export function recordOverallRunScore(entry: OverallRunScore): OverallRunScore[] {
  if (typeof localStorage === 'undefined') return [entry]
  const all = loadOverallRunScores()
  const others = all.filter((s) => s.mode !== entry.mode)
  const forMode = all.filter((s) => s.mode === entry.mode)
  const merged = [...forMode, entry].sort((a, b) => a.ms - b.ms).slice(0, MAX_OVERALL_SCORES)
  const next = [...others, ...merged]
  localStorage.setItem(QUICK_RUN_OVERALL_KEY, JSON.stringify(next))
  return merged
}

export function clearOverallRunScores(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(QUICK_RUN_OVERALL_KEY)
}

/** Legacy flat list (all runs were 20 mazes). */
export const QUICK_RUN_FRENZY_KEY_V1 = 'kgeng.quickrun.frenzy.v1'

/** Buckets: `"5" | "10" | "20"` → scores (or legacy JSON array → treated as 20). */
export const QUICK_RUN_FRENZY_KEY = 'kgeng.quickrun.frenzy.v2'

const FRENZY_PREF_KEY = 'kgeng.quickrun.frenzy.pref'

export type FrenzyMazeCount = 5 | 10 | 20

export const FRENZY_MAZE_COUNTS: readonly FrenzyMazeCount[] = [5, 10, 20]

export interface FrenzyRunScore {
  ms: number
  at: string
}

const MAX_FRENZY_SCORES = 10

function parseFrenzyScoreRows(data: unknown): FrenzyRunScore[] {
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is FrenzyRunScore =>
      row !== null &&
      typeof row === 'object' &&
      typeof (row as FrenzyRunScore).ms === 'number' &&
      typeof (row as FrenzyRunScore).at === 'string'
  )
}

function parseFrenzyScores(raw: string | null): FrenzyRunScore[] {
  if (!raw) return []
  try {
    return parseFrenzyScoreRows(JSON.parse(raw) as unknown)
  } catch {
    return []
  }
}

type FrenzyBuckets = Record<string, FrenzyRunScore[]>

function saveFrenzyBuckets(buckets: FrenzyBuckets): void {
  localStorage.setItem(QUICK_RUN_FRENZY_KEY, JSON.stringify(buckets))
}

function loadFrenzyBuckets(): FrenzyBuckets {
  if (typeof localStorage === 'undefined') return {}

  const v2 = localStorage.getItem(QUICK_RUN_FRENZY_KEY)
  if (v2) {
    try {
      const parsed = JSON.parse(v2) as unknown
      if (Array.isArray(parsed)) {
        const arr = parseFrenzyScoreRows(parsed)
        return arr.length ? { '20': arr } : {}
      }
      if (parsed && typeof parsed === 'object') {
        const out: FrenzyBuckets = {}
        for (const k of ['5', '10', '20']) {
          const rows = (parsed as Record<string, unknown>)[k]
          if (Array.isArray(rows)) out[k] = parseFrenzyScoreRows(rows)
        }
        return out
      }
    } catch {
      return {}
    }
  }

  const v1 = localStorage.getItem(QUICK_RUN_FRENZY_KEY_V1)
  if (v1) {
    const arr = parseFrenzyScores(v1)
    if (arr.length) {
      const buckets: FrenzyBuckets = { '20': arr }
      saveFrenzyBuckets(buckets)
      localStorage.removeItem(QUICK_RUN_FRENZY_KEY_V1)
      return buckets
    }
  }

  return {}
}

export function loadFrenzyMazeCount(): FrenzyMazeCount {
  if (typeof localStorage === 'undefined') return 20
  const raw = localStorage.getItem(FRENZY_PREF_KEY)
  if (raw === '5' || raw === '10' || raw === '20') return Number(raw) as FrenzyMazeCount
  return 20
}

export function saveFrenzyMazeCount(n: FrenzyMazeCount): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(FRENZY_PREF_KEY, String(n))
}

export function frenzyScores(count: FrenzyMazeCount): FrenzyRunScore[] {
  if (typeof localStorage === 'undefined') return []
  const list = loadFrenzyBuckets()[String(count)] ?? []
  return [...list].sort((a, b) => a.ms - b.ms).slice(0, MAX_FRENZY_SCORES)
}

export function recordFrenzyScore(entry: FrenzyRunScore, count: FrenzyMazeCount): FrenzyRunScore[] {
  if (typeof localStorage === 'undefined') return [entry]
  const buckets = loadFrenzyBuckets()
  const key = String(count)
  const prev = buckets[key] ?? []
  const merged = [...prev, entry].sort((a, b) => a.ms - b.ms).slice(0, MAX_FRENZY_SCORES)
  buckets[key] = merged
  saveFrenzyBuckets(buckets)
  return merged
}

/** Clear one maze-count bucket, or all frenzy rows if `count` is omitted. */
export function clearFrenzyScores(count?: FrenzyMazeCount): void {
  if (typeof localStorage === 'undefined') return
  if (count === undefined) {
    localStorage.removeItem(QUICK_RUN_FRENZY_KEY)
    localStorage.removeItem(QUICK_RUN_FRENZY_KEY_V1)
    return
  }
  const buckets = loadFrenzyBuckets()
  delete buckets[String(count)]
  if (Object.keys(buckets).length === 0) {
    localStorage.removeItem(QUICK_RUN_FRENZY_KEY)
  } else {
    saveFrenzyBuckets(buckets)
  }
}

