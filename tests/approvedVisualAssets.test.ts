import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const approvedAssets = {
  'space-background.webp': '9c96bdbba81444760ec13ddc3e3fdc1a9341dbcc',
  'reactor.webp': '01a64790aa159141f148a8ea37c7af78ee2ddd68',
  'player-simple.webp': '07623830073623ac4b944f87f0772f525da115fd',
  'obstacle.webp': '43cbec3f81692ef24fc3b28f13bfcdbb4b54dc44',
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
