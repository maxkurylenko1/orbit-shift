import { clampVisualBase } from '../config/responsiveLayout';

const OBSTACLE_SIZE_RATIO = 0.058;
const SHARD_SIZE_RATIO = 0.044;
const MIN_OBSTACLE_SIZE = 24;
const MIN_SHARD_SIZE = 20;

export interface GameItemVisuals {
  obstacle: number;
  shard: number;
}

export const getGameItemVisuals = (base: number): GameItemVisuals => {
  const safeBase = clampVisualBase(base);

  return {
    obstacle: Math.max(
      MIN_OBSTACLE_SIZE,
      Math.round(safeBase * OBSTACLE_SIZE_RATIO),
    ),
    shard: Math.max(
      MIN_SHARD_SIZE,
      Math.round(safeBase * SHARD_SIZE_RATIO),
    ),
  };
};
