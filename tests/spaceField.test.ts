import assert from 'node:assert/strict';
import test from 'node:test';
import { createSpaceField, getBackgroundMetrics } from '../src/background/spaceField.ts';

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

test('background metrics scale from the smaller viewport dimension', () => {
  assert.deepEqual(getBackgroundMetrics(1280, 720), {
    base: 720,
    centerGlowRadius: 324,
    vignetteInset: 50,
  });
});
