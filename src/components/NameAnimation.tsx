import { Fragment, useEffect, useState } from 'react'

export type NameAnimationKind =
  | 'pop'
  | 'typewriter'
  | 'scramble'
  | 'binary'
  | 'glitch'
  | 'invert-sweep'
  | 'case-ripple'
  | 'dim-sweep'
  | 'wavedash'
  | 'bracket-wrap'
  | 'gravity-drop'

interface NameAnimationProps {
  text?: string
  kind: NameAnimationKind
  /** Incrementing this re-triggers the animation. */
  playKey: number
}

const SCRAMBLE_CHARS = '#@*01/?%'
const BINARY_CHARS = '01'

function randomFrom(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

export default function NameAnimation({
  text = 'kevin geng',
  kind,
  playKey,
}: NameAnimationProps) {
  const [rendered, setRendered] = useState<string[]>(() => text.split(''))
  const [typedCount, setTypedCount] = useState<number>(text.length)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [upperIdx, setUpperIdx] = useState<number | null>(null)

  useEffect(() => {
    setRendered(text.split(''))
    setTypedCount(text.length)
    setActiveIdx(null)
    setUpperIdx(null)

    if (playKey === 0 || prefersReducedMotion()) return

    if (kind === 'typewriter') {
      setTypedCount(0)
      let i = 0
      let endTimeout: number | undefined
      const id = window.setInterval(() => {
        i += 1
        setTypedCount(i)
        if (i >= text.length) {
          window.clearInterval(id)
          endTimeout = window.setTimeout(() => setTypedCount(text.length + 1), 500)
        }
      }, 60)
      return () => {
        window.clearInterval(id)
        if (endTimeout !== undefined) window.clearTimeout(endTimeout)
      }
    }

    if (kind === 'scramble' || kind === 'binary') {
      const pool = kind === 'binary' ? BINARY_CHARS : SCRAMBLE_CHARS
      let locked = 0
      let tick = 0
      const id = window.setInterval(() => {
        tick += 1
        if (tick % 2 === 0) locked += 1
        setRendered(
          text.split('').map((ch, idx) => {
            if (ch === ' ' || idx < locked) return ch
            return randomFrom(pool)
          }),
        )
        if (locked >= text.length) window.clearInterval(id)
      }, 45)
      return () => window.clearInterval(id)
    }

    if (kind === 'invert-sweep' || kind === 'case-ripple') {
      let i = 0
      const setIdx = kind === 'invert-sweep' ? setActiveIdx : setUpperIdx
      setIdx(0)
      const id = window.setInterval(() => {
        i += 1
        if (i >= text.length) {
          setIdx(null)
          window.clearInterval(id)
        } else {
          setIdx(i)
        }
      }, 55)
      return () => window.clearInterval(id)
    }
  }, [text, kind, playKey])

  const cssAnimationFor = (i: number): string | undefined => {
    if (playKey === 0 || prefersReducedMotion()) return undefined
    switch (kind) {
      case 'pop':
        return `name-pop 400ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 48}ms both`
      case 'glitch':
        return `name-glitch 280ms steps(2, end) ${(i % 4) * 35}ms both`
      case 'dim-sweep':
        return `name-dim 420ms ease-in-out ${i * 45}ms both`
      case 'wavedash':
        return `name-wavedash 320ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 22}ms both`
      case 'gravity-drop':
        return `name-drop 450ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 40}ms both`
      default:
        return undefined
    }
  }

  const isTyping = kind === 'typewriter' && typedCount <= text.length

  return (
    <span aria-label={text} className="relative inline-flex items-baseline font-mono">
      {kind === 'bracket-wrap' && playKey > 0 && (
        <span
          key={`bl-${playKey}`}
          aria-hidden="true"
          className="absolute right-full mr-1 text-content-muted pointer-events-none"
          style={
            prefersReducedMotion()
              ? undefined
              : { animation: 'name-bracket-left 750ms ease-in-out both' }
          }
        >
          [
        </span>
      )}
      {rendered.map((ch, i) => {
        const displayChar = upperIdx === i ? ch.toUpperCase() : ch
        const isInverted = activeIdx === i || (isTyping && typedCount === i)
        const isUntyped = isTyping && i > typedCount
        return (
          <Fragment key={`${kind}-${playKey}-${i}`}>
            <span
              aria-hidden="true"
              className={`name-ripple-char ${
                isInverted ? 'bg-content text-surface' : isUntyped ? 'opacity-25' : ''
              }`}
              style={{ animation: cssAnimationFor(i) }}
            >
              {displayChar === ' ' ? '\u00A0' : displayChar}
            </span>
          </Fragment>
        )
      })}
      {isTyping && typedCount === text.length && (
        <span aria-hidden="true" className="absolute left-full ml-0.5 text-content animate-pulse">
          █
        </span>
      )}
      {kind === 'bracket-wrap' && playKey > 0 && (
        <span
          key={`br-${playKey}`}
          aria-hidden="true"
          className="absolute left-full ml-1 text-content-muted pointer-events-none"
          style={
            prefersReducedMotion()
              ? undefined
              : { animation: 'name-bracket-right 750ms ease-in-out both' }
          }
        >
          ]
        </span>
      )}
    </span>
  )
}
