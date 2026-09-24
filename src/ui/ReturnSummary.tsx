import {
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core'
import { formatDuration } from '../game/summary'
import type { AwaySummary } from '../game/summary'
import { OUTCOME_COLOR, OUTCOME_LABEL } from './logText'

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

          <Text size="sm" c="dimmed">
            {summary.stillOut
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
