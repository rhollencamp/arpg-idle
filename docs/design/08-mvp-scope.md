# MVP Scope

Goal: the **smallest version that proves the core loop is fun**: plan →
idle expedition → read the log → make town decisions → plan again, with real
tension over oil, people, and the siege.

## In

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
- Town fall is **possible**. The MVP can simply show a "the light went out"
  screen with a restart. The roguelite carry-over can come later.
- A minimal Keeper's tree: just enough to prove the unlock path (e.g., one
  Tactics node that unlocks target priority)

**Platform**
- TypeScript, runs in modern desktop and mobile browsers
- Installable PWA, works offline
- Local save (IndexedDB) + export/import save as a file
- Offline catch-up when the game loads

## Out (for now)

- Overworld *map*. Zones are a list in the MVP.
- Tier 2/3 policies beyond the one proof-of-concept unlock
- Standing orders / auto-repeat expeditions / multiple teams
- Trade, ships, crafting, gear durability, morale
- Townsfolk vs. heroes split
- Roguelite meta-progression after the town falls
- Push notifications
- Art beyond simple portraits/icons. Audio.
- Cloud save, accounts, any server

## Milestones (proposed)

1. **Sim core:** data model + seeded RNG + combat engine running headless,
   with tests. Output: a combat log in the console.
2. **Expedition runner:** nodes, oil, retreat rules, loot rolls, outcomes.
   A headless expedition from start to finish.
3. **Balance harness:** run thousands of simulated expeditions with different
   policies and compare the outcomes. This *proves pillar 1* before any UI
   exists.
4. **Town sim:** resources, jobs, buildings, refugees, siege, offline
   catch-up.
5. **UI v0:** roster, loadout, policies, send out, log viewer, town screen.
6. **PWA:** installable, offline, save/load/export.
7. **Playtest & tune.**
