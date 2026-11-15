import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useTripAdmin } from '../hooks/useTripAdmin'
import { createTrip, getTrips } from '../services/trips'
import { paths, tripPath } from '../config/paths'
import type { TripSummary } from '../types/trip'

export default function Trips() {
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [creating, setCreating] = useState(false)

  const { token, isAuthenticated, editMode, setEditMode, lock } = useTripAdmin()

  const loadTrips = useCallback(() => {
    setLoading(true)
    getTrips()
      .then((data) => {
        setTrips(data)
        setError(null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'failed to load trips'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newTitle.trim()) return
    setCreating(true)
    try {
      await createTrip(token, {
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || undefined,
      })
      setNewTitle('')
      setNewSubtitle('')
      loadTrips()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to create trip')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link
            to={paths.home}
            className="inline-block text-xs text-content-muted hover:text-content transition-colors mb-2"
          >
            ← home
          </Link>
          <h1 className="text-2xl font-medium text-content">trips</h1>
          <p className="mt-1 text-sm text-content-secondary">
            interactive regional maps, favorite spots, places visited, and saved bookmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  editMode
                    ? 'border-content bg-content text-surface font-medium'
                    : 'border-border bg-surface-secondary text-content-secondary hover:text-content'
                }`}
              >
                {editMode ? 'editing' : 'viewing'}
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

      {editMode && (
        <form
          onSubmit={handleCreateTrip}
          className="mb-8 rounded-2xl border border-border bg-surface-secondary/50 p-4 space-y-3"
        >
          <p className="text-xs font-medium text-content">add a trip</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="trip name (e.g. japan, taiwan)"
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-content outline-none focus:border-content-muted"
              required
            />
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="short subtitle"
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-content outline-none focus:border-content-muted"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-content px-4 py-1.5 text-xs font-medium text-surface hover:opacity-90 disabled:opacity-50"
          >
            {creating ? 'creating…' : '+ create trip'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-content-muted">loading trips…</p>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-surface-secondary/40 p-6 space-y-3">
          <p className="text-sm text-error">{error}</p>
          <p className="text-xs text-content-muted">
            make sure cloudflare d1 migrations have been applied (`npm run d1:migrate:local` for dev).
          </p>
        </div>
      ) : trips.length === 0 ? (
        <p className="text-sm text-content-muted">no trips yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={tripPath(trip.slug)}
              className="group rounded-2xl border border-border bg-surface-secondary/40 p-5 transition-all hover:border-content-muted/60 hover:bg-surface-secondary/80"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium text-content group-hover:underline">
                  {trip.title}
                </h2>
                <span className="text-xs text-content-muted">
                  {trip.regionCount} regions · {trip.spotCount} spots
                </span>
              </div>
              {trip.subtitle && (
                <p className="mt-2 text-sm text-content-secondary">{trip.subtitle}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
