const OBSTACLE_SIZE_RATIO = 0.052;
const SHARD_SIZE_RATIO = 0.041;
const MIN_OBSTACLE_SIZE = 22;
const MIN_SHARD_SIZE = 18;

export interface GameItemVisuals {
  obstacle: number;
  shard: number;
}

export const getGameItemVisuals = (base: number): GameItemVisuals => {
  const safeBase = Math.max(0, base);

  return {
    obstacle: Math.max(MIN_OBSTACLE_SIZE, Math.round(safeBase * OBSTACLE_SIZE_RATIO)),
    shard: Math.max(MIN_SHARD_SIZE, Math.round(safeBase * SHARD_SIZE_RATIO)),
  };
};
