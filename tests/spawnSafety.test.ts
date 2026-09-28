import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeSpawnInterval } from '../src/systems/spawnSafety.ts';

test('fast patterns retain a minimum human reaction window', () => {
  const interval = getSafeSpawnInterval(0.95, 0.45, 1.95);

  assert.ok(interval >= 0.59);
});

test('normal pattern spacing remains untouched when already safe', () => {
  assert.equal(getSafeSpawnInterval(1.8, 1, 1.2), 1.8);
});
