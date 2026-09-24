export interface CoverLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

export const getCoverLayout = (
  viewportWidth: number,
  viewportHeight: number,
  sourceWidth: number,
  sourceHeight: number,
): CoverLayout => {
  const safeViewportWidth = Math.max(0, viewportWidth);
  const safeViewportHeight = Math.max(0, viewportHeight);
  const safeSourceWidth = Math.max(1, sourceWidth);
  const safeSourceHeight = Math.max(1, sourceHeight);
  const scale = Math.max(
    safeViewportWidth / safeSourceWidth,
    safeViewportHeight / safeSourceHeight,
  );
  const width = safeSourceWidth * scale;
  const height = safeSourceHeight * scale;

  return {
    width,
    height,
    x: (safeViewportWidth - width) * 0.5,
    y: (safeViewportHeight - height) * 0.5,
    scale,
  };
};
