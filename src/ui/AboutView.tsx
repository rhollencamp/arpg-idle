import { Anchor, Card, Divider, List, Stack, Text } from '@mantine/core'

const CREDITS = [
  { name: 'React', href: 'https://react.dev', role: 'UI runtime' },
  {
    name: 'Mantine',
    href: 'https://mantine.dev',
    role: 'components and theming',
  },
  { name: 'Vite', href: 'https://vite.dev', role: 'build tooling' },
  {
    name: 'vite-plugin-pwa',
    href: 'https://vite-pwa-org.netlify.app',
    role: 'offline support and the installable app',
  },
]

export function AboutView() {
  return (
    <Stack gap="md">
      <Card withBorder padding="sm">
        <Text fw={600}>The Last Lighthouse</Text>
        <Text size="sm" c="dimmed" mt={4}>
          A fog has swallowed the world, and something lives in it. Your town
          huddles around the last lighthouse still burning. Take in whoever
          finds the light, and send them into the fog for what the town needs.
          It keeps running while the tab is closed.
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          This is an early build: people have only Vitality and Strength, and
          there is one kind of expedition.
        </Text>
      </Card>

      <Card withBorder padding={0}>
        <Text fw={600} p="sm">
          Built with
        </Text>
        <Divider />
        <List spacing="xs" p="sm" listStyleType="none">
          {CREDITS.map((credit) => (
            <List.Item key={credit.name}>
              <Anchor href={credit.href} target="_blank" rel="noreferrer">
                {credit.name}
              </Anchor>
              <Text span size="sm" c="dimmed">
                {' '}
                — {credit.role}
              </Text>
            </List.Item>
          ))}
        </List>
      </Card>
    </Stack>
  )
}
