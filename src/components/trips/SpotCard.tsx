import { useState } from 'react'
import type { SpotImage, TripSpot } from '../../types/trip'

interface SpotCardProps {
  spot: TripSpot
  isActive: boolean
  editMode: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onUpdate: (patch: {
    name?: string
    recommended?: boolean
    category?: string | null
    note?: string | null
    url?: string | null
  }) => Promise<void>
  onDelete: () => Promise<void>
  onUploadImage: (file: File, caption?: string) => Promise<void>
  onDeleteImage: (imageId: string) => Promise<void>
  onRequestPickCoords: () => void
  onPreviewImage: (image: SpotImage) => void
}

export default function SpotCard({
  spot,
  isActive,
  editMode,
  onSelect,
  onDragStart,
  onDragEnd,
  onUpdate,
  onDelete,
  onUploadImage,
  onDeleteImage,
  onRequestPickCoords,
  onPreviewImage,
}: SpotCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(spot.name)
  const [recommended, setRecommended] = useState(spot.recommended)
  const [category, setCategory] = useState(spot.category ?? '')
  const [note, setNote] = useState(spot.note ?? '')
  const [url, setUrl] = useState(spot.url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onUpdate({
        name: name.trim(),
        recommended: spot.bucket === 'visited' ? recommended : false,
        category: category.trim() || null,
        note: note.trim() || null,
        url: url.trim() || null,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUploadImage(file)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div
      draggable={editMode && !editing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`rounded-xl border bg-surface p-3.5 transition-all ${
        isActive ? 'border-content shadow-sm' : 'border-border hover:border-content-muted/50'
      } ${editMode && !editing ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="spot name"
            className="w-full rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-sm text-content outline-none focus:border-content-muted"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="category (food, cafe…)"
              className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-content outline-none focus:border-content-muted"
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-content outline-none focus:border-content-muted"
            />
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="notes, dishes to order, tips…"
            rows={2}
            className="w-full rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-content outline-none focus:border-content-muted"
          />
          {spot.bucket === 'visited' && (
            <label className="inline-flex items-center gap-2 text-xs text-content-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recommended}
                onChange={(e) => setRecommended(e.target.checked)}
                className="rounded border-border"
              />
              <span>
                <span aria-hidden="true" style={{ color: '#f59e0b' }}>★</span> recommend this spot
              </span>
            </label>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={onRequestPickCoords}
              className="rounded-lg border border-border px-2.5 py-1 text-content-secondary hover:text-content transition-colors"
            >
              {spot.lat !== null && spot.lng !== null
                ? `pin: ${spot.lat.toFixed(3)}, ${spot.lng.toFixed(3)}`
                : '+ pick map pin'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-2.5 py-1 text-content-muted hover:text-content"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-content px-3 py-1 font-medium text-surface hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'saving…' : 'save'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {editMode && (
                  <span aria-hidden="true" className="text-xs text-content-muted select-none">
                    ::
                  </span>
                )}
                <h4 className="text-sm font-medium text-content break-words">
                  {spot.url ? (
                    <a
                      href={spot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {spot.name} ↗
                    </a>
                  ) : (
                    spot.name
                  )}
                </h4>
                {spot.category && (
                  <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[11px] text-content-secondary">
                    {spot.category}
                  </span>
                )}
                {spot.bucket === 'visited' && spot.recommended && !editMode && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-[11px] font-medium text-content">
                    <span aria-hidden="true" style={{ color: '#f59e0b' }}>
                      ★
                    </span>
                    recommended
                  </span>
                )}
                {editMode && spot.bucket === 'visited' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      void onUpdate({ recommended: !spot.recommended })
                    }}
                    aria-pressed={spot.recommended}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                      spot.recommended
                        ? 'border-content bg-surface-secondary font-medium text-content'
                        : 'border-border text-content-muted hover:text-content'
                    }`}
                  >
                    <span aria-hidden="true" style={{ color: spot.recommended ? '#f59e0b' : undefined }}>
                      {spot.recommended ? '★' : '☆'}
                    </span>
                    {spot.recommended ? 'recommended' : 'recommend'}
                  </button>
                )}
              </div>
              {spot.note && (
                <p className="mt-1 text-xs leading-relaxed text-content-secondary">{spot.note}</p>
              )}
            </div>

            {editMode && (
              <div
                className="flex shrink-0 items-center gap-1.5 text-[11px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setName(spot.name)
                    setRecommended(spot.recommended)
                    setCategory(spot.category ?? '')
                    setNote(spot.note ?? '')
                    setUrl(spot.url ?? '')
                    setEditing(true)
                  }}
                  className="rounded border border-border px-1.5 py-0.5 text-content-muted hover:text-content"
                >
                  edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onDelete()
                  }}
                  className="rounded border border-border px-1.5 py-0.5 text-error hover:bg-surface-secondary"
                >
                  del
                </button>
              </div>
            )}
          </div>

          {spot.images.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
              {spot.images.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-secondary">
                  <button
                    type="button"
                    onClick={() => onPreviewImage(img)}
                    className="h-full w-full block"
                  >
                    <img
                      src={img.url}
                      alt={img.caption ?? spot.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </button>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => {
                        void onDeleteImage(img.id)
                      }}
                      aria-label="delete photo"
                      className="absolute right-1 top-1 rounded-full bg-surface/90 px-1.5 py-0.5 text-[10px] text-error shadow-sm hover:bg-surface"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {editMode && (
            <div className="flex items-center justify-between pt-1 text-[11px]" onClick={(e) => e.stopPropagation()}>
              <label className="cursor-pointer text-content-muted hover:text-content transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? 'uploading photo…' : '+ attach photo'}
              </label>
              <button
                type="button"
                onClick={onRequestPickCoords}
                className="text-content-muted hover:text-content transition-colors"
              >
                {spot.lat !== null && spot.lng !== null ? 'move pin' : '+ map pin'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
