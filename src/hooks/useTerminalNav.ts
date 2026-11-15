import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/** Navigates back in browser history when available, otherwise falls back to `fallback`. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback)
  }, [navigate, fallback])
}

function isTerminalTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-terminal]') !== null
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
}

interface UseTerminalNavOptions<F> {
  filters: F[]
  activeFilter: F
  onFilterChange: (next: F) => void
  itemCount: number
  onActivate: (index: number) => void
  /** Optional back handler triggered by Esc (when nothing is selected) or Backspace. */
  onBack?: () => void
  query?: string
}

/**
 * Shared keyboard navigation for terminal-style list pages:
 * ←/→ (or h/l) cycles filters, ↑/↓ (or j/k) selects rows, ↵ activates, Esc clears or goes back.
 */
export function useTerminalNav<F>({
  filters,
  activeFilter,
  onFilterChange,
  itemCount,
  onActivate,
  onBack,
  query = '',
}: UseTerminalNavOptions<F>) {
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    setSelected(null)
  }, [activeFilter, query, itemCount])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTerminalTarget(e.target)) return
      const typing = isTypingTarget(e.target)
      const hasInputText = e.target instanceof HTMLInputElement && e.target.value.length > 0
      const down = e.key === 'ArrowDown' || (!typing && e.key === 'j')
      const up = e.key === 'ArrowUp' || (!typing && e.key === 'k')
      const left = (e.key === 'ArrowLeft' && (!typing || !hasInputText)) || (!typing && e.key === 'h')
      const right = (e.key === 'ArrowRight' && (!typing || !hasInputText)) || (!typing && e.key === 'l')

      if ((left || right) && filters.length > 1) {
        e.preventDefault()
        const idx = filters.indexOf(activeFilter)
        const nextIdx = Math.min(filters.length - 1, Math.max(0, idx + (right ? 1 : -1)))
        if (nextIdx !== idx) onFilterChange(filters[nextIdx]!)
      } else if ((down || up) && itemCount > 0) {
        e.preventDefault()
        setSelected((cur) => {
          if (cur === null) return down ? 0 : itemCount - 1
          return Math.min(itemCount - 1, Math.max(0, cur + (down ? 1 : -1)))
        })
      } else if (e.key === 'Escape') {
        if (selected !== null) {
          setSelected(null)
        } else if (onBack && (!typing || !hasInputText)) {
          e.preventDefault()
          onBack()
        }
      } else if (e.key === 'Backspace' && !typing && onBack) {
        e.preventDefault()
        onBack()
      } else if (e.key === 'Enter' && selected !== null && selected < itemCount) {
        const el = e.target
        if (el instanceof HTMLElement && (el.tagName === 'A' || el.tagName === 'BUTTON')) return
        e.preventDefault()
        onActivate(selected)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filters, activeFilter, onFilterChange, itemCount, selected, onActivate, onBack])

  return { selected, setSelected }
}
