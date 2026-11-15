import { useEffect, useRef, useState } from 'react'

const completedKeys = new Set<string>()

/** Reset completed initial-load keys (for unit tests). */
export function resetInitialMinLoadingForTests(): void {
  completedKeys.clear()
}

/**
 * Keeps a loading state visible for at least `minMs` on the first load for `key`
 * in the current session, then passes `loading` through with no artificial delay.
 */
export function useInitialMinLoading(
  loading: boolean,
  key: string,
  minMs = 1000,
): boolean {
  const isInitial = !completedKeys.has(key)
  const startedAtRef = useRef<number | null>(loading && isInitial ? Date.now() : null)
  const [holding, setHolding] = useState<boolean>(loading && isInitial)

  useEffect(() => {
    if (completedKeys.has(key)) {
      setHolding(false)
      return
    }

    if (loading) {
      if (startedAtRef.current === null) {
        startedAtRef.current = Date.now()
      }
      setHolding(true)
      return
    }

    if (startedAtRef.current === null) {
      completedKeys.add(key)
      setHolding(false)
      return
    }

    const elapsed = Date.now() - startedAtRef.current
    const remaining = Math.max(0, minMs - elapsed)

    if (remaining === 0) {
      completedKeys.add(key)
      setHolding(false)
      return
    }

    const id = window.setTimeout(() => {
      completedKeys.add(key)
      setHolding(false)
    }, remaining)

    return () => window.clearTimeout(id)
  }, [loading, key, minMs])

  return loading || holding
}
