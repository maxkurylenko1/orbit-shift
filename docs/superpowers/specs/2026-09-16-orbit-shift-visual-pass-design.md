# Orbit Shift Visual Pass Design

## Goal
Bring Orbit Shift visually as close as practical to the approved sci-fi reference while keeping the existing gameplay loop stable and preserving responsive PixiJS behavior.

## Chosen Direction
Use a hybrid rendering approach:
- procedural deep-space background, star field, center glow, and vignette;
- a small set of lightweight transparent depth textures for nebula and foreground asteroid atmosphere;
- upgraded player/reactor assets with realistic sci-fi material treatment;
- cyan gameplay orbits plus one decorative outer ring;
- UI polish aligned with the same clean cinematic style.

## Visual Target
The final scene should read as cinematic sci-fi rather than a prototype:
- deep navy / blue-black space;
- layered star and nebula depth;
- warm orange reactor as the visual anchor;
- detailed cyan player craft with readable top-down silhouette;
- red hazards and gold shards in a consistent asset family;
- bright cyan orbit lines with controlled glow;
- restrained white/cyan HUD typography.

## Layer Structure
Recommended GameScene layer order:
1. procedural background base;
2. nebula/depth texture layer;
3. distant stars;
4. foreground/depth asteroid layer;
5. reactor glow;
6. reactor;
7. orbit graphics;
8. player trail;
9. obstacles / collectibles;
10. player;
11. HUD / countdown / overlays.

## Orbit System
Keep two gameplay orbits unchanged mechanically:
- inner orbit;
- outer orbit.

Add one additional outer ring as a decorative visual only. It must not participate in collision, spawning, lane switching, or scoring. Its style should be thinner and lower-contrast than gameplay orbits, optionally with subtle markers/dots.

## Core Assets
### Player
Replace the current icon-like visual with a more dimensional top-down sci-fi drone/ship:
- layered metal panels;
- darker recessed sections;
- cyan emissive core and accents;
- clear forward direction;
- strong silhouette at small scale;
- tangent rotation while orbiting;
- existing trail retained and tuned to the new silhouette.

### Reactor
Replace the current flat/cropped visual with a clean transparent top-down reactor:
- layered circular mechanical structure;
- gunmetal and warm orange materials;
- plasma/energy center;
- no rectangular background contamination;
- centered anchor and responsive sizing;
- subtle glow integrated with scene background.

## Background
Milestone 1 uses a hybrid space background:
- procedural dark gradient/base fill;
- deterministic star field for stable composition;
- soft radial center glow behind reactor;
- vignette to keep focus in center;
- 2–3 small transparent nebula/depth textures when available;
- optional subtle foreground asteroid silhouettes at edges.

The background must scale from `min(width, height)` and remain compositionally stable across portrait, landscape, and desktop sizes.

## UI Direction
HUD, MenuScene, and GameOverOverlay should converge toward the approved reference:
- white/cool-blue primary text;
- muted secondary text;
- generous spacing;
- reduced debug-like appearance;
- stronger hierarchy for SCORE / BEST / COMBO;
- cleaner PLAY / PLAY AGAIN controls.

## Milestones
1. `feat: add hybrid space background`
   - background layer;
   - procedural stars;
   - center glow;
   - vignette;
   - initial nebula/depth hooks.

2. `feat: enhance orbit presentation`
   - decorative outer ring;
   - marker accents;
   - orbit glow/alpha tuning.

3. `feat: upgrade player and reactor assets`
   - detailed player asset;
   - clean reactor asset;
   - sizing/anchor/trail adjustments.

4. `feat: align obstacle and shard visuals`
   - red hazard asset;
   - gold shard asset;
   - responsive sizing/readability.

5. `refactor: polish HUD and overlays`
   - HUD hierarchy;
   - menu treatment;
   - Game Over treatment.

## Non-Goals
This pass does not change:
- collision rules;
- scoring rules;
- combo rules;
- spawn logic;
- difficulty tuning;
- input model;
- restart/countdown lifecycle.

## Validation
After every milestone:
- run TypeScript/build verification where available;
- confirm responsive layout on desktop and resized/narrow viewport;
- visually compare against the approved reference;
- make corrective visual tweaks before the next milestone;
- keep gameplay behavior unchanged unless a separate task is approved.

## Success Criteria
The pass is successful when the game no longer reads as a prototype at a glance, and the main gameplay screen is visually close to the approved reference in composition, depth, color hierarchy, and asset quality while retaining the same core gameplay mechanics.
