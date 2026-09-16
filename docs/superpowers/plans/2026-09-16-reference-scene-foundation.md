# Reference Scene Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live Orbit Shift gameplay scene visually match the approved cinematic reference in composition, depth, lighting, orbit framing, reactor quality, and player quality without changing gameplay mechanics.

**Architecture:** Keep the existing PixiJS gameplay systems intact and replace only presentation layers. Use one lightweight generated deep-space backdrop texture for cinematic nebula/asteroid depth, retain procedural stars for responsive continuity, add a decorative outer orbit, and use validated transparent WebP assets for reactor and player. All geometry continues to scale from `min(width, height)`.

**Tech Stack:** TypeScript, PixiJS 8, Vite, Node test runner, WebP/PNG asset validation.

**Spec:** `docs/superpowers/specs/2026-09-16-orbit-shift-visual-pass-design.md`

## Global Constraints

- Keep collision, scoring, combo, spawn, difficulty, input, restart and countdown lifecycle unchanged.
- Keep inner and outer gameplay orbit radii unchanged.
- Add the third orbit as decoration only.
- All new binary image assets must be decoded locally before they are committed.
- Binary image writes must use the Git blob/tree API, not text contents writes.
- The scene must remain responsive and compositionally stable in desktop and narrower viewports.
- Match the approved reference by visual comparison after every task.

---

### Task 1: Cinematic Backdrop Layer

**Files:**
- Create: `public/assets/space-backdrop.webp`
- Create: `src/background/referenceBackdrop.ts`
- Modify: `src/background/SpaceBackground.ts`
- Modify: `src/core/Game.ts`
- Test: `tests/referenceBackdrop.test.ts`

**Interfaces:**
- Produces: `getBackdropLayout(width: number, height: number): { width: number; height: number; x: number; y: number; scale: number }`
- `SpaceBackground` consumes the helper and adds a backdrop Sprite below the procedural star layer.

- [ ] **Step 1: Write the failing layout test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getBackdropLayout } from '../src/background/referenceBackdrop.ts';

test('backdrop covers landscape and portrait without exposing edges', () => {
  for (const [width, height] of [[1600, 900], [900, 1600], [1024, 768]]) {
    const layout = getBackdropLayout(width, height);
    assert.equal(layout.x, width / 2);
    assert.equal(layout.y, height / 2);
    assert.ok(layout.width >= width);
    assert.ok(layout.height >= height);
  }
});
```

- [ ] **Step 2: Run test to verify RED**

Run: `node --experimental-strip-types --test tests/referenceBackdrop.test.ts`
Expected: FAIL because `referenceBackdrop.ts` does not exist.

- [ ] **Step 3: Generate and validate the background asset**

Create one 16:9 deep-space image matching the reference: cyan nebula depth, sparse bright stars, large dark asteroid framing at corners/edges, no HUD, no reactor, no player, no orbit lines. Convert to WebP and verify with Pillow that it decodes successfully and has the expected dimensions before upload.

- [ ] **Step 4: Implement layout helper and backdrop Sprite**

```ts
const SOURCE_ASPECT = 16 / 9;

export const getBackdropLayout = (width: number, height: number) => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const viewportAspect = safeWidth / safeHeight;
  const backdropWidth = viewportAspect > SOURCE_ASPECT
    ? safeWidth
    : safeHeight * SOURCE_ASPECT;
  const backdropHeight = backdropWidth / SOURCE_ASPECT;

  return {
    width: backdropWidth,
    height: backdropHeight,
    x: safeWidth * 0.5,
    y: safeHeight * 0.5,
    scale: backdropWidth / 1600,
  };
};
```

Add `assets/space-backdrop.webp` to `VISUAL_ASSETS`; render the Sprite below procedural stars with a restrained alpha so procedural layers still contribute.

- [ ] **Step 5: Run test to verify GREEN**

Run: `node --experimental-strip-types --test tests/referenceBackdrop.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/assets/space-backdrop.webp src/background/referenceBackdrop.ts src/background/SpaceBackground.ts src/core/Game.ts tests/referenceBackdrop.test.ts
git commit -m "feat: add cinematic space backdrop"
```

---

### Task 2: Reference Orbit Presentation

**Files:**
- Create: `src/presentation/orbitVisual.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/orbitVisual.test.ts`

**Interfaces:**
- Produces: `getOrbitVisuals(base: number): { decorativeRadius: number; gameplayGlowWidth: number; decorativeAlpha: number }`
- `GameScene.resize()` consumes these values only for drawing; gameplay radii stay untouched.

- [ ] **Step 1: Write the failing orbit presentation test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrbitVisuals } from '../src/presentation/orbitVisual.ts';

test('decorative ring sits outside the outer gameplay orbit', () => {
  const visuals = getOrbitVisuals(1000);
  assert.ok(visuals.decorativeRadius > 310);
  assert.ok(visuals.decorativeRadius < 390);
  assert.ok(visuals.decorativeAlpha < 0.2);
});
```

- [ ] **Step 2: Run test to verify RED**

