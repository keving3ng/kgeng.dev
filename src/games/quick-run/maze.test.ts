import { describe, expect, it } from 'vitest'
import { generateFrenzyLevel, generateRandomMazeLines } from './generateRandomMaze'
import { LEVELS, getParsedLevel } from './levels'
import { parseLevel, shortestPathCells, shortestPathLength } from './maze'

describe('maze parsing and shortest path', () => {
  it('parses start, goal, and walls and computes shortest path length and cells', () => {
    const reachable = parseLevel(['#####', '#s..#', '#.#g#', '#####'])
    expect(reachable.start).toEqual({ row: 1, col: 1 })
    expect(reachable.goal).toEqual({ row: 2, col: 3 })
    const cells = shortestPathCells(reachable.wall, reachable.start, reachable.goal)
    expect(cells).not.toBeNull()
    expect(cells!.length - 1).toBe(3)
    expect(shortestPathLength(reachable.wall, reachable.start, reachable.goal)).toBe(3)
    expect(shortestPathLength(reachable.wall, reachable.start, reachable.start)).toBe(0)

    const blocked = parseLevel(['#####', '#s#g#', '#####'])
    expect(shortestPathLength(blocked.wall, blocked.start, blocked.goal)).toBeNull()
  })

  it('validates that every authored level is solvable', () => {
    for (const def of LEVELS) {
      const p = getParsedLevel(def)
      expect(shortestPathLength(p.wall, p.start, p.goal), def.id).not.toBeNull()
    }
  })

  it('generates solvable random and frenzy mazes with increasing grid dimensions', () => {
    for (let i = 0; i < 3; i++) {
      const p = parseLevel(generateRandomMazeLines(11, 11))
      expect(shortestPathLength(p.wall, p.start, p.goal)).not.toBeNull()
    }

    const early = parseLevel(generateFrenzyLevel(0, 20).lines)
    const mid = parseLevel(generateFrenzyLevel(9, 20).lines)
    const late = parseLevel(generateFrenzyLevel(19, 20).lines)

    for (const level of [early, mid, late]) {
      expect(shortestPathLength(level.wall, level.start, level.goal)).not.toBeNull()
    }
    expect(late.rows * late.cols).toBeGreaterThan(early.rows * early.cols)
  })
})
