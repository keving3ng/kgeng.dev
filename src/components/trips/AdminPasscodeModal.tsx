import { useState } from 'react'

interface AdminPasscodeModalProps {
  open: boolean
  onClose: () => void
  onVerify: (passcode: string) => Promise<boolean>
}

export default function AdminPasscodeModal({
  open,
  onClose,
  onVerify,
}: AdminPasscodeModalProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim()) return
    setChecking(true)
    setError(null)
    try {
      const ok = await onVerify(passcode.trim())
      if (ok) {
        setPasscode('')
        onClose()
      } else {
        setError('invalid passcode')
      }
    } catch {
      setError('failed to verify passcode')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-content/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-medium text-content">unlock trip cms</h3>
        <p className="mt-1 text-xs text-content-muted">
          enter your admin passcode to edit regions, spots, and photos.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="passcode"
            autoFocus
            className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-content outline-none focus:border-content-muted"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-content-muted hover:text-content"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={checking}
              className="rounded-lg bg-content px-4 py-1.5 font-medium text-surface hover:opacity-90 disabled:opacity-50"
            >
              {checking ? 'checking…' : 'unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
