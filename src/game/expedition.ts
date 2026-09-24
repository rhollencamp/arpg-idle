import {
  ENEMY_DAMAGE_GROWTH,
  ENEMY_HP_GROWTH,
  ENEMY_KINDS,
  MAX_ENEMIES,
} from './content'
import { createRng } from './rng'
import { lightLevel } from './town'
import {
  ATTACK_SECONDS,
  DARK_DAMAGE_PER_SECOND,
  FIGHT_ESTIMATE_SECONDS,
  MAX_EXPEDITION_SECONDS,
  MAX_LOG_EVENTS,
  MAX_REPORTS,
  PUSH_MARGIN,
  RETURN_PACE,
  RETURN_SECONDS_PER_DEPTH,
  STANCE,
  TRAVEL_HEAL_PER_SECOND,
  TRAVEL_SECONDS,
  TURN_BACK_MARGIN,
  maxHp,
  survivalChance,
} from './rules'
import type {
  Character,
  Enemy,
  Expedition,
  GameState,
  LogEvent,
  Report,
} from './types'

/**
 * One second of an expedition: the walk, the fight, the way home.
 *
 * Mutates a draft (see `tick.ts`). Randomness comes from a generator keyed on
 * the expedition's id and its own clock, so an expedition resolves the same
 * way whether it was watched second by second or caught up in one go.
 */
export function expeditionStep(draft: GameState): void {
  const exp = draft.expedition
  if (!exp) return

  const rng = createRng(draft.seed, exp.t, `expedition:${exp.id}`)
  exp.t += 1

  const members = membersOf(draft, exp)

  // The lantern burns whatever the team is doing.
  exp.light = Math.max(0, exp.light - 1)
  if (exp.light === 0) sufferDark(exp, members)

  switch (exp.phase.kind) {
    case 'travel':
      for (const member of members) {
        if (member.hp > 0) {
          member.hp = Math.min(
            maxHp(member),
            member.hp + TRAVEL_HEAL_PER_SECOND,
          )
        }
      }
      exp.phase.remaining -= 1
      if (exp.phase.remaining <= 0) arrive(exp, rng)
      break
    case 'fight':
      fightStep(draft, exp, members, exp.phase.enemies, rng)
      break
    case 'returning':
      // `remaining` is measured at a steady light's pace; the lighthouse
      // decides how much of it each second covers.
      exp.phase.remaining -= RETURN_PACE[lightLevel(draft)]
      if (exp.phase.remaining <= 0) comeHome(draft, exp, rng)
      break
  }

  // Everyone left standing went down in the dark on the way somewhere.
  if (
    exp.phase.kind !== 'returning' &&
    draft.expedition === exp &&
    membersOf(draft, exp).every((member) => member.hp <= 0)
  ) {
    wipe(draft, exp, rng)
  }

  if (draft.expedition === exp && exp.t >= MAX_EXPEDITION_SECONDS) {
    comeHome(draft, exp, rng)
  }
}

function membersOf(state: GameState, exp: Expedition): Character[] {
  return state.roster.filter((character) =>
    exp.memberIds.includes(character.id),
  )
}

function log(exp: Expedition, event: LogEvent): void {
  // A long fight can throw hundreds of blows; past the cap, only the events
  // that change the story are kept.
  if (exp.log.length >= MAX_LOG_EVENTS && event.kind === 'hit') return
  exp.log.push(event)
}

/** Standing HP as a share of the whole team's, downed members included. */
export function teamHealth(members: readonly Character[]): number {
  let hp = 0
  let max = 0
  for (const member of members) {
    hp += Math.max(0, member.hp)
    max += maxHp(member)
  }
  return max === 0 ? 0 : hp / max
}

function sufferDark(exp: Expedition, members: Character[]): void {
  if (!exp.darkLogged) {
    exp.darkLogged = true
    log(exp, { t: exp.t, kind: 'dark' })
  }
  for (const member of members) {
    if (member.hp <= 0) continue
    member.hp -= DARK_DAMAGE_PER_SECOND
    if (member.hp <= 0) down(exp, member)
  }
}

function down(exp: Expedition, member: Character): void {
  member.hp = 0
  exp.unresolved.push(member.id)
  log(exp, { t: exp.t, kind: 'downed', name: member.name })
}

/** Reaches the next node and meets whatever is waiting there. */
function arrive(exp: Expedition, rng: () => number): void {
  exp.depth += 1
  const enemies = spawnEnemies(exp.depth, rng)
  exp.phase = { kind: 'fight', enemies }
  log(exp, {
    t: exp.t,
    kind: 'encounter',
    depth: exp.depth,
    enemies: enemies.map((enemy) => enemy.name),
  })
}

