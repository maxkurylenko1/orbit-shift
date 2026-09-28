import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateVisualSizes } from '../src/config/visualSizing.ts';
import { getPlayerPresentationMetrics } from '../src/presentation/playerVisual.ts';

test('player is large enough to read against the cinematic scene', () => {
  assert.equal(calculateVisualSizes(1000).player, 92);
  assert.equal(calculateVisualSizes(200).player, 30);
});

test('player trail stays visible without becoming a ribbon', () => {
  const metrics = getPlayerPresentationMetrics(1000);
  assert.equal(metrics.trailPointCount, 30);
  assert.ok(metrics.trailWidth >= 4 && metrics.trailWidth <= 7);
  assert.ok(metrics.trailHeadAlpha <= 0.52);
  assert.ok(metrics.glowRadius > 40 && metrics.glowRadius < 70);
});

test('large screens cap authored sprite and trail scale', () => {
  assert.deepEqual(calculateVisualSizes(4000), calculateVisualSizes(1200));
  assert.deepEqual(
    getPlayerPresentationMetrics(4000),
    getPlayerPresentationMetrics(1200),
  );
});
