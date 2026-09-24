import { describe, expect, it } from 'vitest'
import { depart } from './actions'
import { createInitialState } from './initialState'
import { DEFAULT_POLICY, REFUGEE_SECONDS } from './rules'
import { advanceTo, STEP_MS } from './tick'
import type { GameState } from './types'

const START = 1_700_000_000_000

function sendEveryone(state: GameState): GameState {
  return depart(
    { ...state, oil: 10 },
    state.roster.map((character) => character.id),
    { ...DEFAULT_POLICY, flasks: 5 },
  )
}

describe('advanceTo', () => {
  it('does nothing until a whole step has passed', () => {
    const state = createInitialState(START)

    expect(advanceTo(state, START + STEP_MS - 1)).toBe(state)
  })

  it('carries the remainder of a partial step', () => {
    const state = advanceTo(createInitialState(START), START + 2500)

    expect(state.lastTick).toBe(START + 2000)
  })

  it('resolves an expedition the same however the time is split', () => {
    const start = sendEveryone(createInitialState(START))
    const end = START + 20 * 60 * 1000

    const whole = advanceTo(start, end)

    let pieces = start
    for (let now = START; now <= end; now += 7_300) {
      pieces = advanceTo(pieces, now)
    }
    pieces = advanceTo(pieces, end)

    expect(whole.expedition).toBeNull()
    expect(pieces.reports[0]).toEqual(whole.reports[0])
    expect(pieces.roster.map((c) => c.hp)).toEqual(
      whole.roster.map((c) => c.hp),
    )
    expect(pieces.oil).toBeCloseTo(whole.oil, 9)
    expect(pieces.supplies).toBe(whole.supplies)
  })

  it('brings the team home with a report', () => {
    const state = advanceTo(
      sendEveryone(createInitialState(START)),
      START + 60 * 60 * 1000,
    )

    expect(state.expedition).toBeNull()
    expect(state.reports).toHaveLength(1)
    expect(state.reports[0].depth).toBeGreaterThan(0)
    expect(state.reports[0].log.at(-1)?.kind).toBe('home')
  })

  it('settles a week away in bounded time', () => {
    const state = sendEveryone(createInitialState(START))

    const began = performance.now()
    const later = advanceTo(state, START + 7 * 24 * 60 * 60 * 1000)
    const took = performance.now() - began

    expect(later.expedition).toBeNull()
    expect(later.elapsed).toBeGreaterThan(0)
    expect(took).toBeLessThan(500)
  })

  it('heals the team back to full over a long absence', () => {
    const state = advanceTo(
      sendEveryone(createInitialState(START)),
      START + 2 * 60 * 60 * 1000,
    )

    for (const character of state.roster) {
      expect(character.hp).toBe(character.vitality * 10)
      expect(character.injured).toBe(false)
    }
  })

  it('brings refugees to the gate on a clock', () => {
    const state = advanceTo(
      createInitialState(START),
      START + REFUGEE_SECONDS.steady! * 1000,
    )

    expect(state.gate).toHaveLength(1)
    expect(state.refugeesArrived).toBe(1)
  })
})
