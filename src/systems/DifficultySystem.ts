const BASE_PLAYER_ANGULAR_SPEED = 1.2;
const MID_PLAYER_ANGULAR_SPEED = 1.9;
const HIGH_PLAYER_ANGULAR_SPEED = 2.45;
const ENDGAME_PLAYER_ANGULAR_SPEED = 2.85;

const BASE_SPAWN_INTERVAL_SECONDS = 1.8;
const MID_SPAWN_INTERVAL_SECONDS = 1.05;
const HIGH_SPAWN_INTERVAL_SECONDS = 0.76;
const ENDGAME_SPAWN_INTERVAL_SECONDS = 0.66;

const INTRO_HOLD_SECONDS = 6;
const MID_STAGE_END_SECONDS = 60;
const HIGH_STAGE_END_SECONDS = 140;
const ENDGAME_STAGE_END_SECONDS = 240;

const SURGE_START_SECONDS = 36;
const SURGE_PERIOD_SECONDS = 18;
const SURGE_DURATION_SECONDS = 5.2;
const SURGE_SPEED_BOOST = 0.12;
const SURGE_INTERVAL_REDUCTION = 0.08;

const lerp = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

const smoothstep = (progress: number): number => {
  const safeProgress = clamp01(progress);

  return safeProgress * safeProgress * (3 - 2 * safeProgress);
};

const getPatternTier = (elapsedSeconds: number): number => {
  if (elapsedSeconds < 25) {
    return 0;
  }

  if (elapsedSeconds < 55) {
    return 1;
  }

  if (elapsedSeconds < 90) {
    return 2;
  }

  if (elapsedSeconds < 135) {
    return 3;
  }

  return 4;
};

const getSurgeState = (
  elapsedSeconds: number,
): { index: number; strength: number } => {
  if (elapsedSeconds < SURGE_START_SECONDS) {
    return { index: -1, strength: 0 };
  }

  const surgeElapsed = elapsedSeconds - SURGE_START_SECONDS;
  const index = Math.floor(surgeElapsed / SURGE_PERIOD_SECONDS);
  const cycleSeconds = surgeElapsed % SURGE_PERIOD_SECONDS;

  if (cycleSeconds >= SURGE_DURATION_SECONDS) {
    return { index, strength: 0 };
  }

  return {
    index,
    strength: Math.sin(
      (cycleSeconds / SURGE_DURATION_SECONDS) * Math.PI,
    ),
  };
};

export class DifficultySystem {
  public playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
  public spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;
  public intensity = 0;
  public patternTier = 0;
  public surgeStrength = 0;
  public surgeIndex = -1;

  public reset(): void {
    this.playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
    this.spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;
    this.intensity = 0;
    this.patternTier = 0;
    this.surgeStrength = 0;
    this.surgeIndex = -1;
  }

  public update(elapsedSeconds: number): void {
    const elapsed = Math.max(0, elapsedSeconds);
    let playerAngularSpeed = BASE_PLAYER_ANGULAR_SPEED;
    let spawnIntervalSeconds = BASE_SPAWN_INTERVAL_SECONDS;
    let intensity = 0;

    if (elapsed > INTRO_HOLD_SECONDS && elapsed <= MID_STAGE_END_SECONDS) {
      const progress = smoothstep(
        (elapsed - INTRO_HOLD_SECONDS) /
          (MID_STAGE_END_SECONDS - INTRO_HOLD_SECONDS),
      );

      playerAngularSpeed = lerp(
        BASE_PLAYER_ANGULAR_SPEED,
        MID_PLAYER_ANGULAR_SPEED,
        progress,
      );
      spawnIntervalSeconds = lerp(
        BASE_SPAWN_INTERVAL_SECONDS,
        MID_SPAWN_INTERVAL_SECONDS,
        progress,
      );
      intensity = 0.52 * progress;
    } else if (
      elapsed > MID_STAGE_END_SECONDS &&
      elapsed <= HIGH_STAGE_END_SECONDS
    ) {
      const progress = smoothstep(
        (elapsed - MID_STAGE_END_SECONDS) /
          (HIGH_STAGE_END_SECONDS - MID_STAGE_END_SECONDS),
      );

      playerAngularSpeed = lerp(
        MID_PLAYER_ANGULAR_SPEED,
        HIGH_PLAYER_ANGULAR_SPEED,
        progress,
      );
      spawnIntervalSeconds = lerp(
        MID_SPAWN_INTERVAL_SECONDS,
        HIGH_SPAWN_INTERVAL_SECONDS,
        progress,
      );
      intensity = lerp(0.52, 0.8, progress);
    } else if (elapsed > HIGH_STAGE_END_SECONDS) {
      const progress = smoothstep(
        (Math.min(elapsed, ENDGAME_STAGE_END_SECONDS) -
          HIGH_STAGE_END_SECONDS) /
          (ENDGAME_STAGE_END_SECONDS - HIGH_STAGE_END_SECONDS),
      );

      playerAngularSpeed = lerp(
        HIGH_PLAYER_ANGULAR_SPEED,
        ENDGAME_PLAYER_ANGULAR_SPEED,
        progress,
      );
      spawnIntervalSeconds = lerp(
        HIGH_SPAWN_INTERVAL_SECONDS,
        ENDGAME_SPAWN_INTERVAL_SECONDS,
        progress,
      );
      intensity = lerp(0.8, 0.92, progress);
    }

    const surge = getSurgeState(elapsed);

    this.surgeIndex = surge.index;
    this.surgeStrength = surge.strength;
    this.patternTier = getPatternTier(elapsed);
    this.playerAngularSpeed =
      playerAngularSpeed + surge.strength * SURGE_SPEED_BOOST;
    this.spawnIntervalSeconds =
      spawnIntervalSeconds *
      (1 - surge.strength * SURGE_INTERVAL_REDUCTION);
    this.intensity = Math.min(
      1,
      intensity + surge.strength * 0.1,
    );
  }
}
