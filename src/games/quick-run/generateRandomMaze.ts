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

function randomOddInRange(min: number, max: number): number {
  const lo = Math.ceil(min / 2) * 2 + 1
  const hi = Math.floor(max / 2) * 2 + 1
  if (hi < lo) return min % 2 === 1 ? min : min + 1
  const steps = (hi - lo) / 2 + 1
  return lo + 2 * Math.floor(Math.random() * steps)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

// ---------------------------------------------------------------------------
// Growing Tree maze carver
// ---------------------------------------------------------------------------

/**
 * Growing Tree algorithm. `newestBias` controls cell selection:
 *   1.0 → always pick newest (DFS / recursive-backtracker: long corridors)
 *   0.0 → always pick random (Prim's-like: bushy, many short branches)
 * Values in between blend the two behaviors.
 */
function growingTree(rows: number, cols: number, newestBias: number): boolean[][] {
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => true),
  )

  const sr = 1 + 2 * Math.floor(Math.random() * Math.floor((rows - 1) / 2))
  const sc = 1 + 2 * Math.floor(Math.random() * Math.floor((cols - 1) / 2))
  grid[sr]![sc] = false

  const active: [number, number][] = [[sr, sc]]
  const DIRS: [number, number][] = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ]

  while (active.length > 0) {
    const idx =
      Math.random() < newestBias
        ? active.length - 1
        : Math.floor(Math.random() * active.length)
    const [r, c] = active[idx]!

    const unvisited: [number, number][] = []
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr]![nc]) {
        unvisited.push([nr, nc])
      }
    }

    if (unvisited.length > 0) {
      const pick = unvisited[Math.floor(Math.random() * unvisited.length)]!
      const [nr, nc] = pick
      grid[(r + nr) / 2]![(c + nc) / 2] = false
      grid[nr]![nc] = false
      active.push([nr, nc])
    } else {
      active[idx] = active[active.length - 1]!
      active.pop()
    }
  }

  return grid
}

// ---------------------------------------------------------------------------
// Braiding (dead-end removal) — creates loops for harder mazes
// ---------------------------------------------------------------------------

function openNeighborCount(
  grid: boolean[][],
  r: number,
  c: number,
  rows: number,
  cols: number,
): number {
  let n = 0
  if (r > 0 && !grid[r - 1]![c]) n++
  if (r < rows - 1 && !grid[r + 1]![c]) n++
  if (c > 0 && !grid[r]![c - 1]) n++
  if (c < cols - 1 && !grid[r]![c + 1]) n++
  return n
}

/**
 * Remove a fraction of dead ends by knocking out walls, turning the perfect
 * tree into a graph with loops. `factor` ∈ [0, 1]: 0 = no change, 1 = remove
 * every dead end.
 */
function braidMaze(
  grid: boolean[][],
  rows: number,
  cols: number,
  factor: number,
): void {
  if (factor <= 0) return

  const deadEnds: [number, number][] = []
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (!grid[r]![c] && openNeighborCount(grid, r, c, rows, cols) === 1) {
        deadEnds.push([r, c])
      }
    }
  }

  const ADJ: [number, number][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]

  for (const [r, c] of shuffle(deadEnds)) {
    if (Math.random() > factor) continue
    if (grid[r]![c] || openNeighborCount(grid, r, c, rows, cols) !== 1) continue

    const candidates: [number, number][] = []
    for (const [dr, dc] of ADJ) {
      const wr = r + dr
      const wc = c + dc
      if (wr <= 0 || wr >= rows - 1 || wc <= 0 || wc >= cols - 1) continue
      if (!grid[wr]![wc]) continue
      const br = r + 2 * dr
      const bc = c + 2 * dc
      if (br >= 1 && br < rows - 1 && bc >= 1 && bc < cols - 1 && !grid[br]![bc]) {
        candidates.push([wr, wc])
      }
    }

    if (candidates.length > 0) {
      const [wr, wc] = candidates[Math.floor(Math.random() * candidates.length)]!
      grid[wr]![wc] = false
    }
  }
}

