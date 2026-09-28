export type CountdownCue = '3' | '2' | '1' | 'GO';

export interface SwitchToneProfile {
  startFrequency: number;
  endFrequency: number;
  durationSeconds: number;
}

const MIN_COMBO = 1;
const MAX_COMBO = 5;

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
