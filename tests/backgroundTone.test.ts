import assert from 'node:assert/strict';
import test from 'node:test';
import { getBackgroundTone } from '../src/background/backgroundTone.ts';

test('game background is darker near the gameplay arena', () => {
  const tone = getBackgroundTone(1920, 1080, 'game');

  assert.equal(tone.globalAlpha, 0.12);
  assert.ok(tone.radialLayers >= 24);
  assert.ok(tone.radialLayerAlpha > 0);
  assert.ok(tone.centerRadius > 1080 * 0.5);
});

test('menu retains a gentler backdrop without a radial vignette', () => {
  const menu = getBackgroundTone(390, 844, 'menu');
  const game = getBackgroundTone(390, 844, 'game');

  assert.ok(menu.globalAlpha < game.globalAlpha);
  assert.equal(menu.radialLayers, 0);
  assert.equal(menu.radialLayerAlpha, 0);
  assert.equal(menu.tint, game.tint);
});

test('ultrawide layout caps the visual vignette radius', () => {
  const ultra = getBackgroundTone(3440, 1440, 'game');
  const capped = getBackgroundTone(1920, 1200, 'game');

  assert.equal(ultra.centerRadius, capped.centerRadius);
});
