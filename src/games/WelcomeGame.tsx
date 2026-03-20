import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { paths } from '../config/paths'

export default function WelcomeGame() {
  const [joy, setJoy] = useState(0)

  return (
    <div>
      <PageHeader
        title="hello"
        subtitle="starter room — swap this file out when your real game lands"
        backTo={paths.games}
        backLabel="← games"
      />
      <div className="max-w-md space-y-6">
        <p className="text-content-secondary text-sm leading-relaxed">
          for now it&apos;s just a button. tap it. we&apos;re not judging.
        </p>
        <button
          type="button"
          onClick={() => setJoy((j) => j + 1)}
          className="rounded-2xl border border-border bg-surface-secondary px-6 py-4 text-left text-sm text-content transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-content-muted">joy counter · </span>
          <span className="font-medium tabular-nums">{joy}</span>
        </button>
      </div>
    </div>
  )
}
