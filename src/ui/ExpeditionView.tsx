import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Progress,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text,
} from '@mantine/core'
import { awayIds, canDepart, depart, setPolicy } from '../game/actions'
import { LIGHT_PER_FLASK, MAX_FLASKS, MAX_TEAM, canBeSent } from '../game/rules'
import { formatClock } from '../game/summary'
import { defenseOf } from '../game/town'
import type {
  Expedition,
  GameState,
  Policy,
  Push,
  Report,
  Stance,
} from '../game/types'
import { CharacterRow } from './CharacterRow'
import { statusOf } from './characterStatus'
import { LogList } from './LogList'
import { OUTCOME_COLOR, OUTCOME_LABEL } from './logText'

type Apply = (change: (state: GameState) => GameState) => void

const STANCE_HELP: Record<Stance, string> = {
  aggressive: 'Hit harder and finish the weakest enemy first — but guard less.',
  balanced: 'No particular plan. Swing at whatever is closest.',
  defensive:
    'Hit softer; the sturdiest steps in front and takes most of the blows.',
}

const PUSH_HELP: Record<Push, string> = {
  cautious: 'Turn back with a minute of light to spare.',
  normal: 'Turn back with half a minute of light to spare.',
  reckless: 'Press on while there is any light left to get home by.',
}

export function ExpeditionView({
  state,
  apply,
  onOpenReports,
}: {
  state: GameState
  apply: Apply
  onOpenReports: () => void
}) {
  return state.expedition ? (
    <ActiveExpedition state={state} expedition={state.expedition} />
  ) : (
    <PlanExpedition state={state} apply={apply} onOpenReports={onOpenReports} />
  )
}

