import { useMemo, useState } from 'react'
import taiwan from '@svg-maps/taiwan'
import type { TripRegion } from '../../types/trip'

interface SvgLocation {
  id: string
  name: string
  path: string
}

interface TaiwanRegionMapProps {
  regions: TripRegion[]
  selectedRegionId: string | null
  onSelectRegion: (regionId: string) => void
  /** When set in CMS edit mode, clicking counties toggles their assignment to this region. */
  paintingRegionId?: string | null
  onToggleMapCounty?: (regionId: string, countyKey: string) => void
}

export default function TaiwanRegionMap({
  regions,
  selectedRegionId,
  onSelectRegion,
  paintingRegionId = null,
  onToggleMapCounty,
}: TaiwanRegionMapProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null)
  const [hoveredCountyName, setHoveredCountyName] = useState<string | null>(null)

  const countyToRegion = useMemo(() => {
    const map = new Map<string, TripRegion>()
    for (const region of regions) {
      for (const key of region.mapRegionKeys) {
        map.set(key, region)
      }
    }
    return map
  }, [regions])

  const activeHoverRegion = useMemo(
    () => regions.find((r) => r.id === hoveredRegionId) ?? null,
    [regions, hoveredRegionId],
  )

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-surface-secondary/50 p-4 sm:p-6">
      <div className="mb-3 flex min-h-[2rem] w-full items-center justify-between gap-2 text-xs">
        {paintingRegionId ? (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-content">
            paint mode: click counties on the map to assign
            {hoveredCountyName ? ` · ${hoveredCountyName.toLowerCase()}` : ''}
          </span>
        ) : activeHoverRegion ? (
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-surface"
            style={{ backgroundColor: activeHoverRegion.color }}
          >
            <span>{activeHoverRegion.name}</span>
            <span className="opacity-80">· {activeHoverRegion.spots.length} spots</span>
          </span>
        ) : (
          <span className="text-content-muted">
            hover or click a colored region to explore spots
          </span>
        )}
      </div>

      <svg
        viewBox="285 295 745 995"
        role="img"
        aria-label="interactive map of taiwan regions"
        className="mx-auto h-[360px] w-full max-w-[340px] sm:h-[440px] sm:max-w-[400px] select-none drop-shadow-sm"
      >
        <defs>
          <clipPath id="clip-alishan-mountain">
            <rect x="622" y="795" width="110" height="105" rx="14" />
          </clipPath>
        </defs>
        {(taiwan.locations as SvgLocation[]).map((loc) => {
          const owner = countyToRegion.get(loc.id)
          const isAlishanClip = Boolean(!paintingRegionId && owner?.slug === 'alishan' && loc.id === 'chiayi-county')
          const isSelected = Boolean(owner && owner.id === selectedRegionId)
          const isHovered = Boolean(owner && owner.id === hoveredRegionId)
          const isPaintingTarget = Boolean(paintingRegionId && owner?.id === paintingRegionId)

          const fill = owner && !isAlishanClip ? owner.color : 'var(--color-surface-secondary)'
          const fillOpacity =
            owner && !isAlishanClip
              ? isSelected || isHovered || isPaintingTarget
                ? 0.95
                : 0.72
              : 0.9

          const activeFillOpacity = isSelected || isHovered || isPaintingTarget ? 0.95 : 0.72

          return (
            <g key={loc.id}>
              <path
                d={loc.path}
                aria-label={
                  owner && !isAlishanClip
                    ? `${loc.name.toLowerCase()} (${owner.name})`
                    : loc.name.toLowerCase()
                }
                style={{
                  fill,
                  fillOpacity,
                  stroke:
                    isSelected && !isAlishanClip ? 'var(--color-content)' : 'var(--color-surface)',
                  strokeWidth: isSelected && !isAlishanClip ? 4 : 2,
                  transition:
                    'fill-opacity 150ms ease, transform 150ms ease, stroke-width 150ms ease',
                }}
                className={
                  (owner && !isAlishanClip) || paintingRegionId ? 'cursor-pointer' : 'cursor-default'
                }
                onMouseEnter={() => {
                  setHoveredCountyName(loc.name)
                  if (owner && !isAlishanClip) setHoveredRegionId(owner.id)
                }}
                onMouseLeave={() => {
                  setHoveredCountyName(null)
                  setHoveredRegionId(null)
                }}
                onClick={() => {
                  if (paintingRegionId && onToggleMapCounty) {
                    onToggleMapCounty(paintingRegionId, loc.id)
                  } else if (owner && !isAlishanClip) {
                    onSelectRegion(owner.id)
                  }
                }}
              />
              {isAlishanClip && owner && (
                <path
                  d={loc.path}
                  clipPath="url(#clip-alishan-mountain)"
                  aria-label={`alishan (${owner.name})`}
                  style={{
                    fill: owner.color,
                    fillOpacity: activeFillOpacity,
                    stroke: isSelected ? 'var(--color-content)' : 'var(--color-surface)',
                    strokeWidth: isSelected ? 4 : 2,
                    transition:
                      'fill-opacity 150ms ease, transform 150ms ease, stroke-width 150ms ease',
                  }}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredCountyName('alishan')
                    setHoveredRegionId(owner.id)
                  }}
                  onMouseLeave={() => {
                    setHoveredCountyName(null)
                    setHoveredRegionId(null)
                  }}
                  onClick={() => onSelectRegion(owner.id)}
                />
              )}
            </g>
          )
        })}
      </svg>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {regions.map((region) => {
          const isActive = region.id === selectedRegionId || region.id === hoveredRegionId
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region.id)}
              onMouseEnter={() => setHoveredRegionId(region.id)}
              onMouseLeave={() => setHoveredRegionId(null)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
                isActive
                  ? 'border-content text-content font-medium shadow-sm'
                  : 'border-border bg-surface text-content-secondary hover:text-content'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: region.color }}
              />
              <span>{region.name}</span>
              <span className="text-content-muted">{region.spots.length}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
