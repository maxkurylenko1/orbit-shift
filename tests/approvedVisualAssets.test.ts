import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const approvedAssets = {
  'space-background.webp': '9c96bdbba81444760ec13ddc3e3fdc1a9341dbcc',
  'reactor.webp': 'd358247bfb4dc631fbcd8b3e6a775512497a23e1',
  'player-simple.webp': '07623830073623ac4b944f87f0772f525da115fd',
  'obstacle.webp': '506bc4c919e59e6aa14f75c00ac177cfaebcef0f',
  'shard.webp': '702e56e667622e8b590dab54a45455f7031a9f73',
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
