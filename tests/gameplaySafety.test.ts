import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findSafeCollectiblePlacement,
  resolveSafeObstacleLane,
} from '../src/systems/gameplaySafety.ts';

test('obstacle reroutes instead of closing both lanes at the same angle', () => {
  const lane = resolveSafeObstacleLane(
    'outer',
    1,
    [{ lane: 'inner', angle: 1.08 }],
  );

  assert.equal(lane, 'inner');
});

test('obstacle skips a spawn when every lane would be unsafe', () => {
  const lane = resolveSafeObstacleLane(
    'outer',
    1,
    [
      { lane: 'inner', angle: 1.06 },
      { lane: 'outer', angle: 1.04 },
    ],
  );

  assert.equal(lane, null);
});

test('obstacle does not spawn on top of an active collectible', () => {
  const lane = resolveSafeObstacleLane(
    'outer',
    2,
    [],
    [{ lane: 'outer', angle: 2.05 }],
  );

  assert.equal(lane, 'inner');
});

test('collectible flips lane when the preferred lane is occupied', () => {
  const placement = findSafeCollectiblePlacement(
    'outer',
    2,
    [{ lane: 'outer', angle: 2.1 }],
  );

  assert.deepEqual(placement, { lane: 'inner', angle: 2 });
});

test('collectible offsets its angle when both lanes are blocked', () => {
  const placement = findSafeCollectiblePlacement(
    'outer',
    2,
    [
      { lane: 'outer', angle: 2 },
      { lane: 'inner', angle: 2.02 },
    ],
  );

  assert.ok(placement);
  assert.ok(Math.abs((placement?.angle ?? 0) - 2) > 0.4);
});
