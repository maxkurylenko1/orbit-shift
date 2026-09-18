# Reference-Art Asset Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current procedural-heavy gameplay visuals with the already-generated background, reactor, and player assets while preserving gameplay behavior.

**Architecture:** The background becomes a single aspect-preserving cover sprite. The reactor becomes a single rendered sprite with only a subtle Pixi halo/pulse. The player keeps its existing gameplay entity and trail logic but switches to the new rendered sprite. Orbit rendering and gameplay systems stay unchanged.

**Tech Stack:** TypeScript, PixiJS v8, Vite, PNG assets, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-reference-art-visual-reset-design.md`

## Global Constraints

- Do not change gameplay mechanics.
- Preserve responsive sizing based on `min(width, height)`.
- Preserve DPR cap at 2.
- Background must preserve aspect ratio and crop instead of stretching.
- Reactor and player must use the already-generated assets; do not generate replacements.
- Do not bundle HUD, obstacle, or collectible redesign into this pass.
- Avoid heavy runtime filters/shaders.

---

### Task 1: Add binary-safe production assets and preload them

**Files:**
- Create: `public/assets/space-background.png`
- Create: `public/assets/reactor.png`
- Create: `public/assets/player.png`
- Modify: `src/core/Game.ts`

**Interfaces:**
- Produces asset URLs: `assets/space-background.png`, `assets/reactor.png`, `assets/player.png`.
- Existing Pixi scenes consume these URLs through `Sprite.from(...)`.

- [ ] **Step 1:** Validate local PNG dimensions/alpha before upload.
- [ ] **Step 2:** Upload all three assets using Git blob/tree APIs with base64 encoding.
- [ ] **Step 3:** Change `VISUAL_ASSETS` to preload the three PNGs.
- [ ] **Step 4:** Verify the branch tree contains all assets and the preload list references the same paths.

### Task 2: Replace procedural background with cover sprite

**Files:**
- Create: `src/background/backgroundLayout.ts`
- Modify: `src/background/SpaceBackground.ts`
- Test: `tests/backgroundLayout.test.ts`

**Interfaces:**
- Produces: `getCoverLayout(viewportWidth, viewportHeight, sourceWidth, sourceHeight)`.
- `SpaceBackground.resize(width, height)` consumes the returned width/height and centers the sprite.

- [ ] **Step 1: Write the failing test**

```ts
test('cover layout preserves source aspect ratio and covers viewport', () => {
  const layout = getCoverLayout(1710, 920, 1672, 941);
  assert.ok(layout.width >= 1710);
  assert.ok(layout.height >= 920);
  assert.ok(Math.abs(layout.width / layout.height - 1672 / 941) < 0.001);
});
```

- [ ] **Step 2:** Run the test and verify it fails because `backgroundLayout.ts` does not exist.
- [ ] **Step 3:** Implement `getCoverLayout` using `Math.max(viewportWidth/sourceWidth, viewportHeight/sourceHeight)`.
- [ ] **Step 4:** Replace all procedural nebula/star/asteroid drawing with one centered `Sprite.from('assets/space-background.png')`.
- [ ] **Step 5:** Run the background layout test to GREEN.

### Task 3: Replace procedural reactor assembly with rendered reactor asset

**Files:**
- Create: `src/presentation/ReactorAssetView.ts`
- Create: `src/presentation/reactorAssetVisual.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/reactorAssetVisual.test.ts`

**Interfaces:**
- Produces: `getReactorAssetVisual(size)` returning sprite size, halo radii/alphas, and pulse scale.
- `ReactorAssetView.resize(size)` sizes the sprite and redraws the halo.
- `ReactorAssetView.update(deltaSeconds)` applies only a subtle scale/halo pulse.

- [ ] **Step 1: Write the failing test**

```ts
test('reactor asset keeps glow subtle and sprite inside requested size', () => {
  const visual = getReactorAssetVisual(300);
  assert.equal(visual.spriteSize, 300);
  assert.ok(visual.outerHaloAlpha <= 0.06);
  assert.ok(visual.pulseAmplitude <= 0.03);
});
```

- [ ] **Step 2:** Verify RED because `reactorAssetVisual.ts` is missing.
- [ ] **Step 3:** Implement minimal metrics.
- [ ] **Step 4:** Implement `ReactorAssetView` with one reactor sprite plus two soft `Graphics` halo circles.
- [ ] **Step 5:** Replace `ReactorAssemblyView` in `GameScene` with `ReactorAssetView`.
- [ ] **Step 6:** Remove legacy procedural reactor modules after no imports remain.
- [ ] **Step 7:** Run reactor visual tests to GREEN.

### Task 4: Switch player to the new rendered asset

**Files:**
- Modify: `src/entities/Player.ts`
- Modify: `src/core/Game.ts`

**Interfaces:**
- Existing `Player` movement/rotation/trail behavior remains unchanged.
- Only `PLAYER_ASSET_URL` changes to `assets/player.png`.

- [ ] **Step 1:** Change the player asset URL.
- [ ] **Step 2:** Keep existing tangent rotation and sizing logic.
- [ ] **Step 3:** Verify there are no remaining runtime references to `player.webp`.

### Task 5: Remove obsolete procedural background/reactor files and verify

**Files:**
- Delete when unused: `src/background/asteroidShape.ts`
- Delete when unused: `src/background/spaceField.ts`
- Delete when unused: `src/presentation/ReactorAssemblyView.ts`
- Delete when unused: `src/presentation/reactorGeometry.ts`
- Delete corresponding obsolete tests only when they test removed implementation details.

- [ ] **Step 1:** Search runtime imports to confirm the files are unused.
- [ ] **Step 2:** Remove only unused procedural files.
- [ ] **Step 3:** Run all pure tests.
- [ ] **Step 4:** User runs `npm run build` and `npm run dev` locally.
- [ ] **Step 5:** Perform screenshot comparison against the approved reference before any further polish.
