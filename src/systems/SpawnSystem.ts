import type { OrbitLane } from '../entities/Player';
import { SpawnPatternSystem } from './SpawnPatternSystem';

const SPAWN_LEAD_ANGLE = 2.25;
const MIN_INTERVAL_SECONDS = 0.1;
const TAU = Math.PI * 2;

export type SpawnObstacleHandler = (lane: OrbitLane, angle: number) => void;

export class SpawnSystem {
  private readonly patternSystem = new SpawnPatternSystem();
  private elapsedSeconds = 0;

  public constructor(private readonly onSpawnObstacle: SpawnObstacleHandler) {}

  public reset(): void {
    this.elapsedSeconds = 0;
    this.patternSystem.reset();
  }

  public update(
    deltaSeconds: number,
    playerAngle: number,
    intervalSeconds: number,
  ): void {
    const step = this.patternSystem.currentStep();
    const baseInterval = Math.max(MIN_INTERVAL_SECONDS, intervalSeconds);
    const stepInterval = Math.max(
      MIN_INTERVAL_SECONDS,
      baseInterval * step.intervalMultiplier,
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

    const spawnAngle = (playerAngle + SPAWN_LEAD_ANGLE) % TAU;
    this.onSpawnObstacle(step.lane, spawnAngle);
  }
}
