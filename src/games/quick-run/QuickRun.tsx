import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import { paths } from '../../config/paths'
import { useGameTimer } from '../useGameTimer'
import {
  clearAllQuickRunScores,
  clearFrenzyScores,
  clearOverallRunScores,
  clearQuickRunScoresForLevel,
  FRENZY_MAZE_COUNTS,
  frenzyScores,
  loadFrenzyMazeCount,
  overallScoresForMode,
  recordFrenzyScore,
  recordOverallRunScore,
  recordQuickRunScore,
  saveFrenzyMazeCount,
  scoresForLevel,
  type FrenzyMazeCount,
  type FrenzyRunScore,
  type OverallRunScore,
  type QuickRunMode,
  type QuickRunScore,
} from './highScores'
import { generateFrenzyLevel } from './generateRandomMaze'
import { getParsedLevel, LEVELS, type LevelDefinition } from './levels'
import { isStepBlocked, type Dir, type Pos, shortestPathLength } from './maze'

function ordinalRank(n: number): string {
  const j = n % 10
  const k = n % 100
  if (j === 1 && k !== 11) return `${n}st`
  if (j === 2 && k !== 12) return `${n}nd`
  if (j === 3 && k !== 13) return `${n}rd`
  return `${n}th`
}

function keyToDir(key: string): Dir | null {
  if (key === 'ArrowUp' || key === 'w' || key === 'W') return 'up'
  if (key === 'ArrowDown' || key === 's' || key === 'S') return 'down'
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') return 'left'
  if (key === 'ArrowRight' || key === 'd' || key === 'D') return 'right'
  return null
}

