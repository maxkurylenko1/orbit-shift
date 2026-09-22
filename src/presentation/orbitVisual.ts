export interface OrbitVisualMetrics {
  innerRadius: number;
  outerRadius: number;
  decorativeRadius: number;
  gameplayCoreWidth: number;
  gameplayGlowWidth: number;
  decorativeWidth: number;
  innerAlpha: number;
  outerAlpha: number;
  decorativeAlpha: number;
}

export const getOrbitVisuals = (base: number): OrbitVisualMetrics => {
  const safeBase = Math.max(0, base);
  const coreWidth = Math.max(1.2, safeBase * 0.0022);

  return {
    innerRadius: safeBase * 0.21,
    outerRadius: safeBase * 0.325,
    decorativeRadius: safeBase * 0.38,
    gameplayCoreWidth: coreWidth,
    gameplayGlowWidth: Math.max(coreWidth * 4.5, safeBase * 0.009),
    decorativeWidth: Math.max(1, safeBase * 0.0014),
    innerAlpha: 0.86,
    outerAlpha: 0.72,
    decorativeAlpha: 0.13,
  };
};