function PlanExpedition({
  state,
  apply,
  onOpenReports,
}: {
  state: GameState
  apply: Apply
  onOpenReports: () => void
}) {
  const away = awayIds(state)
  const sendable = state.roster.filter((c) => canBeSent(c, away))
  const [picked, setPicked] = useState<number[]>(() =>
    sendable.slice(0, MAX_TEAM).map((c) => c.id),
  )
  // Only people who can still go count, so someone who was picked and has
  // since been hurt or lost drops out of the team on their own.
  const team = picked.filter((id) => sendable.some((c) => c.id === id))
  const policy = state.policy
  const available = Math.floor(state.oil)
  const flasks = Math.min(policy.flasks, Math.max(1, available))
  const plan: Policy = { ...policy, flasks }

  const update = (change: Partial<Policy>) =>
    apply((s) => setPolicy(s, { ...s.policy, ...change }))

  const toggle = (id: number) =>
    setPicked((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current.filter((entry) => team.includes(entry)), id],
    )

  const ready = canDepart(state, team, plan)
  const last = state.reports[0]
  const wave = state.siege.wave
  const defenseLeft = defenseOf(state, team).total
  const oilLeft = state.oil - flasks

  return (
    <Stack gap="md">
      {last && <LastReport report={last} onOpen={onOpenReports} />}

      <Card withBorder padding={0}>
        <Group justify="space-between" p="sm">
          <Text fw={600}>Team</Text>
          <Text size="sm" c="dimmed">
            {team.length} / {MAX_TEAM}
          </Text>
        </Group>
        {state.roster.map((character) => {
          const can = canBeSent(character, away)
          const checked = team.includes(character.id)
          return (
            <div key={character.id}>
              <Divider />
              <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
                <CharacterRow
                  character={character}
                  status={statusOf(character, away)}
                  right={
                    <Checkbox
                      aria-label={`Send ${character.name}`}
                      checked={checked}
                      disabled={!can || (!checked && team.length >= MAX_TEAM)}
                      onChange={() => toggle(character.id)}
                    />
                  }
                />
              </div>
            </div>
          )
        })}
        <Divider />
        <Text size="sm" c="dimmed" p="sm">
          The injured cannot go until they have fully healed. The merely bruised
          can go, with what health they have.
        </Text>
      </Card>

      <Card withBorder padding={0}>
        <Text fw={600} p="sm">
          Orders
        </Text>
        <Divider />
        <Stack gap="lg" p="sm">
          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={600}>
                Oil
              </Text>
              <Text size="sm" ff="monospace">
                {flasks} flask{flasks === 1 ? '' : 's'} ·{' '}
                {formatClock(flasks * LIGHT_PER_FLASK)} of light
              </Text>
            </Group>
            <Slider
              min={1}
              max={MAX_FLASKS}
              value={flasks}
              onChange={(value) =>
                update({ flasks: Math.min(value, Math.max(1, available)) })
              }
              label={null}
              marks={[{ value: 1 }, { value: 5 }, { value: MAX_FLASKS }]}
            />
            <Text size="xs" c="dimmed" mt="xs">
              {available} in the store. More oil means a longer, deeper trip —
              and the walk home burns it too.
            </Text>
          </div>

          <div>
            <Text size="sm" fw={600} mb={4}>
              Stance
            </Text>
            <SegmentedControl
              fullWidth
              value={policy.stance}
              onChange={(value) => update({ stance: value as Stance })}
              data={[
                { value: 'aggressive', label: 'Aggressive' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'defensive', label: 'Defensive' },
              ]}
            />
            <Text size="xs" c="dimmed" mt="xs">
              {STANCE_HELP[policy.stance]}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={600} mb={4}>
              Push
            </Text>
            <SegmentedControl
              fullWidth
              value={policy.push}
              onChange={(value) => update({ push: value as Push })}
              data={[
                { value: 'cautious', label: 'Cautious' },
                { value: 'normal', label: 'Normal' },
                { value: 'reckless', label: 'Reckless' },
              ]}
            />
            <Text size="xs" c="dimmed" mt="xs">
              {PUSH_HELP[policy.push]}
            </Text>
          </div>

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={600}>
                Retreat
              </Text>
              <Text size="sm" ff="monospace">
                below {Math.round(policy.retreatBelow * 100)}% health
              </Text>
            </Group>
            <Slider
              min={0.1}
              max={0.7}
              step={0.05}
              value={policy.retreatBelow}
              onChange={(value) => update({ retreatBelow: value })}
              label={null}
            />
            <Text size="xs" c="dimmed" mt="xs">
              Mid-fight, they flee once the team's health drops below this —
              taking a parting blow from everything still standing. Set it low
              and more of them will fall.
            </Text>
          </div>
        </Stack>
      </Card>

      {team.length > 0 && (
        <Alert
          variant="light"
          color={
            wave && defenseLeft < wave.strength
              ? 'red'
              : oilLeft < 1
                ? 'lamp'
                : 'gray'
          }
        >
          <Text size="sm">
            {wave
              ? `A wave (strength ${wave.strength}) arrives in ${formatClock(
                  wave.countdown,
                )}. With this team away, the town's defense is ${Math.round(
                  defenseLeft,
                )}${defenseLeft < wave.strength ? ' — not enough.' : '.'}`
              : `With this team away, the town's defense is ${Math.round(
                  defenseLeft,
                )}. No wave has been sighted yet.`}{' '}
            {oilLeft < 1
              ? 'Taking this much oil leaves the lamp dry — the light will go out.'
              : `Leaves ${oilLeft.toFixed(1)} flasks for the lamp.`}
          </Text>
        </Alert>
      )}

      <Button
        size="md"
        disabled={!ready}
        onClick={() => apply((s) => depart(s, team, plan))}
      >
        {team.length === 0
          ? 'Choose who goes'
          : available < 1
            ? 'Not enough oil'
            : 'Send them into the fog'}
      </Button>
    </Stack>
  )
}

function LastReport({
  report,
  onOpen,
}: {
  report: Report
  onOpen: () => void
}) {
  return (
    <Card withBorder padding="sm">
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Group gap="xs">
            <Text fw={600}>Last expedition</Text>
            <Badge color={OUTCOME_COLOR[report.outcome]}>
              {OUTCOME_LABEL[report.outcome]}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Depth {report.depth} · {report.supplies} supplies · {report.oil} oil
            {report.dead.length > 0 && ` · lost ${report.dead.join(', ')}`}
          </Text>
        </div>
        <Button size="compact-sm" variant="light" onClick={onOpen}>
          Read
        </Button>
      </Group>
    </Card>
  )
}

