import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import { paths } from '../../config/paths'
import { PUZZLES } from './puzzles'
import type { DerivedClue, PuzzleDefinition } from './types'
import {
  clearCrosswordScores,
  loadCrosswordScores,
  recordCrosswordScore,
  type CrosswordScore,
} from './highScores'
import { buildSolutionGrid, deriveClues } from './validatePuzzles'
import { useGameTimer } from '../useGameTimer'

const SIZE = 4

function cellKey(row: number, col: number): string {
  return `${row},${col}`
}

function emptyUserGrid(): string[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ''))
}

function pickRandomPuzzle(): PuzzleDefinition {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)]
}

function isClueFilled(
  clue: DerivedClue,
  user: string[][],
  solution: string[][]
): boolean {
  return clue.cells.every(
    ({ row, col }) => user[row][col] === solution[row][col]
  )
}

function firstFocusCellInClue(
  clue: DerivedClue,
  user: string[][],
  solution: string[][]
): { row: number; col: number } {
  for (const cell of clue.cells) {
    if (user[cell.row][cell.col] !== solution[cell.row][cell.col]) {
      return cell
    }
  }
  return clue.cells[0]
}

function findFirstIncompleteClueIndex(
  clues: DerivedClue[],
  user: string[][],
  solution: string[][]
): number | null {
  for (let i = 0; i < clues.length; i++) {
    if (!isClueFilled(clues[i], user, solution)) return i
  }
  return null
}

function isGridSolved(
  blocks: boolean[][],
  user: string[][],
  solution: string[][]
): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (blocks[r][c]) continue
      if (user[r][c] !== solution[r][c]) return false
    }
  }
  return true
}

function indexInClueCells(
  clue: DerivedClue,
  row: number,
  col: number
): number {
  return clue.cells.findIndex((x) => x.row === row && x.col === col)
}

