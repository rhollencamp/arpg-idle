# Combat & Policies

Combat is **tick-based and fully simulated**. The player never controls it
directly. The only input is the set of policies chosen beforehand. The output
is state changes plus an **event log** that becomes the expedition report.

## Combat model

- **Tick = 1 sim-second.** Each combatant has an _action timer_ (based on
  Finesse and weapon speed). When the timer is ready, they choose an action
  according to their policy and perform it.
- **Two rows per side:** _Front_ and _Back_. Melee can only hit the enemy's
  Front row while it still has someone standing. Ranged attacks and spells can
  hit anyone. This small amount of structure makes "protect the healer"
  meaningful.
- **Actions:** basic attack, archetype skills (with cooldowns), use an item
  (tonic, bandage), guard (reduce damage, draw attacks), swap rows.
- **Damage:** attack → hit/dodge roll → armor reduction → crit roll.
  Simple formulas that can be tuned in data.
- **Light level:** a number for each encounter, set by the team's lanterns
  and oil use. Fog creatures get bonuses in low light. The Lamplighter raises
  the light.
- **End of fight:** all enemies dead (victory), the team retreats (policy),
  or the whole team is downed (a wipe: see [Expeditions](04-expeditions.md)).

The engine must be **deterministic given a seed** (see [Tech notes](09-tech-notes.md)).

## Policies: tiers

Policies unlock over time. Deep policies are something to work toward, and
they unlock through the town's **Keeper's tree**.

### Tier 1: Stances (MVP)

Each character has a **stance**:

| Stance         | Effect                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| **Aggressive** | Prefers damage skills. Targets the lowest-HP enemy. +damage, −defense. Uses consumables late.         |
| **Balanced**   | Default mix                                                                                           |
| **Defensive**  | Guards more often. Protects allies (Wardens draw attacks). Uses consumables early. +defense, −damage. |

Plus **team-level retreat rules** (MVP):

- Retreat from a fight when _team HP < X%_ **or** _N members are Downed_
- Head home when _oil < Y_ **or** _any member is below Z% HP between fights_
  **or** _the pack is full_
- **Push depth:** a dial from _Cautious_ to _Reckless_ that sets how willing
  the team is to take on the next, harder encounter (see
  [Expeditions](04-expeditions.md))

### Tier 2: Targeting & resource rules (unlocked)

- Target priority per character: _Lowest HP / Highest threat / Casters first /
  Same as the Warden_
- Consumable thresholds: "drink a tonic below 40% HP"
- Oil budget for the Lamplighter: _Frugal / Normal / Blaze_

### Tier 3: Gambits (unlocked, late)

A priority-ordered list of `condition → action` rules per character, similar
to FF12:

```
1. Ally HP < 30%            → Mend (ally)
2. Self HP < 25%            → Drink tonic
3. Enemy is Elite           → Brand of Light (enemy)
4. Enemies in front row ≥ 3 → Flare
5. Any                      → Basic attack (lowest HP)
```

- The number of gambit **slots** and available **conditions/actions** are
  both unlocked through the Keeper's tree, so gambits keep growing over time.
- Stances in Tier 1 are really just **preset gambit lists**. That keeps the
  engine unified: _everything is gambits under the hood_, and Tiers 1–2 are
  simpler views of it.

## Things to watch

- Policies have to produce **visibly different outcomes**, or the whole
  premise fails. Test for it: the same team with different stances should
  show clearly different rates of wins, injuries, and oil spent.
- The log should _explain policy decisions_ sometimes ("Bram, holding the
  line as ordered, took the blow meant for Ysolde"). That's how players learn
  that their policies matter.
