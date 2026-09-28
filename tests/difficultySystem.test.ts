import assert from 'node:assert/strict';
import test from 'node:test';
import { DifficultySystem } from '../src/systems/DifficultySystem.ts';

test('difficulty keeps a short readable opening', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(6);

  assert.equal(difficulty.playerAngularSpeed, 1.2);
  assert.equal(difficulty.spawnIntervalSeconds, 1.8);
});

test('difficulty ramps smoothly through the middle of a run', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(42);

  assert.ok(difficulty.playerAngularSpeed > 1.5);
  assert.ok(difficulty.playerAngularSpeed < 1.7);
  assert.ok(difficulty.spawnIntervalSeconds > 1.25);
  assert.ok(difficulty.spawnIntervalSeconds < 1.5);
});

test('difficulty caps instead of escalating forever', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(600);

  assert.equal(difficulty.playerAngularSpeed, 1.95);
  assert.equal(difficulty.spawnIntervalSeconds, 0.95);
});
