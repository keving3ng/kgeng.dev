import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import TaiwanRegionMap from '../components/trips/TaiwanRegionMap'
import RegionPinMap from '../components/trips/RegionPinMap'
import SpotCard from '../components/trips/SpotCard'
import { useTripAdmin } from '../hooks/useTripAdmin'
import {
  createRegion,
  createSpot,
  deleteRegion,
  deleteSpot,
  deleteSpotImage,
  getTrip,
  reorderRegions,
  reorderSpots,
  updateRegion,
  updateSpot,
  uploadSpotImage,
} from '../services/trips'
import { paths } from '../config/paths'
import {
  BUCKET_META,
  REGION_PALETTE,
  SPOT_BUCKETS,
  type SpotBucket,
  type SpotImage,
  type TripDetailData,
  type TripRegion,
  type TripSpot,
} from '../types/trip'

export default function TripDetail() {
  const { slug = 'taiwan' } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const regionParam = searchParams.get('region')

  const [data, setData] = useState<TripDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { token, isAuthenticated, editMode, setEditMode, lock } = useTripAdmin()

  // Map / Spot interaction state
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<SpotImage | null>(null)
  const [pickingSpotId, setPickingSpotId] = useState<string | null>(null)
  const [showPinMapInEdit, setShowPinMapInEdit] = useState(false)

  // Region CMS state
  const [paintingRegionId, setPaintingRegionId] = useState<string | null>(null)
  const [draggedRegionId, setDraggedRegionId] = useState<string | null>(null)
  const [newRegionName, setNewRegionName] = useState('')
  const [newRegionSummary, setNewRegionSummary] = useState('')
  const [newRegionColor, setNewRegionColor] = useState<string>(REGION_PALETTE[0])

  // Spot Drag & Drop state
  const [draggedSpot, setDraggedSpot] = useState<{ id: string; bucket: SpotBucket } | null>(null)
  const [dropBucket, setDropBucket] = useState<SpotBucket | null>(null)

  // Quick add spot state
  const [addingBucket, setAddingBucket] = useState<SpotBucket | null>(null)
  const [newSpotName, setNewSpotName] = useState('')
  const [newSpotCategory, setNewSpotCategory] = useState('')
  const [newSpotNote, setNewSpotNote] = useState('')
  const [newSpotUrl, setNewSpotUrl] = useState('')

  const loadTrip = useCallback(() => {
    setLoading(true)
    getTrip(slug)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'failed to load trip'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    loadTrip()
  }, [loadTrip])

  const selectedRegion = useMemo<TripRegion | null>(() => {
    if (!data || !regionParam) return null
    return data.regions.find((r) => r.id === regionParam || r.slug === regionParam) ?? null
  }, [data, regionParam])

  const selectRegion = useCallback(
    (regionId: string | null) => {
      setActiveSpotId(null)
      setPickingSpotId(null)
      setAddingBucket(null)
      if (!regionId || !data) {
        setSearchParams({})
        return
      }
      const target = data.regions.find((r) => r.id === regionId)
      setSearchParams({ region: target?.slug ?? regionId })
    },
    [data, setSearchParams],
  )

  const handleToggleMapCounty = async (regionId: string, countyKey: string) => {
    if (!token || !data) return
    const region = data.regions.find((r) => r.id === regionId)
    if (!region) return

    const exists = region.mapRegionKeys.includes(countyKey)
    const nextKeys = exists
      ? region.mapRegionKeys.filter((k) => k !== countyKey)
      : [...region.mapRegionKeys, countyKey]

    // Optimistic update (also remove from any other region if assigning)
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        regions: prev.regions.map((r) => {
          if (r.id === regionId) return { ...r, mapRegionKeys: nextKeys }
          if (!exists && r.mapRegionKeys.includes(countyKey)) {
            return { ...r, mapRegionKeys: r.mapRegionKeys.filter((k) => k !== countyKey) }
          }
          return r
        }),
      }
    })

    if (!exists) {
      for (const other of data.regions) {
        if (other.id !== regionId && other.mapRegionKeys.includes(countyKey)) {
          await updateRegion(token, slug, {
            id: other.id,
            mapRegionKeys: other.mapRegionKeys.filter((k) => k !== countyKey),
          })
        }
      }
    }
    await updateRegion(token, slug, { id: regionId, mapRegionKeys: nextKeys })
  }

  const handleDropRegion = async (targetRegionId: string) => {
    if (!token || !data || !draggedRegionId || draggedRegionId === targetRegionId) return
    const list = [...data.regions]
    const fromIdx = list.findIndex((r) => r.id === draggedRegionId)
    const toIdx = list.findIndex((r) => r.id === targetRegionId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, moved)

    setData({ ...data, regions: list })
    setDraggedRegionId(null)
    await reorderRegions(
      token,
      slug,
      list.map((r) => r.id),
    )
  }

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newRegionName.trim() || !data) return
    const created = await createRegion(token, slug, {
      name: newRegionName.trim(),
      summary: newRegionSummary.trim() || undefined,
      color: newRegionColor,
    })
    setData({ ...data, regions: [...data.regions, created] })
    setNewRegionName('')
    setNewRegionSummary('')
    setPaintingRegionId(created.id)
  }

  const handleUpdateRegionColor = async (regionId: string, color: string) => {
    if (!token || !data) return
    setData({
      ...data,
      regions: data.regions.map((r) => (r.id === regionId ? { ...r, color } : r)),
    })
    await updateRegion(token, slug, { id: regionId, color })
  }

  const handleDeleteRegion = async (regionId: string) => {
    if (!token || !data) return
    await deleteRegion(token, slug, regionId)
    setData({
      ...data,
      regions: data.regions.filter((r) => r.id !== regionId),
    })
    if (selectedRegion?.id === regionId) selectRegion(null)
    if (paintingRegionId === regionId) setPaintingRegionId(null)
  }

  const handleCreateSpot = async (e: React.FormEvent, bucket: SpotBucket) => {
    e.preventDefault()
    if (!token || !selectedRegion || !newSpotName.trim() || !data) return
    const created = await createSpot(token, slug, {
      regionId: selectedRegion.id,
      name: newSpotName.trim(),
      bucket,
      category: newSpotCategory.trim() || undefined,
      note: newSpotNote.trim() || undefined,
      url: newSpotUrl.trim() || undefined,
    })

    setData({
      ...data,
      regions: data.regions.map((r) =>
        r.id === selectedRegion.id ? { ...r, spots: [...r.spots, created] } : r,
      ),
    })
    setNewSpotName('')
    setNewSpotCategory('')
    setNewSpotNote('')
    setNewSpotUrl('')
    setAddingBucket(null)
  }

  const handleDropSpotOnBucket = async (targetBucket: SpotBucket, beforeSpotId?: string) => {
    if (!token || !selectedRegion || !draggedSpot || !data) return

    const regionSpots = [...selectedRegion.spots]
    const movingIdx = regionSpots.findIndex((s) => s.id === draggedSpot.id)
    if (movingIdx === -1) return

    const [moving] = regionSpots.splice(movingIdx, 1)
    const updatedSpot: TripSpot = { ...moving, bucket: targetBucket }

    if (beforeSpotId && beforeSpotId !== moving.id) {
      const targetIdx = regionSpots.findIndex((s) => s.id === beforeSpotId)
      if (targetIdx !== -1) regionSpots.splice(targetIdx, 0, updatedSpot)
      else regionSpots.push(updatedSpot)
    } else {
      regionSpots.push(updatedSpot)
    }

    // Recompute sortOrder per bucket
    const bucketCounts: Record<SpotBucket, number> = { recommended: 0, visited: 0, saved: 0 }
    const normalized = regionSpots.map((s) => {
      const order = bucketCounts[s.bucket]++
      return { ...s, sortOrder: order }
    })

    setData({
      ...data,
      regions: data.regions.map((r) =>
        r.id === selectedRegion.id ? { ...r, spots: normalized } : r,
      ),
    })
    setDraggedSpot(null)
    setDropBucket(null)

    await reorderSpots(
      token,
      slug,
      normalized.map((s) => ({ id: s.id, bucket: s.bucket, sortOrder: s.sortOrder })),
    )
  }

  const handleUpdateSpot = async (
    spotId: string,
    patch: { name?: string; category?: string | null; note?: string | null; url?: string | null; lat?: number | null; lng?: number | null },
  ) => {
    if (!token || !selectedRegion || !data) return
    setData({
      ...data,
      regions: data.regions.map((r) =>
        r.id === selectedRegion.id
          ? {
              ...r,
              spots: r.spots.map((s) => (s.id === spotId ? { ...s, ...patch } : s)),
            }
          : r,
      ),
    })
    await updateSpot(token, slug, { id: spotId, ...patch })
  }

  const handleDeleteSpot = async (spotId: string) => {
    if (!token || !selectedRegion || !data) return
    setData({
      ...data,
      regions: data.regions.map((r) =>
        r.id === selectedRegion.id
          ? { ...r, spots: r.spots.filter((s) => s.id !== spotId) }
          : r,
      ),
    })
    await deleteSpot(token, slug, spotId)
  }

  const handleUploadImage = async (spotId: string, file: File, caption?: string) => {
    if (!token || !selectedRegion || !data) return
    const uploaded = await uploadSpotImage(token, spotId, file, caption)
    setData({
      ...data,
      regions: data.regions.map((r) =>
        r.id === selectedRegion.id
          ? {
              ...r,
              spots: r.spots.map((s) =>
                s.id === spotId ? { ...s, images: [...s.images, uploaded] } : s,
              ),
            }
          : r,
      ),
    })
  }

  const handleDeleteImage = async (spotId: string, imageId: string) => {
    if (!token || !selectedRegion || !data) return
    setData({
      ...data,
      regions: data.regions.map((r) =>
        r.id === selectedRegion.id
          ? {
              ...r,
              spots: r.spots.map((s) =>
                s.id === spotId
                  ? { ...s, images: s.images.filter((img) => img.id !== imageId) }
                  : s,
              ),
            }
          : r,
      ),
    })
    await deleteSpotImage(token, imageId)
  }

  const handlePickCoords = async (lat: number, lng: number) => {
    if (!pickingSpotId) return
    const targetId = pickingSpotId
    setPickingSpotId(null)
    await handleUpdateSpot(targetId, { lat, lng })
  }

  const hasPinnedSpots = Boolean(
    selectedRegion?.spots.some((s) => s.lat !== null && s.lng !== null),
  )

  return (
    <div className="min-h-screen overflow-x-hidden pb-16 touch-manipulation">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3 text-xs text-content-muted">
            <Link to={paths.trips} className="hover:text-content transition-colors">
              ← trips
            </Link>
            {selectedRegion && (
              <>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => selectRegion(null)}
                  className="hover:text-content transition-colors"
                >
                  all regions
                </button>
              </>
            )}
          </div>
          <h1 className="text-2xl font-medium text-content">
            {data?.trip.title ?? slug}
          </h1>
          {data?.trip.subtitle && (
            <p className="mt-1 text-sm text-content-secondary">{data.trip.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => {
                  const next = !editMode
                  setEditMode(next)
                  if (!next) {
                    setPaintingRegionId(null)
                    setPickingSpotId(null)
                  }
                }}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  editMode
                    ? 'border-content bg-content text-surface font-medium'
                    : 'border-border bg-surface-secondary text-content-secondary hover:text-content'
                }`}
              >
                {editMode ? 'editing' : 'edit'}
              </button>
              <button
                type="button"
                onClick={lock}
                className="rounded-full border border-border px-3 py-1 text-xs text-content-muted hover:text-content"
              >
                lock
              </button>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-content-muted">loading trip map…</p>
      ) : error || !data ? (
        <div className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-2">
          <p className="text-sm text-error">{error ?? 'trip not found'}</p>
          <p className="text-xs text-content-muted">
            apply d1 migrations (`0001_trips.sql` & `0002_seed_taiwan.sql`) to initialize this trip.
          </p>
        </div>
      ) : selectedRegion ? (
        <div className="space-y-6">
          {/* Region header */}
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface-secondary/40 p-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3.5 w-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedRegion.color }}
                />
                <h2 className="text-xl font-medium text-content">{selectedRegion.name}</h2>
              </div>
              {selectedRegion.summary && (
                <p className="text-sm text-content-secondary">{selectedRegion.summary}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-content-muted">
                {SPOT_BUCKETS.map((b) => {
                  const count = selectedRegion.spots.filter((s) => s.bucket === b).length
                  return (
                    <span key={b} className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: BUCKET_META[b].accent }}
                      />
                      {count} {BUCKET_META[b].label}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {editMode && (
                <button
                  type="button"
                  onClick={() => setShowPinMapInEdit((v) => !v)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-content-secondary hover:text-content"
                >
                  {showPinMapInEdit || hasPinnedSpots ? 'hide pin map' : '+ pin map'}
                </button>
              )}
              <button
                type="button"
                onClick={() => selectRegion(null)}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-content-secondary hover:text-content transition-colors"
              >
                ← back to map
              </button>
            </div>
          </div>

          {/* Optional hybrid Leaflet pin map */}
          {(hasPinnedSpots || Boolean(pickingSpotId) || (editMode && showPinMapInEdit)) && (
            <RegionPinMap
              centerLat={selectedRegion.centerLat ?? 23.6978}
              centerLng={selectedRegion.centerLng ?? 120.9605}
              spots={selectedRegion.spots}
              activeSpotId={activeSpotId}
              onSelectSpot={setActiveSpotId}
              pickingCoords={Boolean(pickingSpotId)}
              onPickCoords={handlePickCoords}
            />
          )}

          {/* 3-bucket drag-and-drop breakdown */}
          {editMode && (
            <p className="text-xs text-content-muted">
              drag and drop spots within or between columns to organize them.
            </p>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {SPOT_BUCKETS.map((bucket) => {
              const meta = BUCKET_META[bucket]
              const bucketSpots = selectedRegion.spots.filter((s) => s.bucket === bucket)
              const isDropTarget = dropBucket === bucket

              return (
                <section
                  key={bucket}
                  onDragOver={(e) => {
                    if (!editMode || !draggedSpot) return
                    e.preventDefault()
                    setDropBucket(bucket)
                  }}
                  onDragLeave={() => {
                    if (dropBucket === bucket) setDropBucket(null)
                  }}
                  onDrop={(e) => {
                    if (!editMode || !draggedSpot) return
                    e.preventDefault()
                    void handleDropSpotOnBucket(bucket)
                  }}
                  className={`flex min-w-0 flex-col rounded-2xl border p-4 transition-colors ${
                    isDropTarget
                      ? 'border-content bg-surface-secondary/90'
                      : 'border-border bg-surface-secondary/35'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: meta.accent }}
                        />
                        <h3 className="text-sm font-medium text-content">{meta.label}</h3>
                        <span className="text-xs text-content-muted">{bucketSpots.length}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-content-muted">{meta.hint}</p>
                    </div>

                    {editMode && (
                      <button
                        type="button"
                        onClick={() => setAddingBucket(addingBucket === bucket ? null : bucket)}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-content-secondary hover:text-content"
                      >
                        + add
                      </button>
                    )}
                  </div>

                  {editMode && addingBucket === bucket && (
                    <form
                      onSubmit={(e) => handleCreateSpot(e, bucket)}
                      className="mb-3 space-y-2 rounded-xl border border-border bg-surface p-3 text-xs"
                    >
                      <input
                        type="text"
                        value={newSpotName}
                        onChange={(e) => setNewSpotName(e.target.value)}
                        placeholder="spot name"
                        className="w-full rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-base sm:text-sm text-content outline-none focus:border-content-muted"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newSpotCategory}
                          onChange={(e) => setNewSpotCategory(e.target.value)}
                          placeholder="category (food, cafe…)"
                          className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-content outline-none focus:border-content-muted"
                        />
                        <input
                          type="url"
                          value={newSpotUrl}
                          onChange={(e) => setNewSpotUrl(e.target.value)}
                          placeholder="link (optional)"
                          className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-content outline-none focus:border-content-muted"
                        />
                      </div>
                      <textarea
                        value={newSpotNote}
                        onChange={(e) => setNewSpotNote(e.target.value)}
                        placeholder="notes…"
                        rows={2}
                        className="w-full rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-content outline-none focus:border-content-muted"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingBucket(null)}
                          className="px-2 py-1 text-content-muted hover:text-content"
                        >
                          cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-content px-3 py-1 font-medium text-surface"
                        >
                          add spot
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="flex-1 space-y-2.5">
                    {bucketSpots.length === 0 ? (
                      <p className="py-6 text-center text-xs text-content-muted">
                        {editMode ? 'drop a spot here or click + add' : 'nothing here yet'}
                      </p>
                    ) : (
                      bucketSpots.map((spot) => (
                        <div
                          key={spot.id}
                          onDragOver={(e) => {
                            if (!editMode || !draggedSpot) return
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onDrop={(e) => {
                            if (!editMode || !draggedSpot) return
                            e.preventDefault()
                            e.stopPropagation()
                            void handleDropSpotOnBucket(bucket, spot.id)
                          }}
                        >
                          <SpotCard
                            spot={spot}
                            isActive={activeSpotId === spot.id}
                            editMode={editMode}
                            onSelect={() => setActiveSpotId(spot.id)}
                            onDragStart={() => setDraggedSpot({ id: spot.id, bucket })}
                            onDragEnd={() => {
                              setDraggedSpot(null)
                              setDropBucket(null)
                            }}
                            onUpdate={(patch) => handleUpdateSpot(spot.id, patch)}
                            onDelete={() => handleDeleteSpot(spot.id)}
                            onUploadImage={(file, caption) => handleUploadImage(spot.id, file, caption)}
                            onDeleteImage={(imgId) => handleDeleteImage(spot.id, imgId)}
                            onRequestPickCoords={() => {
                              setShowPinMapInEdit(true)
                              setPickingSpotId(spot.id)
                            }}
                            onPreviewImage={setLightboxImage}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
          <TaiwanRegionMap
            regions={data.regions}
            selectedRegionId={null}
            onSelectRegion={(id) => selectRegion(id)}
            paintingRegionId={editMode ? paintingRegionId : null}
            onToggleMapCounty={handleToggleMapCounty}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-content">
                regions ({data.regions.length})
              </h2>
              {editMode && (
                <span className="text-xs text-content-muted">drag regions to reorder</span>
              )}
            </div>

            <div className="space-y-2.5">
              {data.regions.map((region) => {
                const isPainting = paintingRegionId === region.id
                return (
                  <div
                    key={region.id}
                    draggable={editMode}
                    onDragStart={() => setDraggedRegionId(region.id)}
                    onDragOver={(e) => {
                      if (editMode && draggedRegionId) e.preventDefault()
                    }}
                    onDrop={() => {
                      if (editMode) void handleDropRegion(region.id)
                    }}
                    className={`rounded-2xl border bg-surface-secondary/40 p-4 transition-all ${
                      isPainting
                        ? 'border-content ring-2 ring-content/20'
                        : 'border-border hover:border-content-muted/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => selectRegion(region.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: region.color }}
                          />
                          <span className="text-base font-medium text-content hover:underline">
                            {region.name}
                          </span>
                          <span className="text-xs text-content-muted">
                            {region.spots.length} spots
                          </span>
                        </div>
                        {region.summary && (
                          <p className="mt-1 text-xs text-content-secondary">{region.summary}</p>
                        )}
                      </button>

                      {editMode && (
                        <div className="flex shrink-0 items-center gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setPaintingRegionId(isPainting ? null : region.id)}
                            className={`rounded-lg border px-2 py-1 transition-colors ${
                              isPainting
                                ? 'border-content bg-content text-surface'
                                : 'border-border text-content-secondary hover:text-content'
                            }`}
                          >
                            {isPainting ? 'done painting' : 'paint map'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteRegion(region.id)
                            }}
                            className="rounded-lg border border-border px-2 py-1 text-error hover:bg-surface"
                          >
                            del
                          </button>
                        </div>
                      )}
                    </div>

                    {editMode && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {REGION_PALETTE.map((swatch) => (
                          <button
                            key={swatch}
                            type="button"
                            aria-label={`set color ${swatch}`}
                            onClick={() => {
                              void handleUpdateRegionColor(region.id, swatch)
                            }}
                            className={`h-4 w-4 rounded-full transition-transform ${
                              region.color === swatch ? 'scale-125 ring-2 ring-content' : 'opacity-75 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {editMode && (
              <form
                onSubmit={handleCreateRegion}
                className="rounded-2xl border border-dashed border-border bg-surface-secondary/25 p-4 space-y-3"
              >
                <p className="text-xs font-medium text-content">+ add region</p>
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder="region name (e.g. jiufen & keelung)"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-sm text-content outline-none focus:border-content-muted"
                  required
                />
                <input
                  type="text"
                  value={newRegionSummary}
                  onChange={(e) => setNewRegionSummary(e.target.value)}
                  placeholder="short summary"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-content outline-none focus:border-content-muted"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {REGION_PALETTE.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        aria-label={`pick color ${swatch}`}
                        onClick={() => setNewRegionColor(swatch)}
                        className={`h-4 w-4 rounded-full ${
                          newRegionColor === swatch ? 'scale-125 ring-2 ring-content' : 'opacity-75'
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-content px-3.5 py-1.5 text-xs font-medium text-surface"
                  >
                    create region
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Photo lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-content/75 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="max-h-[90vh] max-w-3xl space-y-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption ?? 'spot photo'}
              className="max-h-[82vh] w-auto rounded-xl object-contain shadow-xl"
            />
            {lightboxImage.caption && (
              <p className="text-center text-xs text-surface">{lightboxImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
