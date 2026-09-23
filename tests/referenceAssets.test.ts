import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const assets = [
  { path: '../public/assets/space-background.webp', minBytes: 50_000 },
  { path: '../public/assets/reactor.webp', minBytes: 50_000 },
  { path: '../public/assets/player.webp', minBytes: 10_000 },
  { path: '../public/assets/obstacle.webp', minBytes: 30_000 },
  { path: '../public/assets/shard.webp', minBytes: 30_000 },
] as const;

test('reference-art assets are committed as nontrivial WebP binaries', () => {
  for (const asset of assets) {
    const url = new URL(asset.path, import.meta.url);
    const bytes = readFileSync(url);

    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
    assert.ok(
      statSync(url).size >= asset.minBytes,
      `${asset.path} is unexpectedly small`,
    );
  }
});
