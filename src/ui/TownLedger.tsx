import { Stack, Text } from '@mantine/core'
import { formatSpan } from '../game/summary'
import type { TownEvent } from '../game/types'
import { TOWN_TONE_COLOR, describeTownEvent, townEventTone } from './townText'

/** The town's ledger, newest first. `t` is shown as time since the founding. */
export function TownLedger({
  events,
  limit,
}: {
  events: readonly TownEvent[]
  limit?: number
}) {
  const lines = [...events].reverse().slice(0, limit)
  return (
    <Stack gap={2}>
      {lines.map((event, index) => (
        <Text key={index} size="sm" c={TOWN_TONE_COLOR[townEventTone(event)]}>
          <Text span ff="monospace" c="dimmed" size="xs" mr="xs">
            {formatSpan(event.t)}
          </Text>
          {describeTownEvent(event)}
        </Text>
      ))}
    </Stack>
  )
}
