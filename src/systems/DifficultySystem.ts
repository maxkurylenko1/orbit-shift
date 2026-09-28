const BASE_PLAYER_ANGULAR_SPEED = 1.2;
const MAX_PLAYER_ANGULAR_SPEED = 1.95;
const BASE_SPAWN_INTERVAL_SECONDS = 1.8;
const MIN_SPAWN_INTERVAL_SECONDS = 0.95;
const INTRO_HOLD_SECONDS = 6;
const DIFFICULTY_RAMP_SECONDS = 72;

const lerp = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const smoothstep = (progress: number): number =>
  progress * progress * (3 - 2 * progress);

export class DifficultySystem {
  public playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
  public spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;

  public reset(): void {
    this.playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
    this.spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;
  }

  public update(elapsedSeconds: number): void {
    const rampElapsed = Math.max(0, elapsedSeconds - INTRO_HOLD_SECONDS);
    const linearProgress = Math.min(
      1,
      rampElapsed / DIFFICULTY_RAMP_SECONDS,
    );
    const progress = smoothstep(linearProgress);

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
