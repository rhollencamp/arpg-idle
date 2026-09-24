import {
  LIGHT_PER_FLASK,
  MAX_FLASKS,
  MAX_TEAM,
  ROSTER_CAP,
  TAKE_IN_COST,
  TRAVEL_SECONDS,
  WALL_REINFORCE_POINTS,
  WALL_REPAIR_PER_SUPPLY,
  canBeSent,
  maxHp,
  reinforceCost,
} from './rules'
import type { Brightness, GameState, Policy } from './types'

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
  if (state.expedition || state.lost) return false
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
  return (
    !state.lost &&
    state.supplies >= TAKE_IN_COST &&
    state.roster.length < ROSTER_CAP
  )
}

/** Opens the gate to a refugee. They arrive at full health. */
export function takeIn(state: GameState, refugeeId: number): GameState {
  const refugee = state.gate.find((entry) => entry.id === refugeeId)
  if (!refugee || !canTakeIn(state)) return state

  return {
    ...state,
    supplies: state.supplies - TAKE_IN_COST,
    takenIn: state.takenIn + 1,
    gate: state.gate.filter((entry) => entry.id !== refugeeId),
    roster: [
      ...state.roster,
      { ...refugee, hp: maxHp(refugee), injured: false },
    ],
  }
}

export function turnAway(state: GameState, refugeeId: number): GameState {
  if (state.lost || !state.gate.some((entry) => entry.id === refugeeId)) {
    return state
  }
  return {
    ...state,
    gate: state.gate.filter((entry) => entry.id !== refugeeId),
  }
}

/** Remembers the plan between expeditions without sending anyone. */
export function setPolicy(state: GameState, policy: Policy): GameState {
  return { ...state, policy }
}

/** Turns the lamp up or down. Takes effect at once, even while it is out. */
export function setBrightness(
  state: GameState,
  brightness: Brightness,
): GameState {
  if (state.lost || state.brightness === brightness) return state
  return { ...state, brightness }
}

/** Supplies a full repair of the walls would cost right now. */
export function repairCost(state: GameState): number {
  return Math.ceil(
    (state.walls.max - state.walls.integrity) / WALL_REPAIR_PER_SUPPLY,
  )
}

/**
 * Patches the walls with whatever supplies there are, up to fully repaired.
 * A partial repair is still a repair: a player with 5 supplies gets 15 points.
 */
export function repairWalls(state: GameState): GameState {
  const spend = Math.min(state.supplies, repairCost(state))
  if (state.lost || spend <= 0) return state
  return {
    ...state,
    supplies: state.supplies - spend,
    walls: {
      ...state.walls,
      integrity: Math.min(
        state.walls.max,
        state.walls.integrity + spend * WALL_REPAIR_PER_SUPPLY,
      ),
    },
  }
}

export function canReinforce(state: GameState): boolean {
  return !state.lost && state.supplies >= reinforceCost(state.walls.level)
}

/** Raises the walls: a higher maximum, and the new stretch comes built. */
export function reinforceWalls(state: GameState): GameState {
  if (!canReinforce(state)) return state
  return {
    ...state,
    supplies: state.supplies - reinforceCost(state.walls.level),
    walls: {
      integrity: state.walls.integrity + WALL_REINFORCE_POINTS,
      max: state.walls.max + WALL_REINFORCE_POINTS,
      level: state.walls.level + 1,
    },
  }
}
