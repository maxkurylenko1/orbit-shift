export interface SpaceStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export interface SpaceNebulaPatch {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export interface SpaceAsteroid {
  x: number;
  y: number;
  radius: number;
  highlightAlpha: number;
}

export interface GalaxyStar extends SpaceStar {}

export interface SpaceFieldLayout {
  stars: SpaceStar[];
  nebulae: SpaceNebulaPatch[];
  asteroids: SpaceAsteroid[];
  galaxyStars: GalaxyStar[];
}

const MIN_STARS = 120;
const MAX_STARS = 180;
const STAR_AREA_DIVISOR = 7_000;

const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const createSpaceField = (
  width: number,
  height: number,
  seed = 0x0b17,
): SpaceFieldLayout => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const random = mulberry32(seed);
  const count = Math.min(
    MAX_STARS,
    Math.max(MIN_STARS, Math.round((safeWidth * safeHeight) / STAR_AREA_DIVISOR)),
  );

  const stars = Array.from({ length: count }, () => ({
    x: random() * safeWidth,
    y: random() * safeHeight,
    radius: 0.35 + random() * 1.2,
    alpha: 0.22 + random() * 0.72,
  }));

  const base = Math.min(safeWidth, safeHeight);
  const nebulae: SpaceNebulaPatch[] = [
    { x: safeWidth * 0.01, y: safeHeight * 0.14, radius: base * 0.13, alpha: 0.026 },
    { x: safeWidth * 0.08, y: safeHeight * 0.88, radius: base * 0.12, alpha: 0.022 },
    { x: safeWidth * 0.99, y: safeHeight * 0.18, radius: base * 0.13, alpha: 0.024 },
    { x: safeWidth * 0.92, y: safeHeight * 0.86, radius: base * 0.12, alpha: 0.021 },
  ];

  const asteroidAnchors = [
    [-0.02, 0.08, 0.09],
    [0.02, 0.9, 0.065],
    [1.02, 0.88, 0.095],
    [0.99, 0.09, 0.055],
    [0.11, 0.25, 0.028],
    [0.9, 0.72, 0.034],
  ] as const;

  const asteroids = asteroidAnchors.map(([x, y, radius], index) => ({
    x: safeWidth * x,
    y: safeHeight * y,
    radius: base * radius,
    highlightAlpha: 0.07 + (index % 3) * 0.018,
  }));

  const galaxyCenterX = safeWidth * 0.86;
  const galaxyCenterY = safeHeight * 0.18;
  const galaxyStars: GalaxyStar[] = [];

  for (let index = 0; index < 54; index += 1) {
    const t = index / 53;
    const angle = t * Math.PI * 4.5;
    const radius = base * (0.01 + t * 0.105);

    galaxyStars.push({
      x: galaxyCenterX + Math.cos(angle) * radius,
      y: galaxyCenterY + Math.sin(angle) * radius * 0.48,
      radius: 0.65 + (1 - t) * 1.5,
      alpha: 0.12 + (1 - t) * 0.5,
    });
  }

  return { stars, nebulae, asteroids, galaxyStars };
};

export interface BackgroundMetrics {
  base: number;
  centerGlowRadius: number;
  vignetteInset: number;
}

export const getBackgroundMetrics = (
  width: number,
  height: number,
): BackgroundMetrics => {
  const base = Math.max(1, Math.min(width, height));
  return {
    base,
    centerGlowRadius: Math.round(base * 0.45),
    vignetteInset: Math.round(base * 0.07),
  };
};
