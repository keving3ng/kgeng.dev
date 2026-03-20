import type { LevelDefinition } from './levels'
import type { Pos } from './maze'
import { shortestPathCells } from './maze'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Odd size in [min, max], inclusive. */
function randomOddSize(min: number, max: number): number {
  const lo = Math.ceil(min / 2) * 2 + 1
  const hi = Math.floor(max / 2) * 2 + 1
  if (hi < lo) return min % 2 === 1 ? min : min + 1
  const steps = (hi - lo) / 2 + 1
  return lo + 2 * Math.floor(Math.random() * steps)
}

/** Recursive backtracker: `true` = wall, `false` = path. */
function carveMaze(rows: number, cols: number): boolean[][] {
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => true)
  )

  const carve = (r: number, c: number) => {
    grid[r]![c] = false
    const dirs = shuffle([
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ] as const)
    for (const [dr, dc] of dirs) {
      const nr = r + dr
      const nc = c + dc
      if (nr <= 0 || nr >= rows - 1 || nc <= 0 || nc >= cols - 1) continue
      if (!grid[nr]![nc]) continue
      const wr = r + dr / 2
      const wc = c + dc / 2
      grid[wr]![wc] = false
      carve(nr, nc)
    }
  }

  carve(1, 1)
  return grid
}

/** Longest run of consecutive moves in the same direction along the path. */
function maxStraightRunOnPath(path: Pos[]): number {
  if (path.length < 2) return 0
  let maxRun = 1
  let run = 1
  let pr = path[1]!.row - path[0]!.row
  let pc = path[1]!.col - path[0]!.col
  for (let i = 2; i < path.length; i++) {
    const dr = path[i]!.row - path[i - 1]!.row
    const dc = path[i]!.col - path[i - 1]!.col
    if (dr === pr && dc === pc) {
      run++
      maxRun = Math.max(maxRun, run)
    } else {
      run = 1
      pr = dr
      pc = dc
    }
  }
  return maxRun
}

function collectPathCells(grid: boolean[][], rows: number, cols: number): Pos[] {
  const out: Pos[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r]![c]) out.push({ row: r, col: c })
    }
  }
  return out
}

/**
 * Pick start/goal so the shortest path is winding: prefer long paths, then minimize
 * longest straight segment (avoids trivial adjacent pairs and “runway” corridors).
 */
function pickStartGoal(grid: boolean[][], rows: number, cols: number): { start: Pos; goal: Pos } {
  const pathCells = collectPathCells(grid, rows, cols)
  if (pathCells.length < 2) {
    return { start: { row: 1, col: 1 }, goal: { row: 1, col: 1 } }
  }

  const minMoves = Math.min(12, Math.max(6, Math.floor((rows + cols) / 2)))
  type Cand = { start: Pos; goal: Pos; maxStr: number; len: number }
  const cands: Cand[] = []
  const wall = grid
  const SAMPLES = 220

  for (let t = 0; t < SAMPLES; t++) {
    const i = Math.floor(Math.random() * pathCells.length)
    let j = Math.floor(Math.random() * pathCells.length)
    if (j === i) j = (j + 1) % pathCells.length
    const start = pathCells[i]!
    const goal = pathCells[j]!
    const path = shortestPathCells(wall, start, goal)
    if (!path || path.length < 2) continue
    const len = path.length - 1
    if (len < minMoves) continue
    const maxStr = maxStraightRunOnPath(path)
    cands.push({ start, goal, maxStr, len })
  }

  if (cands.length === 0) {
    for (let t = 0; t < SAMPLES; t++) {
      const i = Math.floor(Math.random() * pathCells.length)
      let j = Math.floor(Math.random() * pathCells.length)
      if (j === i) j = (j + 1) % pathCells.length
      const start = pathCells[i]!
      const goal = pathCells[j]!
      const path = shortestPathCells(wall, start, goal)
      if (!path || path.length < 2) continue
      const len = path.length - 1
      const maxStr = maxStraightRunOnPath(path)
      cands.push({ start, goal, maxStr, len })
    }
  }

  if (cands.length === 0) {
    return { start: pathCells[0]!, goal: pathCells[pathCells.length - 1]! }
  }

  cands.sort((a, b) => {
    if (a.maxStr !== b.maxStr) return a.maxStr - b.maxStr
    return b.len - a.len
  })

  return { start: cands[0]!.start, goal: cands[0]!.goal }
}

/**
 * Build one solvable random maze (perfect maze + start/goal chosen for winding shortest path).
 * Rows/cols are odd, typically 9–15.
 */
export function generateRandomMazeLines(rows: number, cols: number): string[] {
  const grid = carveMaze(rows, cols)
  const { start, goal } = pickStartGoal(grid, rows, cols)

  const lines: string[] = []
  for (let r = 0; r < rows; r++) {
    let line = ''
    for (let c = 0; c < cols; c++) {
      if (r === start.row && c === start.col) line += 's'
      else if (r === goal.row && c === goal.col) line += 'g'
      else line += grid[r]![c]! ? '#' : '.'
    }
    lines.push(line)
  }
  return lines
}

export function generateFrenzyLevel(index: number): LevelDefinition {
  const rows = randomOddSize(9, 15)
  const cols = randomOddSize(9, 15)
  return {
    id: `frenzy-${index}-${rows}x${cols}`,
    lines: generateRandomMazeLines(rows, cols),
  }
}
