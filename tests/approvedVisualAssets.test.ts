import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const approvedAssets = {
  'space-background.webp': '9c96bdbba81444760ec13ddc3e3fdc1a9341dbcc',
  'reactor.webp': '1e2ab15f7a80ba469da257df3503cd266aa0436b',
  'player-simple.webp': '07623830073623ac4b944f87f0772f525da115fd',
  'obstacle.webp': '8ab27cdc8137026ec3316999a8eea008039d5ad2',
  'shard.webp': '0213be521b12aba4b967e25041fb68a87c2b9b1e',
} as const;

for (const [name, expectedSha] of Object.entries(approvedAssets)) {
  test(`${name} uses the approved visual revision`, () => {
    const bytes = readFileSync(
      new URL(`../public/assets/${name}`, import.meta.url),
    );
    const gitBlob = createHash('sha1')
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest('hex');

    assert.equal(gitBlob, expectedSha);
  });
}
