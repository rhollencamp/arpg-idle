# Characters

Every character is a **refugee** who came in out of the fog. They make up one
shared pool: each person can go on expeditions, work a town job, or rest.

## Anatomy of a character

| Part | Purpose |
| --- | --- |
| **Name, portrait, short bio** | Makes the log readable and losses hurt |
| **Archetype** | Combat role and skill tree (see below) |
| **Background** | What they did before the fog. Gives a town-job bonus and a small combat quirk |
| **Attributes** | Might, Finesse, Wits, Resolve (see below) |
| **Level / XP** | Earned on expeditions (and slowly from working a job?) |
| **Skill tree** | Per archetype, small (a few branches, about 10 nodes in the MVP) |
| **Equipment** | Weapon, Armor, Trinket (MVP: 3 slots) |
| **Traits** | Permanent modifiers: injuries, quirks, fog-exposure effects |
| **Condition** | HP, and a state such as *Ready / Injured / Recovering / Dead* |

### Attributes

- **Might:** melee damage, carry capacity (loot brought home)
- **Finesse:** speed (ticks between actions), crit chance, dodge
- **Wits:** skill power, spotting ambushes and caches
- **Resolve:** max HP, resistance to fear and fog effects. Affects whether a
  downed character survives.

## Archetypes (MVP: 4)

The names below fit the theme and are only placeholders.

| Archetype | Role | Flavor |
| --- | --- | --- |
| *Warden* | Front line / tank | Shield and lantern pole. Holds the line. |
| *Cutthroat* | Damage / skirmisher | Fast, fragile, strong against single targets |
| *Lamplighter* | Caster / area damage | Burns oil to throw light. Strong against fog creatures. |
| *Mender* | Support / healer | Bandages, tonics, keeping the downed alive |

The Lamplighter is the thematic hook: their abilities **spend the team's
lantern oil**. Stronger fights cost you exploration time. Policies decide how
freely they spend it.

## Backgrounds

A refugee's background is independent of their archetype. That's how you get
"blacksmith who's also a Cutthroat."

Examples: *Fisher* (+food from fishing), *Smith* (better salvage and repairs),
*Chandler* (+oil production), *Mason* (+construction speed), *Herbalist*
(+medicine), *Soldier* (+wall defense), *Priest* (+morale / recovery speed).

This gives you the "fight or work" choice: your best Chandler might also be
your best Lamplighter.

## Injuries & death

When a character's HP reaches 0 in combat, they are **Downed**, not dead.

- Downed characters don't act. Enemies may keep hitting them (depending on how
  cruel the enemy type is), and each hit raises the chance of death.
- After the fight (or when the team retreats), every Downed character makes a
  **survival check**. Resolve, an active Mender, and medicine the team carries
  improve the odds.
  - **Survive:** comes home *Injured*. May gain a lasting **injury trait**.
  - **Fail:** dies. Their gear is lost unless a teammate carries it home
    (carry capacity).
- **Rout** (see [Expeditions](04-expeditions.md)): a character left behind
  during a rout is *Missing*. Missing people might turn up later as refugees,
  maybe changed. This is thematic, and it softens the pain a little.

### Injury & fog traits (examples)

- *Lost an eye:* −accuracy
- *Bad knee:* −speed
- *Shaken:* uses a more defensive stance and retreats earlier
- *Fog-touched:* sees in the murk (+ambush detection) but −HP recovery

Recovering from an injury takes time in the **Infirmary**, and medicine and
Menders working there speed it up. Permanent traits can later be removed
(expensive, from the skill tree).

## Progression

- XP from expeditions, divided among the team members who survive.
- Each level gives 1 skill point in the archetype tree and a small stat
  increase.
- Level cap is TBD. Since characters die, individual levels shouldn't be the
  main long-term progress. **Long-term progress lives in the town** (see the
  Keeper's tree in [Town](06-town.md)).
