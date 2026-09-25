import { Button, Card, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { formatSpan } from '../game/summary'
import type { GameState, Lost } from '../game/types'
import { TownLedger } from './TownLedger'

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm">{label}</Text>
      <Text ff="monospace">{value}</Text>
    </Group>
  )
}

/**
 * The end. A fallen town is a hard reset: nothing carries over, so this is
 * its epitaph, and the only way forward is a new fire somewhere else.
 */
export function LostView({
  state,
  lost,
  onRestart,
}: {
  state: GameState
  lost: Lost
  onRestart: () => void
}) {
  return (
    <Stack gap="md">
      <div>
        <Title order={2}>The light guttered out.</Title>
        <Text c="dimmed" mt="xs">
          The walls gave way and the fog came in. It burned for{' '}
          {formatSpan(lost.elapsed)}.
        </Text>
      </div>

      <Card withBorder padding="sm">
        <Stack gap={4}>
          <Line label="The light burned for" value={formatSpan(lost.elapsed)} />
          <Line
            label="Waves thrown back"
            value={`${lost.repelled} of ${lost.waves}`}
          />
          <Line label="People taken in" value={String(lost.takenIn)} />
          <Line label="Expeditions sent" value={String(lost.expeditions)} />
          <Line label="Lost in the fog" value={String(state.fallen.length)} />
        </Stack>
      </Card>

      {state.fallen.length > 0 && (
        <Card withBorder padding="sm">
          <Text fw={600}>Remembered</Text>
          <Text size="sm" c="dimmed" mt={4}>
            {state.fallen.map((fallen) => fallen.name).join(', ')}
          </Text>
        </Card>
      )}

      <Card withBorder padding={0}>
        <Text fw={600} p="sm">
          The last of the ledger
        </Text>
        <Divider />
        <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
          <TownLedger events={state.townLog} limit={10} />
        </div>
      </Card>

      <Button size="md" onClick={onRestart}>
        Light a new fire
      </Button>
      <Text size="xs" c="dimmed" ta="center">
        Nothing carries over. Export this save first from the menu if you want
        to keep it.
      </Text>
    </Stack>
  )
}
