import {
  LIGHT_PER_FLASK,
  MAX_FLASKS,
  MAX_TEAM,
  ROSTER_CAP,
  TAKE_IN_COST,
  TRAVEL_SECONDS,
  canBeSent,
  maxHp,
} from './rules'
import type { GameState, Policy } from './types'

/**
 * The player's moves. Each is a pure function that returns a new state, or
 * the same state untouched when the move is not allowed — the UI disables what
 * it can, and these refuse the rest.
 */

export function awayIds(state: GameState): ReadonlySet<number> {
  return new Set(state.expedition?.memberIds ?? [])
}

export function canDepart(
  state: GameState,
  memberIds: readonly number[],
  policy: Policy,
): boolean {
  if (state.expedition) return false
  if (memberIds.length < 1 || memberIds.length > MAX_TEAM) return false
  if (new Set(memberIds).size !== memberIds.length) return false
  if (policy.flasks < 1 || policy.flasks > MAX_FLASKS) return false
  if (policy.flasks > Math.floor(state.oil)) return false

  const away = awayIds(state)
  return memberIds.every((id) => {
    const character = state.roster.find((entry) => entry.id === id)
    return character !== undefined && canBeSent(character, away)
  })
}

/** Sends a team out into the fog with the plan they leave under. */
export function depart(
  state: GameState,
  memberIds: readonly number[],
  policy: Policy,
): GameState {
  if (!canDepart(state, memberIds, policy)) return state

  const names = memberIds.map(
    (id) => state.roster.find((entry) => entry.id === id)!.name,
  )

  return {
    ...state,
    oil: state.oil - policy.flasks,
    policy,
    nextExpeditionId: state.nextExpeditionId + 1,
    expedition: {
      id: state.nextExpeditionId,
      memberIds: [...memberIds],
      policy: { ...policy },
      t: 0,
      light: policy.flasks * LIGHT_PER_FLASK,
      depth: 0,
      phase: { kind: 'travel', remaining: TRAVEL_SECONDS },
      cooldowns: {},
      unresolved: [],
      loot: { supplies: 0, oil: 0 },
      outcome: null,
      darkLogged: false,
      log: [{ t: 0, kind: 'depart', names, flasks: policy.flasks }],
    },
  }
}

export function canTakeIn(state: GameState): boolean {
  return state.supplies >= TAKE_IN_COST && state.roster.length < ROSTER_CAP
}

/** Opens the gate to a refugee. They arrive at full health. */
export function takeIn(state: GameState, refugeeId: number): GameState {
  const refugee = state.gate.find((entry) => entry.id === refugeeId)
  if (!refugee || !canTakeIn(state)) return state

  return {
    ...state,
    supplies: state.supplies - TAKE_IN_COST,
    gate: state.gate.filter((entry) => entry.id !== refugeeId),
    roster: [
      ...state.roster,
      { ...refugee, hp: maxHp(refugee), injured: false },
    ],
  }
}

export function turnAway(state: GameState, refugeeId: number): GameState {
  if (!state.gate.some((entry) => entry.id === refugeeId)) return state
  return {
    ...state,
    gate: state.gate.filter((entry) => entry.id !== refugeeId),
  }
}

/** Remembers the plan between expeditions without sending anyone. */
export function setPolicy(state: GameState, policy: Policy): GameState {
  return { ...state, policy }
}
