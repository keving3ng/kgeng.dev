import { describe, expect, it } from 'vitest'
import { PUZZLES } from './puzzles'
import { buildSolutionGrid, deriveClues, validateAllPuzzles } from './validatePuzzles'

describe('crossword puzzles', () => {
  it('validates all hand-authored puzzles', () => {
    expect(() => validateAllPuzzles(PUZZLES)).not.toThrow()
  })

  it('ws-fall has expected first across clue and solve order length', () => {
    const p = PUZZLES.find((x) => x.id === 'ws-fall')
    expect(p).toBeDefined()
    const clues = deriveClues(p!)
    expect(clues).toHaveLength(8)
    expect(clues[0].dir).toBe('across')
    expect(clues[0].word).toBe('FALL')
    expect(clues[4].dir).toBe('down')
    const grid = buildSolutionGrid(p!)
    expect(grid[0].join('')).toBe('FALL')
    expect(grid.map((r) => r[0]).join('')).toBe('FALL')
  })
})
