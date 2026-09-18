import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateReactorAssetPulse,
  getReactorAssetVisual,
} from '../src/presentation/reactorAssetVisual.ts';

test('reactor asset presentation stays visually restrained', () => {
  const visual = getReactorAssetVisual(300);

  assert.equal(visual.spriteSize, 300);
  assert.ok(visual.outerHaloAlpha <= 0.06);
  assert.ok(visual.innerHaloAlpha <= 0.08);
  assert.ok(visual.pulseAmplitude <= 0.03);

  for (const elapsed of [0, 0.85, 1.7, 2.55, 3.4]) {
    const pulse = calculateReactorAssetPulse(elapsed, visual.pulseAmplitude);
    assert.ok(pulse >= 0.97);
    assert.ok(pulse <= 1.03);
  }
});
