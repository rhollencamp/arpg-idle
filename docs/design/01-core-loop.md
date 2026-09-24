# Core Loop & Time

## The loop

```
 ┌──────────── ACTIVE ────────────┐      ┌──── IDLE ────┐      ┌────────── ACTIVE ──────────┐
 │ PLAN                           │      │ EXPEDITION   │      │ RETURN          TOWN       │
 │ - pick team from roster        │ ───► │ tick-based   │ ───► │ - read log      - jobs     │
 │ - loadout (gear, oil, supplies)│      │ simulation   │      │ - loot/salvage  - build    │
 │ - policies                     │      │ driven by    │      │ - injuries,     - recruit  │
 │ - target zone                  │      │ policies     │      │   deaths        - skills   │
 └────────────────────────────────┘      └──────────────┘      └────────────────────────────┘
        ▲                                                                   │
        └───────────────────────────────────────────────────────────────────┘
                        (meanwhile the town and the siege run in real time)
```

Two clocks run at the same time:

- **The expedition clock:** one expedition at a time in the MVP. It takes about
  5–10 minutes of real time, and its length depends on policy (mainly how much
  lantern oil you send; see [Expeditions](04-expeditions.md)).
- **The town clock:** runs continuously. Jobs produce resources, refugees
  arrive, and siege pressure builds up and breaks in waves.

## Session shape

| Session | What the player does |
| --- | --- |
| **Short check-in** (under 1 min) | Read the latest log, send the same team out again, reassign a job |
| **Planning session** (5–15 min) | Rework the team and policies, spend skill points, build, handle item drops |
| **Away** (hours) | The town keeps running. Only the expedition that was already out finishes. |

### While you're away

A truly idle game has to handle "the player is gone for 8 hours" well:

- **MVP:** once the current expedition ends, the team comes home and rests.
  The town keeps producing and consuming, and the siege keeps coming. You come
  back to one expedition log and a *town ledger* covering the time you were
  gone.
- **Later (policy-driven expedition cadence):** standing orders such as
  "keep sending this team out while everyone is above 60% HP and we have at
  least 3 oil," or "rotate teams A and B." These unlock through the town
  skill tree. This is the real idle endgame: you manage a *process*, not
  individual runs.

## Time scale

- **Simulation tick:** 1 sim-second. All combat and travel happen in ticks.
- **Expedition speed:** expeditions run faster than real time. For example,
  one expedition covers around 30–60 minutes of in-world time and plays out
  in 5–10 minutes of real time. This is a tuning knob, not a design commitment.
- **Town tick:** coarser, e.g. one "town step" per real minute. Production,
  consumption, refugee rolls, and siege build-up happen per step.

## Offline progress

When the game loads (or the tab becomes visible again), the simulation catches
up on all the time that passed since the last save, in order. Because the
simulation is deterministic (see [Tech notes](09-tech-notes.md)), catching up
gives exactly the same result as leaving the tab open.

**Fairness rule:** the town can fall while you're away, but never without
warning. Siege waves are visible ahead of time (the fog thickens and a
countdown appears), so a player who looked before leaving had a chance to
prepare. See [Town → Siege](06-town.md#siege).
