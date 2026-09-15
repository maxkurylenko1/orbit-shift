const BASE_PLAYER_ANGULAR_SPEED = 1.2;
const MIN_REACTION_SECONDS = 0.5;
const SPEED_REACTION_BUFFER_PER_RADIAN = 0.05;

export const getSafeSpawnInterval = (
  baseIntervalSeconds: number,
  intervalMultiplier: number,
  playerAngularSpeed: number,
): number => {
  const safeBaseInterval = Math.max(0, baseIntervalSeconds);
  const safeMultiplier = Math.max(0, intervalMultiplier);
  const speedPressure = Math.max(0, playerAngularSpeed - BASE_PLAYER_ANGULAR_SPEED);
  const minimumReactionWindow =
    MIN_REACTION_SECONDS + speedPressure * SPEED_REACTION_BUFFER_PER_RADIAN;

  return Math.max(
    minimumReactionWindow,
    safeBaseInterval * safeMultiplier,
  );
};
