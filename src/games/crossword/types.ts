export type Direction = 'across' | 'down'

export interface WordBankEntry {
  id: string
  /** Uppercase A–Z only. */
  word: string
  hint: string
}

export interface WordPlacement {
  wordId: string
  row: number
  col: number
  dir: Direction
}

export interface PuzzleDefinition {
  id: string
  /** Optional label for high score rows. */
  title?: string
  /** true = blocked (black) cell. */
  blocks: boolean[][]
  placements: WordPlacement[]
}

export interface DerivedClue {
  /** Index into ordered clue list for this puzzle. */
  index: number
  puzzleId: string
  wordId: string
  word: string
  hint: string
  dir: Direction
  row: number
  col: number
  /** Cells (row, col) covered by this clue, start → end along direction. */
  cells: { row: number; col: number }[]
}
