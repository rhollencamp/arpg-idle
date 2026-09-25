import { createInitialState } from './initialState'
import { DEFAULT_POLICY } from './rules'
import {
  SAVE_VERSION,
  type Brightness,
  type GameState,
  type Lost,
} from './types'

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

  const fresh = createInitialState(state.lastTick as number)
  // Retired in favour of `refugeeProgress`; read below, not carried over.
  const { refugeeClock, ...current } = state

  return {
    ...(current as unknown as GameState),
    policy: { ...DEFAULT_POLICY, ...(state.policy as object | undefined) },
    // The light and the siege arrived after the first saves were written.
    // Those towns pick them up from a standing start rather than being lost.
    refugeeProgress: isNumber(state.refugeeProgress)
      ? state.refugeeProgress
      : isNumber(refugeeClock)
        ? // The old clock counted seconds toward an eight-minute arrival.
          Math.min(0.999, refugeeClock / (8 * 60))
        : 0,
    elapsed: isNumber(state.elapsed) ? state.elapsed : 0,
    brightness: isBrightness(state.brightness) ? state.brightness : 'steady',
    lightOut: state.lightOut === true,
    siege: isObject(state.siege)
      ? (state.siege as unknown as GameState['siege'])
      : fresh.siege,
    walls: isObject(state.walls)
      ? (state.walls as unknown as GameState['walls'])
      : fresh.walls,
    takenIn: isNumber(state.takenIn) ? state.takenIn : 0,
    townLog: Array.isArray(state.townLog)
      ? (state.townLog as GameState['townLog'])
      : [],
    lost: isObject(state.lost) ? (state.lost as unknown as Lost) : null,
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBrightness(value: unknown): value is Brightness {
  return value === 'low' || value === 'steady' || value === 'bright'
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
