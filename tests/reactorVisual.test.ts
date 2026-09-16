import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateVisualSizes } from '../src/config/visualSizing.ts';
import {
  calculateReactorPulseAlpha,
  createReactorGlowRings,
} from '../src/presentation/reactorVisual.ts';

test('reactor uses a slightly smaller presentation size with breathing room', () => {
  assert.equal(calculateVisualSizes(1000).reactor, 285);
  assert.equal(calculateVisualSizes(200).reactor, 96);
});

test('reactor glow stays soft and extends beyond the asset', () => {
  const rings = createReactorGlowRings(285);
  assert.equal(rings.length, 5);
  assert.ok(rings[0].radius > 285 * 0.5);
  assert.ok(rings[0].radius < 285 * 0.7);
  assert.ok(rings.at(-1)!.radius < 285 * 0.4);
  for (let index = 1; index < rings.length; index += 1) {
    assert.ok(rings[index - 1].radius > rings[index].radius);
  }
  assert.ok(Math.max(...rings.map((ring) => ring.alpha)) <= 0.03);
});

test('reactor pulse remains subtle', () => {
  for (const elapsed of [0, 0.75, 1.5, 2.25, 3]) {
    const alpha = calculateReactorPulseAlpha(elapsed);
    assert.ok(alpha >= 0.95 && alpha <= 1);
  }
});
