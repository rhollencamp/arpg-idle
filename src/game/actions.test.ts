import { describe, expect, it } from 'vitest'
import { canDepart, depart, takeIn, turnAway } from './actions'
import { createInitialState } from './initialState'
import { DEFAULT_POLICY, TAKE_IN_COST } from './rules'
import type { GameState } from './types'

const policy = { ...DEFAULT_POLICY, flasks: 2 }

function withRefugee(state: GameState): GameState {
  return {
    ...state,
    gate: [{ id: 99, name: 'Wren', vitality: 5, strength: 6 }],
  }
}

describe('depart', () => {
  it('sends a team and spends the oil', () => {
    const state = createInitialState()
    const after = depart(state, [1, 2], policy)

    expect(after.expedition?.memberIds).toEqual([1, 2])
    expect(after.oil).toBe(state.oil - 2)
    expect(after.policy).toEqual(policy)
  })

  it('refuses while a team is already out', () => {
    const out = depart(createInitialState(), [1], policy)

    expect(canDepart(out, [2], policy)).toBe(false)
    expect(depart(out, [2], policy)).toBe(out)
  })

  it('refuses without the oil for the plan', () => {
    const state = { ...createInitialState(), oil: 1.9 }

    expect(canDepart(state, [1], policy)).toBe(false)
  })

  it('refuses an empty team, an oversized one, or strangers', () => {
    const state = createInitialState()

    expect(canDepart(state, [], policy)).toBe(false)
    expect(canDepart(state, [1, 2, 3, 4, 5], policy)).toBe(false)
    expect(canDepart(state, [42], policy)).toBe(false)
    expect(canDepart(state, [1, 1], policy)).toBe(false)
  })

  it('refuses the injured', () => {
    const state = createInitialState()
    state.roster[0] = { ...state.roster[0], injured: true }

    expect(canDepart(state, [1], policy)).toBe(false)
  })
})

describe('the gate', () => {
  it('takes a refugee in for supplies', () => {
    const state = withRefugee(createInitialState())
    const after = takeIn(state, 99)

    expect(after.gate).toHaveLength(0)
    expect(after.roster.at(-1)).toMatchObject({ name: 'Wren', hp: 50 })
    expect(after.supplies).toBe(state.supplies - TAKE_IN_COST)
  })

  it('cannot take anyone in without the supplies', () => {
    const state = { ...withRefugee(createInitialState()), supplies: 0 }

    expect(takeIn(state, 99)).toBe(state)
  })

  it('turns a refugee away for free', () => {
    const state = withRefugee(createInitialState())
    const after = turnAway(state, 99)

    expect(after.gate).toHaveLength(0)
    expect(after.supplies).toBe(state.supplies)
  })
})
