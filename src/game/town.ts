import { NAMES } from './content'
import { createRng } from './rng'
import {
  GATE_CAP,
  HEAL_PER_SECOND,
  OIL_CAP,
  OIL_SECONDS_PER_FLASK,
  REFUGEE_SECONDS,
  STAT_MAX,
  STAT_MIN,
  maxHp,
} from './rules'
import type { GameState, Refugee } from './types'

/**
 * The town over `dtSeconds`: the wounded mend, the press fills flasks, and
 * refugees find their way to the gate.
 *
 * Every rule here is a straight accumulation with a cap, so one call over an
 * hour lands where 3,600 one-second calls would. That is what lets `advanceTo`
 * settle a long absence in a single call once no expedition is out.
 */
export function townStep(draft: GameState, dtSeconds: number): void {
  const away = draft.expedition?.memberIds ?? []
  for (const character of draft.roster) {
    if (away.includes(character.id)) continue
    const max = maxHp(character)
    character.hp = Math.min(max, character.hp + HEAL_PER_SECOND * dtSeconds)
    if (character.hp >= max) character.injured = false
  }

  // The press stops at the cap, but oil brought home can sit above it.
  if (draft.oil < OIL_CAP) {
    draft.oil = Math.min(OIL_CAP, draft.oil + dtSeconds / OIL_SECONDS_PER_FLASK)
  }

  // Nobody walks up to a gate that already has a crowd at it: the clock only
  // runs while there is room, and stops at zero once the gate fills.
  if (draft.gate.length < GATE_CAP) {
    draft.refugeeClock += dtSeconds
    while (
      draft.refugeeClock >= REFUGEE_SECONDS &&
      draft.gate.length < GATE_CAP
    ) {
      draft.refugeeClock -= REFUGEE_SECONDS
      draft.gate.push(makeRefugee(draft))
    }
    if (draft.gate.length >= GATE_CAP) draft.refugeeClock = 0
  }
}

/**
 * A new face, rolled from the save's seed and how many have come before, so
 * the same absence brings the same people.
 */
export function makeRefugee(draft: GameState): Refugee {
  const rng = createRng(draft.seed, draft.refugeesArrived, 'refugee')
  draft.refugeesArrived += 1
  const id = draft.nextCharacterId
  draft.nextCharacterId += 1

  return {
    id,
    name: NAMES[Math.floor(rng() * NAMES.length)],
    vitality: rollStat(rng),
    strength: rollStat(rng),
  }
}

export function rollStat(rng: () => number): number {
  return STAT_MIN + Math.floor(rng() * (STAT_MAX - STAT_MIN + 1))
}
