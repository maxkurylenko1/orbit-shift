import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateVisualSizes } from '../src/config/visualSizing.ts';
import {
  calculateReactorPulseAlpha,
  createReactorGlowRings,
  getReactorFrameMetrics,
} from '../src/presentation/reactorVisual.ts';

test('reactor anchors the center with breathing room', () => {
  assert.equal(calculateVisualSizes(1000).reactor, 310);
  assert.equal(calculateVisualSizes(200).reactor, 104);
});

test('reactor glow reaches beyond the frame while staying controlled', () => {
  const rings = createReactorGlowRings(310);
  assert.equal(rings.length, 5);
  assert.ok(rings[0].radius >= 195 && rings[0].radius <= 215);
  assert.ok(Math.max(...rings.map((ring) => ring.alpha)) <= 0.05);
  assert.ok(Math.max(...rings.map((ring) => ring.alpha)) >= 0.035);
});

test('legacy reactor sprite is contained inside a circular mechanical frame', () => {
  const frame = getReactorFrameMetrics(310);
  assert.ok(frame.spriteSize < 310);
  assert.ok(frame.maskRadius < frame.frameRadius);
  assert.ok(frame.armLength > frame.armThickness);
});

test('reactor pulse remains subtle', () => {
  for (const elapsed of [0, 0.8, 1.6, 2.4, 3.2]) {
    const alpha = calculateReactorPulseAlpha(elapsed);
    assert.ok(alpha >= 0.94 && alpha <= 1);
  }
});
