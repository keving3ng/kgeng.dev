import { describe, expect, it } from 'vitest'
import { PUZZLES } from './puzzles'
import { buildSolutionGrid, deriveClues, validateAllPuzzles } from './validatePuzzles'

describe('crossword puzzles', () => {
  it('validates all hand-authored puzzles and derives ordered across/down clues', () => {
    expect(() => validateAllPuzzles(PUZZLES)).not.toThrow()
    const p = PUZZLES.find((x) => x.id === 'ws-fall')!
    const clues = deriveClues(p)
    expect(clues).toHaveLength(8)
    expect(clues[0]).toMatchObject({ dir: 'across', word: 'FALL' })
    expect(clues[4]?.dir).toBe('down')
    const grid = buildSolutionGrid(p)
    expect(grid[0]?.join('')).toBe('FALL')
  })
})
