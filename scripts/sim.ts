// Runs expeditions headless and prints how each plan tends to go.
// `npm run sim` — edit src/game/rules.ts and content.ts, then run it again.

import { depart } from '../src/game/actions'
import { createInitialState } from '../src/game/initialState'
import { advanceTo, STEP_MS } from '../src/game/tick'
import type { GameState, Policy, Push, Stance } from '../src/game/types'

const RUNS = Number(process.argv[2] ?? 400)

interface Tally {
  depth: number
  seconds: number
  supplies: number
  deaths: number
  outcomes: Record<string, number>
}

function runOne(seed: number, policy: Policy): GameState['reports'][number] {
  let state: GameState = {
    ...createInitialState(1_700_000_000_000 + seed * 7919),
    oil: 20,
  }
  state = depart(
    state,
    state.roster.map((character) => character.id),
    policy,
  )
  let now = state.lastTick
  while (state.expedition) {
    now += 60 * STEP_MS
    state = advanceTo(state, now)
  }
  return state.reports[0]
}

function tally(policy: Policy): Tally {
  const result: Tally = {
    depth: 0,
    seconds: 0,
    supplies: 0,
    deaths: 0,
    outcomes: { triumph: 0, retreat: 0, wipe: 0 },
  }
  for (let seed = 0; seed < RUNS; seed += 1) {
    const report = runOne(seed, policy)
    result.depth += report.depth
    result.seconds += report.seconds
    result.supplies += report.supplies
    result.deaths += report.dead.length
    result.outcomes[report.outcome] += 1
  }
  return result
}

const pct = (n: number) => `${Math.round((n / RUNS) * 100)}%`.padStart(4)
const avg = (n: number, digits = 1) => (n / RUNS).toFixed(digits).padStart(5)

console.log(
  `${RUNS} runs each, the four founders.\n` +
    'plan                              depth  mins  supplies  deaths  triumph retreat wipe',
)
for (const flasks of [3, 5, 8]) {
  for (const stance of ['aggressive', 'balanced', 'defensive'] as Stance[]) {
    for (const push of ['cautious', 'reckless'] as Push[]) {
      for (const retreatBelow of [0.2, 0.4]) {
        const t = tally({ stance, push, retreatBelow, flasks })
        const label = `${flasks}fl ${stance} ${push} <${retreatBelow * 100}%`
        console.log(
          `${label.padEnd(33)} ${avg(t.depth)} ${avg(t.seconds / 60)}   ${avg(t.supplies, 0)}   ${avg(t.deaths, 2)}  ${pct(t.outcomes.triumph)}    ${pct(t.outcomes.retreat)}   ${pct(t.outcomes.wipe)}`,
        )
      }
    }
  }
}
