/**
 * The screens the drawer switches between. There is no router — a single
 * `View` in `App` is the whole navigation model, which keeps the game mounted
 * (and ticking) behind whichever screen is showing.
 */
export const VIEWS = [
  { key: 'town', label: 'Town', title: 'The Last Lighthouse' },
  { key: 'expedition', label: 'Expedition', title: 'Expedition' },
  { key: 'reports', label: 'Reports', title: 'Reports' },
  { key: 'save', label: 'Save', title: 'Save' },
  { key: 'settings', label: 'Settings', title: 'Settings' },
  { key: 'about', label: 'About', title: 'About' },
] as const

export type View = (typeof VIEWS)[number]['key']

export function viewTitle(view: View): string {
  return (
    VIEWS.find((entry) => entry.key === view)?.title ?? 'The Last Lighthouse'
  )
}
