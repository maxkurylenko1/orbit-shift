const BASE_PLAYER_ANGULAR_SPEED = 1.2;
const MAX_PLAYER_ANGULAR_SPEED = 2;
const BASE_SPAWN_INTERVAL_SECONDS = 1.75;
const MIN_SPAWN_INTERVAL_SECONDS = 0.9;
const DIFFICULTY_RAMP_SECONDS = 60;

const lerp = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

export class DifficultySystem {
  public playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
  public spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;

  public reset(): void {
    this.playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
    this.spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;
  }

  public update(elapsedSeconds: number): void {
    const progress = Math.min(
      1,
      Math.max(0, elapsedSeconds) / DIFFICULTY_RAMP_SECONDS,
    );

    this.playerAngularSpeed = lerp(
      BASE_PLAYER_ANGULAR_SPEED,
      MAX_PLAYER_ANGULAR_SPEED,
      progress,
    );
    this.spawnIntervalSeconds = lerp(
      BASE_SPAWN_INTERVAL_SECONDS,
      MIN_SPAWN_INTERVAL_SECONDS,
      progress,
    );
  }
}
