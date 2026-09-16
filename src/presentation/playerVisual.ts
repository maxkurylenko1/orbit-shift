export const PLAYER_TRAIL_POINT_COUNT = 30;

export interface PlayerPresentationMetrics {
  trailPointCount: number;
  trailWidth: number;
  trailTailAlpha: number;
  trailHeadAlpha: number;
  glowRadius: number;
  glowAlpha: number;
}

export const getPlayerPresentationMetrics = (
  base: number,
): PlayerPresentationMetrics => {
  const safeBase = Math.max(1, base);

  return {
    trailPointCount: PLAYER_TRAIL_POINT_COUNT,
    trailWidth: Math.max(2.5, safeBase * 0.0055),
    trailTailAlpha: 0.025,
    trailHeadAlpha: 0.48,
    glowRadius: Math.max(18, safeBase * 0.052),
    glowAlpha: 0.11,
  };
};
