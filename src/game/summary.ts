import { advanceTo } from './tick'
import type { Fallen, GameState, Report } from './types'

/** Absences shorter than this pass without a word. */
export const MIN_AWAY_MS = 60_000

/** What happened while nobody was watching. */
export interface AwaySummary {
  awayMs: number
  /** Expeditions that came home during the absence, newest first. */
  reports: Report[]
  fallen: Fallen[]
  /** Refugees who reached the gate. */
  arrivals: number
  oil: number
  supplies: number
  /** Whether a team is still out there. */
  stillOut: boolean
}

export function summarizeAbsence(
  before: GameState,
  after: GameState,
): AwaySummary | null {
  const awayMs = after.lastTick - before.lastTick
  if (awayMs < MIN_AWAY_MS) return null

  const seen = new Set(before.reports.map((report) => report.id))
  const known = new Set(before.fallen.map((fallen) => fallen.id))

  return {
    awayMs,
    reports: after.reports.filter((report) => !seen.has(report.id)),
    fallen: after.fallen.filter((fallen) => !known.has(fallen.id)),
    arrivals: after.refugeesArrived - before.refugeesArrived,
    oil: after.oil - before.oil,
    supplies: after.supplies - before.supplies,
    stillOut: after.expedition !== null,
  }
}

/**
 * Catches a state up to `now` and reports the gap in one call, so the two
 * always describe the same span.
 */
export function resumeFrom(
  state: GameState,
  now: number,
): { state: GameState; summary: AwaySummary | null } {
  const advanced = advanceTo(state, now)
  return { state: advanced, summary: summarizeAbsence(state, advanced) }
}

const DURATION_UNITS: readonly (readonly [ms: number, name: string])[] = [
  [86_400_000, 'day'],
  [3_600_000, 'hour'],
  [60_000, 'minute'],
]

/** An absence in words, rounded down to its largest whole unit. */
export function formatDuration(ms: number): string {
  for (const [unitMs, name] of DURATION_UNITS) {
    const count = Math.floor(ms / unitMs)
    if (count >= 1) return `${count} ${name}${count === 1 ? '' : 's'}`
  }
  return 'a moment'
}

/** A clock reading for sim seconds: `4:05`. */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(whole / 60)
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`
}
