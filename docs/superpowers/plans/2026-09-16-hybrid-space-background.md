# Hybrid Space Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive hybrid deep-space background to Orbit Shift that makes the gameplay scene feel cinematic without changing gameplay behavior.

**Architecture:** Keep background responsibilities outside `GameScene`. Pure deterministic layout helpers generate stable star/nebula placement data; a dedicated `SpaceBackground` Pixi class owns background display objects and resize rendering. `GameScene` only instantiates the background layer, adds it behind gameplay, and forwards resize/destroy lifecycle calls.

**Tech Stack:** TypeScript, PixiJS 8, Node 22 built-in test runner for pure logic verification.

**Spec:** `docs/superpowers/specs/2026-09-16-orbit-shift-visual-pass-design.md`

## Global Constraints

- Keep collision, scoring, combo, spawn, difficulty, input, restart, and countdown behavior unchanged.
- Responsive geometry must derive from `Math.min(width, height)` and remain stable on portrait, landscape, and desktop.
- Milestone 1 includes procedural dark base, deterministic stars, center glow, vignette, and initial depth/nebula hooks.
- Do not add the decorative third orbit in this milestone; that belongs to Milestone 2.
- Do not replace player, reactor, obstacle, shard, HUD, MenuScene, or GameOverOverlay assets/styles in this milestone.
- No new runtime dependencies.

---

### Task 1: Deterministic background layout model

**Files:**
- Create: `src/background/spaceField.ts`
- Create: `tests/spaceField.test.ts`

**Interfaces:**
- Produces: `createSpaceField(width: number, height: number, seed?: number): SpaceFieldLayout`
- Produces: `SpaceFieldLayout` with `stars`, `nebulae`, and normalized composition data consumed by `SpaceBackground`.

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createSpaceField } from '../src/background/spaceField.ts';

test('createSpaceField is deterministic for the same viewport and seed', () => {
  const first = createSpaceField(1280, 720, 42);
  const second = createSpaceField(1280, 720, 42);
  assert.deepEqual(first, second);
});

test('createSpaceField keeps all normalized star positions inside the viewport', () => {
  const layout = createSpaceField(390, 844, 42);
  assert.ok(layout.stars.length >= 50);

  for (const star of layout.stars) {
    assert.ok(star.x >= 0 && star.x <= 390);
    assert.ok(star.y >= 0 && star.y <= 844);
    assert.ok(star.radius > 0);
    assert.ok(star.alpha > 0 && star.alpha <= 1);
  }
});

