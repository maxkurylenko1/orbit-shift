import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrbitVisuals } from '../src/presentation/orbitVisual.ts';

test('decorative ring sits outside enlarged gameplay orbits', () => {
  const visuals = getOrbitVisuals(1000);

  assert.equal(visuals.innerRadius, 210);
  assert.equal(visuals.outerRadius, 325);
  assert.equal(visuals.decorativeRadius, 380);
  assert.ok(visuals.decorativeRadius > visuals.outerRadius);
  assert.ok(visuals.decorativeAlpha < 0.2);
  assert.ok(visuals.gameplayGlowWidth > visuals.gameplayCoreWidth);
});
