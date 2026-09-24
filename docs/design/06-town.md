# Town

The town is the long-term progress and the long-term risk. Characters come and
go (and die). The town is what you're really building, and what can be lost.

## The lighthouse

> v0 status: brightness, light-out, siege, walls and the fall are built. See
> [MVP scope](08-mvp-scope.md#v0-whats-built-now) for the numbers.

The center of everything. It has two numbers:

- **Brightness:** how much oil it burns per town step. Brighter light means:
  - the fog is pushed back further (the safe radius on the
    [Overworld](07-overworld.md)),
  - **more refugees** see it and find their way in,
  - siege pressure builds more slowly.
- **Lighthouse level:** upgraded with materials and relic shards. Raises the
  max brightness and makes burning more efficient.

If the lighthouse runs out of oil, **the light goes out**: siege pressure
spikes, refugees stop arriving, and it's the most urgent crisis the town can
have. The lighthouse and expedition lanterns draw from the same oil supply.
That shared supply is where the main tension of the game comes from.

## Siege

The things in the fog press against the town.

- **Siege pressure** builds every town step. Low brightness makes it build
  faster, and things like cleared siege camps (later) make it build slower.
- When pressure crosses a threshold, a **wave** is scheduled. It's **visible
  ahead of time**, with a countdown (in the MVP, at least ~30–60 minutes of
  real-time warning). The fog visibly thickens.
- A wave is resolved against **town defense** = walls + guards (characters
  assigned to the wall) + brightness bonus. It could be
  simulated with the same combat engine, where guards fight at the wall, or
  as a simpler contest of numbers in the MVP.
- **Outcomes:** repelled (pressure resets and maybe a small loot drop) /
  breached (buildings damaged, people killed, resources lost) / **fallen**.

### The town falls

Permadeath applies to the town. If defense collapses (for example, a wave
breaks through while the walls are already breached, or the town is
completely out of people), **the town falls**.

**A fallen town is a hard reset.** The game is over. Nothing carries over:
no Keeper's tree, no relics, no survivors. You start a new game.

This means:

- The stakes are as high as they can get, so the **fairness rule** is
  essential: waves are always telegraphed, and the town sends clear warnings
  as it gets weaker (low oil, breached walls, no guards). A fall should look
  predictable in hindsight.
- A good "the light went out" screen matters: a final ledger of how long the
  light burned, who was saved, and who was lost. It's the run's epitaph.
- Save export/import lets a determined player back up the game and undo a
  fall. It's single-player, so we accept that and don't try to stop it.

## People: one pool

**Decided: one pool.** Every refugee is a full, named character (archetype +
background) who can fight or work. There's no separate class of anonymous
townsfolk. This keeps pillar 2 simple and strong. If population numbers ever
get too large to manage, solve it with UI (grouping, job presets), not by
splitting the pool.

### Refugees

- They arrive over time. The arrival chance per town step depends on
  **brightness** and the **housing** you have free.
- They also come home with expeditions (✦ survivor nodes).
- Each new arrival costs **food** every step.
- You can **turn refugees away** when you can't feed or house them. That's a
  hard choice, with a morale cost if we ever add morale.

## Jobs (MVP)

| Job                             | Produces / does                              | Background bonus                    |
| ------------------------------- | -------------------------------------------- | ----------------------------------- |
| **Forager/Fisher**              | Food                                         | Fisher, Herbalist                   |
| **Oil press / Chandler**        | Oil                                          | Chandler                            |
| **Scavenger** (near fog's edge) | Materials (low rate, small risk)             | Mason, Smith                        |
| **Builder**                     | Construction progress                        | Mason                               |
| **Guard**                       | Town defense                                 | Soldier, Warden archetype           |
| **Infirmary attendant**         | Faster injury recovery, less medicine needed | Herbalist, Priest, Mender archetype |
| **Rest**                        | Recovers HP faster, no output                | —                                   |

Output = base rate × (background bonus) × (building level). Keep the formulas
simple enough that the player can see them.

## Buildings (MVP set)

| Building       | Purpose                                                                         |
| -------------- | ------------------------------------------------------------------------------- |
| **Lighthouse** | See above                                                                       |
| **Housing**    | Population cap, which limits how many refugees can stay                         |
| **Walls**      | Base town defense. Can be damaged, repaired with materials.                     |
| **Infirmary**  | Recovery speed, capacity for injured characters                                 |
| **Workshop**   | Salvage yield, stash size, later crafting/repairs                               |
| **Storehouse** | Resource caps (so production can't grow without limit while the player is away) |

Buildings take **materials + builder time**. They level up, and there are
only a few levels in the MVP.

## The Keeper's tree (town skill tree)

The long-term progress that survives when characters die. It does **not**
survive the town falling (hard reset). Points come from **milestones and relic shards**, not from grinding.

Example branches:

- **Tactics:** unlocks policy tiers: targeting rules, consumable thresholds,
  gambit slots and conditions. _This is where "deep policies" come from._
- **Logistics:** standing orders (auto-repeat expeditions), a second team,
  more carry capacity, oil efficiency.
- **Hearth:** production bonuses, refugee draw, housing efficiency, morale.
- **Bulwark:** wall strength, siege warning time, guard bonuses.
- **Lore:** better salvage rules, relic identification, fog-trait
  treatments.

## Trade (later)

The lighthouse is on the coast. **Ships guided by the light** could bring
occasional traders: swap surplus resources, buy rare gear, hear rumors that
reveal overworld locations. Brighter light brings ships more often. Not in
the MVP.
