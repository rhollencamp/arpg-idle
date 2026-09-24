import {
  Badge,
  Card,
  Divider,
  Group,
  Progress,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core'
import { setBrightness } from '../game/actions'
import {
  LIGHT_BURN_PER_SECOND,
  LIGHT_DEFENSE,
  OIL_CAP,
  PRESSURE_MULTIPLIER,
  RELIGHT_AT,
  RETURN_PACE,
  WAVE_WARNING_SECONDS,
} from '../game/rules'
import { formatSpan } from '../game/summary'
import { lightLevel, oilRate, refugeeInterval } from '../game/town'
import type { Brightness, GameState } from '../game/types'

type Apply = (change: (state: GameState) => GameState) => void

const LEVEL_LABEL = {
  out: 'Out',
  low: 'Low',
  steady: 'Steady',
  bright: 'Bright',
} as const

function Effect({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm">{label}</Text>
      <Text size="sm" ff="monospace">
        {value}
      </Text>
    </Group>
  )
}

/** The lamp: how bright it burns, what that costs, and what it buys. */
export function LighthouseCard({
  state,
  apply,
}: {
  state: GameState
  apply: Apply
}) {
  const level = lightLevel(state)
  const perMinute = oilRate(state) * 60
  const interval = refugeeInterval(state)
  const burn = LIGHT_BURN_PER_SECOND[state.brightness] * 60
  const draining = perMinute < -1e-9

  return (
    <Card withBorder padding={0}>
      <Group justify="space-between" p="sm">
        <Text fw={600}>The lighthouse</Text>
        <Badge color={level === 'out' ? 'red' : 'lamp'}>
          {LEVEL_LABEL[level]}
        </Badge>
      </Group>
      <Divider />
      <Stack gap="xs" p="sm">
        <SegmentedControl
          fullWidth
          value={state.brightness}
          onChange={(value) =>
            apply((s) => setBrightness(s, value as Brightness))
          }
          data={[
            { value: 'low', label: 'Low' },
            { value: 'steady', label: 'Steady' },
            { value: 'bright', label: 'Bright' },
          ]}
        />
        <Text size="sm" c="dimmed">
          The light draws everything in: the lost, and the things that hunt
          them. Burns {burn.toFixed(2)} flasks a minute.
        </Text>
        <Stack gap={2}>
          <Effect
            label="Refugees"
            value={interval !== null ? `every ${formatSpan(interval)}` : 'none'}
          />
          <Effect
            label="Waves come"
            value={`×${PRESSURE_MULTIPLIER[level]} as often`}
          />
          <Effect
            label="Warning before a wave"
            value={
              WAVE_WARNING_SECONDS[level] > 0
                ? formatSpan(WAVE_WARNING_SECONDS[level])
                : 'none'
            }
          />
          <Effect
            label="Defenders fight at"
            value={`×${LIGHT_DEFENSE[level]}`}
          />
          <Effect
            label="Teams find their way home at"
            value={`×${RETURN_PACE[level]} pace`}
          />
        </Stack>
        {level === 'out' && (
          <Text size="sm" c="red">
            The light is out. Nobody can find the town, a wave would be on the
            walls before anyone saw it, and teams in the fog grope home blind.
            It relights once the press has made {RELIGHT_AT} flask.
          </Text>
        )}
      </Stack>
      <Divider />
      <Stack gap="xs" p="sm">
        <Group justify="space-between" align="baseline" wrap="nowrap">
          <Text>Lantern oil</Text>
          <Group gap="xs" wrap="nowrap">
            <Text ff="monospace">
              {state.oil.toFixed(1)} / {OIL_CAP}
            </Text>
            <Badge ff="monospace" color={draining ? 'red' : undefined}>
              {perMinute >= 0 ? '+' : ''}
              {perMinute.toFixed(2)}/min
            </Badge>
          </Group>
        </Group>
        <Progress.Root>
          <Progress.Section
            value={(Math.min(state.oil, OIL_CAP) / OIL_CAP) * 100}
            color={draining ? 'red' : undefined}
            aria-label="Oil in the store"
          />
        </Progress.Root>
        <Text size="sm" c="dimmed">
          {draining
            ? `The lamp burns more than the press makes. Dry in about ${formatSpan(
                state.oil / -oilRate(state),
              )}.`
            : 'The press makes a flask every 2:30. The lamp and every expedition drink from the same store.'}
        </Text>
      </Stack>
      <Divider />
      <Group justify="space-between" align="baseline" p="sm" wrap="nowrap">
        <Text>Supplies</Text>
        <Text ff="monospace">{state.supplies}</Text>
      </Group>
    </Card>
  )
}
