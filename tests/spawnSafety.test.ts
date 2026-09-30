import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeSpawnInterval } from '../src/systems/spawnSafety.ts';

test('fast patterns preserve enough spacing to switch lanes', () => {
  const interval = getSafeSpawnInterval(0.95, 0.45, 1.95);

  assert.ok(interval >= 0.515);
  assert.ok(interval < 0.55);
});

test('late fast patterns are meaningfully faster than regular steps', () => {
  const fast = getSafeSpawnInterval(0.66, 0.55, 2.85);
  const normal = getSafeSpawnInterval(0.66, 1, 2.85);

  assert.ok(fast >= 0.53 && fast <= 0.55);
  assert.ok(fast < normal * 0.85);
});

test('normal spawn spacing remains unchanged', () => {
  assert.equal(getSafeSpawnInterval(1.8, 1, 1.2), 1.8);
});
