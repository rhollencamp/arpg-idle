# Open Questions

A running list. Move items into the relevant doc once they're decided.

## Big

- **Overworld details.** The direction is siege camps + outposts. Still open:
  how outposts cost oil to keep burning, how a camp's pressure feeds the
  siege, whether fog advance comes in too. See [Overworld](07-overworld.md).
- **Long-run motivation with a hard reset.** Without anything carrying over,
  what makes a second game feel different from the first? Candidates:
  seeded world variety, starting scenarios, difficulty options, a record of
  past lighthouses (honor roll only, no power carried over).
- **What is the fog?** Lore question. It doesn't block the MVP, but a
  long-term mystery helps motivate going deeper.

## Tuning / smaller

- Expedition length: is 5–10 min right? Should it be adjustable by policy
  (oil loadout) from the start? *(Current answer: yes, oil is the knob.)*
- Siege warning time: how much real time between the warning and the wave?
  Too short feels unfair offline. Too long removes the tension.
- Level cap and how fast XP comes, given permadeath.
- Should characters earn XP from town jobs?
- Gear durability: worth the friction?
- Should enemies keep hitting downed characters? (Cruel, but it gives
  Defensive/protect policies more weight.)
- Resource caps vs. unlimited storage while away.
- Hex vs. square grid for the overworld.
- Names: the game, the enemy creatures, archetypes, buildings.

## Decided (log)

| Decision | Choice |
| --- | --- |
| Theme | The Last Lighthouse: fog, light as the key resource |
| Combat | Tick-based, fully simulated, structured event log |
| Policies | Simple first (stances + retreat rules), gambits unlocked via the town tree |
| Loot | Mostly supplies. Useful gear is rare. Rule-based salvage. |
| Death | Permadeath for characters. The town can fall. |
| Platform | TypeScript browser game, installable PWA, desktop-friendly, truly idle (offline catch-up) |
| Expedition length | ~5–10 min, driven by oil loadout, policy-driven cadence later |
| Lantern oil, Lamplighter, downed-before-dead, stances-as-gambits, telegraphed siege, sea trade (later) | Accepted |
| Tech rules | Deterministic sim, separated from UI, seeded RNG, time passed in, headless balance harness |
| Town falls | **Hard reset.** Game over, nothing carries over. |
| Overworld | Siege camps + outposts as the core (iterate). Zone list in the MVP. |
| People | **One pool.** Every refugee is a named character who can fight or work. |
