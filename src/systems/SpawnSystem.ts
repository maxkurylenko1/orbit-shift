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
    const spawnInterval = Math.max(MIN_INTERVAL_SECONDS, intervalSeconds);
    this.elapsedSeconds += deltaSeconds;

    if (this.elapsedSeconds < spawnInterval) {
      return;
    }

    this.elapsedSeconds %= spawnInterval;

    const lane = this.patternSystem.nextStep();

    if (!lane) {
      return;
    }

    const spawnAngle = (playerAngle + SPAWN_LEAD_ANGLE) % TAU;
    this.onSpawnObstacle(lane, spawnAngle);
  }
}
