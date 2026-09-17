import assert from 'node:assert/strict';
import test from 'node:test';
import { createAsteroidPolygon } from '../src/background/asteroidShape.ts';

test('asteroid silhouette is angular and irregular instead of circular', () => {
  const points = createAsteroidPolygon(100, 80, 40, 2);

  assert.equal(points.length, 16);

  const distances: number[] = [];
  for (let index = 0; index < points.length; index += 2) {
    distances.push(Math.hypot(points[index] - 100, points[index + 1] - 80));
  }

  assert.ok(Math.max(...distances) - Math.min(...distances) >= 8);
});
