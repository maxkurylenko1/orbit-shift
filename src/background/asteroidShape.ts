const ASTEROID_RADIAL_PROFILE = [1, 0.78, 0.94, 0.72, 0.88, 0.76, 0.98, 0.81] as const;

export const createAsteroidPolygon = (
  centerX: number,
  centerY: number,
  radius: number,
  variant = 0,
): number[] => {
  const safeRadius = Math.max(0, radius);
  const points: number[] = [];
  const rotation = (variant % ASTEROID_RADIAL_PROFILE.length) * 0.19;

  for (let index = 0; index < ASTEROID_RADIAL_PROFILE.length; index += 1) {
    const profileIndex = (index + variant) % ASTEROID_RADIAL_PROFILE.length;
    const pointRadius = safeRadius * ASTEROID_RADIAL_PROFILE[profileIndex];
    const angle = rotation + (index / ASTEROID_RADIAL_PROFILE.length) * Math.PI * 2;

    points.push(
      centerX + Math.cos(angle) * pointRadius,
      centerY + Math.sin(angle) * pointRadius,
    );
  }

  return points;
};
