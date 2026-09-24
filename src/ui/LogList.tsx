import { Stack, Text } from '@mantine/core'
import { formatClock } from '../game/summary'
import type { LogEvent } from '../game/types'
import { describe, tone } from './logText'

const COLOR = { dim: 'dimmed', normal: undefined, good: 'green', bad: 'red' }

/**
 * An expedition log, oldest first. `hideHits` drops the blow-by-blow so the
 * story reads at a glance.
 */
export function LogList({
  log,
  hideHits = false,
  newestFirst = false,
  limit,
}: {
  log: readonly LogEvent[]
  hideHits?: boolean
  newestFirst?: boolean
  limit?: number
}) {
  let lines = hideHits ? log.filter((event) => event.kind !== 'hit') : [...log]
  if (newestFirst) lines = lines.reverse()
  if (limit !== undefined) lines = lines.slice(0, limit)

  return (
    <Stack gap={2}>
      {lines.map((event, index) => (
        <Text
          key={index}
          size="sm"
          c={COLOR[tone(event)]}
          fw={event.kind === 'encounter' || event.kind === 'died' ? 600 : 400}
        >
          <Text span ff="monospace" c="dimmed" size="xs" mr="xs">
            {formatClock(event.t)}
          </Text>
          {describe(event)}
        </Text>
      ))}
    </Stack>
  )
}
