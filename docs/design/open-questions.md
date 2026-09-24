# Open Questions

A running list. Move items into the relevant doc once they're decided.

## Big

- **What happens when the town falls?** A hard game over, or a roguelite
  reset where the Keeper carries some knowledge and relics to a new
  lighthouse? (Leaning toward the roguelite reset.)
- **What does the overworld do?** See the options in
  [Overworld](07-overworld.md). Leaning toward outposts + siege camps + fog
  advance.
- **One pool vs. townsfolk/hero split?** One pool in the MVP. Revisit if the
  population needs to grow beyond ~20 people.
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
