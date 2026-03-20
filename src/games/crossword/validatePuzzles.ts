import type { DerivedClue, PuzzleDefinition } from './types'
import { getWordById } from './wordBank'

const SIZE = 4

function cellsForPlacement(
  p: PuzzleDefinition['placements'][0],
  len: number
): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = []
  for (let i = 0; i < len; i++) {
    if (p.dir === 'across') {
      out.push({ row: p.row, col: p.col + i })
    } else {
      out.push({ row: p.row + i, col: p.col })
    }
  }
  return out
}

/** Across clues first (row, col), then down (row, col). */
export function sortPlacementsSolveOrder(
  placements: PuzzleDefinition['placements']
): PuzzleDefinition['placements'] {
  const across = placements.filter((x) => x.dir === 'across')
  const down = placements.filter((x) => x.dir === 'down')
  across.sort((a, b) => a.row - b.row || a.col - b.col)
  down.sort((a, b) => a.row - b.row || a.col - b.col)
  return [...across, ...down]
}

/**
 * Build the solution letter grid and validate placements against the bank.
 * Throws with a message if anything is inconsistent.
 */
export function buildSolutionGrid(puzzle: PuzzleDefinition): string[][] {
  if (puzzle.blocks.length !== SIZE || puzzle.blocks.some((r) => r.length !== SIZE)) {
    throw new Error(`puzzle ${puzzle.id}: blocks must be ${SIZE}×${SIZE}`)
  }

  const grid: (string | null)[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null)
  )

  for (const pl of puzzle.placements) {
    const entry = getWordById(pl.wordId)
    if (!entry) {
      throw new Error(`puzzle ${puzzle.id}: unknown wordId ${pl.wordId}`)
    }
    const word = entry.word
    const cells = cellsForPlacement(pl, word.length)

    for (let i = 0; i < cells.length; i++) {
      const { row, col } = cells[i]
      if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) {
        throw new Error(`puzzle ${puzzle.id}: placement out of bounds`)
      }
      if (puzzle.blocks[row][col]) {
        throw new Error(`puzzle ${puzzle.id}: letter on blocked cell (${row},${col})`)
      }
      const ch = word[i]
      const prev = grid[row][col]
      if (prev !== null && prev !== ch) {
        throw new Error(
          `puzzle ${puzzle.id}: letter clash at (${row},${col}): ${prev} vs ${ch}`
        )
      }
      grid[row][col] = ch
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle.blocks[r][c]) {
        if (grid[r][c] !== null) {
          throw new Error(`puzzle ${puzzle.id}: blocked cell (${r},${c}) has a letter`)
        }
        continue
      }
      if (grid[r][c] === null) {
        throw new Error(`puzzle ${puzzle.id}: white cell (${r},${c}) not covered by any word`)
      }
    }
  }

  return grid.map((row) => row.map((cell) => cell as string))
}

export function deriveClues(puzzle: PuzzleDefinition): DerivedClue[] {
  buildSolutionGrid(puzzle)
  const ordered = sortPlacementsSolveOrder(puzzle.placements)
  const clues: DerivedClue[] = []

  ordered.forEach((pl, index) => {
    const entry = getWordById(pl.wordId)
    if (!entry) throw new Error(`missing word ${pl.wordId}`)
    const cells = cellsForPlacement(pl, entry.word.length)
    clues.push({
      index,
      puzzleId: puzzle.id,
      wordId: pl.wordId,
      word: entry.word,
      hint: entry.hint,
      dir: pl.dir,
      row: pl.row,
      col: pl.col,
      cells,
    })
  })

  return clues
}

/** Run all checks; throws on first error. */
export function validateAllPuzzles(puzzles: PuzzleDefinition[]): void {
  for (const p of puzzles) {
    buildSolutionGrid(p)
    deriveClues(p)
  }
}
