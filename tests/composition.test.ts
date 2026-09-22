import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateVisualSizes } from '../src/config/visualSizing.ts';
import { getOrbitVisuals } from '../src/presentation/orbitVisual.ts';

test('center composition leaves more breathing room around the reactor', () => {
  const base = 1000;
  const sizes = calculateVisualSizes(base);
  const orbits = getOrbitVisuals(base);

  assert.equal(sizes.reactor, 285);
  assert.equal(orbits.innerRadius, 210);
  assert.equal(orbits.outerRadius, 325);
  assert.equal(orbits.decorativeRadius, 380);
});

test('small viewports keep a restrained minimum reactor size', () => {
  assert.equal(calculateVisualSizes(200).reactor, 96);
});
