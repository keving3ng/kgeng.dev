import { describe, expect, it } from 'vitest'
import { generateRandomMazeLines } from './generateRandomMaze'
import { LEVELS, getParsedLevel } from './levels'
import { parseLevel, shortestPathCells, shortestPathLength } from './maze'

describe('parseLevel', () => {
  it('parses start and goal', () => {
    const p = parseLevel(['###', '#sg', '###'])
    expect(p.start).toEqual({ row: 1, col: 1 })
    expect(p.goal).toEqual({ row: 1, col: 2 })
    expect(p.wall[0][1]).toBe(true)
    expect(p.wall[1][1]).toBe(false)
    expect(p.wall[1][2]).toBe(false)
  })
})

describe('shortestPathCells', () => {
  it('matches shortestPathLength for a small maze', () => {
    const p = parseLevel([
      '#####',
      '#s..#',
      '#.#g#',
      '#####',
    ])
    const path = shortestPathCells(p.wall, p.start, p.goal)
    expect(path).not.toBeNull()
    expect(path!.length - 1).toBe(shortestPathLength(p.wall, p.start, p.goal))
  })
})

describe('shortestPathLength', () => {
  it('returns 0 when start equals goal', () => {
    const wall = [[true, true], [true, false]]
    expect(shortestPathLength(wall, { row: 1, col: 1 }, { row: 1, col: 1 })).toBe(0)
  })

  it('finds shortest path', () => {
    const p = parseLevel([
      '#####',
      '#s..#',
      '#.#g#',
      '#####',
    ])
    const n = shortestPathLength(p.wall, p.start, p.goal)
    expect(n).toBe(3)
  })

  it('returns null when goal unreachable', () => {
    const p = parseLevel([
      '#####',
      '#s#g#',
      '#####',
    ])
    expect(shortestPathLength(p.wall, p.start, p.goal)).toBeNull()
  })
})

describe('authored levels', () => {
  it('every level has a path from start to goal', () => {
    for (const def of LEVELS) {
      const p = getParsedLevel(def)
      expect(shortestPathLength(p.wall, p.start, p.goal), def.id).not.toBeNull()
    }
  })
})

describe('generateRandomMazeLines', () => {
  it('produces solvable mazes (sample)', () => {
    for (let i = 0; i < 50; i++) {
      const lines = generateRandomMazeLines(11, 11)
      const p = parseLevel(lines)
      expect(shortestPathLength(p.wall, p.start, p.goal), `trial ${i}`).not.toBeNull()
    }
  })
})
