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

export interface SpaceFieldLayout {
  stars: SpaceStar[];
  nebulae: SpaceNebulaPatch[];
}

const MIN_STARS = 60;
const MAX_STARS = 180;
const STAR_AREA_DIVISOR = 12_000;

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
    radius: 0.5 + random() * 1.35,
    alpha: 0.2 + random() * 0.65,
  }));

  const base = Math.min(safeWidth, safeHeight);
  const nebulae: SpaceNebulaPatch[] = [
    {
      x: safeWidth * 0.2,
      y: safeHeight * 0.28,
      radius: base * 0.34,
      alpha: 0.035,
    },
    {
      x: safeWidth * 0.8,
      y: safeHeight * 0.7,
      radius: base * 0.42,
      alpha: 0.028,
    },
  ];

  return { stars, nebulae };
};
