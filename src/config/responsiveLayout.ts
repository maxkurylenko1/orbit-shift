export const MAX_VISUAL_BASE = 1200;
const COMPACT_HUD_WIDTH = 520;
const MIN_HUD_PADDING = 16;
const MAX_HUD_PADDING = 32;
const HUD_PADDING_RATIO = 0.025;

export interface ResponsiveViewportMetrics {
  width: number;
  height: number;
  visualBase: number;
  centerX: number;
  centerY: number;
  compactHud: boolean;
  hudPadding: number;
}

export interface HudLayoutMetrics {
  scoreX: number;
  scoreY: number;
  bestX: number;
  bestY: number;
  comboX: number;
  comboY: number;
  timeX: number;
  timeY: number;
}

export const clampVisualBase = (base: number): number =>
  Math.min(MAX_VISUAL_BASE, Math.max(0, base));

export const getResponsiveViewportMetrics = (
  width: number,
  height: number,
): ResponsiveViewportMetrics => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const visualBase = clampVisualBase(Math.min(safeWidth, safeHeight));
  const hudPadding = Math.round(
    Math.min(
      MAX_HUD_PADDING,
      Math.max(MIN_HUD_PADDING, visualBase * HUD_PADDING_RATIO),
    ),
  );

  return {
    width: safeWidth,
    height: safeHeight,
    visualBase,
    centerX: safeWidth * 0.5,
    centerY: safeHeight * 0.5,
    compactHud: safeWidth < COMPACT_HUD_WIDTH,
    hudPadding,
  };
};

export const getHudLayoutMetrics = (
  viewport: ResponsiveViewportMetrics,
  lineGap: number,
): HudLayoutMetrics => {
  const topY = viewport.hudPadding;
  const secondaryY = topY + lineGap;
  const comboY = viewport.compactHud ? secondaryY : topY;

  return {
    scoreX: viewport.hudPadding,
    scoreY: topY,
    bestX: viewport.hudPadding,
    bestY: secondaryY,
    comboX: Math.round(viewport.width * 0.5),
    comboY,
    timeX: Math.round(viewport.width - viewport.hudPadding),
    timeY: topY,
  };
};
