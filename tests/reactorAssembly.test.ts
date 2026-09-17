import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCorePulseScale,
  calculateReactorRingRotation,
  getReactorAssemblyMetrics,
} from '../src/presentation/reactorVisual.ts';

test('reactor assembly keeps the core nested inside one mechanical body', () => {
  const metrics = getReactorAssemblyMetrics(300);

  assert.equal(metrics.outerRadius, 150);
  assert.ok(metrics.bodyRadius < metrics.outerRadius);
  assert.ok(metrics.innerRingRadius < metrics.bodyRadius);
  assert.ok(metrics.coreRadius < metrics.innerRingRadius);
  assert.ok(metrics.armOffset + metrics.armLength * 0.5 <= metrics.outerRadius);
});

test('reactor motion stays subtle', () => {
  for (const elapsed of [0, 0.8, 1.6, 2.4, 3.2]) {
    const scale = calculateCorePulseScale(elapsed);
    assert.ok(scale >= 0.96 && scale <= 1.04);
  }

  assert.ok(calculateReactorRingRotation(10) > 0);
  assert.ok(calculateReactorRingRotation(10) < Math.PI * 2);
});