function phaseText(exp: Expedition): string {
  switch (exp.phase.kind) {
    case 'travel':
      return `Walking to depth ${exp.depth + 1}`
    case 'fight':
      return `Fighting at depth ${exp.depth}`
    case 'returning':
      return 'Heading home'
  }
}

function ActiveExpedition({
  state,
  expedition,
}: {
  state: GameState
  expedition: Expedition
}) {
  const [hideHits, setHideHits] = useState(true)
  const members = state.roster.filter((c) =>
    expedition.memberIds.includes(c.id),
  )
  const total = expedition.policy.flasks * LIGHT_PER_FLASK
  const lightShare = expedition.light / total
  const enemies =
    expedition.phase.kind === 'fight'
      ? expedition.phase.enemies.filter((enemy) => enemy.hp > 0)
      : []

  return (
    <Stack gap="md">
      <Card withBorder padding={0}>
        <Group justify="space-between" p="sm" wrap="nowrap">
          <Text fw={600}>{phaseText(expedition)}</Text>
          <Text ff="monospace" size="sm" c="dimmed">
            {formatClock(expedition.t)}
          </Text>
        </Group>
        <Divider />
        <Stack gap="xs" p="sm">
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm">Lantern light</Text>
            <Text
              size="sm"
              ff="monospace"
              c={lightShare === 0 ? 'red' : undefined}
            >
              {expedition.light === 0
                ? 'dark'
                : `${formatClock(expedition.light)} left`}
            </Text>
          </Group>
          <Progress.Root>
            <Progress.Section
              value={lightShare * 100}
              aria-label="Light left"
            />
          </Progress.Root>
          <Text size="sm" c="dimmed">
            Carrying {expedition.loot.supplies} supplies and{' '}
            {expedition.loot.oil} oil. Orders: {expedition.policy.stance},{' '}
            {expedition.policy.push}, retreat below{' '}
            {Math.round(expedition.policy.retreatBelow * 100)}%.
          </Text>
        </Stack>
      </Card>

      <Card withBorder padding={0}>
        <Text fw={600} p="sm">
          Team
        </Text>
        {members.map((character) => (
          <div key={character.id}>
            <Divider />
            <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
              <CharacterRow
                character={character}
                status={character.hp <= 0 ? 'down' : undefined}
              />
            </div>
          </div>
        ))}
      </Card>

      {enemies.length > 0 && (
        <Card withBorder padding={0}>
          <Text fw={600} p="sm">
            In the fog
          </Text>
          {enemies.map((enemy, index) => (
            <div key={index}>
              <Divider />
              <Group p="sm" gap="sm" wrap="nowrap">
                <Text size="sm" w={120}>
                  {enemy.name}
                </Text>
                <Progress.Root flex={1} size="sm">
                  <Progress.Section
                    value={(enemy.hp / enemy.maxHp) * 100}
                    color="red"
                    aria-label={`${enemy.name} health`}
                  />
                </Progress.Root>
                <Text size="xs" ff="monospace" c="dimmed" w={64} ta="right">
                  {enemy.hp}/{enemy.maxHp}
                </Text>
              </Group>
            </div>
          ))}
        </Card>
      )}

      <Card withBorder padding={0}>
        <Group justify="space-between" p="sm">
          <Text fw={600}>Log</Text>
          <Switch
            size="xs"
            label="Every blow"
            checked={!hideHits}
            onChange={(event) => setHideHits(!event.currentTarget.checked)}
          />
        </Group>
        <Divider />
        <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
          <LogList
            log={expedition.log}
            hideHits={hideHits}
            newestFirst
            limit={80}
          />
        </div>
      </Card>
    </Stack>
  )
}