export default function QuickRun() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [levelIndex, setLevelIndex] = useState(0)
  const [mode, setMode] = useState<QuickRunMode>('normal')
  const [player, setPlayer] = useState<Pos>(() => ({ ...getParsedLevel(LEVELS[0]).start }))
  const [runStatus, setRunStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready')
  const [scores, setScores] = useState<QuickRunScore[]>(() => scoresForLevel(LEVELS[0]!.id))
  /**
   * Single-run overall: levels must be completed in order 0→n−1. You may retry the previous
   * level to improve time; any skip or out-of-order win resets the streak.
   */
  const [overallStreak, setOverallStreak] = useState<{
    nextToComplete: number
    timesByIndex: Record<number, number>
  }>(() => ({ nextToComplete: 0, timesByIndex: {} }))
  const [overallScores, setOverallScores] = useState<OverallRunScore[]>(() =>
    overallScoresForMode('normal')
  )
  const [overallFinishToast, setOverallFinishToast] = useState<{
    ms: number
    rank: number
    count: number
  } | null>(null)
  const [frenzySeed, setFrenzySeed] = useState(0)
  const [frenzyMazeCount, setFrenzyMazeCount] = useState<FrenzyMazeCount>(loadFrenzyMazeCount)
  const [frenzyTop, setFrenzyTop] = useState<FrenzyRunScore[]>(() =>
    frenzyScores(loadFrenzyMazeCount())
  )
  const [frenzyFinishToast, setFrenzyFinishToast] = useState<{
    ms: number
    rank: number
    count: number
    mazeCount: FrenzyMazeCount
  } | null>(null)
  const frenzyAdvanceRef = useRef(false)
  const prevModeRef = useRef<QuickRunMode>(mode)

  const runStatusRef = useRef(runStatus)
  const modeRef = useRef(mode)
  const levelIndexRef = useRef(levelIndex)
  runStatusRef.current = runStatus
  modeRef.current = mode
  levelIndexRef.current = levelIndex

  const frenzyLevels = useMemo(() => {
    if (mode !== 'frenzy') return null
    void frenzySeed
    return Array.from({ length: frenzyMazeCount }, (_, i) => generateFrenzyLevel(i))
  }, [mode, frenzySeed, frenzyMazeCount])

  const levelDef = useMemo((): LevelDefinition => {
    if (mode === 'frenzy') {
      return frenzyLevels![levelIndex]!
    }
    return LEVELS[levelIndex]!
  }, [mode, frenzyLevels, levelIndex])

  const parsed = useMemo(() => getParsedLevel(levelDef), [levelDef])

  const optimal = useMemo(
    () => shortestPathLength(parsed.wall, parsed.start, parsed.goal),
    [parsed]
  )

  const overallRunStats = useMemo(() => {
    const t = overallStreak.timesByIndex
    let sumMs = 0
    for (let i = 0; i < overallStreak.nextToComplete; i++) {
      const ms = t[i]
      if (ms != null) sumMs += ms
    }
    return {
      filled: overallStreak.nextToComplete,
      sumMs,
    }
  }, [overallStreak])

  /** Newest recorded row in the visible list (ISO `at`), for a small “new” dot. */
  const latestLocalAt = useMemo(() => {
    if (scores.length === 0) return null
    return scores.reduce((best, s) => (s.at > best ? s.at : best), scores[0]!.at)
  }, [scores])

  const latestOverallAt = useMemo(() => {
    if (overallScores.length === 0) return null
    return overallScores.reduce((best, s) => (s.at > best ? s.at : best), overallScores[0]!.at)
  }, [overallScores])

  const latestFrenzyAt = useMemo(() => {
    if (frenzyTop.length === 0) return null
    return frenzyTop.reduce((best, s) => (s.at > best ? s.at : best), frenzyTop[0]!.at)
  }, [frenzyTop])

  const lastLevelIdx = mode === 'frenzy' ? frenzyMazeCount - 1 : LEVELS.length - 1
  const levelCountLabel = mode === 'frenzy' ? frenzyMazeCount : LEVELS.length

  const resetOverallAttempt = useCallback(() => {
    setOverallStreak({ nextToComplete: 0, timesByIndex: {} })
    setOverallFinishToast(null)
  }, [])

  const { phase: timerPhase, elapsedMs, start: startTimer, stop: stopTimer, reset: resetTimer } =
    useGameTimer()

  /** Successful tile moves this run (for actions per minute). */
  const [moveCount, setMoveCount] = useState(0)
  /** Inputs into a wall (blocked moves). */
  const [wastedActions, setWastedActions] = useState(0)

  const apm = useMemo(() => {
    if (timerPhase === 'idle' || elapsedMs <= 0) return null
    return Math.round((moveCount * 60000) / elapsedMs)
  }, [timerPhase, moveCount, elapsedMs])

  const resetRun = useCallback(() => {
    if (mode === 'frenzy') {
      setFrenzySeed((s) => s + 1)
      setLevelIndex(0)
      setRunStatus('ready')
      setMoveCount(0)
      setWastedActions(0)
      resetTimer()
      return
    }
    setPlayer({ ...parsed.start })
    setRunStatus('ready')
    setMoveCount(0)
    setWastedActions(0)
    resetTimer()
  }, [mode, parsed.start, resetTimer])

  const onFrenzyMazeCountChange = useCallback(
    (n: FrenzyMazeCount) => {
      if (n === frenzyMazeCount) return
      saveFrenzyMazeCount(n)
      setFrenzyMazeCount(n)
      if (mode !== 'frenzy') return
      setFrenzySeed((s) => s + 1)
      setLevelIndex(0)
      setRunStatus('ready')
      setMoveCount(0)
      setWastedActions(0)
      resetTimer()
    },
    [frenzyMazeCount, mode, resetTimer]
  )

  /** Back to level 1 and a fresh run (used after hard-mode death). */
  const resetWholeGame = useCallback(() => {
    if (levelIndexRef.current !== 0) {
      setLevelIndex(0)
    } else {
      resetRun()
    }
  }, [resetRun])

  useEffect(() => {
    setPlayer({ ...parsed.start })
    if (mode === 'frenzy' && frenzyAdvanceRef.current) {
      frenzyAdvanceRef.current = false
      setRunStatus('playing')
      return
    }
    setRunStatus('ready')
    setMoveCount(0)
    setWastedActions(0)
    resetTimer()
  }, [parsed, mode, resetTimer])

  const winAndRecord = useCallback(
    (finalMs: number) => {
      if (mode === 'frenzy') return
      const entry: QuickRunScore = {
        ms: finalMs,
        at: new Date().toISOString(),
        levelId: levelDef.id,
        mode,
      }
      setScores(recordQuickRunScore(entry))

      setOverallStreak((prev) => {
        const L = levelIndex
        const lastIdx = LEVELS.length - 1

        if (L === prev.nextToComplete) {
          const timesByIndex = { ...prev.timesByIndex, [L]: finalMs }
          if (L === lastIdx) {
            const total = LEVELS.reduce((s, _, i) => s + (timesByIndex[i] ?? 0), 0)
            const at = new Date().toISOString()
            queueMicrotask(() => {
              const merged = recordOverallRunScore({ ms: total, at, mode })
              setOverallScores(merged)
              const idx = merged.findIndex((s) => s.at === at)
              const rank = idx >= 0 ? idx + 1 : merged.length
              setOverallFinishToast({ ms: total, rank, count: merged.length })
            })
            return { nextToComplete: 0, timesByIndex: {} }
          }
          return { nextToComplete: L + 1, timesByIndex }
        }

        if (L === prev.nextToComplete - 1) {
          return {
            nextToComplete: prev.nextToComplete,
            timesByIndex: { ...prev.timesByIndex, [L]: finalMs },
          }
        }

        return { nextToComplete: 0, timesByIndex: {} }
      })
    },
    [levelDef.id, levelIndex, mode]
  )

  const finishFrenzyRun = useCallback(
    (finalMs: number, mazeCount: FrenzyMazeCount) => {
      const at = new Date().toISOString()
      queueMicrotask(() => {
        const merged = recordFrenzyScore({ ms: finalMs, at }, mazeCount)
        setFrenzyTop(merged)
        const idx = merged.findIndex((s) => s.at === at)
        const rank = idx >= 0 ? idx + 1 : merged.length
        setFrenzyFinishToast({ ms: finalMs, rank, count: merged.length, mazeCount })
      })
    },
    []
  )

  const applyDirection = useCallback(
    (dir: Dir) => {
      if (runStatus === 'won' || runStatus === 'lost') return

      const { wall, rows, cols, goal } = parsed
      const blocked = isStepBlocked(wall, rows, cols, player, dir)

      if (blocked) {
        setWastedActions((w) => w + 1)
        if (mode === 'hard') {
          stopTimer()
          setRunStatus('lost')
          return
        }
        if (runStatus === 'ready') {
          startTimer()
          setRunStatus('playing')
        }
        return
      }

      if (runStatus === 'ready') {
        startTimer()
        setRunStatus('playing')
      }

      setMoveCount((c) => c + 1)

      const next: Pos = {
        row:
          dir === 'up'
            ? player.row - 1
            : dir === 'down'
              ? player.row + 1
              : player.row,
        col:
          dir === 'left'
            ? player.col - 1
            : dir === 'right'
              ? player.col + 1
              : player.col,
      }

      setPlayer(next)

      if (next.row === goal.row && next.col === goal.col) {
        if (mode === 'frenzy') {
          if (levelIndex < frenzyMazeCount - 1) {
            frenzyAdvanceRef.current = true
            setLevelIndex((i) => i + 1)
            setRunStatus('playing')
            return
          }
          const ms = stopTimer()
          setRunStatus('won')
          if (ms !== null) finishFrenzyRun(ms, frenzyMazeCount)
          return
        }
        const ms = stopTimer()
        setRunStatus('won')
        if (ms !== null) winAndRecord(ms)
      }
    },
    [
      parsed,
      player,
      mode,
      runStatus,
      levelIndex,
      frenzyMazeCount,
      startTimer,
      stopTimer,
      winAndRecord,
      finishFrenzyRun,
    ]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
        if (e.repeat) return
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (modeRef.current === 'frenzy') {
          return
        }
        if (modeRef.current === 'hard' && runStatusRef.current === 'lost') {
          resetWholeGame()
          return
        }
        if (runStatusRef.current !== 'won') {
          return
        }
        setLevelIndex((i) => (i >= LEVELS.length - 1 ? 0 : i + 1))
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        resetRun()
        return
      }
      const dir = keyToDir(e.key)
      if (!dir) return
      if (e.repeat) return
      e.preventDefault()
      applyDirection(dir)
    },
    [applyDirection, resetRun, resetWholeGame]
  )

  useEffect(() => {
    if (mode === 'frenzy') return
    setScores(scoresForLevel(levelDef.id))
  }, [levelDef.id, mode])

  useLayoutEffect(() => {
    const prev = prevModeRef.current
    if (mode === 'frenzy' && prev !== 'frenzy') {
      setLevelIndex(0)
    }
    if (mode !== 'frenzy' && prev === 'frenzy') {
      setLevelIndex(0)
    }
  }, [mode])

  useEffect(() => {
    setOverallStreak({ nextToComplete: 0, timesByIndex: {} })
    setOverallFinishToast(null)
    if (mode === 'frenzy') {
      setOverallScores([])
    } else {
      setOverallScores(overallScoresForMode(mode))
    }
    prevModeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (mode !== 'frenzy') return
    setFrenzyTop(frenzyScores(frenzyMazeCount))
  }, [mode, frenzyMazeCount])

  useEffect(() => {
    if (!overallFinishToast) return
    const id = window.setTimeout(() => setOverallFinishToast(null), 3000)
    return () => window.clearTimeout(id)
  }, [overallFinishToast])

  useEffect(() => {
    if (!frenzyFinishToast) return
    const id = window.setTimeout(() => setFrenzyFinishToast(null), 3000)
    return () => window.clearTimeout(id)
  }, [frenzyFinishToast])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.focus()
  }, [levelIndex])

  return (
    <div>
      <PageHeader title="quick run" subtitle="path · speed" backTo={paths.games} backLabel="← games" />

      {overallFinishToast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,20rem)] -translate-x-1/2 rounded-xl border border-border bg-surface-secondary px-4 py-3 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] text-content-muted">overall · {mode}</p>
          <p className="mt-2 text-2xl font-medium tabular-nums text-content">
            {(overallFinishToast.ms / 1000).toFixed(3)}s
          </p>
          <p className="mt-1 text-xs text-content-secondary">
            {ordinalRank(overallFinishToast.rank)} / {overallFinishToast.count}
          </p>
        </div>
      )}

      {frenzyFinishToast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,20rem)] -translate-x-1/2 rounded-xl border border-border bg-surface-secondary px-4 py-3 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] text-content-muted">
            frenzy · {frenzyFinishToast.mazeCount} mazes
          </p>
          <p className="mt-2 text-2xl font-medium tabular-nums text-content">
            {(frenzyFinishToast.ms / 1000).toFixed(3)}s
          </p>
          <p className="mt-1 text-xs text-content-secondary">
            {ordinalRank(frenzyFinishToast.rank)} / {frenzyFinishToast.count}
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label="quick run"
        onKeyDown={onKeyDown}
        className="outline-none focus-visible:ring-2 focus-visible:ring-content-muted focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-lg"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start sm:gap-6">
            <div className="flex max-w-xl flex-col gap-1">
              <div
                className="flex overflow-hidden rounded-lg border border-border bg-surface text-xs"
                role="group"
                aria-label="level and run"
              >
                <button
                  type="button"
                  disabled={mode === 'frenzy'}
                  onClick={() =>
                    setLevelIndex((i) => (i <= 0 ? lastLevelIdx : i - 1))
                  }
                  className="flex-1 border-r border-border bg-surface-secondary px-2 py-1.5 text-center font-medium text-content-secondary transition-colors hover:bg-surface hover:text-content disabled:pointer-events-none disabled:opacity-40"
                >
                  prev level
                </button>
                <button
                  type="button"
                  disabled={mode === 'frenzy'}
                  onClick={() =>
                    setLevelIndex((i) => (i >= lastLevelIdx ? 0 : i + 1))
                  }
                  className="flex-1 bg-surface-secondary px-2 py-1.5 text-center font-medium text-content-secondary transition-colors hover:bg-surface hover:text-content disabled:pointer-events-none disabled:opacity-40"
                >
                  next level
                </button>
                <button
                  type="button"
                  onClick={resetRun}
                  className="flex-1 border-l border-dashed border-border bg-surface px-2 py-1.5 text-center font-medium text-content-muted transition-colors hover:bg-surface-secondary hover:text-content-secondary"
                >
                  reset run
                </button>
              </div>
              <div
                className="mt-0.5 flex flex-wrap rounded-lg border border-border bg-surface p-0.5 text-xs"
                role="radiogroup"
                aria-label="mode"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'normal'}
                  onClick={() => setMode('normal')}
                  className={`min-w-[4.5rem] flex-1 rounded-md px-2 py-1 text-center font-medium transition-colors ${
                    mode === 'normal'
                      ? 'bg-surface-secondary text-content shadow-sm'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  normal
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'hard'}
                  onClick={() => setMode('hard')}
                  className={`min-w-[4.5rem] flex-1 rounded-md px-2 py-1 text-center font-medium transition-colors ${
                    mode === 'hard'
                      ? 'bg-surface-secondary text-content shadow-sm'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  hard
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'frenzy'}
                  onClick={() => setMode('frenzy')}
                  className={`min-w-[4.5rem] flex-1 rounded-md px-2 py-1 text-center font-medium transition-colors ${
                    mode === 'frenzy'
                      ? 'bg-surface-secondary text-content shadow-sm'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  frenzy
                </button>
              </div>
              {mode === 'frenzy' && (
                <div
                  className="mt-0.5 flex flex-wrap rounded-lg border border-border bg-surface p-0.5 text-xs"
                  role="radiogroup"
                  aria-label="frenzy length"
                >
                  {FRENZY_MAZE_COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={frenzyMazeCount === n}
                      onClick={() => onFrenzyMazeCountChange(n)}
                      className={`min-w-[3rem] flex-1 rounded-md px-2 py-1 text-center font-medium tabular-nums transition-colors ${
                        frenzyMazeCount === n
                          ? 'bg-surface-secondary text-content shadow-sm'
                          : 'text-content-muted hover:text-content-secondary'
                      }`}
                    >
                      {n} mazes
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-3 sm:max-w-none">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] text-content-muted">timer</p>
                  <p className="mt-1 text-2xl font-medium tabular-nums text-content sm:text-3xl">
                    {(elapsedMs / 1000).toFixed(3)}s
                  </p>
                  <p className="mt-0.5 text-[10px] text-content-muted">
                    {timerPhase === 'idle' ? 'off' : timerPhase === 'running' ? 'run' : 'end'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-content-muted">apm</p>
                  <p className="mt-1 text-2xl font-medium tabular-nums text-content sm:text-3xl">
                    {apm == null ? '—' : apm}
                  </p>
                  <p className="mt-0.5 text-[10px] text-content-muted">actions / min</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4">
            <section className="w-full" aria-label="current level board">
              <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface-secondary px-4 py-5 sm:px-6">
                <p className="text-xs text-content-muted">
                  level: {levelDef.id.toLowerCase()} ({levelIndex + 1}/{levelCountLabel})
                </p>
                <div className="mt-3 flex w-full min-w-0 justify-center overflow-x-auto">
                  <div
                    className="inline-grid gap-1 p-1 sm:p-2"
                    style={{
                      gridTemplateColumns: `repeat(${parsed.cols}, minmax(0, 2.5rem))`,
                    }}
                  >
              {parsed.wall.map((row, r) =>
                row.map((isWall, c) => {
                  const isPlayer = player.row === r && player.col === c
                  const isGoal = parsed.goal.row === r && parsed.goal.col === c
                  const isStart = parsed.start.row === r && parsed.start.col === c
                  let cellLabel = 'wall'
                  if (!isWall) {
                    if (isPlayer && isGoal) cellLabel = 'you · goal'
                    else if (isPlayer) cellLabel = 'you'
                    else if (isGoal) cellLabel = 'goal'
                    else if (isStart) cellLabel = 'start'
                    else cellLabel = 'path'
                  }
                  return (
                    <div
                      key={`${r}-${c}`}
                      aria-label={cellLabel}
                      className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-md text-sm ${
                        isWall
                          ? 'border-2 border-content-muted/70 bg-content-muted/45 shadow-inner'
                          : isGoal
                            ? 'border-2 border-dashed border-content bg-surface-secondary shadow-md ring-4 ring-content/35 ring-inset'
                            : 'border border-border bg-surface shadow-sm'
                      }`}
                    >
                      {!isWall && isGoal && !isPlayer && (
                        <span
                          className="text-2xl font-light leading-none text-content"
                          aria-hidden
                        >
                          ◇
                        </span>
                      )}
                      {!isWall && isPlayer && (
                        <span
                          className={`font-semibold leading-none text-content ${
                            isGoal ? 'text-2xl drop-shadow-sm' : 'text-xl'
                          }`}
                          aria-hidden
                        >
                          ●
                        </span>
                      )}
                      {!isWall && isGoal && isPlayer && (
                        <span
                          className="pointer-events-none absolute bottom-0.5 right-0.5 text-[10px] leading-none text-content-muted"
                          aria-hidden
                        >
                          ◇
                        </span>
                      )}
                    </div>
                  )
                })
              )}
                  </div>
                </div>

                {(runStatus === 'won' || runStatus === 'lost') && (
                  <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface/90 px-4 py-6 text-center backdrop-blur-sm pointer-events-none"
                    role="region"
                    aria-live="polite"
                    aria-label={runStatus === 'won' ? 'run complete' : 'run ended'}
                  >
                    <p
                      className={`text-xs font-medium ${
                        runStatus === 'won' ? 'text-content-muted' : 'text-error'
                      }`}
                    >
                      {runStatus === 'won' ? 'done' : 'lost'}
                    </p>
                    <p className="text-3xl font-medium tabular-nums text-content sm:text-4xl">
                      {(elapsedMs / 1000).toFixed(3)}s
                    </p>
                    {apm != null && (
                      <p className="text-sm font-medium tabular-nums text-content-secondary">
                        {apm} apm
                      </p>
                    )}
                    <p className="text-sm tabular-nums text-content-secondary">
                      {wastedActions} actions wasted
                    </p>
                    <ul className="max-w-xs space-y-1.5 text-xs text-content-secondary">
                      <li className="flex flex-wrap items-center justify-center gap-1.5">
                        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px]">
                          r
                        </kbd>
                        <span>
                          {mode === 'frenzy' && runStatus === 'won'
                            ? `new ${frenzyMazeCount} mazes`
                            : 'reset run'}
                        </span>
                      </li>
                      {mode !== 'frenzy' && (
                        <li className="flex flex-wrap items-center justify-center gap-1.5">
                          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px]">
                            space
                          </kbd>
                          <span>
                            {runStatus === 'won' ? 'next level' : 'restart all'}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 lg:items-start">
              <div className="min-w-0 rounded-2xl border border-border bg-surface-secondary p-4">
                {mode === 'frenzy' ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-content-muted">
                        frenzy · {frenzyMazeCount} mazes
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            typeof window !== 'undefined' &&
                            window.confirm('clear frenzy times for this length?')
                          ) {
                            clearFrenzyScores(frenzyMazeCount)
                            setFrenzyTop([])
                          }
                        }}
                        className="text-xs text-content-muted underline decoration-border hover:text-content-secondary"
                      >
                        clear
                      </button>
                    </div>
                    <ol className="mt-3 space-y-2">
                      {frenzyTop.length === 0 ? (
                        <li className="text-sm text-content-muted">—</li>
                      ) : (
                        frenzyTop.map((s, i) => (
                          <li
                            key={`${s.at}-${i}`}
                            className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-content-secondary"
                          >
                            <span className="tabular-nums text-content-muted">{i + 1}.</span>
                            <span className="relative inline-block tabular-nums font-medium text-content">
                              {(s.ms / 1000).toFixed(3)}s
                              {latestFrenzyAt !== null && s.at === latestFrenzyAt && (
                                <span
                                  className="pointer-events-none absolute left-full top-1/2 ml-0.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-content"
                                  title="latest run"
                                  aria-hidden
                                />
                              )}
                            </span>
                          </li>
                        ))
                      )}
                    </ol>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-content-muted">local · {levelDef.id.toLowerCase()}</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            typeof window !== 'undefined' &&
                            window.confirm('clear local?')
                          ) {
                            clearQuickRunScoresForLevel(levelDef.id)
                            setScores([])
                          }
                        }}
                        className="text-xs text-content-muted underline decoration-border hover:text-content-secondary"
                      >
                        clear
                      </button>
                    </div>
                    <ol className="mt-3 space-y-2">
                      {scores.length === 0 ? (
                        <li className="text-sm text-content-muted">—</li>
                      ) : (
                        scores.map((s, i) => (
                          <li
                            key={`${s.at}-${i}`}
                            className="grid grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] items-baseline gap-x-2 text-sm text-content-secondary"
                          >
                            <span className="tabular-nums text-content-muted">{i + 1}.</span>
                            <span className="relative inline-block min-w-0 justify-self-end tabular-nums font-medium text-content">
                              {(s.ms / 1000).toFixed(3)}s
                              {latestLocalAt !== null && s.at === latestLocalAt && (
                                <span
                                  className="pointer-events-none absolute left-full top-1/2 ml-0.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-content"
                                  title="latest run"
                                  aria-hidden
                                />
                              )}
                            </span>
                            <span className="truncate text-right text-xs text-content-muted">
                              {s.mode}
                            </span>
                          </li>
                        ))
                      )}
                    </ol>
                  </>
                )}
              </div>

              <aside className="min-w-0">
                {mode === 'frenzy' ? (
                  <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                    <p className="text-xs text-content-muted">overall</p>
                    <p className="mt-2 text-xs text-content-secondary">
                      not tracked in frenzy — use authored levels for streak totals
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-content-muted">overall · {mode}</p>
                        <p className="mt-1 text-xs text-content-muted">
                          {LEVELS.length} in order · last level logs sum
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={resetOverallAttempt}
                        className="shrink-0 text-xs text-content-muted underline decoration-border hover:text-content-secondary"
                      >
                        reset attempt
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-content">
                      {overallRunStats.filled}/{LEVELS.length}
                      {overallRunStats.filled > 0 && (
                        <span className="text-content-muted">
                          {' '}
                          ·{' '}
                          <span className="tabular-nums font-medium text-content">
                            {(overallRunStats.sumMs / 1000).toFixed(3)}s
                          </span>
                        </span>
                      )}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <p className="text-xs text-content-muted">totals</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            typeof window !== 'undefined' &&
                            window.confirm('clear overall?')
                          ) {
                            clearOverallRunScores()
                            setOverallScores(overallScoresForMode(mode))
                          }
                        }}
                        className="text-xs text-content-muted underline decoration-border hover:text-content-secondary"
                      >
                        clear
                      </button>
                    </div>
                    <ol className="mt-3 space-y-2">
                      {overallScores.length === 0 ? (
                        <li className="text-sm text-content-muted">—</li>
                      ) : (
                        overallScores.map((s, i) => (
                          <li
                            key={`${s.at}-${i}`}
                            className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-content-secondary"
                          >
                            <span className="tabular-nums text-content-muted">{i + 1}.</span>
                            <span className="relative inline-block tabular-nums font-medium text-content">
                              {(s.ms / 1000).toFixed(3)}s
                              {latestOverallAt !== null && s.at === latestOverallAt && (
                                <span
                                  className="pointer-events-none absolute left-full top-1/2 ml-0.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-content"
                                  title="latest run"
                                  aria-hidden
                                />
                              )}
                            </span>
                          </li>
                        ))
                      )}
                    </ol>
                  </div>
                )}
              </aside>

              <div className="min-w-0 space-y-5">
                <div className="space-y-1 text-xs text-content-muted">
                  <p>
                    {mode === 'frenzy'
                      ? `frenzy · ${frenzyMazeCount} random mazes · auto-advance · one clock`
                      : mode === 'normal'
                        ? 'normal · walls stop you'
                        : 'hard · wall ends run'}
                  </p>
                  {optimal !== null && <p>opt · {optimal}</p>}
                </div>

                <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                  <ul className="space-y-2 text-xs text-content-secondary leading-snug">
                    <li>
                      <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                        ↑↓←→
                      </kbd>{' '}
                      /{' '}
                      <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                        wasd
                      </kbd>{' '}
                      move · timer on first input
                    </li>
                    {mode === 'frenzy' ? (
                      <>
                        <li>
                          goal · next maze instantly · timer keeps running
                        </li>
                        <li>
                          <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                            r
                          </kbd>{' '}
                          new {frenzyMazeCount} mazes · level 1 · reset clock
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                            space
                          </kbd>{' '}
                          next after goal · hard death: reset all
                        </li>
                        <li>
                          <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                            r
                          </kbd>{' '}
                          reset · click game to focus keys
                        </li>
                        <li className="text-content-muted">order streak · clear = this row in list</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-center border-t border-border pt-6">
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== 'undefined' &&
                    window.confirm('clear all local scores for every level?')
                  ) {
                    clearAllQuickRunScores()
                    if (mode === 'frenzy') {
                      setScores([])
                    } else {
                      setScores(scoresForLevel(levelDef.id))
                    }
                  }
                }}
                className="rounded-lg border border-dashed border-border px-4 py-2 text-xs text-content-muted transition-colors hover:border-content-muted/50 hover:text-content-secondary"
              >
                reset all local scores
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
