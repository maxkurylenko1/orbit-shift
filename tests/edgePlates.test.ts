import assert from 'node:assert/strict';
import test from 'node:test';
import { getEdgePlateLayout } from '../src/background/edgePlates.ts';

test('edge plates use the high-resolution crop aspect without horizontal stretching', () => {
  const layout = getEdgePlateLayout(1710, 920);

  assert.equal(layout.width, 360);
  assert.equal(layout.height, 920);
  assert.equal(layout.leftX, 0);
  assert.equal(layout.rightX, 1350);
});

test('edge plates stay narrow on portrait layouts', () => {
  const layout = getEdgePlateLayout(390, 844);

  assert.ok(layout.width <= 110);
  assert.equal(layout.height, 844);
  assert.equal(layout.rightX, 390 - layout.width);
});
