# Overworld

> Status: **direction chosen, details still to be worked out.** Siege camps and
> outposts are the core. We'll iterate from there.

## What we know

- A map (hex or square grid, TBD), with the **lighthouse** in the center,
  probably on a coastline.
- **Fog of war is literally fog.** Tiles inside the lighthouse's light radius
  are clear. Everything else is murk that expeditions push into.
- Upgrading brightness visibly **pushes the fog back**. That is the main
  visual sign of progress in the game.

## Options for what the overworld does

Not mutually exclusive. We should pick 1–2 for the first version after the MVP.

1. **Zone selection (simplest):** discovered locations are expedition
   destinations. Each has a theme, difficulty, and loot profile (a drowned
   village has more medicine, a quarry has more materials). *This is roughly
   what the MVP needs anyway, even as a list rather than a map.*
2. **Outposts / braziers:** expeditions can reach a spot and **light a
   secondary fire** (it costs oil to build and to keep burning). That extends
   the cleared area and gives safer staging points for deeper runs. It's
   territory control, in theme.
3. **Siege camps:** visible enemy staging areas that feed siege pressure.
   Clearing them lowers pressure for a while. This connects expeditions
   directly to town defense.
4. **Refugee signals:** flickers in the fog marking stranded survivors, which
   disappear after a while. It's a reason to change plans ("rescue run!").
5. **Landmarks & story:** ruins, a sunken cathedral, the *heart of the fog*.
   Discovering them unlocks lore, relics, and new zones. A slow-burning
   mystery about what the fog is.
6. **Fog advance:** if the light weakens, the fog **takes tiles back**:
   outposts go dark and discoveries are lost. A cost to neglect you can see.

## Direction (decided, will iterate)

- **MVP:** option 1 as a **simple list** (one or two zones). No map yet.
- **Next version:** a real map built around **2 (outposts)** and
  **3 (siege camps)**:
  - *Siege camps* connect expeditions to town defense: clearing a camp lowers
    siege pressure.
  - *Outposts* are territory: lighting them extends the cleared area and adds
    staging points, but they cost oil to keep burning.
  - Both come back to the oil tension. Every outpost is another fire to feed.
- **Candidates for later:** 6 (fog advance) pairs naturally with outposts
  (neglected outposts go dark). 4 (refugee signals) and 5 (landmarks) add
  variety and story.
