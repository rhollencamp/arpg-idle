import { expeditionStep } from './expedition'
import { townStep } from './town'
import type { Expedition, GameState } from './types'

/**
 * The sim's base resolution: one second, which is also one tick of combat.
 */
export const STEP_MS = 1000

/**
 * A private copy the step loop may mutate freely. Everything a step can touch
 * is copied once up front; logs are append-only arrays of immutable events,
 * so a shallow copy of the array is enough.
 */
function draftFrom(state: GameState): GameState {
  return {
    ...state,
    roster: state.roster.map((character) => ({ ...character })),
    gate: [...state.gate],
    fallen: [...state.fallen],
    reports: [...state.reports],
    expedition: state.expedition && cloneExpedition(state.expedition),
  }
}

function cloneExpedition(exp: Expedition): Expedition {
  return {
    ...exp,
    memberIds: [...exp.memberIds],
    cooldowns: { ...exp.cooldowns },
    unresolved: [...exp.unresolved],
    loot: { ...exp.loot },
    phase:
      exp.phase.kind === 'fight'
        ? {
            kind: 'fight',
            enemies: exp.phase.enemies.map((enemy) => ({ ...enemy })),
          }
        : { ...exp.phase },
    log: [...exp.log],
  }
}

/**
 * Advances `state` to `now` in whole one-second steps.
 *
 * While an expedition is out, every second is simulated, because combat is
 * tick by tick. Once nobody is out, the town is all that is left and its rules
 * are plain accumulations (`town.ts`), so whatever time remains is settled in
 * one call. An absence of a week costs an expedition's worth of steps plus
 * one, not 600,000.
 *
 * Only whole steps are consumed and `lastTick` moves by exactly that much, so
 * the result depends on elapsed time alone, not on how it was split into calls.
 */
export function advanceTo(state: GameState, now: number): GameState {
  const steps = Math.floor((now - state.lastTick) / STEP_MS)
  if (steps < 1) return state

  const draft = draftFrom(state)
  let done = 0
  while (done < steps && draft.expedition) {
    expeditionStep(draft)
    townStep(draft, 1)
    done += 1
  }
  if (done < steps) townStep(draft, steps - done)

  draft.lastTick = state.lastTick + steps * STEP_MS
  return draft
}
