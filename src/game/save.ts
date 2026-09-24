import { DEFAULT_POLICY } from './rules'
import { SAVE_VERSION, type GameState } from './types'

const SAVE_KEY = `guttered:save:v${SAVE_VERSION}`

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Turns an unknown saved blob into a usable `GameState`, or `null` when it
 * cannot be salvaged.
 *
 * This is the seam for save compatibility: an additive change to `GameState`
 * should be handled here by filling in a default for the new field, so old
 * saves survive. Reserve a `SAVE_VERSION` bump for reshapes that genuinely
 * cannot be repaired — bumping discards every existing save.
 */
export function migrate(raw: unknown): GameState | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null
  }
  const state = raw as Record<string, unknown>
  if (state.version !== SAVE_VERSION) return null

  const numbers = [
    'seed',
    'lastTick',
    'oil',
    'supplies',
    'refugeeClock',
    'refugeesArrived',
    'nextCharacterId',
    'nextExpeditionId',
  ]
  if (!numbers.every((key) => isNumber(state[key]))) return null

  const arrays = ['roster', 'gate', 'fallen', 'reports']
  if (!arrays.every((key) => Array.isArray(state[key]))) return null

  const roster = state.roster as unknown[]
  const rosterOk = roster.every((entry) => {
    const character = entry as Record<string, unknown> | null
    return (
      typeof character === 'object' &&
      character !== null &&
      isNumber(character.id) &&
      typeof character.name === 'string' &&
      isNumber(character.vitality) &&
      isNumber(character.strength) &&
      isNumber(character.hp)
    )
  })
  if (!rosterOk) return null

  const expedition = state.expedition
  if (
    expedition !== null &&
    (typeof expedition !== 'object' ||
      !Array.isArray((expedition as Record<string, unknown>).memberIds))
  ) {
    return null
  }

  return {
    ...(state as unknown as GameState),
    policy: { ...DEFAULT_POLICY, ...(state.policy as object | undefined) },
  }
}

export function loadState(create: () => GameState): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return create()
    return migrate(JSON.parse(raw)) ?? create()
  } catch {
    return create()
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

/**
 * The save as text the player can keep. Deliberately the same JSON
 * `saveState` writes: an export is a copy of the save, not a second format.
 */
export function serializeSave(state: GameState): string {
  return JSON.stringify(state, null, 2)
}

/** Reads back what `serializeSave` wrote, through the same `migrate`. */
export function parseSave(text: string): GameState | null {
  try {
    return migrate(JSON.parse(text))
  } catch {
    return null
  }
}
