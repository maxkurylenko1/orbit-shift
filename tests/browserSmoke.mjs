import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const TARGETS = [
  { name: 'phone-small', width: 375, height: 667, mobile: true },
  { name: 'phone-modern', width: 390, height: 844, mobile: true },
  { name: 'phone-landscape', width: 844, height: 390, mobile: true },
  { name: 'laptop', width: 1366, height: 768, mobile: false },
  { name: 'desktop', width: 1920, height: 1080, mobile: false },
  { name: 'ultrawide', width: 3440, height: 1440, mobile: false },
];

const baseUrl = process.env.ORBIT_QA_URL ?? 'http://127.0.0.1:4173';
const screenshotDir = 'qa-screenshots';
const SCREENSHOT_TARGETS = new Set(['phone-modern', 'desktop']);

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    '--enable-webgl',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
  ],
});

try {
  for (const target of TARGETS) {
    const context = await browser.newContext({
      viewport: { width: target.width, height: target.height },
      isMobile: target.mobile,
      hasTouch: target.mobile,
      deviceScaleFactor: target.mobile ? 2 : 1,
    });
    const page = await context.newPage();
    const pageErrors = [];

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(baseUrl, { waitUntil: 'load', timeout: 30_000 });
    const canvas = page.locator('canvas.game-canvas');
    const soundButton = page.locator('button.audio-toggle');

    await canvas.waitFor({ timeout: 20_000 });
    await soundButton.waitFor({ timeout: 20_000 });

    const size = await page.evaluate(() => {
      const canvasElement = document.querySelector('canvas.game-canvas');
      const rect = canvasElement.getBoundingClientRect();

      return {
        width: rect.width,
        height: rect.height,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    });

    assert.ok(
      Math.abs(size.viewportWidth - target.width) < 2 &&
        Math.abs(size.viewportHeight - target.height) < 2,
      `${target.name}: emulated browser viewport mismatch: ${JSON.stringify(size)}`,
    );
    assert.ok(
      Math.abs(size.width - size.viewportWidth) < 2,
      `${target.name}: canvas width does not fit viewport: ${JSON.stringify(size)}`,
    );
    assert.ok(
      Math.abs(size.height - size.viewportHeight) < 2,
      `${target.name}: canvas height does not fit viewport: ${JSON.stringify(size)}`,
    );
    assert.ok(
      size.scrollWidth <= size.viewportWidth + 1 &&
        size.scrollHeight <= size.viewportHeight + 1,
      `${target.name}: document scrolls unexpectedly: ${JSON.stringify(size)}`,
    );

    await soundButton.click();
    assert.equal(
      await soundButton.getAttribute('aria-pressed'),
      'true',
      `${target.name}: mute button did not toggle`,
    );

    await page.reload({ waitUntil: 'load' });
    await canvas.waitFor({ timeout: 20_000 });
    assert.equal(
      await soundButton.getAttribute('aria-pressed'),
      'true',
      `${target.name}: mute preference did not persist`,
    );

    await page.keyboard.press('m');
    assert.equal(
      await soundButton.getAttribute('aria-pressed'),
      'false',
      `${target.name}: keyboard mute shortcut failed`,
    );

    await canvas.click({
      position: { x: target.width * 0.5, y: target.height * 0.5 },
    });
    await page.waitForTimeout(300);

    if (SCREENSHOT_TARGETS.has(target.name)) {
      await page.screenshot({
        path: `${screenshotDir}/${target.name}.jpg`,
        type: 'jpeg',
        quality: 80,
        timeout: 60_000,
      });
    }

    if (target.name === 'phone-modern') {
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForFunction(() => {
        const canvasElement = document.querySelector('canvas.game-canvas');
        if (!canvasElement) return false;
        const rect = canvasElement.getBoundingClientRect();
        return (
          Math.abs(rect.width - window.innerWidth) < 2 &&
          Math.abs(rect.height - window.innerHeight) < 2
        );
      }, undefined, { timeout: 15_000 });

      const rotated = await page.evaluate(() => {
        const rect = document
          .querySelector('canvas.game-canvas')
          .getBoundingClientRect();

        return {
          width: rect.width,
          height: rect.height,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          visualWidth: window.visualViewport?.width,
          visualHeight: window.visualViewport?.height,
          hostWidth: document.querySelector('#app')?.getBoundingClientRect().width,
          hostHeight: document.querySelector('#app')?.getBoundingClientRect().height,
          hostInlineWidth: document.querySelector('#app')?.style.width,
          hostInlineHeight: document.querySelector('#app')?.style.height,
        };
      });

      console.log('In-place mobile rotation:', JSON.stringify(rotated));

      if (rotated.innerWidth === 844 && rotated.innerHeight === 390) {
        assert.ok(
          Math.abs(rotated.width - 844) < 2 &&
            Math.abs(rotated.height - 390) < 2,
          'canvas did not follow an actual viewport resize',
        );
      } else {
        console.log(
          'The emulated device screen did not rotate in place; ' +
            'the dedicated phone-landscape context checks true landscape rendering.',
        );
      }

      await page.screenshot({
        path: `${screenshotDir}/phone-landscape-resize.jpg`,
        type: 'jpeg',
        quality: 80,
        timeout: 60_000,
      });
    }

    assert.deepEqual(
      pageErrors,
      [],
      `${target.name}: unexpected browser runtime errors`,
    );

    console.log(
      `PASS ${target.name}: canvas, no scrolling, mute persistence, keyboard, input, no page errors`,
    );

    await context.close();
  }
} finally {
  await browser.close();
}
