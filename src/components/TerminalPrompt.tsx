import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runCommand } from '../config/commands'
import type { IndexRow } from '../config/indexRows'
import { useTheme } from '../contexts/ThemeContext'

interface TerminalPromptProps {
  rows: IndexRow[]
}

interface HistoryEntry {
  input: string
  output: string[]
}

const PROMPT = 'kgeng@dev:~$'

/**
 * Click-to-focus command line. Desktop only: hidden below the `md` breakpoint
 * (no hardware keyboard to rely on, and the tap targets elsewhere cover it).
 */
export default function TerminalPrompt({ rows }: TerminalPromptProps) {
  const navigate = useNavigate()
  const { setTheme, cycleTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [recall, setRecall] = useState<number | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [history])

  const submit = () => {
    const input = value
    setValue('')
    setRecall(null)
    if (!input.trim()) return
    const result = runCommand(input, { rows })
    setHistory((h) => (result.clear ? [] : [...h, { input, output: result.output }]))
    if (result.theme === 'toggle') cycleTheme()
    else if (result.theme) setTheme(result.theme)
    if (result.open) window.open(result.open, '_blank', 'noopener,noreferrer')
    if (result.navigate) navigate(result.navigate)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (history.length === 0) return
      const delta = e.key === 'ArrowUp' ? -1 : 1
      const next = Math.min(history.length, Math.max(0, (recall ?? history.length) + delta))
      setRecall(next === history.length ? null : next)
      setValue(next === history.length ? '' : history[next]!.input)
    }
  }

  return (
    <section
      aria-label="terminal"
      data-terminal
      onClick={() => inputRef.current?.focus()}
      className="hidden md:block font-mono text-sm text-content-secondary cursor-text"
    >
      {history.length > 0 && (
        <div className="mb-2 max-h-36 overflow-y-auto" aria-live="polite">
          {history.map((entry, i) => (
            <div key={i}>
              <div>
                <span className="text-content-muted">{PROMPT}</span> {entry.input}
              </div>
              {entry.output.map((line, j) => (
                <div key={j} className="whitespace-pre-wrap text-content-muted">
                  {line}
                </div>
              ))}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
      <label className="flex items-center gap-2">
        <span className="text-content-muted shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder="type help"
          aria-label="terminal command"
          className="flex-1 bg-transparent text-content placeholder:text-content-muted/60 outline-none caret-current"
        />
      </label>
    </section>
  )
}