Run: `node --experimental-strip-types --test tests/orbitVisual.test.ts`
Expected: FAIL because `orbitVisual.ts` does not exist.

- [ ] **Step 3: Implement orbit visual metrics**

Use a decorative radius near `base * 0.36`, brighter gameplay orbit cores, soft outer glow strokes, and a thin low-alpha decorative ring. Do not expose the decorative radius to collision/spawn systems.

- [ ] **Step 4: Integrate drawing into `GameScene.resize()`**

Keep `INNER_RADIUS_RATIO = 0.20` and `OUTER_RADIUS_RATIO = 0.31` exactly as gameplay values. Draw the decorative ring from the presentation helper only.

- [ ] **Step 5: Run test to verify GREEN**

Run: `node --experimental-strip-types --test tests/orbitVisual.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/orbitVisual.ts src/scenes/GameScene.ts tests/orbitVisual.test.ts
git commit -m "feat: match reference orbit presentation"
```

---

### Task 3: Reference Reactor Asset and Lighting

**Files:**
- Replace: `public/assets/reactor.webp`
- Modify: `src/config/visualSizing.ts`
- Modify: `src/presentation/reactorVisual.ts`
- Modify: `src/scenes/GameScene.ts`
- Test: `tests/reactorVisual.test.ts`

**Interfaces:**
- `calculateVisualSizes(base).reactor` remains the responsive reactor size.
- `createReactorGlowRings(size)` remains the glow interface.

- [ ] **Step 1: Tighten the failing visual metrics test**

Require the reactor to occupy roughly 30–32% of `base`, while preserving breathing room inside the inner orbit, and require warm inner glow plus weak cyan outer integration.

- [ ] **Step 2: Run test to verify RED**

Run: `node --experimental-strip-types --test tests/reactorVisual.test.ts`
Expected: FAIL on the updated target values.

- [ ] **Step 3: Generate and validate the reactor asset**

Create a fully circular top-down mechanical reactor matching the reference: dark gunmetal, four radial mechanical arms, orange plasma center, small cyan accent lights, transparent background, 10–12% alpha margin, no baked rectangular background. Convert to WebP and verify decoding and alpha bounds locally before Git upload.

- [ ] **Step 4: Update sizing and glow**

Tune reactor sizing and the local orange-to-cyan glow so the reactor reads as part of the scene rather than a pasted sprite. Keep normal blend mode.

- [ ] **Step 5: Run test to verify GREEN**

Run: `node --experimental-strip-types --test tests/reactorVisual.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/assets/reactor.webp src/config/visualSizing.ts src/presentation/reactorVisual.ts src/scenes/GameScene.ts tests/reactorVisual.test.ts
git commit -m "feat: upgrade reactor to reference style"
```

---

### Task 4: Reference Player Asset and Trail

**Files:**
- Replace: `public/assets/player.webp`
- Modify: `src/entities/Player.ts`
- Modify: `src/config/visualSizing.ts`
- Test: `tests/playerVisual.test.ts`

**Interfaces:**
- Existing tangent rotation helper remains unchanged unless visual orientation proves incorrect.
- Player gameplay radius and lane switching remain unchanged.

- [ ] **Step 1: Write/extend failing player presentation test**

Assert a player visual size around 8.5–9.5% of `base` and a trail sample budget large enough to remain visible at normal frame rates.

- [ ] **Step 2: Run test to verify RED**

Run: `node --experimental-strip-types --test tests/playerVisual.test.ts`
Expected: FAIL on the new trail/size target.

- [ ] **Step 3: Generate and validate the player asset**

Create a dimensional top-down cyan sci-fi craft matching the reference: metallic white/gunmetal panels, clear nose direction, cyan energy core, transparent background, readable silhouette at 40–80 px. Validate WebP decoding before upload.

- [ ] **Step 4: Integrate asset and tune trail**

Use a slightly longer but subtle cyan trail with smooth fade. Keep movement and lane transition logic untouched.

- [ ] **Step 5: Run test to verify GREEN**

Run: `node --experimental-strip-types --test tests/playerVisual.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/assets/player.webp src/entities/Player.ts src/config/visualSizing.ts tests/playerVisual.test.ts
git commit -m "feat: upgrade player to reference style"
```

---

### Task 5: Scene Foundation Verification

**Files:**
- No production changes unless verification exposes a defect.

**Interfaces:**
- None.

- [ ] **Step 1: Run pure tests**

Run: `node --experimental-strip-types --test tests/spaceField.test.ts tests/referenceBackdrop.test.ts tests/orbitVisual.test.ts tests/reactorVisual.test.ts tests/playerVisual.test.ts`
Expected: all tests PASS.

- [ ] **Step 2: Run project build locally**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Visual comparison**

Run `npm run dev` and compare the live gameplay scene against the approved reference. Confirm: cinematic nebula/asteroid framing, three-ring composition, reactor integrated into background, dimensional player asset, no blank asset-load failures, and unchanged gameplay behavior.

- [ ] **Step 4: Commit only if verification required a fix**

Use a narrowly scoped `fix:` commit describing the verified defect.
