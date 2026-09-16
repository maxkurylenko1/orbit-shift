const PLAYER_VISUAL_RATIO = 0.085;
const REACTOR_VISUAL_RATIO = 0.31;
const MIN_PLAYER_VISUAL_SIZE = 28;
const MIN_REACTOR_VISUAL_SIZE = 104;

export interface VisualSizes {
  player: number;
  reactor: number;
}

export const calculateVisualSizes = (base: number): VisualSizes => {
  const safeBase = Math.max(0, base);

  return {
    player: Math.max(
      MIN_PLAYER_VISUAL_SIZE,
      Math.round(safeBase * PLAYER_VISUAL_RATIO),
    ),
    reactor: Math.max(
      MIN_REACTOR_VISUAL_SIZE,
      Math.round(safeBase * REACTOR_VISUAL_RATIO),
    ),
  };
};
