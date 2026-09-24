import { useState } from 'react'
import { Accordion, Badge, Card, Group, Switch, Text } from '@mantine/core'
import { formatClock } from '../game/summary'
import type { GameState } from '../game/types'
import { LogList } from './LogList'
import { OUTCOME_COLOR, OUTCOME_LABEL } from './logText'

export function ReportsView({ state }: { state: GameState }) {
  const [hideHits, setHideHits] = useState(true)

  if (state.reports.length === 0) {
    return (
      <Card withBorder padding="sm">
        <Text size="sm" c="dimmed">
          No expedition has come home yet. When one does, its story will be
          here.
        </Text>
      </Card>
    )
  }

  return (
    <>
      <Group justify="flex-end" mb="sm">
        <Switch
          size="xs"
          label="Every blow"
          checked={!hideHits}
          onChange={(event) => setHideHits(!event.currentTarget.checked)}
        />
      </Group>
      <Accordion variant="separated" defaultValue={String(state.reports[0].id)}>
        {state.reports.map((report) => (
          <Accordion.Item key={report.id} value={String(report.id)}>
            <Accordion.Control>
              <Group gap="xs" wrap="nowrap">
                <Badge color={OUTCOME_COLOR[report.outcome]}>
                  {OUTCOME_LABEL[report.outcome]}
                </Badge>
                <div>
                  <Text size="sm" fw={600}>
                    #{report.id}: {report.names.join(', ')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Depth {report.depth} · {formatClock(report.seconds)} ·{' '}
                    {report.supplies} supplies · {report.oil} oil
                    {report.dead.length > 0 &&
                      ` · lost ${report.dead.join(', ')}`}
                  </Text>
                </div>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <LogList log={report.log} hideHits={hideHits} />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  )
}
