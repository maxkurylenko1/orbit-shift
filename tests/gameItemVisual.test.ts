import assert from 'node:assert/strict';
import test from 'node:test';
import { getGameItemVisuals } from '../src/presentation/gameItemVisual.ts';

test('hazard and shard use distinct sizes at desktop scale', () => {
  assert.deepEqual(getGameItemVisuals(1000), { obstacle: 52, shard: 41 });
});

test('small screens retain readable items without oversized sprites', () => {
  assert.deepEqual(getGameItemVisuals(320), { obstacle: 22, shard: 18 });
  assert.deepEqual(getGameItemVisuals(-4), { obstacle: 22, shard: 18 });
});
