import assert from 'node:assert/strict';
import test from 'node:test';
import { DifficultySystem } from '../src/systems/DifficultySystem.ts';
import {
  resolveSafeObstacleLane,
  type AngularLaneObject,
} from '../src/systems/gameplaySafety.ts';
import {
  advanceObstacleTravelBudget,
  createObstacleTravelBudget,
} from '../src/systems/obstacleLifetime.ts';
import { ComboSystem } from '../src/systems/ComboSystem.ts';
import { ScoreSystem } from '../src/systems/ScoreSystem.ts';
import { SpawnSystem } from '../src/systems/SpawnSystem.ts';

const TAU = Math.PI * 2;
const FRAME_SECONDS = 1 / 60;
const RUN_SECONDS = 300;
const BLOCKADE_ANGLE = 0.34;

interface ActiveObstacle extends AngularLaneObject {
  remainingTravelRadians: number;
}

const distance = (a: number, b: number): number => {
  const delta = Math.abs(a - b) % TAU;

  return Math.min(delta, TAU - delta);
};

const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;

    return state / 0x100000000;
  };
};

const simulate = (seed: number) => {
  const difficulty = new DifficultySystem();
  const obstacles: ActiveObstacle[] = [];
  const byMinute = [0, 0, 0, 0, 0];
  const endgameLanes = { inner: 0, outer: 0 };
  let angle = -Math.PI / 2;
  let time = 0;
  let lastAccepted = -1;
  let minSpawnGap = Number.POSITIVE_INFINITY;

  const spawns = new SpawnSystem((proposedLane, spawnAngle) => {
    const lane = resolveSafeObstacleLane(
      proposedLane,
      spawnAngle,
      obstacles,
    );

    if (!lane) {
      return;
    }

    for (const other of obstacles) {
      assert.ok(
        other.lane === lane ||
          distance(other.angle, spawnAngle) >= BLOCKADE_ANGLE,
        'opposite lanes must never be blocked simultaneously',
      );
    }

    if (lastAccepted >= 0) {
      minSpawnGap = Math.min(minSpawnGap, time - lastAccepted);
    }

    lastAccepted = time;
    byMinute[Math.min(4, Math.floor(time / 60))] += 1;

    if (time >= 240) {
      endgameLanes[lane] += 1;
    }

    if (obstacles.length >= 8) {
      obstacles.shift();
    }

    obstacles.push({
      lane,
      angle: spawnAngle,
      remainingTravelRadians: createObstacleTravelBudget(
        angle,
        spawnAngle,
      ),
    });
  });

  spawns.reset(seededRandom(seed));

  for (let frame = 0; frame < RUN_SECONDS * 60; frame += 1) {
    time = frame * FRAME_SECONDS;
    difficulty.update(time);
    angle = (angle + difficulty.playerAngularSpeed * FRAME_SECONDS) % TAU;

    spawns.update(
      FRAME_SECONDS,
      angle,
      difficulty.spawnIntervalSeconds,
      difficulty.playerAngularSpeed,
      difficulty.patternTier,
    );

    for (let index = obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = obstacles[index];

      obstacle.remainingTravelRadians = advanceObstacleTravelBudget(
        obstacle.remainingTravelRadians,
        difficulty.playerAngularSpeed,
        FRAME_SECONDS,
      );

      if (obstacle.remainingTravelRadians <= 0) {
        obstacles.splice(index, 1);
      }
    }
  }

  return { byMinute, endgameLanes, minSpawnGap };
};

test('five-minute seeded runs keep increasing pressure while preserving fair lanes', () => {
  for (const seed of [1, 19, 42, 137, 901]) {
    const result = simulate(seed);

    assert.ok(
      result.byMinute[4] > result.byMinute[0] * 1.45,
      `late-game pressure must increase for seed ${seed}: ${result.byMinute}`,
    );
    assert.ok(
      result.endgameLanes.inner >= 15 &&
        result.endgameLanes.outer >= 15,
      `both lanes must be threatened late in run ${seed}`,
    );
    assert.ok(
      result.minSpawnGap >= 0.47,
      `spawn gap became too small in run ${seed}`,
    );
  }
});

test('collecting five shards beats passive survival over 30 seconds', () => {
  const idle = new ScoreSystem();
  const collecting = new ScoreSystem();
  const combo = new ComboSystem();

  for (let index = 0; index < 5; index += 1) {
    idle.update(6);
    collecting.update(6);
    combo.recordCollect();
    collecting.addPoints(50 * combo.multiplier);
  }

  assert.ok(collecting.score >= idle.score * 2);
  assert.equal(combo.multiplier, 5);

  combo.resetChain();
  assert.equal(combo.multiplier, 1);
});