export function spawnEnemies(depth: number, rng: () => number): Enemy[] {
  const available = ENEMY_KINDS.filter((kind) => kind.minDepth <= depth)
  const count = Math.min(
    MAX_ENEMIES,
    1 + Math.floor(depth / 3) + (rng() < 0.5 ? 1 : 0),
  )
  const hpScale = 1 + ENEMY_HP_GROWTH * (depth - 1)
  const damageScale = 1 + ENEMY_DAMAGE_GROWTH * (depth - 1)

  const enemies: Enemy[] = []
  for (let i = 0; i < count; i += 1) {
    // Weighted toward the newest kind the depth allows, so going deeper
    // changes *what* you meet as well as how tough it is.
    const pick = Math.min(
      available.length - 1,
      Math.floor(Math.sqrt(rng()) * available.length),
    )
    const kind = available[pick]
    const hp = Math.round(kind.hp * hpScale)
    enemies.push({
      name: kind.name,
      hp,
      maxHp: hp,
      damage: kind.damage * damageScale,
      // Staggered so a pack does not strike in lockstep.
      cooldown: 1 + rng() * kind.attackSeconds,
    })
  }
  return enemies
}

function roll(base: number, rng: () => number): number {
  return Math.max(1, Math.round(base * (0.8 + 0.4 * rng())))
}

function fightStep(
  draft: GameState,
  exp: Expedition,
  members: Character[],
  enemies: Enemy[],
  rng: () => number,
): void {
  const stance = STANCE[exp.policy.stance]

  // Ours strike first: a blow that lands this second can stop one coming back.
  for (const member of members) {
    if (member.hp <= 0) continue
    exp.cooldowns[member.id] = (exp.cooldowns[member.id] ?? 0) - 1
    if (exp.cooldowns[member.id] > 0) continue
    exp.cooldowns[member.id] += ATTACK_SECONDS

    const target = pickEnemy(enemies, exp.policy.stance, rng)
    if (!target) break
    const damage = roll(member.strength * stance.dealt, rng)
    target.hp -= damage
    log(exp, {
      t: exp.t,
      kind: 'hit',
      attacker: member.name,
      target: target.name,
      damage,
      ours: true,
    })
    if (target.hp <= 0) log(exp, { t: exp.t, kind: 'slain', name: target.name })
  }

  if (enemies.every((enemy) => enemy.hp <= 0)) {
    win(draft, exp, members, rng)
    return
  }

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue
    enemy.cooldown -= 1
    if (enemy.cooldown > 0) continue
    const kind = ENEMY_KINDS.find((entry) => entry.name === enemy.name)
    enemy.cooldown += kind?.attackSeconds ?? ATTACK_SECONDS

    const target = pickMember(members, exp.policy.stance, rng)
    if (!target) break
    strikeMember(exp, enemy, target, enemy.damage * stance.taken, rng)
  }

  if (members.every((member) => member.hp <= 0)) {
    wipe(draft, exp, rng)
    return
  }

  if (teamHealth(members) < exp.policy.retreatBelow) {
    retreat(draft, exp, members, enemies, rng)
  }
}

function strikeMember(
  exp: Expedition,
  enemy: Enemy,
  target: Character,
  base: number,
  rng: () => number,
): void {
  const damage = roll(base, rng)
  target.hp -= damage
  log(exp, {
    t: exp.t,
    kind: 'hit',
    attacker: enemy.name,
    target: target.name,
    damage,
    ours: false,
  })
  if (target.hp <= 0) down(exp, target)
}

function pickEnemy(
  enemies: Enemy[],
  stance: Expedition['policy']['stance'],
  rng: () => number,
): Enemy | undefined {
  const alive = enemies.filter((enemy) => enemy.hp > 0)
  if (alive.length === 0) return undefined
  if (stance === 'aggressive') {
    // Finish off the weakest: fewer enemies swinging, sooner.
    return alive.reduce((low, enemy) => (enemy.hp < low.hp ? enemy : low))
  }
  return alive[Math.floor(rng() * alive.length)]
}

function pickMember(
  members: Character[],
  stance: Expedition['policy']['stance'],
  rng: () => number,
): Character | undefined {
  const standing = members.filter((member) => member.hp > 0)
  if (standing.length === 0) return undefined
  if (stance === 'defensive' && rng() < 0.6) {
    // The sturdiest steps in front and draws most of the blows.
    return standing.reduce((best, member) =>
      member.hp > best.hp ? member : best,
    )
  }
  return standing[Math.floor(rng() * standing.length)]
}

