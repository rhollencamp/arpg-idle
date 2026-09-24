import { describe, expect, it } from 'vitest'
import {
  repairCost,
  reinforceWalls,
  repairWalls,
  setBrightness,
} from './actions'
import { createInitialState } from './initialState'
import {
  OIL_CAP,
  PRESSURE_MAX,
  PRESSURE_PER_SECOND,
  RELIGHT_AT,
  WAVE_WARNING_SECONDS,
  reinforceCost,
  waveStrength,
} from './rules'
import { advanceTo } from './tick'
import { defenseOf, oilRate, townStep } from './town'
import type { GameState } from './types'

const START = 1_700_000_000_000
const HOUR = 60 * 60 * 1000

function town(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(START), ...overrides }
}

/** A town with nobody left to defend it. */
function empty(overrides: Partial<GameState> = {}): GameState {
  return town({ roster: [], ...overrides })
}

describe('the lighthouse', () => {
  it('burns oil faster than the press fills it on a bright setting', () => {
    expect(oilRate(town({ brightness: 'bright' }))).toBeLessThan(0)
    expect(oilRate(town({ brightness: 'low' }))).toBeGreaterThan(0)
  })

  it('goes out when the oil runs dry, and relights once the press catches up', () => {
    const state = advanceTo(
      town({ brightness: 'bright', oil: 0.5 }),
      START + 10 * 60 * 1000,
    )
    const kinds = state.townLog.map((event) => event.kind)

    expect(kinds).toContain('lightOut')
    expect(kinds).toContain('relit')
    expect(kinds.indexOf('relit')).toBeGreaterThan(kinds.indexOf('lightOut'))
  })

  it('stays out until a whole flask is pressed', () => {
    const state = town({ lightOut: true, oil: 0 })
    townStep(state, 60)

    expect(state.lightOut).toBe(true)
    expect(state.oil).toBeLessThan(RELIGHT_AT)
  })

  it('never lets the press fill past the cap', () => {
    const state = advanceTo(town({ brightness: 'low' }), START + 48 * HOUR)

    expect(state.oil).toBeLessThanOrEqual(OIL_CAP)
  })

  it('draws fewer refugees in the dark', () => {
    // Short enough that neither gate fills up.
    const window = START + 20 * 60 * 1000
    const lit = advanceTo(town({ brightness: 'bright', oil: 20 }), window)
    const dim = advanceTo(town({ brightness: 'low' }), window)

    expect(lit.refugeesArrived).toBeGreaterThan(dim.refugeesArrived)
  })
})

describe('the siege', () => {
  it('sights a wave once pressure fills, with a warning', () => {
    const state = town()
    townStep(state, PRESSURE_MAX / PRESSURE_PER_SECOND)

    expect(state.siege.wave).toEqual({
      strength: waveStrength(0),
      countdown: WAVE_WARNING_SECONDS,
    })
    expect(state.townLog.at(-1)?.kind).toBe('waveSighted')
  })

  it('throws back a wave the defense can match, and scavenges from it', () => {
    const state = town({
      siege: {
        pressure: 0,
        wave: { strength: 10, countdown: 1 },
        waves: 0,
        repelled: 0,
      },
    })
    townStep(state, 1)

    expect(state.siege.repelled).toBe(1)
    expect(state.supplies).toBeGreaterThan(10)
    expect(state.walls.integrity).toBeLessThan(100)
  })

  it('lets a stronger wave through, costing walls and supplies', () => {
    const state = empty({
      supplies: 50,
      siege: {
        pressure: 0,
        wave: { strength: 40, countdown: 1 },
        waves: 0,
        repelled: 0,
      },
    })
    townStep(state, 1)

    expect(state.lost).toBeNull()
    expect(state.townLog.at(-1)?.kind).toBe('breached')
    expect(state.walls.integrity).toBeLessThan(100)
    expect(state.supplies).toBeLessThan(50)
  })

  it('falls when the walls cannot take the blow', () => {
    const state = empty({
      walls: { integrity: 10, max: 100, level: 1 },
      siege: {
        pressure: 0,
        wave: { strength: 80, countdown: 1 },
        waves: 3,
        repelled: 3,
      },
    })
    townStep(state, 1)

    expect(state.lost).toMatchObject({ waves: 4, repelled: 3 })
    expect(state.townLog.at(-1)?.kind).toBe('fell')
  })

  it('stops the world once the town has fallen', () => {
    const fallen = town({
      lost: { elapsed: 5, waves: 1, repelled: 0, takenIn: 0, expeditions: 0 },
    })
    const later = advanceTo(fallen, START + HOUR)

    expect(later.elapsed).toBe(fallen.elapsed)
    expect(later.oil).toBe(fallen.oil)
    expect(later.lastTick).toBe(START + HOUR)
  })

  it('counts only the people at home toward the defense', () => {
    const state = town()
    const everyone = state.roster.map((c) => c.id)

    expect(defenseOf(state, everyone).people).toBe(0)
    expect(defenseOf(state).people).toBeGreaterThan(0)
  })

  it('comes out the same however a long absence is split', () => {
    const start = town()
    const end = START + 30 * HOUR
    const whole = advanceTo(start, end)

    let pieces = start
    for (let now = START; now < end; now += 17 * 60 * 1000 + 333) {
      pieces = advanceTo(pieces, now)
    }
    pieces = advanceTo(pieces, end)

    expect(pieces.townLog.map((e) => e.kind)).toEqual(
      whole.townLog.map((e) => e.kind),
    )
    expect(pieces.siege.waves).toBe(whole.siege.waves)
    expect(pieces.lost === null).toBe(whole.lost === null)
    expect(pieces.walls.integrity).toBeCloseTo(whole.walls.integrity, 6)
    expect(pieces.oil).toBeCloseTo(whole.oil, 6)
    expect(pieces.elapsed).toBeCloseTo(whole.elapsed, 6)
  })

  it('eventually overruns a town nobody tends', () => {
    const state = advanceTo(town(), START + 72 * HOUR)

    expect(state.lost).not.toBeNull()
  })
})

describe('walls and light', () => {
  it('repairs the walls with what supplies there are', () => {
    const state = town({
      walls: { integrity: 40, max: 100, level: 1 },
      supplies: 5,
    })
    const after = repairWalls(state)

    expect(repairCost(state)).toBe(20)
    expect(after.supplies).toBe(0)
    expect(after.walls.integrity).toBe(55)
  })

  it('reinforces the walls for supplies', () => {
    const state = town({ supplies: 100 })
    const after = reinforceWalls(state)

    expect(after.walls.max).toBeGreaterThan(state.walls.max)
    expect(after.walls.level).toBe(2)
    expect(after.supplies).toBe(100 - reinforceCost(1))
    expect(reinforceWalls(town({ supplies: 0 }))).toEqual(town({ supplies: 0 }))
  })

  it('changes the brightness, but not after the fall', () => {
    expect(setBrightness(town(), 'bright').brightness).toBe('bright')
    const fallen = town({
      lost: { elapsed: 0, waves: 0, repelled: 0, takenIn: 0, expeditions: 0 },
    })
    expect(setBrightness(fallen, 'bright')).toBe(fallen)
  })
})
