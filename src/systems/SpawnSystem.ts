import type { OrbitLane } from '../entities/Player';

const SPAWN_INTERVAL_SECONDS = 1.75;
const SPAWN_LEAD_ANGLE = 2.25;
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

  public update(deltaSeconds: number, playerAngle: number): void {
    this.elapsedSeconds += deltaSeconds;

    if (this.elapsedSeconds < SPAWN_INTERVAL_SECONDS) {
      return;
    }

    this.elapsedSeconds %= SPAWN_INTERVAL_SECONDS;

    const spawnAngle = (playerAngle + SPAWN_LEAD_ANGLE) % TAU;
    this.onSpawnObstacle(this.nextLane, spawnAngle);
    this.nextLane = this.nextLane === 'inner' ? 'outer' : 'inner';
  }
}
