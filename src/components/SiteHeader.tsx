import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import NameAnimation, { type NameAnimationKind } from './NameAnimation'
import { parentPath, promptSegments } from '../config/headerNav'
import { paths } from '../config/paths'
import { randomFortune } from '../config/fortunes'

const DISPLAY_NAME = 'kevin geng'
const ANIMATION_INTERVAL_MS = 8000

const NAME_ANIMATIONS: NameAnimationKind[] = [
  'pop',
  'typewriter',
  'scramble',
  'binary',
  'glitch',
  'invert-sweep',
  'case-ripple',
  'dim-sweep',
  'wavedash',
  'bracket-wrap',
  'gravity-drop',
]

function pickNextAnimation(current: NameAnimationKind): NameAnimationKind {
  const pool = NAME_ANIMATIONS.filter((a) => a !== current)
  return pool[Math.floor(Math.random() * pool.length)] ?? 'pop'
}

export default function SiteHeader() {
  const { pathname } = useLocation()
  const parent = parentPath(pathname)
  const segments = promptSegments(pathname)
  const [fortune] = useState(() => randomFortune())
  const [anim, setAnim] = useState<{ kind: NameAnimationKind; tick: number }>({
    kind: 'pop',
    tick: 0,
  })

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (media?.matches) return

    const triggerRandom = () => {
      setAnim((prev) => ({
        kind: pickNextAnimation(prev.kind),
        tick: prev.tick + 1,
      }))
    }

    triggerRandom()
    const interval = window.setInterval(triggerRandom, ANIMATION_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <header className="mb-4 md:mb-5 px-2 md:px-0 flex justify-between items-start font-mono shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-3 text-xs text-content-muted mb-2 min-w-0">
          <nav aria-label="breadcrumb" className="truncate flex items-center">
            <span>kgeng@dev:</span>
            {segments.map((seg, i) => (
              <span key={`${seg.label}-${i}`} className="inline-flex items-center">
                {i > 0 && <span>/</span>}
                {seg.to ? (
                  <Link to={seg.to} className="hover:text-content transition-colors">
                    {seg.label}
                  </Link>
                ) : (
                  <span className="text-content-secondary">{seg.label}</span>
                )}
              </span>
            ))}
            <span>$</span>
          </nav>
          {parent && (
            <Link
              to={parent}
              className="shrink-0 text-content-muted hover:text-content transition-colors"
            >
              ← cd ..
            </Link>
          )}
        </div>
        <h1 className="text-2xl font-medium text-content">
          <Link to={paths.home} aria-label={DISPLAY_NAME}>
            <NameAnimation text={DISPLAY_NAME} kind={anim.kind} playKey={anim.tick} />
          </Link>
        </h1>
        <p className="text-sm text-content-muted mt-1">
          product engineer @{' '}
          <a
            href="https://faire.com/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-content-secondary hover:text-content transition-colors"
          >
            faire
          </a>{' '}
          · {fortune}
        </p>
      </div>
      <ThemeToggle />
    </header>
  )
}
