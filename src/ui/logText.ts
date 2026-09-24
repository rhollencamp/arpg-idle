import type { LogEvent, Outcome } from '../game/types'

export const OUTCOME_LABEL: Record<Outcome, string> = {
  triumph: 'Returned',
  retreat: 'Retreated',
  wipe: 'Overwhelmed',
}

export const OUTCOME_COLOR: Record<Outcome, string> = {
  triumph: 'green',
  retreat: 'yellow',
  wipe: 'red',
}

function list(names: readonly string[]): string {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

/** Groups "Murkling, Murkling, Hollow" into "2 Murklings and a Hollow". */
function pack(enemies: readonly string[]): string {
  const counts = new Map<string, number>()
  for (const name of enemies) counts.set(name, (counts.get(name) ?? 0) + 1)
  return list(
    [...counts].map(([name, count]) =>
      count === 1 ? `a ${name}` : `${count} ${name}s`,
    ),
  )
}

/** Prose for one log line. The sim records facts; the telling lives here. */
export function describe(event: LogEvent): string {
  switch (event.kind) {
    case 'depart':
      return `${list(event.names)} set out with ${event.flasks} flask${event.flasks === 1 ? '' : 's'} of oil.`
    case 'encounter':
      return `Depth ${event.depth}: ${pack(event.enemies)} loom out of the fog.`
    case 'hit':
      return `${event.attacker} hits ${event.target} for ${event.damage}.`
    case 'slain':
      return `The ${event.name} falls.`
    case 'downed':
      return `${event.name} goes down!`
    case 'victory':
      return `The way is clear. Found ${event.supplies} supplies${event.oil ? ` and ${event.oil} flask of oil` : ''}.`
    case 'retreat':
      return 'Too hurt to go on — they break off and run.'
    case 'wipe':
      return 'Every one of them is down. Whatever they carried is lost.'
    case 'turnBack':
      return event.reason === 'oil'
        ? 'The lanterns are running low. They turn for home.'
        : 'Bloodied, they turn for home.'
    case 'dark':
      return 'The last lantern gutters out. The fog closes in.'
    case 'died':
      return `${event.name} does not get up.`
    case 'survived':
      return `${event.name} is alive, barely. The others carry them.`
    case 'home':
      return event.outcome === 'wipe'
        ? 'The survivors crawl back into the light.'
        : `Home, with ${event.supplies} supplies and ${event.oil} oil.`
  }
}

/** How loudly a line should read. Blow-by-blow hits sit in the background. */
export function tone(event: LogEvent): 'dim' | 'normal' | 'good' | 'bad' {
  switch (event.kind) {
    case 'hit':
    case 'slain':
      return 'dim'
    case 'victory':
    case 'survived':
      return 'good'
    case 'downed':
    case 'died':
    case 'wipe':
    case 'dark':
    case 'retreat':
      return 'bad'
    default:
      return 'normal'
  }
}
