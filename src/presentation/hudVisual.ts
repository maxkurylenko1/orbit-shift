export interface HudVisualMetrics {
  primaryFontSize: number;
  secondaryFontSize: number;
  letterSpacing: number;
  lineGap: number;
  resolution: number;
}

export const getHudVisualMetrics = (
  base: number,
  devicePixelRatio: number,
): HudVisualMetrics => {
  const safeBase = Math.max(1, base);
  const safeDpr = Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1;

  return {
    primaryFontSize: Math.max(18, Math.round(safeBase * 0.024)),
    secondaryFontSize: Math.max(14, Math.round(safeBase * 0.017)),
    letterSpacing: Math.max(0.4, safeBase * 0.00055),
    lineGap: Math.max(20, Math.round(safeBase * 0.03)),
    resolution: Math.min(2, Math.max(1, safeDpr)),
  };
};

export const snapHudCoordinate = (value: number): number => Math.round(value);
