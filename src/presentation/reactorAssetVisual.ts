const TAU = Math.PI * 2;
const PULSE_PERIOD_SECONDS = 3.4;

export interface ReactorAssetVisual {
  spriteSize: number;
  pulseAmplitude: number;
}

export const getReactorAssetVisual = (size: number): ReactorAssetVisual => ({
  spriteSize: Math.max(0, size),
  pulseAmplitude: 0.015,
});

export const calculateReactorAssetPulse = (
  elapsedSeconds: number,
  pulseAmplitude = 0.015,
): number => {
  const safeAmplitude = Math.max(0, Math.min(0.025, pulseAmplitude));
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;

  return 1 + Math.sin(phase) * safeAmplitude;
};
