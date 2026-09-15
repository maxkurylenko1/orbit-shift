import type { OrbitLane } from '../entities/Player';

const SPAWN_LEAD_ANGLE = 2.25;
const MIN_INTERVAL_SECONDS = 0.1;
const TAU = Math.PI * 2;

export type SpawnObstacleHandler = (lane: OrbitLane, angle: number) => void;

export class SpawnSystem {
  private elapsedSeconds = 0;
  private nextLane: OrbitLane = 'inner';

  public constructor(private readonly onSpawnObstacle: SpawnObstacleHandler) {}

  public reset(): void {
    this.elapsedSeconds = 0;
    this.nextLane = 'inner';
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

    const spawnAngle = (playerAngle + SPAWN_LEAD_ANGLE) % TAU;
    this.onSpawnObstacle(this.nextLane, spawnAngle);
    this.nextLane = this.nextLane === 'inner' ? 'outer' : 'inner';
  }
}
