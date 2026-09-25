import { NAMES } from './content'
import { createRng } from './rng'
import {
  GATE_CAP,
  HEAL_PER_SECOND,
  LIGHT_BURN_PER_SECOND,
  LIGHT_DEFENSE,
  MAX_TOWN_LOG,
  OIL_CAP,
  OIL_SECONDS_PER_FLASK,
  PRESSURE_MAX,
  PRESSURE_MULTIPLIER,
  PRESSURE_PER_SECOND,
  REFUGEE_SECONDS,
  RELIGHT_AT,
  STAT_MAX,
  STAT_MIN,
  WALL_DEFENSE_PER_POINT,
  WAVE_CHIP,
  WAVE_SPOILS,
  WAVE_WARNING_SECONDS,
  maxHp,
  waveStrength,
  type LightLevel,
} from './rules'
import type { GameState, Refugee, TownEvent } from './types'

/** Below this, two times are the same instant. Absorbs float dust. */
const EPSILON = 1e-9

/** Guard against a bug turning a catch-up into an endless loop. */
const MAX_SEGMENTS = 100_000

/**
 * The town over `dtSeconds`: the lamp burns, the press fills flasks, the
 * wounded mend, refugees reach the gate, and the fog presses on the walls.
 *
 * Between *events* every rate here is constant: the light going out or
 * relighting, the oil store filling, a wave being sighted, a wave breaking, a
 * refugee arriving. So rather than stepping second by second, this runs
 * segment to segment: it works out how long until the next event, advances
 * everything at its current rate for exactly that long, handles the event,
 * and goes again. One call over a week lands where 604,800 one-second calls
 * would, at the cost of one loop per event.
 */
export function townStep(draft: GameState, dtSeconds: number): void {
  let remaining = dtSeconds
  for (let i = 0; i < MAX_SEGMENTS && remaining > EPSILON; i += 1) {
    if (draft.lost) return
    settleLight(draft)

    const oilPerSecond = oilRate(draft)
    const toOil = secondsToOilEvent(draft, oilPerSecond)
    const pressurePerSecond = draft.siege.wave ? 0 : pressureRate(draft)
    const toSighting =
      pressurePerSecond > 0
        ? (PRESSURE_MAX - draft.siege.pressure) / pressurePerSecond
        : Infinity
    const toWave = draft.siege.wave ? draft.siege.wave.countdown : Infinity
    const interval = refugeeInterval(draft)
    const toRefugee =
      interval !== null ? (1 - draft.refugeeProgress) * interval : Infinity

    const segment = Math.min(remaining, toOil, toSighting, toWave, toRefugee)

    // Advance everything at its current rate.
    draft.oil += oilPerSecond * segment
    draft.siege.pressure += pressurePerSecond * segment
    if (draft.siege.wave) draft.siege.wave.countdown -= segment
    if (interval !== null) draft.refugeeProgress += segment / interval
    heal(draft, segment)
    draft.elapsed += segment
    remaining -= segment

    // Then handle whatever this segment ran up against. Snapping each value
    // to its boundary keeps float dust from re-triggering or missing events.
    if (toOil - segment <= EPSILON) oilEvent(draft, oilPerSecond)
    if (toSighting - segment <= EPSILON) sightWave(draft)
    if (toWave - segment <= EPSILON) breakWave(draft)
    if (toRefugee - segment <= EPSILON) refugeeArrives(draft)
  }
}

// ── The light ───────────────────────────────────────────────────────────────

export function lightLevel(state: GameState): LightLevel {
  return state.lightOut ? 'out' : state.brightness
}

/** How fast the oil store is moving right now, in flasks per second. */
export function oilRate(state: GameState): number {
  const press = 1 / OIL_SECONDS_PER_FLASK
  if (state.lightOut) return state.oil < OIL_CAP ? press : 0

  const burn = LIGHT_BURN_PER_SECOND[state.brightness]
  // Oil brought home can sit above the cap; the press waits until the lamp
  // has burned it back down.
  if (state.oil > OIL_CAP) return -burn
  // At the cap the press only tops up what the lamp takes.
  if (state.oil === OIL_CAP) return Math.min(0, press - burn)
  return press - burn
}

function secondsToOilEvent(state: GameState, rate: number): number {
  if (rate > 0) {
    const target = state.lightOut ? RELIGHT_AT : OIL_CAP
    return (target - state.oil) / rate
  }
  if (rate < 0) {
    const floor = state.oil > OIL_CAP ? OIL_CAP : 0
    return (state.oil - floor) / -rate
  }
  return Infinity
}

function oilEvent(draft: GameState, rate: number): void {
  // Snap to whichever boundary the segment ran into.
  if (draft.lightOut && rate > 0) {
    draft.oil = RELIGHT_AT
  } else if (Math.abs(draft.oil - OIL_CAP) < Math.abs(draft.oil)) {
    draft.oil = OIL_CAP
  } else {
    draft.oil = 0
  }
  settleLight(draft)
}

