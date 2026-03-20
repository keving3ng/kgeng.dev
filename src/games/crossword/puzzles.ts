import type { PuzzleDefinition } from './types'

/**
 * Hand-authored 4×4 word squares (all white cells). Each puzzle uses four row
 * words and four column words from the bank; intersections are consistent.
 */
export const PUZZLES: PuzzleDefinition[] = [
  {
    id: 'ws-fall',
    title: 'fall grid',
    blocks: [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ],
    placements: [
      { wordId: 'fall', row: 0, col: 0, dir: 'across' },
      { wordId: 'area', row: 1, col: 0, dir: 'across' },
      { wordId: 'lear', row: 2, col: 0, dir: 'across' },
      { wordId: 'lare', row: 3, col: 0, dir: 'across' },
      { wordId: 'fall', row: 0, col: 0, dir: 'down' },
      { wordId: 'area', row: 0, col: 1, dir: 'down' },
      { wordId: 'lear', row: 0, col: 2, dir: 'down' },
      { wordId: 'lare', row: 0, col: 3, dir: 'down' },
    ],
  },
  {
    id: 'ws-area',
    title: 'area grid',
    blocks: [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ],
    placements: [
      { wordId: 'area', row: 0, col: 0, dir: 'across' },
      { wordId: 'rear', row: 1, col: 0, dir: 'across' },
      { wordId: 'ears', row: 2, col: 0, dir: 'across' },
      { wordId: 'arse', row: 3, col: 0, dir: 'across' },
      { wordId: 'area', row: 0, col: 0, dir: 'down' },
      { wordId: 'rear', row: 0, col: 1, dir: 'down' },
      { wordId: 'ears', row: 0, col: 2, dir: 'down' },
      { wordId: 'arse', row: 0, col: 3, dir: 'down' },
    ],
  },
  {
    id: 'ws-sale',
    title: 'sale grid',
    blocks: [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ],
    placements: [
      { wordId: 'sale', row: 0, col: 0, dir: 'across' },
      { wordId: 'alea', row: 1, col: 0, dir: 'across' },
      { wordId: 'lear', row: 2, col: 0, dir: 'across' },
      { wordId: 'ears', row: 3, col: 0, dir: 'across' },
      { wordId: 'sale', row: 0, col: 0, dir: 'down' },
      { wordId: 'alea', row: 0, col: 1, dir: 'down' },
      { wordId: 'lear', row: 0, col: 2, dir: 'down' },
      { wordId: 'ears', row: 0, col: 3, dir: 'down' },
    ],
  },
  {
    id: 'ws-face',
    title: 'face grid',
    blocks: [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ],
    placements: [
      { wordId: 'face', row: 0, col: 0, dir: 'across' },
      { wordId: 'acer', row: 1, col: 0, dir: 'across' },
      { wordId: 'cere', row: 2, col: 0, dir: 'across' },
      { wordId: 'eres', row: 3, col: 0, dir: 'across' },
      { wordId: 'face', row: 0, col: 0, dir: 'down' },
      { wordId: 'acer', row: 0, col: 1, dir: 'down' },
      { wordId: 'cere', row: 0, col: 2, dir: 'down' },
      { wordId: 'eres', row: 0, col: 3, dir: 'down' },
    ],
  },
  {
    id: 'ws-tare',
    title: 'tare grid',
    blocks: [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ],
    placements: [
      { wordId: 'tare', row: 0, col: 0, dir: 'across' },
      { wordId: 'area', row: 1, col: 0, dir: 'across' },
      { wordId: 'rear', row: 2, col: 0, dir: 'across' },
      { wordId: 'ears', row: 3, col: 0, dir: 'across' },
      { wordId: 'tare', row: 0, col: 0, dir: 'down' },
      { wordId: 'area', row: 0, col: 1, dir: 'down' },
      { wordId: 'rear', row: 0, col: 2, dir: 'down' },
      { wordId: 'ears', row: 0, col: 3, dir: 'down' },
    ],
  },
]

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
  return PUZZLES.find((p) => p.id === id)
}