function win(
  draft: GameState,
  exp: Expedition,
  members: Character[],
  rng: () => number,
): void {
  const supplies = exp.depth * 2 + Math.floor(rng() * 3)
  const oil = rng() < 0.25 ? 1 : 0
  exp.loot.supplies += supplies
  exp.loot.oil += oil
  log(exp, { t: exp.t, kind: 'victory', depth: exp.depth, supplies, oil })

  resolveDowned(draft, exp, rng)
  if (draft.expedition !== exp) return

  // Press on, or turn for home?
  const standing = membersOf(draft, exp)
  const hurt = teamHealth(standing) < exp.policy.retreatBelow + TURN_BACK_MARGIN
  const needed =
    TRAVEL_SECONDS +
    FIGHT_ESTIMATE_SECONDS +
    ((exp.depth + 1) * RETURN_SECONDS_PER_DEPTH) /
      RETURN_PACE[lightLevel(draft)] +
    PUSH_MARGIN[exp.policy.push]

  if (hurt || exp.light < needed) {
    log(exp, { t: exp.t, kind: 'turnBack', reason: hurt ? 'hurt' : 'oil' })
    goHome(exp)
  } else {
    for (const member of members) exp.cooldowns[member.id] = 0
    exp.phase = { kind: 'travel', remaining: TRAVEL_SECONDS }
  }
}

function retreat(
  draft: GameState,
  exp: Expedition,
  members: Character[],
  enemies: Enemy[],
  rng: () => number,
): void {
  log(exp, { t: exp.t, kind: 'retreat' })
  // Turning your back costs something: every enemy still up gets a parting blow.
  const stance = STANCE[exp.policy.stance]
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue
    const target = pickMember(members, exp.policy.stance, rng)
    if (!target) break
    strikeMember(exp, enemy, target, enemy.damage * stance.taken, rng)
  }
  exp.outcome = 'retreat'

  if (members.every((member) => member.hp <= 0)) {
    wipe(draft, exp, rng)
    return
  }
  resolveDowned(draft, exp, rng)
  if (draft.expedition === exp) goHome(exp)
}

function wipe(draft: GameState, exp: Expedition, rng: () => number): void {
  log(exp, { t: exp.t, kind: 'wipe' })
  exp.outcome = 'wipe'
  // Nobody is left on their feet to carry anything.
  exp.loot = { supplies: 0, oil: 0 }
  resolveDowned(draft, exp, rng)
  if (draft.expedition === exp) goHome(exp)
}

function goHome(exp: Expedition): void {
  exp.phase = {
    kind: 'returning',
    remaining: exp.depth * RETURN_SECONDS_PER_DEPTH,
  }
}

/** Each member downed since the last check learns whether they will live. */
function resolveDowned(
  draft: GameState,
  exp: Expedition,
  rng: () => number,
): void {
  for (const id of exp.unresolved) {
    const member = draft.roster.find((character) => character.id === id)
    if (!member) continue
    if (rng() < survivalChance(member)) {
      log(exp, { t: exp.t, kind: 'survived', name: member.name })
    } else {
      log(exp, { t: exp.t, kind: 'died', name: member.name })
      draft.roster = draft.roster.filter((character) => character.id !== id)
      exp.memberIds = exp.memberIds.filter((memberId) => memberId !== id)
      draft.fallen.push({
        id,
        name: member.name,
        expeditionId: exp.id,
        depth: exp.depth,
      })
    }
  }
  exp.unresolved = []
}

function comeHome(draft: GameState, exp: Expedition, rng: () => number): void {
  resolveDowned(draft, exp, rng)

  const outcome = exp.outcome ?? 'triumph'
  log(exp, {
    t: exp.t,
    kind: 'home',
    outcome,
    supplies: exp.loot.supplies,
    oil: exp.loot.oil,
  })

  const survivors = membersOf(draft, exp)
  for (const member of survivors) {
    // Carried home rather than walked: they will need time to mend.
    if (member.hp <= 0) {
      member.hp = 1
      member.injured = true
    }
  }

  draft.supplies += exp.loot.supplies
  draft.oil += exp.loot.oil

  const report: Report = {
    id: exp.id,
    names: exp.log[0]?.kind === 'depart' ? exp.log[0].names : [],
    outcome,
    depth: exp.depth,
    seconds: exp.t,
    supplies: exp.loot.supplies,
    oil: exp.loot.oil,
    dead: draft.fallen
      .filter((fallen) => fallen.expeditionId === exp.id)
      .map((fallen) => fallen.name),
    log: exp.log,
  }
  draft.reports = [report, ...draft.reports].slice(0, MAX_REPORTS)
  draft.expedition = null
}