/**
 * Puts the lamp in the state its oil calls for. Also runs at the start of
 * every segment, because oil can change between steps too: a team leaving
 * with the last flasks, or coming home with a few.
 */
function settleLight(draft: GameState): void {
  if (!draft.lightOut && draft.oil <= EPSILON) {
    draft.oil = 0
    draft.lightOut = true
    log(draft, { t: draft.elapsed, kind: 'lightOut' })
  } else if (draft.lightOut && draft.oil >= RELIGHT_AT - EPSILON) {
    draft.lightOut = false
    log(draft, { t: draft.elapsed, kind: 'relit' })
  }
}

// ── People ──────────────────────────────────────────────────────────────────

function heal(draft: GameState, seconds: number): void {
  const away = draft.expedition?.memberIds ?? []
  for (const character of draft.roster) {
    if (away.includes(character.id)) continue
    const max = maxHp(character)
    character.hp = Math.min(max, character.hp + HEAL_PER_SECOND * seconds)
    if (character.hp >= max) character.injured = false
  }
}

/**
 * Seconds between arrivals at the current light, or `null` while nobody is
 * coming — because the light is out, or because the gate is already crowded.
 */
export function refugeeInterval(state: GameState): number | null {
  if (state.gate.length >= GATE_CAP) return null
  return REFUGEE_SECONDS[lightLevel(state)]
}

function refugeeArrives(draft: GameState): void {
  draft.refugeeProgress = 0
  const refugee = makeRefugee(draft)
  draft.gate.push(refugee)
  log(draft, { t: draft.elapsed, kind: 'arrived', name: refugee.name })
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

// ── The siege ───────────────────────────────────────────────────────────────

export function pressureRate(state: GameState): number {
  return PRESSURE_PER_SECOND * PRESSURE_MULTIPLIER[lightLevel(state)]
}

function sightWave(draft: GameState): void {
  const strength = waveStrength(draft.elapsed)
  draft.siege.pressure = 0
  const countdown = WAVE_WARNING_SECONDS[lightLevel(draft)]
  draft.siege.wave = { strength, countdown }
  log(draft, { t: draft.elapsed, kind: 'waveSighted', strength })
  // With the light out nobody sees it coming: it is on the walls at once.
  if (countdown <= 0) breakWave(draft)
}

export interface Defense {
  walls: number
  people: number
  /** The light's multiplier on the sum of the two. */
  light: number
  total: number
}

/**
 * What the town can put against a wave: its walls, plus everyone at home
 * weighted by how healthy they are, all scaled by how well the defenders can
 * see. `alsoAway` counts extra people as gone, for "what if I send them?".
 */
export function defenseOf(
  state: GameState,
  alsoAway: readonly number[] = [],
): Defense {
  const away = new Set([...(state.expedition?.memberIds ?? []), ...alsoAway])
  let people = 0
  for (const character of state.roster) {
    if (away.has(character.id)) continue
    const health = Math.max(0, character.hp) / maxHp(character)
    people += (character.vitality + character.strength) * health
  }
  const walls = state.walls.integrity * WALL_DEFENSE_PER_POINT
  const light = LIGHT_DEFENSE[lightLevel(state)]
  return { walls, people, light, total: (walls + people) * light }
}

/**
 * The wave arrives. Thrown back, it still chips the walls and leaves
 * something to scavenge. Breaking through, it tears down walls and carries
 * off supplies — and if the walls cannot take it, the town falls.
 */
function breakWave(draft: GameState): void {
  const wave = draft.siege.wave
  if (!wave) return
  draft.siege.wave = null
  draft.siege.waves += 1

  const { strength } = wave
  const defense = defenseOf(draft).total
  const chip = strength * WAVE_CHIP

  if (defense >= strength) {
    const spoils = Math.round(strength * WAVE_SPOILS)
    draft.walls.integrity = Math.max(0, draft.walls.integrity - chip)
    draft.supplies += spoils
    draft.siege.repelled += 1
    log(draft, {
      t: draft.elapsed,
      kind: 'repelled',
      strength,
      defense,
      spoils,
    })
    return
  }

  const wallDamage = strength - defense + chip
  if (draft.walls.integrity - wallDamage <= 0) {
    draft.walls.integrity = 0
    log(draft, { t: draft.elapsed, kind: 'fell', strength, defense })
    draft.lost = {
      elapsed: draft.elapsed,
      waves: draft.siege.waves,
      repelled: draft.siege.repelled,
      takenIn: draft.takenIn,
      expeditions: draft.nextExpeditionId - 1,
    }
    return
  }

  const suppliesLost = Math.min(draft.supplies, Math.round(strength - defense))
  draft.walls.integrity -= wallDamage
  draft.supplies -= suppliesLost
  log(draft, {
    t: draft.elapsed,
    kind: 'breached',
    strength,
    defense,
    wallDamage,
    suppliesLost,
  })
}

function log(draft: GameState, event: TownEvent): void {
  draft.townLog.push(event)
  if (draft.townLog.length > MAX_TOWN_LOG) draft.townLog.shift()
}
