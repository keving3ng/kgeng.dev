import { useState } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '../config/paths'
import { useTripAdmin } from '../hooks/useTripAdmin'

const ASCII_CAT = [
  '  /\\_/\\  (',
  ' ( o.o ) _)',
  '   >^<  (',
  ' ( | | )',
  '(__d b__)',
].join('\n')

export default function CmsLogin() {
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
      } else {
        setError('invalid passcode')
      }
    } catch {
      setError('failed to verify passcode')
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface text-content flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center space-y-2">
            <pre className="inline-block text-left text-xs leading-tight text-content-muted font-mono select-none">
              {ASCII_CAT}
            </pre>
            <h1 className="text-sm font-medium text-content">cms</h1>
          </div>

          <div className="space-y-2.5">
            <Link
              to={paths.cmsPosts}
              className="block rounded-xl border border-border bg-surface-secondary/40 p-4 hover:border-content-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-content">blog management</span>
                <span className="text-xs text-content-muted">→</span>
              </div>
              <p className="mt-1 text-xs text-content-secondary">
                pull articles from notion into d1, toggle drafts, and edit metadata.
              </p>
            </Link>

            <Link
              to={paths.trips}
              className="block rounded-xl border border-border bg-surface-secondary/40 p-4 hover:border-content-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-content">trips</span>
                <span className="text-xs text-content-muted">→</span>
              </div>
              <p className="mt-1 text-xs text-content-secondary">
                manage trip regions, visited/saved spots, and photos.
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs text-content-muted pt-1">
            <Link to={paths.home} className="hover:text-content transition-colors">
              ← home
            </Link>
            <button
              type="button"
              onClick={lock}
              className="hover:text-content transition-colors"
            >
              lock
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-content flex items-center justify-center px-4 pb-24">
      <div className="w-full max-w-xs space-y-4 text-center">
        <pre className="inline-block text-left text-xs leading-tight text-content-muted font-mono select-none">
          {ASCII_CAT}
        </pre>
        <h1 className="text-sm font-medium text-content">you&apos;re not supposed to be here!</h1>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="passcode"
            autoFocus
            disabled={submitting}
            className="w-full rounded-lg border border-border bg-surface-secondary/50 px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-content focus:outline-none disabled:opacity-50"
          />
          {error && <p className="text-xs text-error text-center">{error}</p>}
        </form>
      </div>
    </div>
  )
}
