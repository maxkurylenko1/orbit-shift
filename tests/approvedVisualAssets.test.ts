import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const approvedAssets = {
  'space-background.webp': '9c96bdbba81444760ec13ddc3e3fdc1a9341dbcc',
  'reactor.webp': 'e8a7a64db24dc0a70440b1deab1a58422302de76',
  'player.webp': '482f9cb6f6bc5a4899242680b1e15f07e664b75b',
  'obstacle.webp': '4ef916dd1cb4bbff918eec30acc20d840a9200cd',
  'shard.webp': '2b070d35ab3652b43334d6a7d7b9b864a331bd15',
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
