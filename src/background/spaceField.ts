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

const MIN_STARS = 90;
const MAX_STARS = 180;
const STAR_AREA_DIVISOR = 8_500;

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
    radius: 0.45 + random() * 1.5,
    alpha: 0.18 + random() * 0.75,
  }));

  const base = Math.min(safeWidth, safeHeight);
  const nebulae: SpaceNebulaPatch[] = [
    {
      x: safeWidth * 0.08,
      y: safeHeight * 0.14,
      radius: base * 0.5,
      alpha: 0.065,
    },
    {
      x: safeWidth * 0.22,
      y: safeHeight * 0.78,
      radius: base * 0.42,
      alpha: 0.045,
    },
    {
      x: safeWidth * 0.84,
      y: safeHeight * 0.32,
      radius: base * 0.48,
      alpha: 0.052,
    },
    {
      x: safeWidth * 0.8,
      y: safeHeight * 0.86,
      radius: base * 0.4,
      alpha: 0.04,
    },
  ];

  const asteroidAnchors = [
    [-0.02, 0.12, 0.16],
    [0.06, 0.88, 0.12],
    [1.02, 0.84, 0.18],
    [0.96, 0.12, 0.09],
    [0.15, 0.58, 0.055],
    [0.88, 0.58, 0.065],
    [0.22, 0.18, 0.042],
    [0.76, 0.9, 0.048],
  ] as const;

  const asteroids = asteroidAnchors.map(([x, y, radius], index) => ({
    x: safeWidth * x,
    y: safeHeight * y,
    radius: base * radius,
    highlightAlpha: 0.055 + (index % 3) * 0.018,
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