test('createSpaceField scales density from viewport area without exploding on large screens', () => {
  const mobile = createSpaceField(390, 844, 42);
  const desktop = createSpaceField(1920, 1080, 42);
  assert.ok(desktop.stars.length > mobile.stars.length);
  assert.ok(desktop.stars.length <= 180);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node --experimental-strip-types --test tests/spaceField.test.ts
```

Expected: FAIL because `src/background/spaceField.ts` does not exist.

- [ ] **Step 3: Implement the minimal deterministic layout helper**

Create `src/background/spaceField.ts` with:

```ts
export interface SpaceStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export interface SpaceNebulaPatch {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export interface SpaceFieldLayout {
  stars: SpaceStar[];
  nebulae: SpaceNebulaPatch[];
}

const MIN_STARS = 60;
const MAX_STARS = 180;
const STAR_AREA_DIVISOR = 12_000;

const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const createSpaceField = (
  width: number,
  height: number,
  seed = 0x0b17,
): SpaceFieldLayout => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const random = mulberry32(seed);
  const count = Math.min(
    MAX_STARS,
    Math.max(MIN_STARS, Math.round((safeWidth * safeHeight) / STAR_AREA_DIVISOR)),
  );

  const stars = Array.from({ length: count }, () => ({
    x: random() * safeWidth,
    y: random() * safeHeight,
    radius: 0.5 + random() * 1.35,
    alpha: 0.2 + random() * 0.65,
  }));

  const base = Math.min(safeWidth, safeHeight);
  const nebulae: SpaceNebulaPatch[] = [
    {
      x: safeWidth * 0.2,
      y: safeHeight * 0.28,
      radius: base * 0.34,
      alpha: 0.035,
    },
    {
      x: safeWidth * 0.8,
      y: safeHeight * 0.7,
      radius: base * 0.42,
      alpha: 0.028,
    },
  ];

  return { stars, nebulae };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
node --experimental-strip-types --test tests/spaceField.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/background/spaceField.ts tests/spaceField.test.ts
git commit -m "test: define deterministic space background layout"
```

---

### Task 2: Pixi background renderer

**Files:**
- Create: `src/background/SpaceBackground.ts`

**Interfaces:**
- Consumes: `createSpaceField(width, height, seed)` from Task 1.
- Produces: `SpaceBackground.view: Container`
- Produces: `SpaceBackground.resize(width: number, height: number): void`
- Produces: `SpaceBackground.destroy(): void`

- [ ] **Step 1: Write the failing test for renderer-independent sizing constants**

Extend `tests/spaceField.test.ts`:

```ts
import { createSpaceField, getBackgroundMetrics } from '../src/background/spaceField.ts';

test('background metrics scale from the smaller viewport dimension', () => {
  assert.deepEqual(getBackgroundMetrics(1280, 720), {
    base: 720,
    centerGlowRadius: 324,
    vignetteInset: 50,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node --experimental-strip-types --test tests/spaceField.test.ts
```

Expected: FAIL because `getBackgroundMetrics` is not exported.

- [ ] **Step 3: Implement background metrics**

Add to `src/background/spaceField.ts`:

```ts
export interface BackgroundMetrics {
  base: number;
  centerGlowRadius: number;
  vignetteInset: number;
}

export const getBackgroundMetrics = (
  width: number,
  height: number,
): BackgroundMetrics => {
  const base = Math.max(1, Math.min(width, height));
  return {
    base,
    centerGlowRadius: Math.round(base * 0.45),
    vignetteInset: Math.round(base * 0.07),
  };
};
```

- [ ] **Step 4: Run the pure tests again**

Run:
```bash
node --experimental-strip-types --test tests/spaceField.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Implement `SpaceBackground`**

Create `src/background/SpaceBackground.ts` using Pixi `Container` and `Graphics` only. It should create four internal layers:

```ts
private readonly baseLayer = new Graphics();
private readonly nebulaLayer = new Graphics();
private readonly starLayer = new Graphics();
private readonly vignetteLayer = new Graphics();
```

Constructor:

```ts
public readonly view = new Container();

public constructor() {
  this.view.addChild(
    this.baseLayer,
    this.nebulaLayer,
    this.starLayer,
    this.vignetteLayer,
  );
}
```

`resize(width, height)` must:
- clear all four graphics;
- draw a full-screen `0x030713` base rectangle;
- draw a second full-screen translucent `0x08142b` wash at low alpha;
- call `createSpaceField(width, height, 0x0b17)`;
- render each nebula patch as 3 concentric translucent circles to approximate a soft haze without filters;
- render stars as small circles with per-star alpha;
- draw a cyan/navy center glow behind the reactor using 5 concentric circles centered on the viewport;
- approximate vignette using four dark edge rectangles with alpha between `0.08` and `0.18`, sized from `getBackgroundMetrics().vignetteInset`;
- avoid filters, blur shaders, sprites, or new textures in Milestone 1.

Recommended colors:

```ts
const BASE_COLOR = 0x030713;
const WASH_COLOR = 0x08142b;
const STAR_COLOR = 0xd9f6ff;
const NEBULA_COLOR = 0x164b73;
const CENTER_GLOW_COLOR = 0x0d6a86;
const VIGNETTE_COLOR = 0x01030a;
```

Center glow example:

```ts
for (let ring = 5; ring >= 1; ring -= 1) {
  const progress = ring / 5;
  this.nebulaLayer
    .circle(centerX, centerY, centerGlowRadius * progress)
    .fill({ color: CENTER_GLOW_COLOR, alpha: 0.012 + (1 - progress) * 0.018 });
}
```

- [ ] **Step 6: Standalone TypeScript verification for pure logic**

Run:
```bash
tsc --strict --noEmit --target ES2022 --module ESNext src/background/spaceField.ts
```

Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/background/spaceField.ts src/background/SpaceBackground.ts tests/spaceField.test.ts
git commit -m "feat: add procedural space background renderer"
```

---

### Task 3: Integrate background into `GameScene`

**Files:**
- Modify: `src/scenes/GameScene.ts`

**Interfaces:**
- Consumes: `new SpaceBackground()`
- Calls: `spaceBackground.resize(width, height)` from `GameScene.resize()`.
- Calls: `spaceBackground.destroy()` indirectly through scene child destruction; do not double-destroy the same Pixi children.

- [ ] **Step 1: Add import and background instance**

At the top of `GameScene.ts`:

```ts
import { SpaceBackground } from '../background/SpaceBackground';
```

Inside `GameScene`:

```ts
private readonly spaceBackground = new SpaceBackground();
```

- [ ] **Step 2: Put the background at the bottom of the display list**

Change the beginning of `this.view.addChild(...)` so the order starts with:

```ts
this.view.addChild(
  this.spaceBackground.view,
  this.reactor,
  this.orbits,
  this.player.trailView,
  // existing gameplay layers continue unchanged
);
```

Do not reorder obstacle, collectible, player, HUD, countdown, or overlay relative to each other in this milestone.

- [ ] **Step 3: Forward resize lifecycle**

In `GameScene.resize(width, height)`, after computing `centerX`, `centerY`, and before drawing reactor/orbits:

```ts
this.spaceBackground.resize(width, height);
```

Do not touch gameplay radii (`INNER_RADIUS_RATIO`, `OUTER_RADIUS_RATIO`) in this task.

- [ ] **Step 4: Run pure tests**

Run:
```bash
node --experimental-strip-types --test tests/spaceField.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Run project verification when dependencies are available**

Run:
```bash
npm run build
```

Expected: TypeScript + Vite build PASS. If dependencies are unavailable in the execution environment, report that limitation instead of claiming success.

- [ ] **Step 6: Manual visual verification**

Run:
```bash
npm run dev
```

Verify at minimum:
- desktop landscape around 1920×1080;
- narrow portrait around 390×844;
- stars remain deterministic after restart/resize;
- center glow stays under the reactor;
- HUD remains readable;
- gameplay mechanics, collision, spawn cadence, scoring, combo, and countdown feel unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/scenes/GameScene.ts
git commit -m "feat: integrate hybrid space background"
```

---

## Self-Review

- Spec coverage for Milestone 1: procedural base, stars, center glow, vignette, and initial nebula/depth hooks are covered.
- Deliberately deferred per spec: decorative outer ring, upgraded player/reactor assets, obstacle/shard visuals, HUD/Menu/GameOver polish.
- No new runtime dependency is introduced.
- Pure layout logic is independently testable before Pixi integration.
- Gameplay behavior is not modified.
