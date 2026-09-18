import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('reactor assembly uses a helper path with a distinct Windows-safe basename', () => {
  const geometryUrl = new URL('../src/presentation/reactorGeometry.ts', import.meta.url);
  const viewUrl = new URL('../src/presentation/ReactorAssemblyView.ts', import.meta.url);

  assert.equal(existsSync(geometryUrl), true);
  assert.match(readFileSync(viewUrl, 'utf8'), /from '\.\/reactorGeometry'/);
});
