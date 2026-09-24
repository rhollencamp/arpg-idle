# MVP Scope

Goal: the **smallest version that proves the core loop is fun**: plan →
idle expedition → read the log → make town decisions → plan again, with real
tension over oil, people, and the siege.

## v0: what's built now

A deliberately thinner slice than the MVP below, so there's something to
play with and tune:

- **Characters have only Vitality (HP) and Strength (damage).** There are
  no archetypes, backgrounds, levels, or gear yet. Everyone attacks every
  2 s.
- **Expeditions:** a team of 1–4, a chain of nodes getting deeper, lantern
  oil as the timer (90 s per flask), healing while walking between nodes,
  and darkness that hurts once the oil runs out.
- **Tier 1 policies:** a stance for the whole team
  (aggressive/balanced/defensive), how hard to push (how much spare light
  to keep before going deeper), and a retreat threshold.
- **Downed → survival check → dead or injured.** Injured characters must
  heal fully before they can go out again.
- **Town:** an oil press (1 flask per 2:30), supplies, refugees at the gate
  every 8 min (taking one in costs 10 supplies), a roster cap of 8, and a
  list of the fallen.
- **Reports** with a structured log, plus a "while you were away" summary.
- **The lighthouse** burns oil at a setting you choose (low, steady,
  bright). Brighter light draws refugees faster and slows the siege, but
  drinks from the same store as the expeditions. When the oil runs dry the
  light goes out: nobody arrives, and siege pressure builds 3× as fast.
  It relights once the press has made 1 flask.
- **The siege:** pressure builds to a wave, which is announced with a
  30-minute countdown. Defense = (walls + people at home, weighted by
  health) × light. A repelled wave chips the walls and leaves supplies to
  scavenge. A wave that breaks through damages the walls and carries off
  supplies. If the walls can't take the blow, the town falls: a hard reset
  with a final screen.
- **Walls:** repair (1 supply → 3 points) and reinforce (+50, costing
  30 × level). This is the main supply sink for now.
- **Not built yet:** loot/gear, jobs, buildings, character progression, the
  Keeper's tree, standing orders.

First-pass balance (`npm run sim:town`, 24 h per run):

- A town nobody tends falls in about 12 h.
- Building walls without sending expeditions lasts about 19 h.
- A bot that sends expeditions and builds survives the full 24 h at low or
  steady light.
- Running bright light constantly while sending expeditions keeps drying
  out the lamp and falls in about 15 h.
- Waves grow 15% each, so without character progression every town falls
  eventually.

Tuning lives in `src/game/rules.ts` and `src/game/content.ts`. `npm run sim`
shows how each plan tends to go.

## In (full MVP)

**Characters**

- A starting roster of 3–4 characters, plus refugees arriving over time
- 4 archetypes (Warden, Cutthroat, Lamplighter, Mender), each with a small
  skill tree (~8–10 nodes)
- About 6 backgrounds
- Levels/XP, injuries (a handful of injury traits), permadeath

**Combat & policies**

- A deterministic tick-based combat engine, front/back rows
- Tier 1 policies: per-character stance plus team retreat rules and a push
  dial
- Internally built as gambit lists (stances are presets), so Tiers 2–3 can be
  added later without rewriting the engine

**Expeditions**

- One team at a time, 1–4 members
- 1 zone (2 if cheap), node paths generated from a seed
- Lantern oil as the timer. Retreat / rout / wipe outcomes.
- Expedition log: summary card + highlights + full log
- About 5–10 minutes of real time per expedition at a standard loadout

**Loot**

- Supplies: food, oil, materials, medicine, relic shards
- Gear: 3 slots, 4 rarities, a small affix pool, 2–3 relic uniques
- Carry capacity, stash cap, auto-salvage below a chosen rarity

**Town**

- Lighthouse (brightness + level), Housing, Walls, Infirmary, Workshop,
  Storehouse
- Jobs: forage, press oil, scavenge, build, guard, infirmary, rest
- Refugee arrivals (driven by brightness and housing)
- Siege: pressure → a telegraphed wave → resolved against defense (a simple
  numbers contest is fine for the MVP)
- Town fall is **possible**, and it's a **hard reset**: a "the light went
  out" screen with a final ledger, then a new game.
- A minimal Keeper's tree: just enough to prove the unlock path (e.g., one
  Tactics node that unlocks target priority)

**Platform**

- TypeScript, runs in modern desktop and mobile browsers
- Installable PWA, works offline
- Local save (IndexedDB) + export/import save as a file
- Offline catch-up when the game loads

## Out (for now)

- Overworld _map_. Zones are a list in the MVP.
- Tier 2/3 policies beyond the one proof-of-concept unlock
- Standing orders / auto-repeat expeditions / multiple teams
- Trade, ships, crafting, gear durability, morale
- Push notifications
- Art beyond simple portraits/icons. Audio.
- Cloud save, accounts, any server

## Milestones (proposed)

1. **Sim core:** data model + seeded RNG + combat engine running headless,
   with tests. Output: a combat log in the console.
2. **Expedition runner:** nodes, oil, retreat rules, loot rolls, outcomes.
   A headless expedition from start to finish.
3. **Balance harness:** run thousands of simulated expeditions with different
   policies and compare the outcomes. This _proves pillar 1_ before any UI
   exists.
4. **Town sim:** resources, jobs, buildings, refugees, siege, offline
   catch-up.
5. **UI v0:** roster, loadout, policies, send out, log viewer, town screen.
6. **PWA:** installable, offline, save/load/export.
7. **Playtest & tune.**
