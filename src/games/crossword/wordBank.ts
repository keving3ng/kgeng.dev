import type { WordBankEntry } from './types'

/**
 * Curated 4-letter words + hints. Puzzles reference entries by `id`.
 * User-facing copy stays lowercase in the UI.
 */
export const WORD_BANK: WordBankEntry[] = [
  { id: 'fall', word: 'FALL', hint: 'autumn or drop' },
  { id: 'area', word: 'AREA', hint: 'region or square footage' },
  { id: 'lear', word: 'LEAR', hint: 'king in a storm' },
  { id: 'lare', word: 'LARE', hint: 'obsolete: lore' },
  { id: 'rear', word: 'REAR', hint: 'back part' },
  { id: 'ears', word: 'EARS', hint: 'listeners on the sides' },
  { id: 'arse', word: 'ARSE', hint: 'british rear' },
  { id: 'sale', word: 'SALE', hint: 'discount event' },
  { id: 'alea', word: 'ALEA', hint: 'latin: dice (alea iacta)' },
  { id: 'lean', word: 'LEAN', hint: 'tilt or spare' },
  { id: 'face', word: 'FACE', hint: 'clock position or visage' },
  { id: 'acer', word: 'ACER', hint: 'maple genus' },
  { id: 'cere', word: 'CERE', hint: 'waxy bird bill' },
  { id: 'eres', word: 'ERES', hint: 'spanish: you are' },
  { id: 'tare', word: 'TARE', hint: 'empty weight' },
  { id: 'word', word: 'WORD', hint: 'unit of language' },
  { id: 'grid', word: 'GRID', hint: 'matrix of lines' },
  { id: 'time', word: 'TIME', hint: 'what the timer measures' },
  { id: 'rush', word: 'RUSH', hint: 'speedrun energy' },
  { id: 'fast', word: 'FAST', hint: 'quick or abstain' },
  { id: 'slow', word: 'SLOW', hint: 'opposite of rush' },
  { id: 'hint', word: 'HINT', hint: 'nudge toward an answer' },
  { id: 'clue', word: 'CLUE', hint: 'detective bread crumb' },
  { id: 'play', word: 'PLAY', hint: 'press start' },
  { id: 'type', word: 'TYPE', hint: 'keyboard input' },
  { id: 'keys', word: 'KEYS', hint: 'piano or keyboard' },
  { id: 'best', word: 'BEST', hint: 'personal record' },
  { id: 'pace', word: 'PACE', hint: 'tempo' },
  { id: 'goal', word: 'GOAL', hint: 'finish line' },
  { id: 'luck', word: 'LUCK', hint: 'rng blessing' },
  { id: 'mind', word: 'MIND', hint: 'focus' },
  { id: 'calm', word: 'CALM', hint: 'steady hands' },
  { id: 'edit', word: 'EDIT', hint: 'fix a typo' },
  { id: 'undo', word: 'UNDO', hint: 'wishful thinking here' },
  { id: 'skip', word: 'SKIP', hint: 'not allowed in a run' },
  { id: 'next', word: 'NEXT', hint: 'after this clue' },
  { id: 'last', word: 'LAST', hint: 'final letter moment' },
  { id: 'fill', word: 'FILL', hint: 'white square goal' },
  { id: 'void', word: 'VOID', hint: 'empty cell' },
  { id: 'snap', word: 'SNAP', hint: 'quick motion' },
  { id: 'tick', word: 'TICK', hint: 'tiny time slice' },
]

const byId = new Map(WORD_BANK.map((e) => [e.id, e]))

export function getWordById(id: string): WordBankEntry | undefined {
  return byId.get(id)
}
