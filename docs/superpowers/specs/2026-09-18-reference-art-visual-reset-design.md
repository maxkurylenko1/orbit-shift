# Orbit Shift Reference-Art Visual Reset

Date: 2026-09-18

## Goal

Replace the current procedural-heavy visual layer with an asset-driven presentation that matches the approved reference as closely as practical while keeping the game lightweight, responsive, and fully playable.

The reference is the visual target for composition, mood, lighting, object quality, and scene hierarchy. Gameplay behavior is not being redesigned.

## Problem

The current visual implementation relies too heavily on Pixi `Graphics` for the reactor, asteroids, nebula framing, and decorative details. This produces a clean but synthetic "diagram" look with too many small independent details and insufficient visual cohesion.

Repeated incremental fixes have improved individual elements but have not moved the scene toward the reference because the reference itself is authored as a coherent rendered scene.

## Decision

Use an asset-driven visual pipeline:

- Background: high-resolution cinematic space plate.
- Reactor: high-resolution transparent rendered asset.
- Player: high-resolution transparent rendered asset.
- Pixi: gameplay orbits, movement, subtle glow, particles, transitions, HUD, obstacles, collectibles.

The split should be approximately 90% authored visual assets and 10% runtime procedural effects.

## Scene Architecture

Layer order:

1. Cinematic background plate
2. Optional low-cost ambient star layer
3. Reactor glow halo
4. Reactor rendered sprite
5. Gameplay orbit glow
6. Gameplay orbit core lines
7. Decorative outer orbit
8. Player trail
9. Obstacles and collectibles
10. Player rendered sprite
11. Feedback particles
12. HUD / countdown / game-over UI

The background, reactor, and player must not contain HUD, gameplay orbit lines, score text, obstacles, or collectibles baked into the artwork.

## Background Asset

Target:
- 16:9 master plate, minimum 2560x1440.
- Deep navy/black center with clear negative space around the orbit system.
- Blue/cyan nebula detail concentrated toward the outer thirds.
- Large asteroid framing at corners and edges.
- Sparse sharp stars.
- A galaxy or bright astronomical feature may live in the upper-right region, matching the approved reference composition.
- No blur caused by runtime stretching.

Runtime behavior:
- Render as a single sprite using cover-style scaling.
- Preserve aspect ratio.
- Crop overflow instead of non-uniform stretching.
- No large procedural nebula circles or fake polygon asteroid silhouettes over the plate.

## Reactor Asset

Target:
- Transparent PNG/WebP, ideally 768-1024 square source.
- Top-down circular sci-fi reactor/station.
- Dark gunmetal body.
- Four integrated mechanical modules.
- Strong orange/amber plasma center.
- Small cyan technical lights.
- Cohesive material rendering and lighting.
- No rectangular background, baked orbit lines, HUD, or text.

Runtime behavior:
- One primary sprite.
- Only subtle additive halo/pulse is procedural.
- Optional very small scale pulse around 2-4%.
- No procedural mechanical frame drawn over the sprite.
- Reactor remains fully inside the inner gameplay orbit with visual breathing room.

## Player Asset

Target:
- Transparent PNG/WebP, ideally 512-768 square source.
- Top-down compact drone/ship.
- Clear directional nose.
- Gunmetal/white structure.
- Bright cyan energy core / propulsion.
- Same rendering family and material treatment as reactor.

Runtime behavior:
- Sprite follows the existing orbit/lane-switch logic.
- Rotation follows tangent movement.
- Pixi trail remains procedural but subtle.
- No baked trail in the source asset.

## Orbits

Keep orbits fully procedural because they must remain crisp and responsive.

Target:
- Two bright cyan gameplay rings.
- One thinner, dimmer decorative outer ring.
- Subtle glow around gameplay rings.
- No excessive tick marks, crosshairs, or micro-details.
- Orbit visuals should frame the art rather than compete with it.

Gameplay radii remain unchanged unless a later visual review proves a small spacing adjustment is necessary.

## Runtime Effects

Allowed:
- soft reactor halo
- subtle reactor pulse
- player trail
- lightweight collection burst
- lightweight collision flash
- gentle orbit glow

Avoid:
- dense rotating reactor linework
- large procedural nebula blobs
- fake asteroid polygons
- multiple competing glow colors
- decorative effects that reduce gameplay readability

## HUD

HUD remains separate from the visual reset.

Current sharpness improvements stay. A later pass may refine:
- font choice
- score hierarchy
- countdown styling
- spacing
- game-over presentation

No HUD work is bundled into the first reference-art implementation.

## Asset Generation Workflow

Each production asset is generated separately rather than generating a whole mockup and cropping it.

Order:
1. background plate
2. reactor
3. player

For each asset:
- generate against the approved reference direction
- inspect visually before integration
- validate file dimensions and alpha where applicable
- validate browser decoding before committing
- integrate only after the standalone asset is accepted

Binary files must be committed through a binary-safe Git path. Avoid text-oriented file upload flows that previously corrupted WebP assets.

## Removal Scope

The first implementation pass removes from runtime:
- procedural reactor assembly
- procedural reactor mechanical linework
- procedural asteroid silhouettes
- procedural nebula blobs that duplicate the new background

Do not remove gameplay systems, orbit calculations, player movement, obstacle logic, collectible logic, score logic, persistence, or scene lifecycle.

## Responsive Behavior

- Background preserves its source aspect ratio and crops responsively.
- Reactor/player sizes remain based on `min(width, height)`.
- Device pixel ratio remains capped at 2.
- No fixed 16:9 gameplay canvas requirement.
- Core gameplay stays centered at all supported viewport sizes.

## Performance Constraints

- Keep total visual asset weight reasonable for a portfolio HTML5 game.
- Prefer WebP for final delivery when browser decoding has been explicitly validated.
- Prefer PNG during generation/validation when transparency correctness matters.
- Avoid large runtime filters or full-screen blur shaders.
- Preserve stable 60 FPS target on ordinary desktop/mobile hardware.

## Validation

Before considering the reset successful:

1. Build succeeds locally.
2. No browser console/runtime errors.
3. All current gameplay systems still function.
4. Reactor/player/background decode correctly.
5. No texture is visibly stretched.
6. At desktop reference size, the first impression is materially closer to the approved reference than to the current procedural version.
7. Center hierarchy is clear: reactor first, player second, orbits third, background fourth.
8. A visual screenshot review is required before continuing to HUD/obstacle/shard polish.

## Non-Goals

This reset does not:
- change game mechanics
- add a third gameplay lane
- redesign scoring
- add new difficulty rules
- introduce 3D rendering
- introduce heavy shaders
- redesign the menu/game-over screen
- finalize obstacle or collectible art

Those remain separate follow-up tasks after the main scene visually converges on the reference.
