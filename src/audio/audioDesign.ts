export type CountdownCue = '3' | '2' | '1' | 'GO';

export interface SwitchToneProfile {
  startFrequency: number;
  endFrequency: number;
  durationSeconds: number;
}

export interface AmbientProfile {
  baseFrequency: number;
  harmonicFrequency: number;
  filterFrequency: number;
  gain: number;
  pulseRate: number;
  pulseDepth: number;
}

const MIN_COMBO = 1;
const MAX_COMBO = 5;

const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

export const getSwitchToneProfile = (): SwitchToneProfile => ({
  startFrequency: 390,
  endFrequency: 640,
  durationSeconds: 0.075,
});

export const getPickupFrequency = (multiplier: number): number => {
  const safeMultiplier = Math.max(
    MIN_COMBO,
    Math.min(MAX_COMBO, Math.round(multiplier)),
  );

  return 720 + (safeMultiplier - 1) * 82;
};

export const getCountdownFrequency = (label: string): number | null => {
  switch (label) {
    case '3':
      return 460;
    case '2':
      return 520;
    case '1':
      return 590;
    case 'GO':
      return 880;
    default:
      return null;
  }
};

export const getAmbientProfile = (
  intensity: number,
  surgeStrength: number,
): AmbientProfile => {
  const safeIntensity = clamp01(intensity);
  const safeSurge = clamp01(surgeStrength);

  return {
    baseFrequency: 43 + safeIntensity * 8 + safeSurge * 2,
    harmonicFrequency: 86 + safeIntensity * 19 + safeSurge * 5,
    filterFrequency: 210 + safeIntensity * 520 + safeSurge * 180,
    gain: 0.018 + safeIntensity * 0.011 + safeSurge * 0.004,
    pulseRate: 0.58 + safeIntensity * 1.12 + safeSurge * 0.72,
    pulseDepth: 0.004 + safeIntensity * 0.007 + safeSurge * 0.003,
  };
};
