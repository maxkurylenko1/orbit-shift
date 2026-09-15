import type { OrbitLane } from '../entities/Player';
import { getSafeSpawnInterval } from './spawnSafety';
import { createSpawnRunVariation } from './spawnVariation';
import { SPAWN_PATTERN_COUNT, SpawnPatternSystem } from './SpawnPatternSystem';

const SPAWN_LEAD_ANGLE = 2.25;
const MIN_INTERVAL_SECONDS = 0.1;
const TAU = Math.PI * 2;

export type SpawnObstacleHandler = (lane: OrbitLane, angle: number) => void;

export class SpawnSystem {
  private readonly patternSystem = new SpawnPatternSystem();
  private elapsedSeconds = 0;
  private runLeadAngle = SPAWN_LEAD_ANGLE;

  public constructor(private readonly onSpawnObstacle: SpawnObstacleHandler) {}

  public reset(): void {
    const variation = createSpawnRunVariation(SPAWN_PATTERN_COUNT);

    this.elapsedSeconds = 0;
    this.runLeadAngle = SPAWN_LEAD_ANGLE + variation.leadAngleOffset;
    this.patternSystem.reset(variation.patternIndex, variation.phaseRatio);
  }

  public update(
    deltaSeconds: number,
    playerAngle: number,
    intervalSeconds: number,
    playerAngularSpeed: number,
  ): void {
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

    this.elapsedSeconds %= stepInterval;
    this.patternSystem.advance();

    if (!step.lane) {
      return;
    }

    const spawnAngle = (playerAngle + this.runLeadAngle) % TAU;
    this.onSpawnObstacle(step.lane, spawnAngle);
  }
}
