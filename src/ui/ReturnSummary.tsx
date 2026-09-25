import {
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core'
import { formatClock, formatDuration } from '../game/summary'
import type { AwaySummary } from '../game/summary'
import { OUTCOME_COLOR, OUTCOME_LABEL } from './logText'
import { TownLedger } from './TownLedger'

function signed(value: number, digits = 0): string {
  const rounded = Number(value.toFixed(digits)) || 0
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(digits)}`
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" align="baseline" wrap="nowrap">
      <Text size="sm">{label}</Text>
      <Text ff="monospace">{value}</Text>
    </Group>
  )
}

/** What happened while nobody was watching. Read once, then dismissed. */
export function ReturnSummary({
  summary,
  onDismiss,
}: {
  summary: AwaySummary | null
  onDismiss: () => void
}) {
  return (
    <Modal
      opened={summary !== null}
      onClose={onDismiss}
      title="While you were away"
      centered
      withCloseButton={false}
      yOffset="max(5dvh, env(safe-area-inset-top), env(safe-area-inset-bottom))"
      xOffset="max(5vw, env(safe-area-inset-left), env(safe-area-inset-right))"
    >
      {summary && (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            You were gone about {formatDuration(summary.awayMs)}.
          </Text>

          {summary.reports.map((report) => (
            <Group key={report.id} gap="xs" wrap="nowrap" align="flex-start">
              <Badge color={OUTCOME_COLOR[report.outcome]}>
                {OUTCOME_LABEL[report.outcome]}
              </Badge>
              <Text size="sm">
                {report.names.join(', ')} reached depth {report.depth} and
                brought back {report.supplies} supplies.
              </Text>
            </Group>
          ))}

          {summary.lost && (
            <Text size="sm" c="red" fw={600}>
              The town fell while you were away.
            </Text>
          )}

          {summary.events.length > 0 && (
            <>
              <Divider label="The ledger" labelPosition="left" />
              <div style={{ maxHeight: '30vh', overflowY: 'auto' }}>
                <TownLedger events={summary.events} limit={20} />
              </div>
            </>
          )}

          {summary.fallen.length > 0 && (
            <Text size="sm" c="red">
              Lost: {summary.fallen.map((fallen) => fallen.name).join(', ')}.
            </Text>
          )}

          <Divider />
          <Stack gap={4}>
            <Line label="Oil" value={signed(summary.oil, 1)} />
            <Line label="Supplies" value={signed(summary.supplies)} />
            <Line
              label="Refugees at the gate"
              value={summary.arrivals === 0 ? 'none' : `+${summary.arrivals}`}
            />
          </Stack>

          {summary.wave && !summary.lost && (
            <Text size="sm" c="lamp">
              A wave (strength {summary.wave.strength}) arrives in{' '}
              {formatClock(summary.wave.countdown)}.
            </Text>
          )}

          <Text size="sm" c={summary.lightOut ? 'red' : 'dimmed'}>
            {summary.lost
              ? 'There is nothing left to defend.'
              : summary.lightOut
                ? 'The light is out. The press will relight it, slowly.'
                : summary.stillOut
                  ? 'A team is still out in the fog.'
                  : 'The light kept burning.'}
          </Text>

          <Button onClick={onDismiss} mt="xs" fullWidth>
            Back to the lighthouse
          </Button>
        </Stack>
      )}
    </Modal>
  )
}
