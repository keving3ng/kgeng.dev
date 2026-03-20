export const CROSSWORD_SCORES_KEY = 'kgeng.crossword.speedrun.v1'

export interface CrosswordScore {
  ms: number
  at: string
  puzzleId: string
}

const MAX_SCORES = 20

function parseScores(raw: string | null): CrosswordScore[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data
      .filter(
        (row): row is CrosswordScore =>
          row !== null &&
          typeof row === 'object' &&
          typeof (row as CrosswordScore).ms === 'number' &&
          typeof (row as CrosswordScore).at === 'string' &&
          typeof (row as CrosswordScore).puzzleId === 'string'
      )
      .sort((a, b) => a.ms - b.ms)
      .slice(0, MAX_SCORES)
  } catch {
    return []
  }
}

export function loadCrosswordScores(): CrosswordScore[] {
  if (typeof localStorage === 'undefined') return []
  return parseScores(localStorage.getItem(CROSSWORD_SCORES_KEY))
}

export function recordCrosswordScore(entry: CrosswordScore): CrosswordScore[] {
  if (typeof localStorage === 'undefined') return [entry]
  const next = [...loadCrosswordScores(), entry].sort((a, b) => a.ms - b.ms).slice(0, MAX_SCORES)
  localStorage.setItem(CROSSWORD_SCORES_KEY, JSON.stringify(next))
  return next
}

export function clearCrosswordScores(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(CROSSWORD_SCORES_KEY)
}