// ---------------------------------------------------------------------------
// Start / goal selection
// ---------------------------------------------------------------------------

function collectPathCells(grid: boolean[][], rows: number, cols: number): Pos[] {
  const out: Pos[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r]![c]) out.push({ row: r, col: c })
    }
  }
  return out
}

function bfsFarthest(grid: boolean[][], source: Pos, rows: number, cols: number): Pos {
  const q: Pos[] = [source]
  const seen = new Set<number>()
  seen.add(source.row * cols + source.col)
  let farthest = source
  const ADJ: [number, number][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]

  while (q.length > 0) {
    const p = q.shift()!
    farthest = p
    for (const [dr, dc] of ADJ) {
      const nr = p.row + dr
      const nc = p.col + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (grid[nr]![nc]) continue
      const k = nr * cols + nc
      if (seen.has(k)) continue
      seen.add(k)
      q.push({ row: nr, col: nc })
    }
  }
  return farthest
}

function countTurns(path: Pos[]): number {
  if (path.length < 3) return 0
  let turns = 0
  let pr = path[1]!.row - path[0]!.row
  let pc = path[1]!.col - path[0]!.col
  for (let i = 2; i < path.length; i++) {
    const dr = path[i]!.row - path[i - 1]!.row
    const dc = path[i]!.col - path[i - 1]!.col
    if (dr !== pr || dc !== pc) {
      turns++
      pr = dr
      pc = dc
    }
  }
  return turns
}

function maxStraightRun(path: Pos[]): number {
  if (path.length < 2) return 0
  let best = 1
  let run = 1
  let pr = path[1]!.row - path[0]!.row
  let pc = path[1]!.col - path[0]!.col
  for (let i = 2; i < path.length; i++) {
    const dr = path[i]!.row - path[i - 1]!.row
    const dc = path[i]!.col - path[i - 1]!.col
    if (dr === pr && dc === pc) {
      run++
      best = Math.max(best, run)
    } else {
      run = 1
      pr = dr
      pc = dc
    }
  }
  return best
}

interface PickConstraints {
  minMoves: number
  preferTurns: boolean
}

/**
 * Find a good start/goal pair. Uses BFS-diameter heuristic (BFS from random
 * sources → farthest cell) supplemented by random sampling, then ranks
 * candidates by turn count, path length, and minimal long straights.
 */
function pickStartGoal(
  grid: boolean[][],
  rows: number,
  cols: number,
  constraints: PickConstraints,
): { start: Pos; goal: Pos } {
  const pathCells = collectPathCells(grid, rows, cols)
  if (pathCells.length < 2) {
    return { start: { row: 1, col: 1 }, goal: { row: 1, col: 1 } }
  }

  type Cand = { s: Pos; g: Pos; len: number; turns: number; maxStr: number }
  const cands: Cand[] = []

  const sources = shuffle(pathCells).slice(0, Math.min(pathCells.length, 16))
  for (const src of sources) {
    const far = bfsFarthest(grid, src, rows, cols)
    if (far.row === src.row && far.col === src.col) continue
    const path = shortestPathCells(grid, src, far)
    if (!path || path.length < 2) continue
    const len = path.length - 1
    if (len >= constraints.minMoves) {
      cands.push({ s: src, g: far, len, turns: countTurns(path), maxStr: maxStraightRun(path) })
    }
  }

  const RANDOM_SAMPLES = 120
  for (let t = 0; t < RANDOM_SAMPLES; t++) {
    const i = Math.floor(Math.random() * pathCells.length)
    let j = Math.floor(Math.random() * pathCells.length)
    if (j === i) j = (j + 1) % pathCells.length
    const s = pathCells[i]!
    const g = pathCells[j]!
    const path = shortestPathCells(grid, s, g)
    if (!path || path.length < 2) continue
    const len = path.length - 1
    if (len < constraints.minMoves) continue
    cands.push({ s, g, len, turns: countTurns(path), maxStr: maxStraightRun(path) })
  }

  if (cands.length === 0) {
    for (const src of sources.slice(0, 4)) {
      const far = bfsFarthest(grid, src, rows, cols)
      if (far.row === src.row && far.col === src.col) continue
      const path = shortestPathCells(grid, src, far)
      if (!path || path.length < 2) continue
      cands.push({
        s: src,
        g: far,
        len: path.length - 1,
        turns: countTurns(path),
        maxStr: maxStraightRun(path),
      })
    }
  }

  if (cands.length === 0) {
    return { start: pathCells[0]!, goal: pathCells[pathCells.length - 1]! }
  }

  cands.sort((a, b) => {
    const turnW = constraints.preferTurns ? 3 : 0
    const score = (c: Cand) => c.turns * turnW + c.len - c.maxStr * 2
    return score(b) - score(a)
  })

  return { start: cands[0]!.s, goal: cands[0]!.g }
}

