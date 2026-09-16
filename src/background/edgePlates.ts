const EDGE_SOURCE_ASPECT = 145 / 330;
const MAX_VIEWPORT_WIDTH_RATIO = 0.28;

export interface EdgePlateLayout {
  width: number;
  height: number;
  leftX: number;
  rightX: number;
}

export const getEdgePlateLayout = (
  width: number,
  height: number,
): EdgePlateLayout => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const naturalWidth = safeHeight * EDGE_SOURCE_ASPECT;
  const edgeWidth = Math.min(
    naturalWidth,
    safeWidth * MAX_VIEWPORT_WIDTH_RATIO,
  );

  return {
    width: edgeWidth,
    height: safeHeight,
    leftX: 0,
    rightX: safeWidth - edgeWidth,
  };
};
