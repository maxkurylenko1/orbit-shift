import assert from 'node:assert/strict';
import test from 'node:test';
import { DifficultySystem } from '../src/systems/DifficultySystem.ts';

test('difficulty keeps a short readable opening', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(6);

  assert.equal(difficulty.playerAngularSpeed, 1.2);
  assert.equal(difficulty.spawnIntervalSeconds, 1.8);
  assert.equal(difficulty.patternTier, 0);
  assert.equal(difficulty.surgeStrength, 0);
});

test('difficulty becomes meaningfully harder before the first minute', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(42);

  assert.ok(difficulty.playerAngularSpeed > 1.65);
  assert.ok(difficulty.playerAngularSpeed < 1.8);
  assert.ok(difficulty.spawnIntervalSeconds > 1.15);
  assert.ok(difficulty.spawnIntervalSeconds < 1.35);
  assert.equal(difficulty.patternTier, 1);
});

test('second stage keeps increasing speed and density', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(100);

  assert.ok(difficulty.playerAngularSpeed > 2.05);
  assert.ok(difficulty.playerAngularSpeed < 2.3);
  assert.ok(difficulty.spawnIntervalSeconds < 1);
  assert.equal(difficulty.patternTier, 3);
});

test('endgame reaches a substantially harder cap', () => {
  const difficulty = new DifficultySystem();

  difficulty.update(600);

  assert.equal(difficulty.playerAngularSpeed, 2.85);
  assert.equal(difficulty.spawnIntervalSeconds, 0.66);
  assert.equal(difficulty.patternTier, 4);
  assert.equal(difficulty.surgeStrength, 0);
  assert.equal(difficulty.intensity, 0.92);
});

test('surges temporarily add a short pressure spike', () => {
  const surge = new DifficultySystem();

  surge.update(38.6);

  assert.ok(surge.surgeStrength > 0.9);
  assert.ok(surge.intensity > 0);
  assert.ok(surge.playerAngularSpeed > 1.2);
  assert.ok(surge.spawnIntervalSeconds < 1.8);
});
