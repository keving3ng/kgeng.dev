import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import NameAnimation, { type NameAnimationKind } from '../components/NameAnimation'

interface AnimationOption {
  id: number
  kind: NameAnimationKind
  label: string
  note: string
}

const ANIMATIONS: AnimationOption[] = [
  { id: 0, kind: 'pop', label: 'wave ripple (original)', note: 'staggered upward pop across each letter' },
  { id: 1, kind: 'typewriter', label: 'typewriter + block cursor', note: 'sweeps typing cursor across dimmed letters' },
  { id: 2, kind: 'scramble', label: 'scramble / decode', note: 'cycles through ascii symbols before locking left-to-right' },
  { id: 3, kind: 'binary', label: 'matrix / binary flip', note: 'flashes 0/1 bits before resolving' },
  { id: 4, kind: 'glitch', label: 'crt / glitch jitter', note: 'quick micro-jitter and opacity flicker' },
  { id: 5, kind: 'invert-sweep', label: 'inverted block sweep', note: 'terminal cursor highlight sweeps across each char' },
  { id: 6, kind: 'case-ripple', label: 'case toggle ripple', note: 'flips each letter to uppercase in a wave' },
  { id: 7, kind: 'dim-sweep', label: 'dim-to-bright pulse', note: 'dims and snaps back left-to-right' },
  { id: 8, kind: 'wavedash', label: 'wavedash', note: 'snappy low horizontal slide-hop' },
  { id: 9, kind: 'bracket-wrap', label: 'bracket wrap', note: 'brackets slide in around the name and retract' },
  { id: 10, kind: 'gravity-drop', label: 'gravity drop', note: 'letters drop in and settle with a bounce' },
]

export default function AnimationTest() {
  const [ticks, setTicks] = useState<Record<NameAnimationKind, number>>({
    pop: 1,
    typewriter: 1,
    scramble: 1,
    binary: 1,
    glitch: 1,
    'invert-sweep': 1,
    'case-ripple': 1,
    'dim-sweep': 1,
    wavedash: 1,
    'bracket-wrap': 1,
    'gravity-drop': 1,
  })

  const replayOne = (kind: NameAnimationKind) => {
    setTicks((prev) => ({ ...prev, [kind]: prev[kind] + 1 }))
  }

  const replayAll = () => {
    setTicks((prev) => {
      const next = { ...prev }
      for (const a of ANIMATIONS) next[a.kind] = prev[a.kind] + 1
      return next
    })
  }

  return (
    <div className="font-mono pb-16">
      <SiteHeader />

      <div className="px-2 md:px-0">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-content">name animations</h1>
          <p className="text-xs text-content-muted mt-1">
            click any row or replay all to preview.
          </p>
        </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={replayAll}
          className="min-h-[44px] px-3 py-2 text-sm border border-border rounded text-content hover:bg-surface-secondary transition-colors"
        >
          replay all
        </button>
      </div>

      <ul className="divide-y divide-border">
        {ANIMATIONS.map((anim) => (
          <li key={anim.kind} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-2xl font-medium text-content">
                <NameAnimation kind={anim.kind} playKey={ticks[anim.kind]} />
              </div>
              <p className="text-xs text-content-muted mt-1">
                {anim.id}. {anim.label} — {anim.note}
              </p>
            </div>
            <button
              type="button"
              onClick={() => replayOne(anim.kind)}
              className="min-h-[44px] self-start sm:self-center px-3 text-xs text-content-muted hover:text-content border border-border rounded transition-colors"
            >
              replay
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}