// ---------------------------------------------------------------------------
// Difficulty configuration
// ---------------------------------------------------------------------------

interface MazeConfig {
  rows: number
  cols: number
  newestBias: number
  braidFactor: number
  minMoves: number
  preferTurns: boolean
}

/**
 * Map a normalized difficulty `t` ∈ [0, 1] to maze generation parameters.
 *
 * t ≈ 0   → small grid, DFS-like corridors, no loops, short path
 * t ≈ 0.5 → medium grid, mixed topology, light braiding
 * t ≈ 1   → large grid, bushy/branchy, moderate loops, long winding path
 */
function configForDifficulty(t: number): Omit<MazeConfig, 'rows' | 'cols'> & {
  minRows: number
  maxRows: number
  minCols: number
  maxCols: number
} {
  return {
    minRows: Math.round(lerp(7, 13, t)),
    maxRows: Math.round(lerp(9, 15, t)),
    minCols: Math.round(lerp(7, 13, t)),
    maxCols: Math.round(lerp(9, 15, t)),
    newestBias: lerp(0.95, 0.25, t),
    braidFactor: lerp(0, 0.4, Math.max(0, t - 0.2) / 0.8),
    minMoves: Math.round(lerp(4, 12, t)),
    preferTurns: t > 0.15,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function buildMazeLines(cfg: MazeConfig): string[] {
  const grid = growingTree(cfg.rows, cfg.cols, cfg.newestBias)
  braidMaze(grid, cfg.rows, cfg.cols, cfg.braidFactor)
  const { start, goal } = pickStartGoal(grid, cfg.rows, cfg.cols, {
    minMoves: cfg.minMoves,
    preferTurns: cfg.preferTurns,
  })

  const lines: string[] = []
  for (let r = 0; r < cfg.rows; r++) {
    let line = ''
    for (let c = 0; c < cfg.cols; c++) {
      if (r === start.row && c === start.col) line += 's'
      else if (r === goal.row && c === goal.col) line += 'g'
      else line += grid[r]![c]! ? '#' : '.'
    }
    lines.push(line)
  }
  return lines
}

/**
 * Generate a random maze at a given grid size with moderate difficulty.
 * Kept for backward compatibility with tests.
 */
export function generateRandomMazeLines(rows: number, cols: number): string[] {
  return buildMazeLines({
    rows,
    cols,
    newestBias: 0.75,
    braidFactor: 0.1,
    minMoves: Math.max(4, Math.floor((rows + cols) / 3)),
    preferTurns: true,
  })
}

/**
 * Generate one frenzy-mode level. Difficulty ramps from easy (index 0) to
 * hard (index total−1) by adjusting grid size, maze topology, loop density,
 * and required path length.
 */
export function generateFrenzyLevel(index: number, total: number = 20): LevelDefinition {
  const t = total <= 1 ? 1 : index / (total - 1)
  const dc = configForDifficulty(t)
  const rows = randomOddInRange(dc.minRows, dc.maxRows)
  const cols = randomOddInRange(dc.minCols, dc.maxCols)
  return {
    id: `frenzy-${index + 1}-${rows}x${cols}`,
    lines: buildMazeLines({
      rows,
      cols,
      newestBias: dc.newestBias,
      braidFactor: dc.braidFactor,
      minMoves: dc.minMoves,
      preferTurns: dc.preferTurns,
    }),
  }
}
