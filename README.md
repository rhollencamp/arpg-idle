# Guttered

An idle ARPG for the browser, installable as a PWA. A fog has swallowed the
world. Your town gathers around the last lighthouse still burning. You recruit
survivors who come in out of the fog, set how your expedition team will fight,
and send them into the murk. They return with loot and supplies, or they
don't return at all.

There is an **early playable build**. Characters have only Vitality and
Strength. You pick a team, give them oil and orders (stance, how hard to
push, when to retreat), and send them out. The fight plays out second by
second whether the tab is open or not. They come back with supplies and
oil, hurt, or not at all. Refugees turn up at the gate and cost supplies to
take in.

## Run it

```bash
npm install
npm run dev      # then open the printed URL
npm run test
npm run sim      # headless balance harness
```

Built with React, TypeScript, Vite, and Mantine, as an installable PWA.
Pushes to `main` deploy to GitHub Pages (see `docs/tech/deployment.md`).

## Design docs

| Doc                                                        | What's in it                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| [Vision & pillars](docs/design/00-vision.md)               | Theme, tone, and the rules every design decision should follow      |
| [Core loop & time](docs/design/01-core-loop.md)            | Active and idle phases, how time passes, offline progress           |
| [Characters](docs/design/02-characters.md)                 | Refugees, archetypes, backgrounds, injuries, death                  |
| [Combat & policies](docs/design/03-combat-and-policies.md) | Tick-based combat and the policy system (simple → gambits)          |
| [Expeditions](docs/design/04-expeditions.md)               | Zones, depth, lantern oil, retreat and rout, the expedition log     |
| [Loot & items](docs/design/05-loot.md)                     | Supplies vs gear, rarity, salvage rules                             |
| [Town](docs/design/06-town.md)                             | The lighthouse, siege, refugees, jobs, buildings, the Keeper's tree |
| [Overworld](docs/design/07-overworld.md)                   | The fog map (mostly still open)                                     |
| [MVP scope](docs/design/08-mvp-scope.md)                   | What the first playable version includes and leaves out             |
| [Tech notes](docs/design/09-tech-notes.md)                 | TypeScript/PWA architecture ideas, deterministic simulation         |
| [Open questions](docs/design/open-questions.md)            | Undecided items                                                     |

Placeholder names (the game, enemies, buildings) are marked _italic_ the first
time they appear in a doc and can be renamed freely.
