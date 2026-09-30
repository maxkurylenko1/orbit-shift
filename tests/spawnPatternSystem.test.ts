import assert from 'node:assert/strict';
import test from 'node:test';
import { SpawnPatternSystem } from '../src/systems/SpawnPatternSystem.ts';

test('opening tier only exposes readable pattern timings', () => {
  const system = new SpawnPatternSystem();

  system.reset(0, 0, 0);

  for (let index = 0; index < 12; index += 1) {
    const step = system.currentStep();

    assert.ok(step.intervalMultiplier >= 1);
    system.advance();
  }
});

test('endgame rotates advanced sequences, not tutorial laps', () => {
  const system = new SpawnPatternSystem();
  let fastSteps = 0;
  let easySteps = 0;

  system.reset(0, 0, 4);

  for (let index = 0; index < 55; index += 1) {
    const step = system.currentStep();

    if (step.lane && step.intervalMultiplier <= 0.68) {
      fastSteps += 1;
    }

    if (step.intervalMultiplier >= 1) {
      easySteps += 1;
    }

    system.advance();
  }

  assert.ok(fastSteps >= 18);
  assert.ok(easySteps < 10);
});

test('a tier upgrade applies after the current pattern ends', () => {
  const system = new SpawnPatternSystem();

  system.reset(0, 0, 0);
  system.setTier(4);

  for (let index = 0; index < 4; index += 1) {
    system.advance();
  }

  assert.equal(system.currentStep().intervalMultiplier, 0.95);
});
