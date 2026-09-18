import assert from 'node:assert/strict';
import test from 'node:test';
import { getCoverLayout } from '../src/background/backgroundLayout.ts';

test('cover layout preserves aspect ratio and fully covers viewport', () => {
  const layout = getCoverLayout(1710, 920, 1672, 941);

  assert.ok(layout.width >= 1710);
  assert.ok(layout.height >= 920);
  assert.ok(Math.abs(layout.width / layout.height - 1672 / 941) < 0.001);
  assert.equal(layout.x, (1710 - layout.width) / 2);
  assert.equal(layout.y, (920 - layout.height) / 2);
});

test('cover layout also covers portrait viewports without stretching', () => {
  const layout = getCoverLayout(390, 844, 1672, 941);

  assert.ok(layout.width >= 390);
  assert.ok(layout.height >= 844);
  assert.ok(Math.abs(layout.width / layout.height - 1672 / 941) < 0.001);
});
