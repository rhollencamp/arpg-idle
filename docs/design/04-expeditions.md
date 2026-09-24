# Expeditions

An expedition is a team of **1–4 characters** going into a **zone** in the
fog, fighting through a series of **encounters**, and deciding by policy when
to come home.

## Structure: a path of nodes

A zone is generated as a sequence of **nodes** of increasing **depth**:

```
[Town] → ◇ → ⚔ → ⚔ → ☐ → ⚔ → ☠ → ⚔ → ...
```

| Node | What happens |
| --- | --- |
| ⚔ Encounter | A fight. Difficulty and rewards grow with depth. |
| ◇ Event | Short text events with an outcome decided by policy or stats (a stranded survivor, a strange shrine, a collapsed bridge) |
| ☐ Cache | Supplies/loot. May be trapped (Wits check). |
| ☠ Elite | A harder fight with better loot. Optional under *Cautious* push. |
| ✦ Survivor | A refugee found in the fog. Escorting them home adds a person to the pool. |

After each node, the team checks its **retreat rules** (see
[Combat & policies](03-combat-and-policies.md)) and either continues deeper
or turns back.

## Lantern oil: the natural timer

The team carries **oil**. It's the key expedition supply and the main thing
that sets expedition length.

- Oil burns steadily while moving through the fog, and the Lamplighter's
  skills spend extra.
- **Low oil = low light** → fog creatures get stronger, ambushes get more
  likely, and the team is more likely to get lost.
- **No oil = in the dark.** Danger rises sharply every tick. Only desperate or
  badly configured teams end up here.
- The trip home **also costs oil** (it's a walk back through cleared nodes,
  faster than the way in). Retreat rules should reserve enough to get back.

So "how long is an expedition?" becomes a **loadout decision**: send more oil
for a longer, deeper run, but oil comes from the town, which also needs it
to keep the lighthouse lit.

Roughly: 1 flask ≈ 1–2 minutes of real time out there. A standard loadout of
4–6 flasks gives the 5–10 minute target.

## Coming home

| Outcome | Trigger | Result |
| --- | --- | --- |
| **Triumphant return** | Retreat rule reached at a planned point (oil, pack full, goal met) | Everything carried comes home |
| **Retreat** | An in-fight retreat rule triggers | The team disengages (it may take a parting hit), then walks home. Keeps loot. |
| **Rout** | The team is overwhelmed and fails its disengage check | Drops some loot. Downed members may be left behind (*Missing*). |
| **Wipe** | Everyone is downed | Survival checks for everyone. Anyone who survives crawls home with nothing. It's possible nobody returns. |

The walk home is not completely safe: there's a small ambush chance per
cleared node, which goes up in low light.

## The expedition log

Every expedition produces a log. It's the main thing the player reads.

- **Summary card:** outcome, depth reached, time, loot, XP, injuries/deaths,
  oil spent.
- **Highlights:** 3–6 of the most notable events (a crit that turned the
  fight, someone going down, a policy decision that mattered, a rare drop).
- **Full log:** every event, collapsible by node, for players who want to
  study how their policies played out.

The log is built from **structured events** (not free text) so the UI can
summarize, filter, and later chart them. The text is generated from templates
with some variety.

## Later ideas (not MVP)

- **Standing orders:** repeat expeditions automatically (see
  [Core loop](01-core-loop.md#while-youre-away)).
- **Multiple teams out at once.**
- **Goals:** "find the survivors in the old mill," "destroy the siege camp,"
  "escort the caravan": expeditions with a purpose beyond loot, connected to
  the [Overworld](07-overworld.md).
- **Fog exposure:** a per-character meter that fills up on deep or dark runs
  and can lead to fog traits (good and bad).
