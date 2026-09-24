import { Badge, Group, Progress, Stack, Text } from '@mantine/core'
import { maxHp } from '../game/rules'
import type { Character } from '../game/types'
import type { CharacterStatus } from './characterStatus'

const STATUS_BADGE: Record<CharacterStatus, { label: string; color: string }> =
  {
    ready: { label: 'Ready', color: 'green' },
    hurt: { label: 'Mending', color: 'lamp' },
    injured: { label: 'Injured', color: 'red' },
    away: { label: 'In the fog', color: 'gray' },
    down: { label: 'Down', color: 'red' },
  }

/** A person at a glance: stats, health, and whether they can go out. */
export function CharacterRow({
  character,
  status,
  right,
}: {
  character: Character
  status?: CharacterStatus
  /** Anything to show on the right-hand end, e.g. a checkbox. */
  right?: React.ReactNode
}) {
  const max = maxHp(character)
  const hp = Math.max(0, character.hp)
  const share = hp / max

  return (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Stack gap={4} flex={1}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap="xs" wrap="nowrap">
            <Text fw={600}>{character.name}</Text>
            {status && (
              <Badge size="sm" color={STATUS_BADGE[status].color}>
                {STATUS_BADGE[status].label}
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" ff="monospace">
            VIT {character.vitality} · STR {character.strength}
          </Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Progress.Root flex={1} size="sm">
            <Progress.Section
              value={share * 100}
              color={share < 0.34 ? 'red' : share < 0.67 ? 'lamp' : 'green'}
              aria-label={`${character.name} health`}
            />
          </Progress.Root>
          <Text size="xs" ff="monospace" c="dimmed" w={64} ta="right">
            {Math.floor(hp)}/{max}
          </Text>
        </Group>
      </Stack>
      {right}
    </Group>
  )
}
