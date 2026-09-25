import { Badge, Button, Card, Divider, Group, Stack, Text } from '@mantine/core'
import { awayIds, canTakeIn, takeIn, turnAway } from '../game/actions'
import { GATE_CAP, ROSTER_CAP, TAKE_IN_COST, maxHp } from '../game/rules'
import { formatSpan } from '../game/summary'
import { refugeeInterval } from '../game/town'
import type { GameState } from '../game/types'
import { CharacterRow } from './CharacterRow'
import { LighthouseCard } from './LighthouseCard'
import { SiegeCard } from './SiegeCard'
import { TownLedger } from './TownLedger'
import { statusOf } from './characterStatus'

export function TownView({
  state,
  apply,
  onOpenExpedition,
}: {
  state: GameState
  apply: (change: (state: GameState) => GameState) => void
  onOpenExpedition: () => void
}) {
  const away = awayIds(state)
  const gateFull = state.gate.length >= GATE_CAP
  const interval = refugeeInterval(state)

  return (
    <Stack gap="md">
      {state.expedition && (
        <Card withBorder padding="sm">
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm">
              A team is out in the fog — depth {state.expedition.depth}.
            </Text>
            <Button
              size="compact-sm"
              variant="light"
              onClick={onOpenExpedition}
            >
              Watch
            </Button>
          </Group>
        </Card>
      )}

      <LighthouseCard state={state} apply={apply} />
      <SiegeCard state={state} apply={apply} />

      <Card withBorder padding={0}>
        <Group justify="space-between" p="sm">
          <Text fw={600}>The gate</Text>
          {state.gate.length > 0 && (
            <Badge color="lamp">{state.gate.length} waiting</Badge>
          )}
        </Group>
        {state.gate.map((refugee) => (
          <div key={refugee.id}>
            <Divider />
            <Group justify="space-between" p="sm" wrap="nowrap">
              <div>
                <Text fw={600}>{refugee.name}</Text>
                <Text size="sm" c="dimmed" ff="monospace">
                  VIT {refugee.vitality} · STR {refugee.strength} ·{' '}
                  {maxHp(refugee)} HP
                </Text>
              </div>
              <Group gap="xs" wrap="nowrap">
                <Button
                  size="compact-sm"
                  disabled={!canTakeIn(state)}
                  onClick={() => apply((s) => takeIn(s, refugee.id))}
                >
                  Take in ({TAKE_IN_COST})
                </Button>
                <Button
                  size="compact-sm"
                  variant="default"
                  onClick={() => apply((s) => turnAway(s, refugee.id))}
                >
                  Turn away
                </Button>
              </Group>
            </Group>
          </div>
        ))}
        <Divider />
        <Text size="sm" c="dimmed" p="sm">
          {gateFull
            ? 'The gate is crowded. Nobody else will come until you decide.'
            : interval === null
              ? 'Nobody can find the town while the light is out.'
              : `Someone should see the light in about ${formatSpan(
                  (1 - state.refugeeProgress) * interval,
                )}.`}
          {state.roster.length >= ROSTER_CAP &&
            ' There is no room left in town.'}
        </Text>
      </Card>

      <Card withBorder padding={0}>
        <Group justify="space-between" p="sm">
          <Text fw={600}>Your people</Text>
          <Text size="sm" c="dimmed">
            {state.roster.length} / {ROSTER_CAP}
          </Text>
        </Group>
        {state.roster.map((character) => (
          <div key={character.id}>
            <Divider />
            <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
              <CharacterRow
                character={character}
                status={statusOf(character, away)}
              />
            </div>
          </div>
        ))}
        {state.roster.length === 0 && (
          <>
            <Divider />
            <Text size="sm" c="dimmed" p="sm">
              Nobody is left. The light burns on for whoever comes next.
            </Text>
          </>
        )}
      </Card>

      {state.townLog.length > 0 && (
        <Card withBorder padding={0}>
          <Text fw={600} p="sm">
            Ledger
          </Text>
          <Divider />
          <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
            <TownLedger events={state.townLog} limit={15} />
          </div>
        </Card>
      )}

      {state.fallen.length > 0 && (
        <Card withBorder padding={0}>
          <Text fw={600} p="sm">
            The fallen
          </Text>
          <Divider />
          <Stack gap={2} p="sm">
            {state.fallen.map((fallen) => (
              <Text key={fallen.id} size="sm" c="dimmed">
                {fallen.name} — lost at depth {fallen.depth}, expedition{' '}
                {fallen.expeditionId}
              </Text>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
