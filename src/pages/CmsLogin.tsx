import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { paths, tripPath } from '../config/paths'
import { useTripAdmin } from '../hooks/useTripAdmin'

export default function CmsLogin() {
  const navigate = useNavigate()
  const { isAuthenticated, unlock, lock } = useTripAdmin()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const ok = await unlock(passcode.trim())
      if (ok) {
        setPasscode('')
        navigate(paths.trips)
      } else {
        setError('invalid passcode')
      }
    } catch {
      setError('failed to verify passcode')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface text-content flex flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-8 pb-4">
        <Link
          to={paths.home}
          className="text-xs text-content-muted hover:text-content transition-colors"
        >
          ← home
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 items-center px-4 pb-20">
        <div className="w-full rounded-2xl border border-border bg-surface-secondary/50 p-6 space-y-4">
          <div>
            <h1 className="text-lg font-medium text-content">cms</h1>
            <p className="mt-1 text-xs text-content-muted">
              {isAuthenticated
                ? 'session unlocked for trip editing.'
                : 'enter your admin passcode to unlock trip editing.'}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  to={paths.trips}
                  className="rounded-lg bg-content px-4 py-2 text-xs font-medium text-surface hover:opacity-90 transition-opacity"
                >
                  open trips
                </Link>
                <Link
                  to={tripPath('taiwan')}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs text-content-secondary hover:text-content transition-colors"
                >
                  open taiwan
                </Link>
              </div>
              <button
                type="button"
                onClick={lock}
                className="text-xs text-content-muted hover:text-error transition-colors"
              >
                lock session
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="admin passcode"
                autoFocus
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-content focus:outline-none"
              />
              {error && <p className="text-xs text-error">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !passcode.trim()}
                className="w-full rounded-lg bg-content px-4 py-2 text-xs font-medium text-surface hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'verifying…' : 'unlock'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
