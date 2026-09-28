import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getImpactShake,
  getLaneSwitchVisual,
  getTransientAlpha,
} from '../src/presentation/gameFeelVisual.ts';

test('lane switch visual peaks at mid-transition and returns to neutral', () => {
  const start = getLaneSwitchVisual(0, 1);
  const middle = getLaneSwitchVisual(0.5, 1);
  const end = getLaneSwitchVisual(1, 1);

  assert.deepEqual(start, {
    scaleX: 1,
    scaleY: 1,
    rotationOffset: 0,
    trailBoost: 1,
    glowBoost: 1,
  });
  assert.ok(middle.scaleX > 1.06);
  assert.ok(middle.scaleY < 0.96);
  assert.ok(middle.rotationOffset > 0.1);
  assert.ok(middle.trailBoost > 1.6);
  assert.ok(middle.glowBoost > 1.5);
  assert.ok(Math.abs(end.scaleX - 1) < 1e-12);
  assert.ok(Math.abs(end.scaleY - 1) < 1e-12);
  assert.ok(Math.abs(end.rotationOffset) < 1e-12);
});

test('lane switch tilt follows the transition direction', () => {
  const inward = getLaneSwitchVisual(0.5, -1);
  const outward = getLaneSwitchVisual(0.5, 1);

  assert.ok(inward.rotationOffset < 0);
  assert.ok(outward.rotationOffset > 0);
  assert.equal(
    Math.abs(inward.rotationOffset),
    Math.abs(outward.rotationOffset),
  );
});

test('impact shake damps to zero within its short effect window', () => {
  const early = getImpactShake(0.03, 8);
  const late = getImpactShake(0.2, 8);
  const finished = getImpactShake(0.22, 8);

  assert.ok(Math.hypot(early.x, early.y) > Math.hypot(late.x, late.y));
  assert.deepEqual(finished, { x: 0, y: 0 });
});

test('transient alpha clamps and fades linearly', () => {
  assert.equal(getTransientAlpha(-1, 0.2), 1);
  assert.equal(getTransientAlpha(0.1, 0.2), 0.5);
  assert.equal(getTransientAlpha(0.2, 0.2), 0);
  assert.equal(getTransientAlpha(1, 0), 0);
});
