import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCorePulseScale,
  calculateReactorPulseAlpha,
  calculateReactorRingRotation,
  createReactorGlowRings,
  getReactorAssemblyMetrics,
} from '../src/presentation/reactorGeometry.ts';

test('reactor glow extends outside the mechanical body without becoming dominant', () => {
  const rings = createReactorGlowRings(300);
  const metrics = getReactorAssemblyMetrics(300);

  assert.equal(rings.length, 4);
  assert.ok(rings[0].radius > metrics.outerRadius);
  assert.ok(Math.max(...rings.map((ring) => ring.alpha)) <= 0.05);
});

test('reactor assembly keeps every layer nested inside one circular silhouette', () => {
  const metrics = getReactorAssemblyMetrics(300);

  assert.equal(metrics.outerRadius, 150);
  assert.ok(metrics.bodyRadius < metrics.outerRadius);
  assert.ok(metrics.innerRingRadius < metrics.bodyRadius);
  assert.ok(metrics.coreRadius < metrics.innerRingRadius);
  assert.ok(metrics.armOffset + metrics.armLength * 0.5 <= metrics.outerRadius);
});

test('reactor animation remains subtle', () => {
  for (const elapsed of [0, 0.8, 1.6, 2.4, 3.2]) {
    assert.ok(calculateReactorPulseAlpha(elapsed) >= 0.93);
    assert.ok(calculateReactorPulseAlpha(elapsed) <= 0.99);
    assert.ok(calculateCorePulseScale(elapsed) >= 0.96);
    assert.ok(calculateCorePulseScale(elapsed) <= 1.04);
  }

  assert.ok(calculateReactorRingRotation(10) > 0);
  assert.ok(calculateReactorRingRotation(10) < Math.PI * 2);
});
