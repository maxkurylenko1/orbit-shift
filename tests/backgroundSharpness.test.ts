import assert from 'node:assert/strict';
import test from 'node:test';
import { createSpaceField } from '../src/background/spaceField.ts';

test('nebula accents stay narrow and away from the gameplay center', () => {
  const width = 1710;
  const height = 920;
  const base = Math.min(width, height);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const layout = createSpaceField(width, height, 42);

  for (const patch of layout.nebulae) {
    assert.ok(patch.radius <= base * 0.16);
    assert.ok(Math.hypot(patch.x - centerX, patch.y - centerY) >= base * 0.52);
  }
});

test('asteroid framing stays compact instead of creating giant circular blobs', () => {
  const width = 1710;
  const height = 920;
  const base = Math.min(width, height);
  const layout = createSpaceField(width, height, 42);

  assert.ok(layout.asteroids.length >= 6);
  for (const asteroid of layout.asteroids) {
    assert.ok(asteroid.radius <= base * 0.095);
  }
});
