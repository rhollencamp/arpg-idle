import { beforeEach, describe, expect, it } from 'vitest'
import { depart } from './actions'
import { createInitialState } from './initialState'
import { DEFAULT_POLICY } from './rules'
import {
  clearSave,
  loadState,
  migrate,
  parseSave,
  saveState,
  serializeSave,
} from './save'

beforeEach(() => {
  localStorage.clear()
})

describe('migrate', () => {
  it('accepts a well-formed save, expedition and all', () => {
    const state = depart(createInitialState(), [1, 2], DEFAULT_POLICY)

    expect(migrate(JSON.parse(JSON.stringify(state)))).toEqual(state)
  })

  it('rejects garbage', () => {
    expect(migrate(null)).toBeNull()
    expect(migrate('nope')).toBeNull()
    expect(migrate([])).toBeNull()
    expect(migrate({ version: 999 })).toBeNull()
  })

  it('rejects a save with broken numbers or a broken roster', () => {
    expect(migrate({ ...createInitialState(), oil: Number.NaN })).toBeNull()
    expect(migrate({ ...createInitialState(), roster: [{}] })).toBeNull()
  })

  it('fills in a missing policy', () => {
    const { policy: _policy, ...older } = createInitialState()

    expect(migrate(older)?.policy).toEqual(DEFAULT_POLICY)
  })
})

describe('storage', () => {
  it('round-trips a state', () => {
    const state = { ...createInitialState(), supplies: 42 }
    saveState(state)

    expect(loadState(createInitialState)).toEqual(state)
  })

  it('starts fresh when nothing usable is stored', () => {
    expect(loadState(createInitialState).supplies).toBe(10)
    clearSave()
    expect(loadState(createInitialState).reports).toEqual([])
  })

  it('round-trips an export', () => {
    const state = createInitialState()

    expect(parseSave(serializeSave(state))).toEqual(state)
    expect(parseSave('not json')).toBeNull()
  })
})
