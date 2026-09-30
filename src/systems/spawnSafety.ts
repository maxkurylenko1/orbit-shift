const BASE_PLAYER_ANGULAR_SPEED = 1.2;
// Minimum gap between obstacles; lead angle provides additional reaction time.
const MIN_HAZARD_SPACING_SECONDS = 0.5;
const SPEED_SPACING_BUFFER_PER_RADIAN = 0.02;

export const getSafeSpawnInterval = (
  baseIntervalSeconds: number,
  intervalMultiplier: number,
  playerAngularSpeed: number,
): number => {
  const safeBaseInterval = Math.max(0, baseIntervalSeconds);
  const safeMultiplier = Math.max(0, intervalMultiplier);
  const speedPressure = Math.max(
    0,
    playerAngularSpeed - BASE_PLAYER_ANGULAR_SPEED,
  );
  const minimumHazardSpacing =
    MIN_HAZARD_SPACING_SECONDS +
    speedPressure * SPEED_SPACING_BUFFER_PER_RADIAN;

  return Math.max(
    minimumHazardSpacing,
    safeBaseInterval * safeMultiplier,
  );
};
