import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
} from '@mantine/core'
import {
  canReinforce,
  reinforceWalls,
  repairCost,
  repairWalls,
} from '../game/actions'
import { PRESSURE_MAX, reinforceCost } from '../game/rules'
import { formatClock, formatSpan } from '../game/summary'
import { defenseOf, pressureRate } from '../game/town'
import type { GameState } from '../game/types'

type Apply = (change: (state: GameState) => GameState) => void

/** The fog against the walls: the next wave, and what stands in its way. */
export function SiegeCard({
  state,
  apply,
}: {
  state: GameState
  apply: Apply
}) {
  const { siege, walls } = state
  const defense = defenseOf(state)
  const wave = siege.wave
  const holding = wave ? defense.total >= wave.strength : true
  const untilSighting = (PRESSURE_MAX - siege.pressure) / pressureRate(state)
  const cost = repairCost(state)
  const wallShare = walls.integrity / walls.max

  return (
    <Card withBorder padding={0}>
      <Group justify="space-between" p="sm">
        <Text fw={600}>The siege</Text>
        <Text size="sm" c="dimmed">
          {siege.repelled} of {siege.waves} waves thrown back
        </Text>
      </Group>
      <Divider />
      <Stack gap="xs" p="sm">
        {wave ? (
          <Alert
            color={holding ? 'lamp' : 'red'}
            variant="light"
            title={`A wave arrives in ${formatClock(wave.countdown)}`}
          >
            <Text size="sm">
              Strength {wave.strength} against your defense of{' '}
              {Math.round(defense.total)}.{' '}
              {holding
                ? 'The walls should hold.'
                : 'It will break through. Bring people home, repair the walls, or raise the light.'}
            </Text>
          </Alert>
        ) : (
          <>
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm">Fog pressing on the walls</Text>
              <Text size="sm" ff="monospace" c="dimmed">
                wave in ~{formatSpan(untilSighting)}
              </Text>
            </Group>
            <Progress.Root>
              <Progress.Section
                value={(siege.pressure / PRESSURE_MAX) * 100}
                color="gray"
                aria-label="Siege pressure"
              />
            </Progress.Root>
            <Text size="xs" c="dimmed">
              When it fills, a wave is sighted — then you have 30 minutes to get
              ready.
            </Text>
          </>
        )}
        <Text size="sm" c="dimmed">
          Defense {Math.round(defense.total)} = (walls{' '}
          {Math.round(defense.walls)} + people at home{' '}
          {Math.round(defense.people)}) × light {defense.light}
        </Text>
      </Stack>
      <Divider />
      <Stack gap="xs" p="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text>Walls</Text>
          <Text ff="monospace">
            {Math.floor(walls.integrity)} / {walls.max}
          </Text>
        </Group>
        <Progress.Root>
          <Progress.Section
            value={wallShare * 100}
            color={
              wallShare < 0.34 ? 'red' : wallShare < 0.67 ? 'lamp' : 'green'
            }
            aria-label="Wall integrity"
          />
        </Progress.Root>
        <Group gap="xs">
          <Button
            size="compact-sm"
            variant="light"
            disabled={cost === 0 || state.supplies === 0}
            onClick={() => apply(repairWalls)}
          >
            {cost === 0
              ? 'Walls whole'
              : `Repair (${Math.min(cost, state.supplies)} of ${cost} supplies)`}
          </Button>
          <Button
            size="compact-sm"
            variant="default"
            disabled={!canReinforce(state)}
            onClick={() => apply(reinforceWalls)}
          >
            Reinforce ({reinforceCost(walls.level)} supplies)
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          If a wave breaks through walls that cannot take the blow, the town
          falls — and that is the end of it.
        </Text>
      </Stack>
    </Card>
  )
}
