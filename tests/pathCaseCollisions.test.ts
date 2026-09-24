import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import test from 'node:test';

test('presentation module names are unique on case-insensitive filesystems', () => {
  const presentationDir = new URL('../src/presentation/', import.meta.url);
  const moduleNames = readdirSync(presentationDir)
    .filter((name) => name.endsWith('.ts'))
    .sort();

  const normalized = moduleNames.map((name) => name.toLowerCase());

  assert.equal(
    new Set(normalized).size,
    normalized.length,
    `case-insensitive filename collision detected: ${moduleNames.join(', ')}`,
  );
});
