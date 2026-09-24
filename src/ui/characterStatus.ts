import { maxHp } from '../game/rules'
import type { Character } from '../game/types'

export type CharacterStatus = 'ready' | 'injured' | 'away' | 'hurt' | 'down'

export function statusOf(
  character: Character,
  away: ReadonlySet<number>,
): CharacterStatus {
  if (away.has(character.id)) return 'away'
  if (character.injured) return 'injured'
  if (character.hp < maxHp(character)) return 'hurt'
  return 'ready'
}
