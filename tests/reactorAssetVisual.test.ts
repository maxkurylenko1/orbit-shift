import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateReactorAssetPulse,
  getReactorAssetVisual,
} from '../src/presentation/reactorAssetVisual.ts';

test('reactor delegates soft halo rendering to the authored asset', () => {
  const visual = getReactorAssetVisual(300);

  assert.deepEqual(visual, {
    spriteSize: 300,
    pulseAmplitude: 0.015,
  });

  for (const elapsed of [0, 0.85, 1.7, 2.55, 3.4]) {
    const pulse = calculateReactorAssetPulse(elapsed, visual.pulseAmplitude);
    assert.ok(pulse >= 0.975);
    assert.ok(pulse <= 1.025);
  }
});

test('reactor feedback pulse adds a restrained gameplay impulse', () => {
  const idle = calculateReactorAssetPulse(0, 0.015, 0);
  const pickup = calculateReactorAssetPulse(0, 0.015, 0.65);
  const impact = calculateReactorAssetPulse(0, 0.015, 1);

  assert.ok(pickup > idle);
  assert.ok(impact > pickup);
  assert.ok(impact <= 1.04);
});
