import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Inner surface the pearl rolls on: bottom toward the left wall / rim (cup stays fixed in frame).
 */
const PEARL_TRACK_D =
  'M 112 275 C 94 275 78 262 70 232 C 62 198 60 158 64 118 C 66 88 72 62 78 54'

interface Point {
  x: number
  y: number
}

export default function BobaPearlAnimation() {
  const trackRef = useRef<SVGPathElement>(null)
  const [pearl, setPearl] = useState<Point>({ x: 112, y: 275 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useLayoutEffect(() => {
    const path = trackRef.current
    if (!path) return
    const len = path.getTotalLength()
    const mid = path.getPointAtLength(len * 0.5)
    setPearl({ x: mid.x, y: mid.y })
  }, [reducedMotion])

  useEffect(() => {
    const path = trackRef.current
    if (!path || reducedMotion) return

    const len = path.getTotalLength()
    let progress = 0.5
    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const phase = now * 0.00062
      const target = 0.5 + 0.46 * Math.sin(phase)
      const dt = Math.min((now - last) / 1000, 0.064)
      last = now
      progress += (target - progress) * (1 - Math.exp(-dt * 2.4))
      const pt = path.getPointAtLength(progress * len)
      setPearl({ x: pt.x, y: pt.y })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  return (
    <div
      className="flex justify-center w-full py-2"
      role="img"
      aria-label="animation of one boba pearl rolling along the inner wall of milk tea in a cup; the frame stays fixed on the cup and pearl"
    >
      <svg
        viewBox="0 0 220 300"
        className="w-full max-w-[min(280px,100%)] h-auto overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="boba-tea-fill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(32 38% 42%)" stopOpacity="0.96" />
            <stop offset="50%" stopColor="hsl(34 42% 58%)" stopOpacity="0.93" />
            <stop offset="100%" stopColor="hsl(36 48% 72%)" stopOpacity="0.9" />
          </linearGradient>
          <clipPath id="boba-cup-inner">
            <path d="M 58 48 L 162 48 L 148 278 L 72 278 Z" />
          </clipPath>
        </defs>

        {/* Milk tea — horizontal surface (world upright); clipped to cup interior */}
        <g clipPath="url(#boba-cup-inner)">
          <rect x="0" y="64" width="220" height="240" fill="url(#boba-tea-fill)" />
          <rect x="0" y="58" width="220" height="10" fill="hsl(38 55% 80%)" fillOpacity="0.28" />
        </g>

        <path ref={trackRef} d={PEARL_TRACK_D} fill="none" stroke="none" />

        {/* Drawn before rim stroke so the pearl reads inside the cup */}
        <g transform={`translate(${pearl.x} ${pearl.y})`}>
          <circle r="10.5" fill="#0a0a0a" />
          <ellipse cx="-2.8" cy="-3.2" rx="3.2" ry="2" fill="white" fillOpacity="0.2" />
        </g>

        {/* Cup: outline only so the pearl stays visible */}
        <path
          d="M 58 48 L 162 48 L 148 278 L 72 278 Z"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="2"
          strokeOpacity="0.85"
        />
        <path
          d="M 60 50 L 160 50"
          stroke="var(--color-content-muted)"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
