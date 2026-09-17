import assert from 'node:assert/strict';
import test from 'node:test';
import { createSpaceField } from '../src/background/spaceField.ts';

test('nebula accents stay compact and outside the gameplay center', () => {
  const width = 1710;
  const height = 920;
  const base = Math.min(width, height);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const layout = createSpaceField(width, height, 42);

  for (const patch of layout.nebulae) {
    assert.ok(patch.radius <= base * 0.26);
    assert.ok(Math.hypot(patch.x - centerX, patch.y - centerY) >= base * 0.42);
  }
});
