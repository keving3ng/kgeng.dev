export interface Pos {
  row: number
  col: number
}

export type Dir = 'up' | 'down' | 'left' | 'right'

const DELTA: Record<Dir, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
}

export interface ParsedLevel {
  wall: boolean[][]
  start: Pos
  goal: Pos
  rows: number
  cols: number
}

/**
 * Lines use `#` wall, `.` path, `s` start, `g` goal. All rows must be equal length.
 */
export function parseLevel(lines: string[]): ParsedLevel {
  if (lines.length === 0) throw new Error('empty level')
  const cols = lines[0].length
  for (const line of lines) {
    if (line.length !== cols) throw new Error('jagged level lines')
  }
  let start: Pos | null = null
  let goal: Pos | null = null
  const wall: boolean[][] = []

  for (let row = 0; row < lines.length; row++) {
    wall[row] = []
    for (let col = 0; col < cols; col++) {
      const ch = lines[row][col]
      if (ch === '#') {
        wall[row][col] = true
      } else if (ch === '.') {
        wall[row][col] = false
      } else if (ch === 's') {
        wall[row][col] = false
        if (start) throw new Error('multiple starts')
        start = { row, col }
      } else if (ch === 'g') {
        wall[row][col] = false
        if (goal) throw new Error('multiple goals')
        goal = { row, col }
      } else {
        throw new Error(`invalid cell "${ch}"`)
      }
    }
  }

  if (!start || !goal) throw new Error('missing start or goal')

  return {
    wall,
    start,
    goal,
    rows: lines.length,
    cols,
  }
}

export function posKey(p: Pos): string {
  return `${p.row},${p.col}`
}

/** Shortest number of moves from start to goal; null if unreachable. */
export function shortestPathLength(
  wall: boolean[][],
  start: Pos,
  goal: Pos
): number | null {
  if (start.row === goal.row && start.col === goal.col) return 0
  const rows = wall.length
  const cols = wall[0]?.length ?? 0
  const q: Pos[] = [start]
  const seen = new Map<string, number>()
  seen.set(posKey(start), 0)

  while (q.length > 0) {
    const p = q.shift()!
    const d = seen.get(posKey(p))!
    for (const dir of Object.keys(DELTA) as Dir[]) {
      const { dr, dc } = DELTA[dir]
      const nr = p.row + dr
      const nc = p.col + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (wall[nr][nc]) continue
      const next: Pos = { row: nr, col: nc }
      const k = posKey(next)
      if (seen.has(k)) continue
      const nd = d + 1
      seen.set(k, nd)
      if (nr === goal.row && nc === goal.col) return nd
      q.push(next)
    }
  }

  return null
}

/** Shortest path as cell sequence (start → goal), or null. */
export function shortestPathCells(wall: boolean[][], start: Pos, goal: Pos): Pos[] | null {
  if (start.row === goal.row && start.col === goal.col) return [start]
  const rows = wall.length
  const cols = wall[0]?.length ?? 0
  const q: Pos[] = [start]
  const parent = new Map<string, string | null>()
  parent.set(posKey(start), null)

  while (q.length > 0) {
    const p = q.shift()!
    for (const dir of Object.keys(DELTA) as Dir[]) {
      const { dr, dc } = DELTA[dir]
      const nr = p.row + dr
      const nc = p.col + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (wall[nr][nc]) continue
      const next: Pos = { row: nr, col: nc }
      const k = posKey(next)
      if (parent.has(k)) continue
      parent.set(k, posKey(p))
      if (nr === goal.row && nc === goal.col) {
        const out: Pos[] = []
        let cur: Pos | null = goal
        while (cur) {
          out.push(cur)
          const pk = parent.get(posKey(cur))
          if (!pk) break
          const [pr, pc] = pk.split(',').map(Number)
          cur = { row: pr!, col: pc! }
        }
        out.reverse()
        return out
      }
      q.push(next)
    }
  }

  return null
}

export function neighbor(pos: Pos, dir: Dir): Pos {
  const { dr, dc } = DELTA[dir]
  return { row: pos.row + dr, col: pos.col + dc }
}

export function inBounds(p: Pos, rows: number, cols: number): boolean {
  return p.row >= 0 && p.row < rows && p.col >= 0 && p.col < cols
}

/** Whether stepping from `pos` in `dir` hits a wall or boundary (treat boundary as wall). */
export function isStepBlocked(wall: boolean[][], rows: number, cols: number, pos: Pos, dir: Dir): boolean {
  const next = neighbor(pos, dir)
  if (!inBounds(next, rows, cols)) return true
  return wall[next.row][next.col]
}
