import { useEffect, useState } from 'react'

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

interface SkeletonRowSpec {
  typeWidth: string
  nameWidth: string
  descWidth: string
  dateWidth: string
}

const SKELETON_ROWS: SkeletonRowSpec[] = [
  { typeWidth: 'w-14', nameWidth: 'w-28', descWidth: 'w-3/4', dateWidth: 'w-12' },
  { typeWidth: 'w-14', nameWidth: 'w-36', descWidth: 'w-2/3', dateWidth: 'w-12' },
  { typeWidth: 'w-10', nameWidth: 'w-24', descWidth: 'w-4/5', dateWidth: 'w-10' },
  { typeWidth: 'w-10', nameWidth: 'w-20', descWidth: 'w-1/2', dateWidth: 'w-10' },
  { typeWidth: 'w-10', nameWidth: 'w-40', descWidth: 'w-3/5', dateWidth: 'w-12' },
  { typeWidth: 'w-10', nameWidth: 'w-32', descWidth: 'w-2/3', dateWidth: 'w-12' },
  { typeWidth: 'w-10', nameWidth: 'w-44', descWidth: 'w-1/2', dateWidth: 'w-12' },
  { typeWidth: 'w-10', nameWidth: 'w-28', descWidth: 'w-3/4', dateWidth: 'w-12' },
]

interface TerminalListSkeletonProps {
  /** Status text shown next to the spinner. */
  label?: string
  /** Matches the target list's column layout. */
  variant?: 'index' | 'recipes'
}

export default function TerminalListSkeleton({
  label = 'indexing…',
  variant = 'index',
}: TerminalListSkeletonProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => window.clearInterval(id)
  }, [])

  const gridClass =
    variant === 'recipes'
      ? 'grid grid-cols-[auto_1fr] md:grid-cols-[7rem_16rem_1fr] gap-x-4 gap-y-1.5 text-sm items-center'
      : 'grid grid-cols-[auto_1fr_5rem] md:grid-cols-[6rem_1fr_auto_5.5rem] gap-x-4 gap-y-1.5 text-sm items-center'

  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-content-muted">
        <span aria-hidden="true" className="text-content-secondary">
          {SPINNER_FRAMES[frame]}
        </span>
        <span>{label}</span>
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-3.5 bg-content-muted/70 animate-pulse motion-reduce:animate-none"
        />
      </div>

      <ul aria-hidden="true" className="space-y-3 md:space-y-1.5">
        {SKELETON_ROWS.map((row, idx) => {
          const delay = `${idx * 65}ms`
          const barClass =
            'h-3.5 rounded-sm bg-surface-secondary animate-pulse motion-reduce:animate-none'

          return (
            <li key={idx} className={gridClass}>
              <span className="flex items-center">
                {variant === 'recipes' && (
                  <span className="hidden md:inline text-content-muted/40 mr-1.5 whitespace-pre">
                    {'  '}
                  </span>
                )}
                <span className={`${barClass} inline-block ${row.typeWidth}`} style={{ animationDelay: delay }} />
              </span>

              <span className={`${barClass} inline-block ${row.nameWidth}`} style={{ animationDelay: delay }} />

              <span
                className={`${barClass} ${
                  variant === 'recipes' ? 'col-span-2 md:col-span-1' : 'order-3 col-span-3 md:order-none md:col-span-1'
                } ${row.descWidth}`}
                style={{ animationDelay: delay }}
              />

              {variant === 'index' && (
                <span
                  className={`${barClass} order-2 md:order-none justify-self-end ${row.dateWidth}`}
                  style={{ animationDelay: delay }}
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
