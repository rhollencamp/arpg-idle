import type { Character, Policy, Push, Stance } from './types'

/**
 * Every tuning number in one place, so balancing is an edit to this file and
 * nothing else. The rules that *apply* them live in `expedition.ts` and
 * `town.ts`. `npm run sim` runs expeditions headless for checking a change.
 */

// ── Characters ──────────────────────────────────────────────────────────────

/** Max HP is Vitality times this. */
export const HP_PER_VITALITY = 10

/** Seconds between a character's attacks. Everyone swings at the same pace for now. */
export const ATTACK_SECONDS = 2

export function maxHp(character: { vitality: number }): number {
  return character.vitality * HP_PER_VITALITY
}

/**
 * The chance a downed character lives through their wounds. Vitality helps;
 * nobody is ever quite safe.
 */
export function survivalChance(character: { vitality: number }): number {
  return Math.min(0.95, 0.55 + 0.05 * character.vitality)
}

/** Range new characters and refugees roll their two stats in, inclusive. */
export const STAT_MIN = 3
export const STAT_MAX = 8

// ── Policies ────────────────────────────────────────────────────────────────

export const STANCE: Readonly<
  Record<Stance, { dealt: number; taken: number }>
> = {
  // Hits harder, guards less, and goes for whichever enemy is closest to dead.
  aggressive: { dealt: 1.25, taken: 1.2 },
  balanced: { dealt: 1, taken: 1 },
  // Hits softer, and the sturdiest member stands in front to take the blows.
  defensive: { dealt: 0.8, taken: 0.8 },
}

/**
 * Spare light, in seconds, a team wants in hand beyond what the next node and
 * the walk home should cost before it presses on.
 */
export const PUSH_MARGIN: Readonly<Record<Push, number>> = {
  cautious: 60,
  normal: 30,
  reckless: 0,
}

/**
 * Between fights a team turns for home a little *above* its retreat line, so
 * it does not walk into a fight it would flee at the first blow.
 */
export const TURN_BACK_MARGIN = 0.15

export const MAX_TEAM = 4
export const MAX_FLASKS = 10

export const DEFAULT_POLICY: Policy = {
  stance: 'balanced',
  push: 'normal',
  retreatBelow: 0.35,
  flasks: 4,
}

// ── Expeditions ─────────────────────────────────────────────────────────────

/** Seconds of lantern light in one flask. */
export const LIGHT_PER_FLASK = 90

/** Seconds to walk from one node to the next, going out. */
export const TRAVEL_SECONDS = 30

/** Seconds per node of depth to walk home through ground already cleared. */
export const RETURN_SECONDS_PER_DEPTH = 10

/**
 * HP a standing member gets back per second on the road between fights. A
 * breather, not a rest: it softens attrition so that oil, not only wounds,
 * decides how deep a team gets.
 */
export const TRAVEL_HEAL_PER_SECOND = 0.3

/** What a team budgets for the fight at the next node when judging its oil. */
export const FIGHT_ESTIMATE_SECONDS = 20

/** Damage the dark does each standing member per second once the light is gone. */
export const DARK_DAMAGE_PER_SECOND = 1

/** Hard stop on any one expedition, as a guard against a stalled sim. */
export const MAX_EXPEDITION_SECONDS = 3 * 60 * 60

/** Log lines kept per expedition. Past this, blow-by-blow hits are dropped. */
export const MAX_LOG_EVENTS = 600

/** Finished expeditions kept on the reports screen. */
export const MAX_REPORTS = 8

// ── Town ────────────────────────────────────────────────────────────────────

/** HP a character at home recovers per second. */
export const HEAL_PER_SECOND = 0.2

/** Seconds for the town's oil press to fill one flask. */
export const OIL_SECONDS_PER_FLASK = 150

/** The press stops once the store holds this much. Loot can carry it higher. */
export const OIL_CAP = 20

/** Seconds between refugees reaching the gate. */
export const REFUGEE_SECONDS = 8 * 60

/** Refugees who will wait at the gate at once. The clock stops while it is full. */
export const GATE_CAP = 3

export const ROSTER_CAP = 8

/** Supplies it costs to take a refugee in. */
export const TAKE_IN_COST = 10

export function canBeSent(
  character: Character,
  away: ReadonlySet<number>,
): boolean {
  return !away.has(character.id) && !character.injured && character.hp > 0
}
