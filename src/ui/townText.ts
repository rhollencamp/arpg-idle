import type { TownEvent } from '../game/types'

/** Prose for one line of the town's ledger. */
export function describeTownEvent(event: TownEvent): string {
  switch (event.kind) {
    case 'lightOut':
      return 'The oil ran dry. The light went out.'
    case 'relit':
      return 'A flask from the press. The light burns again.'
    case 'arrived':
      return `${event.name} found the light and waits at the gate.`
    case 'waveSighted':
      return `Shapes in the fog: a wave is coming (strength ${event.strength}).`
    case 'repelled':
      return `The wave broke on the walls (${Math.round(event.defense)} against ${event.strength}). Scavenged ${event.spoils} supplies.`
    case 'breached':
      return `The wave broke through (${Math.round(event.defense)} against ${event.strength}). The walls took ${Math.round(event.wallDamage)} damage${event.suppliesLost ? ` and ${event.suppliesLost} supplies were lost` : ''}.`
    case 'fell':
      return `The walls gave way (${Math.round(event.defense)} against ${event.strength}). The light went out for good.`
  }
}

export function townEventTone(
  event: TownEvent,
): 'normal' | 'good' | 'bad' | 'warn' {
  switch (event.kind) {
    case 'repelled':
    case 'relit':
      return 'good'
    case 'breached':
    case 'fell':
    case 'lightOut':
      return 'bad'
    case 'waveSighted':
      return 'warn'
    default:
      return 'normal'
  }
}

export const TOWN_TONE_COLOR = {
  normal: undefined,
  good: 'green',
  bad: 'red',
  warn: 'lamp',
} as const
