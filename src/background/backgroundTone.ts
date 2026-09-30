import { clampVisualBase } from '../config/responsiveLayout';

export type BackgroundVariant = 'game' | 'menu';

export interface BackgroundTone {
  tint: number;
  overlayColor: number;
  globalAlpha: number;
  centerRadius: number;
  radialLayers: number;
  radialLayerAlpha: number;
}

export const getBackgroundTone = (
  width: number,
  height: number,
  variant: BackgroundVariant,
): BackgroundTone => {
  const visualBase = clampVisualBase(Math.min(
    Math.max(1, width),
    Math.max(1, height),
  ));
  const isGame = variant === 'game';

  return {
    tint: 0xe7edf2,
    overlayColor: 0x050b17,
    globalAlpha: isGame ? 0.12 : 0.075,
    centerRadius: visualBase * 0.66,
    radialLayers: isGame ? 28 : 0,
    radialLayerAlpha: isGame ? 0.015 : 0,
  };
};
