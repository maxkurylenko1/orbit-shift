import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('cinematic background retains the high-resolution master', () => {
  const bytes = readFileSync(new URL('../public/assets/space-background.webp', import.meta.url));
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(bytes.length >= 150_000, 'background appears excessively compressed');

  const marker = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
  assert.ok(marker >= 0 && marker < 64, 'missing VP8 frame header');
  const width = bytes.readUInt16LE(marker + 3) & 0x3fff;
  const height = bytes.readUInt16LE(marker + 5) & 0x3fff;
  assert.equal(width, 2560);
  assert.equal(height, 1440);
});
