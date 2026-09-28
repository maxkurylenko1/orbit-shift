import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getHudLayoutMetrics,
  getResponsiveViewportMetrics,
  MAX_VISUAL_BASE,
} from '../src/config/responsiveLayout.ts';

const CASES = [
  { width: 375, height: 667, expectedBase: 375, compact: true },
  { width: 390, height: 844, expectedBase: 390, compact: true },
  { width: 1366, height: 768, expectedBase: 768, compact: false },
  { width: 1920, height: 1080, expectedBase: 1080, compact: false },
  { width: 3440, height: 1440, expectedBase: MAX_VISUAL_BASE, compact: false },
] as const;

test('responsive metrics cover phone, laptop, desktop, and ultrawide targets', () => {
  for (const target of CASES) {
    const metrics = getResponsiveViewportMetrics(target.width, target.height);

    assert.equal(metrics.visualBase, target.expectedBase);
    assert.equal(metrics.compactHud, target.compact);
    assert.equal(metrics.centerX, target.width * 0.5);
    assert.equal(metrics.centerY, target.height * 0.5);
    assert.ok(metrics.hudPadding >= 16);
    assert.ok(metrics.hudPadding <= 32);
  }
});

test('compact HUD moves combo to the secondary row', () => {
  const phone = getResponsiveViewportMetrics(390, 844);
  const layout = getHudLayoutMetrics(phone, 20);

  assert.equal(layout.scoreY, phone.hudPadding);
  assert.ok(layout.comboY > layout.scoreY);
  assert.equal(layout.comboY, layout.bestY);
});

test('desktop HUD keeps combo on the top row', () => {
  const desktop = getResponsiveViewportMetrics(1920, 1080);
  const layout = getHudLayoutMetrics(desktop, 30);

  assert.equal(layout.comboY, layout.scoreY);
  assert.ok(layout.bestY > layout.scoreY);
});
