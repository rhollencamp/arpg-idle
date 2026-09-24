import { createTheme } from '@mantine/core'

// Mantine is the theming layer: colours, typography, spacing and dark mode all
// come from here and Mantine's CSS custom properties. Reskin the game here.
//
// `colors.lamp` is the accent (lantern light). `colors.dark` is every
// dark-scheme surface, border and muted text — replacing that ramp is how the
// dark theme is reskinned. `black` is light-scheme body text.
export const theme = createTheme({
  primaryColor: 'lamp',
  primaryShade: { light: 7, dark: 5 },
  // Amber fills want dark text, not Mantine's default white.
  autoContrast: true,
  black: '#1d242c',
  colors: {
    lamp: [
      '#fff8e1',
      '#ffecb3',
      '#ffe082',
      '#ffd54f',
      '#ffca28',
      '#ffc107',
      '#ffb300',
      '#e89a0c',
      '#c97f06',
      '#a86400',
    ],
    // Fog at night. [0] body text, [4] borders, [5] hover, [6] cards, [7] page.
    dark: [
      '#c9d1d9',
      '#aab4bf',
      '#8b97a5',
      '#6c7a8a',
      '#4f5d6d',
      '#374452',
      '#222c37',
      '#161d25',
      '#10161c',
      '#0a0e12',
    ],
  },

  fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  headings: { fontWeight: '500' },

  components: {
    Progress: {
      styles: { root: { backgroundColor: 'var(--app-progress-track)' } },
    },
    // Bars are redrawn every tick; a width transition only makes them lag.
    ProgressRoot: { defaultProps: { transitionDuration: 0 } },
    Badge: { defaultProps: { variant: 'light', tt: 'none' } },
  },
})
