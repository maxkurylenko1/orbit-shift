import assert from 'node:assert/strict';
import test from 'node:test';
import { getGameItemVisuals } from '../src/presentation/gameItemVisual.ts';

test('hazard and shard use distinct sizes at desktop scale', () => {
  assert.deepEqual(getGameItemVisuals(1000), { obstacle: 58, shard: 44 });
});

test('small screens retain readable items without oversized sprites', () => {
  assert.deepEqual(getGameItemVisuals(320), { obstacle: 24, shard: 20 });
  assert.deepEqual(getGameItemVisuals(-4), { obstacle: 24, shard: 20 });
});

test('ultrawide and 4K layouts cap item scale', () => {
  assert.deepEqual(getGameItemVisuals(4000), getGameItemVisuals(1200));
});
