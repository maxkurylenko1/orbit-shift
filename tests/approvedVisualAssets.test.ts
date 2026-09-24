import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const approvedAssets = {
  'space-background.webp': '9c96bdbba81444760ec13ddc3e3fdc1a9341dbcc',
  'reactor.webp': 'e8a7a64db24dc0a70440b1deab1a58422302de76',
  'player-simple.webp': 'ed8fbc8a16a87fc143c4f595bda802c62b6505dd',
  'obstacle.webp': 'd62fe3d2e91f1452d4221e3a25b7b073fdf38dd8',
  'shard.webp': 'f93a80e1d3ecac9a934135931160c1d2097c50ce',
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
