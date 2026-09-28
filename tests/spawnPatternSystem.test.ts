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

test('endgame tier unlocks short pressure-chain timings', () => {
  const system = new SpawnPatternSystem();
  let sawPressureStep = false;

  system.reset(0, 0, 4);

  for (let index = 0; index < 40; index += 1) {
    if (system.currentStep().intervalMultiplier <= 0.58) {
      sawPressureStep = true;
    }

    system.advance();
  }

  assert.equal(sawPressureStep, true);
});
