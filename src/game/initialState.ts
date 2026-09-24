import { makeSeed } from './rng'
import { DEFAULT_POLICY, maxHp } from './rules'
import { SAVE_VERSION, type Character, type GameState } from './types'

/** The first four who made it to the light. */
const FOUNDERS: readonly Omit<Character, 'id' | 'hp' | 'injured'>[] = [
  { name: 'Mara', vitality: 7, strength: 5 },
  { name: 'Bram', vitality: 8, strength: 4 },
  { name: 'Ysolde', vitality: 4, strength: 7 },
  { name: 'Oswin', vitality: 5, strength: 5 },
]

/**
 * The town on the first night: four people, a little oil, nothing else.
 * Enough oil for one proper expedition straight away, so the first thing the
 * player does is the thing the game is about.
 */
export function createInitialState(now: number = Date.now()): GameState {
  return {
    version: SAVE_VERSION,
    seed: makeSeed(now),
    lastTick: now,
    oil: 6,
    supplies: 10,
    roster: FOUNDERS.map((founder, index) => ({
      ...founder,
      id: index + 1,
      hp: maxHp(founder),
      injured: false,
    })),
    gate: [],
    refugeeClock: 0,
    refugeesArrived: 0,
    nextCharacterId: FOUNDERS.length + 1,
    fallen: [],
    policy: { ...DEFAULT_POLICY },
    expedition: null,
    nextExpeditionId: 1,
    reports: [],
  }
}
