import assert from 'node:assert/strict';
import test from 'node:test';
import { createSpaceField } from '../src/background/spaceField.ts';

test('cinematic field includes edge asteroids and a galaxy cluster', () => {
  const field = createSpaceField(1600, 900, 0x0b17);

  assert.ok(field.asteroids.length >= 6);
  assert.ok(field.galaxyStars.length >= 24);
  assert.ok(
    field.asteroids.some(
      (asteroid) =>
        asteroid.x < 100 ||
        asteroid.x > 1500 ||
        asteroid.y < 100 ||
        asteroid.y > 800,
    ),
  );
});
