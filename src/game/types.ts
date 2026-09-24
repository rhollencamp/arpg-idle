/** Bumped when the saved shape changes in a way `migrate` cannot repair. */
export const SAVE_VERSION = 1

/**
 * A person in the one shared pool. For now a character is just two numbers:
 * Vitality (how much punishment they take) and Strength (how hard they hit).
 * Archetypes, backgrounds and gear come later — see docs/design/02-characters.md.
 */
export interface Character {
  id: number
  name: string
  vitality: number
  strength: number
  /**
   * Current HP. Lives on the character rather than on the expedition, so the
   * damage a team comes home with is the damage it keeps until it heals.
   */
  hp: number
  /**
   * Came home downed. An injured character heals at home but cannot be sent
   * out again until they are back to full health.
   */
  injured: boolean
}

/** Someone waiting at the gate to be taken in. Not yet part of the roster. */
export interface Refugee {
  id: number
  name: string
  vitality: number
  strength: number
}

/** The dead, remembered. */
export interface Fallen {
  id: number
  name: string
  /** Which expedition they fell on. */
  expeditionId: number
  depth: number
}

/** How brightly the lighthouse is set to burn. */
export type Brightness = 'low' | 'steady' | 'bright'

/**
 * One line of the town's ledger. `t` is seconds since the town was founded
 * (`GameState.elapsed`), so the ledger reads the same however the time was
 * simulated.
 */
export type TownEvent =
  | { t: number; kind: 'lightOut' }
  | { t: number; kind: 'relit' }
  | { t: number; kind: 'arrived'; name: string }
  | { t: number; kind: 'waveSighted'; strength: number }
  | {
      t: number
      kind: 'repelled'
      strength: number
      defense: number
      spoils: number
    }
  | {
      t: number
      kind: 'breached'
      strength: number
      defense: number
      wallDamage: number
      suppliesLost: number
    }
  | { t: number; kind: 'fell'; strength: number; defense: number }

export interface Siege {
  /** Builds toward `PRESSURE_MAX`, which sets a wave in motion. */
  pressure: number
  /** The wave on its way, if one has been sighted. */
  wave: { strength: number; countdown: number } | null
  /** Waves that have broken on the town, thrown back or not. */
  waves: number
  repelled: number
}

export interface Walls {
  integrity: number
  max: number
  /** Times reinforced, starting from 1. Sets the next reinforcement's cost. */
  level: number
}

/** How it ended. Set once, when the town falls; the save is then read-only. */
export interface Lost {
  /** Seconds the light burned. */
  elapsed: number
  waves: number
  repelled: number
  takenIn: number
  expeditions: number
}

/** How hard a team fights. Applies to the whole team for now. */
export type Stance = 'aggressive' | 'balanced' | 'defensive'

/** How much spare oil a team insists on before it goes one node deeper. */
export type Push = 'cautious' | 'normal' | 'reckless'

/**
 * The standing orders an expedition leaves with. Snapshotted onto the
 * expedition at departure, so changing the plan at home cannot reach a team
 * that is already out in the fog.
 */
export interface Policy {
  stance: Stance
  push: Push
  /** Retreat from a fight once the team's standing HP falls below this share. */
  retreatBelow: number
  /** Flasks of lantern oil to carry. */
  flasks: number
}

export interface Enemy {
  name: string
  hp: number
  maxHp: number
  damage: number
  /** Seconds until this enemy acts again. */
  cooldown: number
}

/**
 * Where an expedition is. A team walks to a node, fights what is there, then
 * either walks on or turns for home. `returning` covers every way home — a
 * planned turn, a retreat, and the crawl back after a wipe.
 */
export type Phase =
  | { kind: 'travel'; remaining: number }
  | { kind: 'fight'; enemies: Enemy[] }
  | { kind: 'returning'; remaining: number }

export type Outcome = 'triumph' | 'retreat' | 'wipe'

/**
 * One line of an expedition log, kept structured so the UI can render,
 * summarise and filter it; the prose lives in `src/ui/logText.ts`.
 * `t` is seconds since departure.
 */
export type LogEvent =
  | { t: number; kind: 'depart'; names: string[]; flasks: number }
  | { t: number; kind: 'encounter'; depth: number; enemies: string[] }
  | {
      t: number
      kind: 'hit'
      attacker: string
      target: string
      damage: number
      /** True when the attacker was one of ours. */
      ours: boolean
    }
  | { t: number; kind: 'downed'; name: string }
  | { t: number; kind: 'slain'; name: string }
  | { t: number; kind: 'victory'; depth: number; supplies: number; oil: number }
  | { t: number; kind: 'retreat' }
  | { t: number; kind: 'wipe' }
  | { t: number; kind: 'turnBack'; reason: 'oil' | 'hurt' }
  | { t: number; kind: 'dark' }
  | { t: number; kind: 'died'; name: string }
  | { t: number; kind: 'survived'; name: string }
  | {
      t: number
      kind: 'home'
      outcome: Outcome
      supplies: number
      oil: number
    }

export interface Expedition {
  id: number
  memberIds: number[]
  policy: Policy
  /** Seconds since departure. Also the RNG step index for this expedition. */
  t: number
  /** Seconds of lantern light left. */
  light: number
  /** Nodes reached so far. */
  depth: number
  phase: Phase
  /** Seconds until each member acts again, keyed by character id. */
  cooldowns: Record<number, number>
  /** Members downed since the last survival check. */
  unresolved: number[]
  /** Everything carried home so far. Lost on a wipe. */
  loot: { supplies: number; oil: number }
  outcome: Outcome | null
  darkLogged: boolean
  log: LogEvent[]
}

/** A finished expedition, kept for the reports screen. */
export interface Report {
  id: number
  names: string[]
  outcome: Outcome
  depth: number
  seconds: number
  supplies: number
  oil: number
  dead: string[]
  log: LogEvent[]
}

export interface GameState {
  version: typeof SAVE_VERSION
  /** Fixed for the life of a save, so the same absence resolves the same way. */
  seed: number
  /**
   * epoch ms of the last simulated step boundary. Lags `now` by up to one
   * step: the leftover is carried rather than dropped, so no time is lost.
   */
  lastTick: number
  /** Flasks of lantern oil in the town's store. Fractional while it accrues. */
  oil: number
  supplies: number
  roster: Character[]
  gate: Refugee[]
  /** Progress toward the next refugee reaching the gate, in [0, 1). */
  refugeeProgress: number
  /** How many refugees have ever arrived; also their RNG step index. */
  refugeesArrived: number
  nextCharacterId: number
  fallen: Fallen[]
  /** The plan the next expedition will leave with. */
  policy: Policy
  expedition: Expedition | null
  nextExpeditionId: number
  /** Newest first. */
  reports: Report[]
  /** Seconds since the town was founded. The town's own clock. */
  elapsed: number
  brightness: Brightness
  /** The oil ran dry. Stays out until the press refills `RELIGHT_AT`. */
  lightOut: boolean
  siege: Siege
  walls: Walls
  /** Refugees ever taken in. */
  takenIn: number
  /** Oldest first, capped. */
  townLog: TownEvent[]
  lost: Lost | null
}
