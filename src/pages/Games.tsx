import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { GAME_LIST } from '../games/registry'
import { gamePath } from '../config/paths'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function Games() {
  const navigate = useNavigate()
  const [deck, setDeck] = useState(() => [...GAME_LIST])

  const reshuffle = useCallback(() => {
    setDeck(shuffle([...GAME_LIST]))
  }, [])

  const surprise = useCallback(() => {
    if (GAME_LIST.length === 0) return
    const pick = GAME_LIST[Math.floor(Math.random() * GAME_LIST.length)]
    navigate(gamePath(pick.slug))
  }, [navigate])

  return (
    <div>
      <PageHeader
        title="games"
        subtitle="pick a door. order is meaningless. or is it?"
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reshuffle}
          className="rounded-full border border-border bg-surface-secondary px-4 py-2 text-sm text-content-secondary transition-colors hover:text-content hover:border-content-muted/40"
        >
          shuffle the deck
        </button>
        <button
          type="button"
          onClick={surprise}
          className="rounded-full border border-dashed border-border px-4 py-2 text-sm text-content-muted transition-colors hover:text-content-secondary hover:border-content-muted/50"
        >
          surprise me
        </button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deck.map((game, index) => (
          <li
            key={game.slug}
            className="animate-games-rise"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Link
              to={gamePath(game.slug)}
              className="group block h-full rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-content-muted/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-muted"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span
                  className="text-4xl leading-none transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  aria-hidden
                >
                  {game.glyph}
                </span>
                <span className="text-xs text-content-muted opacity-0 transition-opacity group-hover:opacity-100">
                  play →
                </span>
              </div>
              <h2 className="text-lg font-medium text-content">{game.title}</h2>
              <p className="mt-2 text-sm text-content-muted leading-snug">{game.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>

      {GAME_LIST.length === 0 && (
        <p className="text-sm text-content-muted">nothing here yet — add entries in `src/games/registry.ts`.</p>
      )}
    </div>
  )
}
