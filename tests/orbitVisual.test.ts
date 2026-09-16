import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrbitVisuals } from '../src/presentation/orbitVisual.ts';

test('decorative ring sits outside outer gameplay orbit', () => {
  const visuals = getOrbitVisuals(1000);

  assert.equal(visuals.decorativeRadius, 365);
  assert.ok(visuals.decorativeRadius > 310);
  assert.ok(visuals.decorativeAlpha < 0.2);
  assert.ok(visuals.gameplayGlowWidth > visuals.gameplayCoreWidth);
});
