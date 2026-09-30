import assert from 'node:assert/strict';
import test from 'node:test';
import { SpawnSystem } from '../src/systems/SpawnSystem.ts';

test('identical random samples produce repeatable spawn sequences', () => {
  const firstEvents: string[] = [];
  const secondEvents: string[] = [];
  const makeSystem = (events: string[]) =>
    new SpawnSystem((lane, angle) => {
      events.push(`${lane}:${angle.toFixed(4)}`);
    });

  const first = makeSystem(firstEvents);
  const second = makeSystem(secondEvents);

  first.reset(() => 0.25);
  second.reset(() => 0.25);

  for (let tick = 0; tick < 480; tick += 1) {
    first.update(1 / 60, tick / 60, 1.8, 1.2, 0);
    second.update(1 / 60, tick / 60, 1.8, 1.2, 0);
  }

  assert.deepEqual(firstEvents, secondEvents);
  assert.ok(firstEvents.length > 0);
});

test('after a tab stall hazards never catch up in consecutive frames', () => {
  let emitted = 0;
  const system = new SpawnSystem(() => {
    emitted += 1;
  });

  system.reset(() => 0);
  system.update(10, 0, 1.8, 1.2, 0);
  assert.equal(emitted, 1);

  for (let index = 0; index < 10; index += 1) {
    system.update(1 / 60, 0, 1.8, 1.2, 0);
  }

  assert.equal(emitted, 1);
});
