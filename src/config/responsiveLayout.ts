export const MAX_VISUAL_BASE = 1200;
const COMPACT_HUD_WIDTH = 520;
const MIN_HUD_PADDING = 16;
const MAX_HUD_PADDING = 32;
const HUD_PADDING_RATIO = 0.025;
const SAFE_EDGE_GAP = 10;

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ResponsiveViewportMetrics {
  width: number;
  height: number;
  visualBase: number;
  centerX: number;
  centerY: number;
  compactHud: boolean;
  hudPadding: number;
  safeArea: SafeAreaInsets;
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

const ZERO_SAFE_AREA: SafeAreaInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const normalizeInset = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

const parseCssPixelValue = (value: string): number => {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export const clampVisualBase = (base: number): number =>
  Math.min(MAX_VISUAL_BASE, Math.max(0, base));

export const readSafeAreaInsets = (): SafeAreaInsets => {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { ...ZERO_SAFE_AREA };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseCssPixelValue(style.getPropertyValue('--safe-area-top')),
    right: parseCssPixelValue(style.getPropertyValue('--safe-area-right')),
    bottom: parseCssPixelValue(style.getPropertyValue('--safe-area-bottom')),
    left: parseCssPixelValue(style.getPropertyValue('--safe-area-left')),
  };
};

export const getResponsiveViewportMetrics = (
  width: number,
  height: number,
  safeArea: SafeAreaInsets = ZERO_SAFE_AREA,
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
    safeArea: {
      top: normalizeInset(safeArea.top),
      right: normalizeInset(safeArea.right),
      bottom: normalizeInset(safeArea.bottom),
      left: normalizeInset(safeArea.left),
    },
  };
};

export const getHudLayoutMetrics = (
  viewport: ResponsiveViewportMetrics,
  lineGap: number,
): HudLayoutMetrics => {
  const leftX = Math.max(
    viewport.hudPadding,
    viewport.safeArea.left + SAFE_EDGE_GAP,
  );
  const rightPadding = Math.max(
    viewport.hudPadding,
    viewport.safeArea.right + SAFE_EDGE_GAP,
  );
  const topY = Math.max(
    viewport.hudPadding,
    viewport.safeArea.top + SAFE_EDGE_GAP,
  );
  const secondaryY = topY + lineGap;
  const comboY = viewport.compactHud ? secondaryY : topY;

  return {
    scoreX: leftX,
    scoreY: topY,
    bestX: leftX,
    bestY: secondaryY,
    comboX: Math.round(viewport.width * 0.5),
    comboY,
    timeX: Math.round(viewport.width - rightPadding),
    timeY: topY,
  };
};
