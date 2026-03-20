import { useCallback, useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'running' | 'done'

/**
 * High-resolution elapsed time using performance.now(). Starts on demand; stops with a fixed end time.
 */
export function useGameTimer() {
  const [phase, setPhase] = useState<Phase>('idle')
  const startMsRef = useRef<number | null>(null)
  const endMsRef = useRef<number | null>(null)
  const [tick, setTick] = useState(0)

  const elapsedMs =
    phase === 'idle' || startMsRef.current === null
      ? 0
      : phase === 'done' && endMsRef.current !== null
        ? endMsRef.current - startMsRef.current
        : tick - startMsRef.current

  useEffect(() => {
    if (phase !== 'running' || startMsRef.current === null) return
    let id = 0
    const loop = () => {
      setTick(performance.now())
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [phase])

  const start = useCallback(() => {
    if (phase !== 'idle') return
    startMsRef.current = performance.now()
    endMsRef.current = null
    setTick(startMsRef.current)
    setPhase('running')
  }, [phase])

  const stop = useCallback((): number | null => {
    if (phase !== 'running' || startMsRef.current === null) return null
    const end = performance.now()
    endMsRef.current = end
    setTick(end)
    setPhase('done')
    return Math.round(end - startMsRef.current)
  }, [phase])

  const reset = useCallback(() => {
    startMsRef.current = null
    endMsRef.current = null
    setPhase('idle')
    setTick(0)
  }, [])

  return { phase, elapsedMs, start, stop, reset }
}
