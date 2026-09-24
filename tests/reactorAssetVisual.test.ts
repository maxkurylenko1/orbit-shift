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