export default function CrosswordSpeedrun() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [puzzle, setPuzzle] = useState<PuzzleDefinition>(() => pickRandomPuzzle())
  const solution = useMemo(() => buildSolutionGrid(puzzle), [puzzle])
  const clues = useMemo(() => deriveClues(puzzle), [puzzle])
  const [userGrid, setUserGrid] = useState<string[][]>(() => emptyUserGrid())
  const [activeClueIndex, setActiveClueIndex] = useState(0)
  const [activeRow, setActiveRow] = useState(0)
  const [activeCol, setActiveCol] = useState(0)
  const [won, setWon] = useState(false)
  const [scores, setScores] = useState<CrosswordScore[]>(() => loadCrosswordScores())
  const { phase: timerPhase, elapsedMs, start: startTimer, stop: stopTimer, reset: resetTimer } =
    useGameTimer()

  const syncCursorFromGrid = useCallback(
    (user: string[][], clueIdx: number) => {
      const clue = clues[clueIdx]
      if (!clue) return
      const cell = firstFocusCellInClue(clue, user, solution)
      setActiveRow(cell.row)
      setActiveCol(cell.col)
    },
    [clues, solution]
  )

  useEffect(() => {
    const blank = emptyUserGrid()
    const first = findFirstIncompleteClueIndex(clues, blank, solution) ?? 0
    setActiveClueIndex(first)
    syncCursorFromGrid(blank, first)
  }, [puzzle.id, clues, solution, syncCursorFromGrid])

  const newPuzzle = useCallback(() => {
    let next = pickRandomPuzzle()
    if (PUZZLES.length > 1) {
      let guard = 0
      while (next.id === puzzle.id && guard++ < 8) {
        next = pickRandomPuzzle()
      }
    }
    const blank = emptyUserGrid()
    const sol = buildSolutionGrid(next)
    const cl = deriveClues(next)
    const first = findFirstIncompleteClueIndex(cl, blank, sol) ?? 0
    const cell = firstFocusCellInClue(cl[first], blank, sol)
    setPuzzle(next)
    setUserGrid(blank)
    setActiveClueIndex(first)
    setActiveRow(cell.row)
    setActiveCol(cell.col)
    setWon(false)
    resetTimer()
  }, [puzzle.id, resetTimer])

  const resetRun = useCallback(() => {
    const blank = emptyUserGrid()
    setUserGrid(blank)
    setWon(false)
    resetTimer()
    const first = findFirstIncompleteClueIndex(clues, blank, solution) ?? 0
    setActiveClueIndex(first)
    syncCursorFromGrid(blank, first)
  }, [clues, resetTimer, solution, syncCursorFromGrid])

  const winAndRecord = useCallback(
    (puzzleId: string) => {
      setWon(true)
      const ms = stopTimer()
      if (ms !== null) {
        setScores(
          recordCrosswordScore({
            ms,
            at: new Date().toISOString(),
            puzzleId,
          })
        )
      }
    },
    [stopTimer]
  )

  useEffect(() => {
    containerRef.current?.focus()
  }, [puzzle])

  const activeClue = clues[activeClueIndex]

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (won) return

      const clue = clues[activeClueIndex]
      if (!clue) return

      if (e.key === 'Tab') {
        e.preventDefault()
        const dir = e.shiftKey ? -1 : 1
        const idx = (activeClueIndex + dir + clues.length) % clues.length
        setActiveClueIndex(idx)
        const cell = firstFocusCellInClue(clues[idx], userGrid, solution)
        setActiveRow(cell.row)
        setActiveCol(cell.col)
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        const i = indexInClueCells(clue, activeRow, activeCol)
        if (i < 0) return
        const copy = userGrid.map((row) => [...row])
        const cur = clue.cells[i]
        copy[cur.row][cur.col] = ''
        setUserGrid(copy)
        if (i > 0) {
          const prev = clue.cells[i - 1]
          setActiveRow(prev.row)
          setActiveCol(prev.col)
        }
        return
      }

      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const i = indexInClueCells(clue, activeRow, activeCol)
        if (i < 0) return
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          if (i > 0) {
            const prev = clue.cells[i - 1]
            setActiveRow(prev.row)
            setActiveCol(prev.col)
          }
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          if (i < clue.cells.length - 1) {
            const next = clue.cells[i + 1]
            setActiveRow(next.row)
            setActiveCol(next.col)
          }
        }
        return
      }

      if (e.key.length !== 1 || !/^[a-zA-Z]$/.test(e.key)) return
      e.preventDefault()
      const letter = e.key.toUpperCase()
      const i = indexInClueCells(clue, activeRow, activeCol)
      if (i < 0) return
      const { row, col } = clue.cells[i]
      const expected = solution[row][col]
      if (letter !== expected) return

      if (timerPhase === 'idle') startTimer()

      const copy = userGrid.map((r) => [...r])
      copy[row][col] = letter

      if (!isClueFilled(clue, copy, solution)) {
        setUserGrid(copy)
        const nextCell = firstFocusCellInClue(clue, copy, solution)
        setActiveRow(nextCell.row)
        setActiveCol(nextCell.col)
        return
      }

      setUserGrid(copy)

      if (isGridSolved(puzzle.blocks, copy, solution)) {
        winAndRecord(puzzle.id)
        return
      }

      let nextIdx = activeClueIndex + 1
      while (nextIdx < clues.length && isClueFilled(clues[nextIdx], copy, solution)) {
        nextIdx++
      }
      if (nextIdx < clues.length) {
        setActiveClueIndex(nextIdx)
        syncCursorFromGrid(copy, nextIdx)
        return
      }

      const rest = findFirstIncompleteClueIndex(clues, copy, solution)
      if (rest === null) {
        winAndRecord(puzzle.id)
        return
      }
      setActiveClueIndex(rest)
      syncCursorFromGrid(copy, rest)
    },
    [
      activeClueIndex,
      activeCol,
      activeRow,
      clues,
      puzzle.blocks,
      puzzle.id,
      solution,
      syncCursorFromGrid,
      timerPhase,
      userGrid,
      winAndRecord,
      won,
      startTimer,
    ]
  )

  return (
    <div>
      <PageHeader
        title="crossword speedrun"
        subtitle="4×4 · wrong letters don’t stick · tab switches clues · timer starts on your first correct letter"
        backTo={paths.games}
        backLabel="← games"
      />

      <p className="mb-8 max-w-2xl text-sm text-content-muted leading-relaxed">
        wip: this game is rough and unfinished — i haven&apos;t figured out yet exactly how i want it
        to work or feel, so expect rough edges and changes.
      </p>

      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label="crossword speedrun"
        onKeyDown={onKeyDown}
        className="outline-none focus-visible:ring-2 focus-visible:ring-content-muted focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-lg"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={newPuzzle}
                className="rounded-full border border-border bg-surface-secondary px-4 py-2 text-sm text-content-secondary transition-colors hover:border-content-muted/40 hover:text-content"
              >
                new puzzle
              </button>
              <button
                type="button"
                onClick={resetRun}
                className="rounded-full border border-dashed border-border px-4 py-2 text-sm text-content-muted transition-colors hover:border-content-muted/50 hover:text-content-secondary"
              >
                reset run
              </button>
            </div>

            <div>
              <p className="text-xs text-content-muted">
                puzzle: {(puzzle.title ?? puzzle.id).toLowerCase()}
              </p>
              <p className="mt-2 text-sm text-content-secondary leading-relaxed">
                <span className="text-content-muted">{activeClue.dir} · </span>
                {activeClue.hint.toLowerCase()}
              </p>
            </div>

            <div
              className="inline-grid gap-1 p-2 rounded-2xl border border-border bg-surface-secondary"
              style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
            >
              {puzzle.blocks.map((row, r) =>
                row.map((blocked, c) => {
                  const letter = userGrid[r][c]
                  const isActive = r === activeRow && c === activeCol
                  if (blocked) {
                    return (
                      <div
                        key={cellKey(r, c)}
                        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-md bg-surface border border-border"
                        aria-hidden
                      />
                    )
                  }
                  return (
                    <div
                      key={cellKey(r, c)}
                      className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-md border text-lg font-medium tabular-nums tracking-wide ${
                        isActive
                          ? 'border-content-muted bg-surface ring-2 ring-content-muted/40'
                          : 'border-border bg-surface'
                      }`}
                      aria-label={`row ${r + 1} column ${c + 1}`}
                    >
                      <span className="text-content">{letter}</span>
                    </div>
                  )
                })
              )}
            </div>

            <div className="max-w-xl space-y-2 text-xs text-content-muted leading-relaxed">
              <p>
                cursor stays on the active clue: letters advance along the word; when the word is
                done it jumps forward to the next clue that still needs letters (later clues can
                auto-fill from crossings).
              </p>
              <p>
                arrows move inside the current clue only. backspace clears the current square and
                steps back.
              </p>
            </div>

            {won && (
              <p className="text-sm text-content-secondary" role="status">
                done · grid matches solution
              </p>
            )}
          </div>

          <aside className="w-full shrink-0 space-y-6 lg:w-72">
            <div className="rounded-2xl border border-border bg-surface-secondary p-5">
              <p className="text-xs text-content-muted">timer</p>
              <p className="mt-2 text-3xl font-medium tabular-nums text-content">
                {(elapsedMs / 1000).toFixed(3)}s
              </p>
              <p className="mt-1 text-xs text-content-muted">
                {timerPhase === 'idle'
                  ? 'idle'
                  : timerPhase === 'running'
                    ? 'running'
                    : 'stopped'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-content-muted">local best times</p>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      typeof window !== 'undefined' &&
                      window.confirm('clear all crossword scores?')
                    ) {
                      clearCrosswordScores()
                      setScores(loadCrosswordScores())
                    }
                  }}
                  className="text-xs text-content-muted underline decoration-border hover:text-content-secondary"
                >
                  clear
                </button>
              </div>
              <ol className="mt-3 space-y-2">
                {scores.length === 0 ? (
                  <li className="text-sm text-content-muted">no runs yet</li>
                ) : (
                  scores.map((s, i) => (
                    <li
                      key={`${s.at}-${i}`}
                      className="flex items-baseline justify-between gap-2 text-sm text-content-secondary"
                    >
                      <span className="tabular-nums text-content-muted">{i + 1}.</span>
                      <span className="tabular-nums font-medium text-content">
                        {(s.ms / 1000).toFixed(3)}s
                      </span>
                      <span className="truncate text-xs text-content-muted">{s.puzzleId}</span>
                    </li>
                  ))
                )}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
