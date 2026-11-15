import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { unlock } = useTripAdmin()
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
