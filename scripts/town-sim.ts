// Plays the town headless with a simple bot and prints how long it lasts.
// `npm run sim:town [runs]` — edit src/game/rules.ts, then run it again.

import {
  canDepart,
  canReinforce,
  canTakeIn,
  depart,
  reinforceWalls,
  repairWalls,
  setBrightness,
  takeIn,
} from '../src/game/actions'
import { createInitialState } from '../src/game/initialState'
import { DEFAULT_POLICY, MAX_TEAM, canBeSent } from '../src/game/rules'
import { advanceTo } from '../src/game/tick'
import { defenseOf } from '../src/game/town'
import type { Brightness, GameState } from '../src/game/types'

const RUNS = Number(process.argv[2] ?? 40)
const HOURS = 24
const CHECK_EVERY_MS = 60_000

interface Bot {
  label: string
  brightness: Brightness
  /** Send expeditions at all? */
  expeditions: boolean
  /** Spend supplies on walls and refugees? */
  build: boolean
  /** Keep the team home while a wave is on its way? */
  wary: boolean
}

const BOTS: Bot[] = [
  {
    label: 'idle, steady light',
    brightness: 'steady',
    expeditions: false,
    build: false,
    wary: false,
  },
  {
    label: 'idle but builds, steady',
    brightness: 'steady',
    expeditions: false,
    build: true,
    wary: false,
  },
  {
    label: 'expeditions, no building',
    brightness: 'steady',
    expeditions: true,
    build: false,
    wary: false,
  },
  {
    label: 'full bot, low light',
    brightness: 'low',
    expeditions: true,
    build: true,
    wary: true,
  },
  {
    label: 'full bot, steady light',
    brightness: 'steady',
    expeditions: true,
    build: true,
    wary: true,
  },
  {
    label: 'full bot, bright light',
    brightness: 'bright',
    expeditions: true,
    build: true,
    wary: true,
  },
  {
    label: 'full bot, careless of waves',
    brightness: 'steady',
    expeditions: true,
    build: true,
    wary: false,
  },
]

function play(state: GameState, bot: Bot): GameState {
  state = setBrightness(state, bot.brightness)
  if (bot.build) {
    for (const refugee of state.gate) {
      if (canTakeIn(state)) state = takeIn(state, refugee.id)
    }
    // Reinforce while it keeps a small reserve for repairs.
    while (canReinforce(state) && state.supplies > 60) {
      state = reinforceWalls(state)
    }
    state = repairWalls(state)
  }
  if (bot.expeditions && !state.expedition) {
    const wave = state.siege.wave
    const away = new Set<number>()
    const ready = state.roster.filter((c) => canBeSent(c, away))
    const team = ready
      .filter((c) => c.hp >= c.vitality * 10 * 0.8)
      .slice(0, MAX_TEAM)
      .map((c) => c.id)
    const safe =
      !bot.wary ||
      !wave ||
      defenseOf(state, team).total >= wave.strength * 1.1 ||
      wave.countdown > 12 * 60
    const flasks = Math.min(4, Math.floor(state.oil) - 2)
    const policy = { ...DEFAULT_POLICY, flasks }
    if (
      safe &&
      team.length > 0 &&
      flasks >= 2 &&
      canDepart(state, team, policy)
    ) {
      state = depart(state, team, policy)
    }
  }
  return state
}

console.log(`${RUNS} runs of ${HOURS}h each.`)
console.log(
  'bot                              fell   survived  waves  repelled  walls  people  dead  light-out',
)
for (const bot of BOTS) {
  let fell = 0
  let hours = 0
  let waves = 0
  let repelled = 0
  let walls = 0
  let people = 0
  let dead = 0
  let outs = 0
  for (let run = 0; run < RUNS; run += 1) {
    const start = 1_700_000_000_000 + run * 104_729
    let state = createInitialState(start)
    for (
      let now = start;
      now < start + HOURS * 3_600_000;
      now += CHECK_EVERY_MS
    ) {
      state = advanceTo(play(state, bot), now + CHECK_EVERY_MS)
      if (state.lost) break
    }
    if (state.lost) fell += 1
    hours += state.elapsed / 3600
    waves += state.siege.waves
    repelled += state.siege.repelled
    walls += state.walls.max
    people += state.roster.length
    dead += state.fallen.length
    outs += state.townLog.filter((e) => e.kind === 'lightOut').length
  }
  const avg = (n: number, d = 1) => (n / RUNS).toFixed(d).padStart(6)
  console.log(
    `${bot.label.padEnd(32)} ${`${Math.round((fell / RUNS) * 100)}%`.padStart(4)}  ${avg(hours)}h  ${avg(waves)} ${avg(repelled)}   ${avg(walls, 0)} ${avg(people)} ${avg(dead)} ${avg(outs)}`,
  )
}
