import type { ComponentType } from 'react'
import WelcomeGame from './WelcomeGame'
import CrosswordSpeedrun from './crossword/CrosswordSpeedrun'

/**
 * Add new games here: create a component under `src/games/`, import it, and append
 * an entry (slug must stay url-safe and unique).
 */
export interface GameDefinition {
  slug: string
  title: string
  /** Short line on the hub card. */
  blurb: string
  /** Shown on the card — keep it one character for the tile look. */
  glyph: string
  Component: ComponentType
}

export const GAME_LIST: GameDefinition[] = [
  {
    slug: 'hello',
    title: 'hello',
    blurb: 'starter room — replace with anything',
    glyph: '👋',
    Component: WelcomeGame,
  },
  {
    slug: 'crossword',
    title: 'crossword speedrun',
    blurb: '4×4 word square · hints · local bests',
    glyph: '▦',
    Component: CrosswordSpeedrun,
  },
]

export function getGameBySlug(slug: string | undefined): GameDefinition | undefined {
  if (!slug) return undefined
  return GAME_LIST.find((g) => g.slug === slug)
}
