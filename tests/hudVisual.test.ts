import assert from 'node:assert/strict';
import test from 'node:test';
import { getHudVisualMetrics, snapHudCoordinate } from '../src/presentation/hudVisual.ts';

test('HUD metrics cap text resolution and keep a clear type hierarchy', () => {
  const metrics = getHudVisualMetrics(920, 2.75);

  assert.equal(metrics.resolution, 2);
  assert.ok(metrics.primaryFontSize > metrics.secondaryFontSize);
  assert.ok(metrics.primaryFontSize >= 20);
  assert.ok(metrics.secondaryFontSize >= 14);
  assert.ok(metrics.letterSpacing > 0);
});

test('HUD coordinates snap to whole CSS pixels', () => {
  assert.equal(snapHudCoordinate(23.2), 23);
  assert.equal(snapHudCoordinate(23.7), 24);
});
