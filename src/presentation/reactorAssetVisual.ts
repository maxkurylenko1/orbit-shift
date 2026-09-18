const TAU = Math.PI * 2;
const PULSE_PERIOD_SECONDS = 3.4;

export interface ReactorAssetVisual {
  spriteSize: number;
  innerHaloRadius: number;
  outerHaloRadius: number;
  innerHaloAlpha: number;
  outerHaloAlpha: number;
  pulseAmplitude: number;
}

export const getReactorAssetVisual = (size: number): ReactorAssetVisual => {
  const safeSize = Math.max(0, size);

  return {
    spriteSize: safeSize,
    innerHaloRadius: safeSize * 0.55,
    outerHaloRadius: safeSize * 0.72,
    innerHaloAlpha: 0.055,
    outerHaloAlpha: 0.025,
    pulseAmplitude: 0.02,
  };
};

export const calculateReactorAssetPulse = (
  elapsedSeconds: number,
  pulseAmplitude = 0.02,
): number => {
  const safeAmplitude = Math.max(0, Math.min(0.03, pulseAmplitude));
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;

  return 1 + Math.sin(phase) * safeAmplitude;
};
