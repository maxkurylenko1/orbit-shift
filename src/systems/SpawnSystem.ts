import type { OrbitLane } from '../entities/Player';
import { getSafeSpawnInterval } from './spawnSafety';
import { createSpawnRunVariation } from './spawnVariation';
import { SPAWN_PATTERN_COUNT, SpawnPatternSystem } from './SpawnPatternSystem';

const SPAWN_LEAD_ANGLE = 2.25;
const MIN_INTERVAL_SECONDS = 0.1;
const MAX_FRAME_OVERSHOOT_SECONDS = 0.025;
const TAU = Math.PI * 2;

export type SpawnObstacleHandler = (lane: OrbitLane, angle: number) => void;

export class SpawnSystem {
  private readonly patternSystem = new SpawnPatternSystem();
  private elapsedSeconds = 0;
  private runLeadAngle = SPAWN_LEAD_ANGLE;

  public constructor(private readonly onSpawnObstacle: SpawnObstacleHandler) {}

  public reset(random: () => number = Math.random): void {
    const variation = createSpawnRunVariation(SPAWN_PATTERN_COUNT, random);

    this.elapsedSeconds = 0;
    this.runLeadAngle = SPAWN_LEAD_ANGLE + variation.leadAngleOffset;
    this.patternSystem.reset(
      variation.patternIndex,
      variation.phaseRatio,
      0,
    );
  }

  public update(
    deltaSeconds: number,
    playerAngle: number,
    intervalSeconds: number,
    playerAngularSpeed: number,
    patternTier: number,
  ): void {
    this.patternSystem.setTier(patternTier);

    const step = this.patternSystem.currentStep();
    const baseInterval = Math.max(MIN_INTERVAL_SECONDS, intervalSeconds);
    const stepInterval = getSafeSpawnInterval(
      baseInterval,
      step.intervalMultiplier,
      playerAngularSpeed,
    );

    this.elapsedSeconds += deltaSeconds;

    if (this.elapsedSeconds < stepInterval) {
      return;
    }

    // Discard excessive elapsed time after tab stalls or a dropped frame.
    // Never spawn a backlog of obstacles in back-to-back frames.
    this.elapsedSeconds = Math.min(
      Math.max(0, this.elapsedSeconds - stepInterval),
      MAX_FRAME_OVERSHOOT_SECONDS,
    );
    this.patternSystem.advance();

    if (!step.lane) {
      return;
    }

    const spawnAngle = (playerAngle + this.runLeadAngle) % TAU;
    this.onSpawnObstacle(step.lane, spawnAngle);
  }
}
