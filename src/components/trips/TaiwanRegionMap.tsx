import { useMemo, useState } from 'react'
import taiwan from '@svg-maps/taiwan'
import type { TripRegion } from '../../types/trip'

interface SvgLocation {
  id: string
  name: string
  path: string
}

const CLIPPED_REGIONS: Record<
  string,
  {
    countyId: string
    clipId: string
    label: string
    rect: { x: number; y: number; width: number; height: number; rx: number }
  }
> = {
  alishan: {
    countyId: 'chiayi-county',
    clipId: 'clip-alishan-mountain',
    label: 'alishan',
    rect: { x: 622, y: 795, width: 110, height: 105, rx: 14 },
  },
  tainan: {
    countyId: 'tainan-city',
    clipId: 'clip-tainan-city',
    label: 'tainan',
    rect: { x: 475, y: 930, width: 90, height: 88, rx: 14 },
  },
  kaohsiung: {
    countyId: 'kaohsiung-city',
    clipId: 'clip-kaohsiung-city',
    label: 'kaohsiung',
    rect: { x: 512, y: 1015, width: 90, height: 120, rx: 14 },
  },
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
        className="mx-auto h-[360px] w-full max-w-[340px] sm:h-[440px] sm:max-w-[400px] select-none touch-manipulation drop-shadow-sm"
      >
        <defs>
          {Object.values(CLIPPED_REGIONS).map((spec) => (
            <clipPath key={spec.clipId} id={spec.clipId}>
              <rect {...spec.rect} />
            </clipPath>
          ))}
          {Object.values(CLIPPED_REGIONS).map((spec) => {
            const loc = (taiwan.locations as SvgLocation[]).find((l) => l.id === spec.countyId)
            return loc ? (
              <clipPath key={`county-${spec.countyId}`} id={`clip-county-${spec.countyId}`}>
                <path d={loc.path} />
              </clipPath>
            ) : null
          })}
        </defs>
        {[...(taiwan.locations as SvgLocation[])]
          .sort((a, b) => {
            const aSelected = countyToRegion.get(a.id)?.id === selectedRegionId ? 1 : 0
            const bSelected = countyToRegion.get(b.id)?.id === selectedRegionId ? 1 : 0
            return aSelected - bSelected
          })
          .map((loc) => {
            const owner = countyToRegion.get(loc.id)
            const clipSpec = owner ? CLIPPED_REGIONS[owner.slug] : undefined
            const isClippedRegion = Boolean(!paintingRegionId && clipSpec && clipSpec.countyId === loc.id)
            const isSelected = Boolean(owner && owner.id === selectedRegionId)
            const isHovered = Boolean(owner && owner.id === hoveredRegionId)
            const isPaintingTarget = Boolean(paintingRegionId && owner?.id === paintingRegionId)

            const fill = owner && !isClippedRegion ? owner.color : 'var(--color-surface-secondary)'
            const fillOpacity =
              owner && !isClippedRegion
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
                    owner && !isClippedRegion
                      ? `${loc.name.toLowerCase()} (${owner.name})`
                      : loc.name.toLowerCase()
                  }
                  style={{
                    fill,
                    fillOpacity,
                    stroke:
                      isSelected && !isClippedRegion ? 'var(--color-content)' : 'var(--color-surface)',
                    strokeWidth: isSelected && !isClippedRegion ? 4 : 2,
                    transition:
                      'fill-opacity 150ms ease, transform 150ms ease, stroke-width 150ms ease',
                  }}
                  className={
                    (owner && !isClippedRegion) || paintingRegionId
                      ? 'cursor-pointer'
                      : 'cursor-default'
                  }
                  onMouseEnter={() => {
                    setHoveredCountyName(loc.name)
                    if (owner && !isClippedRegion) setHoveredRegionId(owner.id)
                  }}
                  onMouseLeave={() => {
                    setHoveredCountyName(null)
                    setHoveredRegionId(null)
                  }}
                  onClick={() => {
                    if (paintingRegionId && onToggleMapCounty) {
                      onToggleMapCounty(paintingRegionId, loc.id)
                    } else if (owner && !isClippedRegion) {
                      onSelectRegion(owner.id)
                    }
                  }}
                />
                {isClippedRegion && owner && clipSpec && (
                  <g>
                    <path
                      d={loc.path}
                      clipPath={`url(#${clipSpec.clipId})`}
                      aria-label={`${clipSpec.label} (${owner.name})`}
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
                        setHoveredCountyName(clipSpec.label)
                        setHoveredRegionId(owner.id)
                      }}
                      onMouseLeave={() => {
                        setHoveredCountyName(null)
                        setHoveredRegionId(null)
                      }}
                      onClick={() => onSelectRegion(owner.id)}
                    />
                    <rect
                      {...clipSpec.rect}
                      clipPath={`url(#clip-county-${clipSpec.countyId})`}
                      fill="none"
                      pointerEvents="none"
                      style={{
                        stroke: isSelected ? 'var(--color-content)' : 'var(--color-surface)',
                        strokeWidth: isSelected ? 4 : 2,
                        transition: 'stroke-width 150ms ease',
                      }}
                    />
                  </g>
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
