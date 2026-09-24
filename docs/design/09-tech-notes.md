# Tech Notes

These are only design constraints for now. No code yet.

## Stack (leaning)

- **TypeScript**, strict mode.
- **Vite** for building and dev server. `vite-plugin-pwa` (Workbox) for the
  service worker and manifest.
- **UI:** the UI is mostly menus, lists, and text, so any light framework
  works (Preact, Solid, Svelte, or plain DOM with a tiny state store). To be
  decided when we start coding.
- **Tests:** Vitest. The simulation is pure logic, so it's easy to test
  thoroughly.

## Architecture principles

1. **Simulation is separate from UI.** The simulation is a pure TypeScript
   module with no DOM access: `(state, input, elapsed) → (newState, events)`.
   The UI only reads state and sends commands.
2. **Deterministic.** All randomness comes from a seeded PRNG (e.g.
   xoshiro/mulberry32) that is stored in the save file. No `Math.random()`, and
   no `Date.now()` inside the simulation. Time is always passed in. This gives
   us:
   - offline catch-up that matches leaving the tab open,
   - reproducible bugs (seed + inputs = replay),
   - a balance harness that can run huge numbers of expeditions headless
     (Node).
3. **Game data lives in data files.** Archetypes, skills, enemies, affixes,
   buildings, and zones are declared as typed data (TS objects or JSON), not
   hardcoded in logic. This makes balancing and adding content cheap.
4. **Structured event log.** Combat and town produce typed events. Text for
   the log is rendered from events with templates, so the UI can summarize,
   filter, and localize them.
5. **Everything is gambits internally.** Stances and simple policies compile
   down to gambit lists. There is one decision engine.

## Time & offline catch-up

- The save stores `lastSimulatedAt` (wall-clock time).
- On load or tab focus: `elapsed = now − lastSimulatedAt`, then advance the
  simulation step by step. Order matters: expedition ticks and town steps run
  interleaved in timestamp order (e.g., a team coming home lands before a
  siege wave that happens later).
- Long absences: town steps are cheap. If they ever become slow, run
  catch-up in a **Web Worker** with a progress bar ("The Keeper reads the
  ledger...").
- **Clock tampering:** it's single-player and local, so don't fight it much.
  At most, clamp negative elapsed time and cap catch-up at something generous
  like 7 days.

## Persistence

- **IndexedDB** (via a small wrapper like `idb-keyval`) for the save.
  `localStorage` is too small and synchronous.
- Autosave after every command and every N town steps.
- A **versioned save schema** with migrations from day one.
- Export/import the save as a file (backups, moving between devices).
- Ask for `navigator.storage.persist()` so the browser is less likely to
  evict the save.

## PWA notes

- Offline-first: every asset is precached, and the game needs no network.
- Background execution isn't available (browsers don't run the tab in the
  background). That's fine: we catch up on load, and the design already
  assumes it.
- Notifications ("the team has returned") would need a push server or a
  scheduled-notification API that browsers don't widely support. **Leave
  them out of the MVP.** On load, show a "while you were away" summary instead.
