const TAU = Math.PI * 2;
const PULSE_PERIOD_SECONDS = 3.4;
const MAX_FEEDBACK_STRENGTH = 1;
const FEEDBACK_SCALE_BOOST = 0.034;

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
  feedbackStrength = 0,
): number => {
  const safeAmplitude = Math.max(0, Math.min(0.025, pulseAmplitude));
  const safeFeedbackStrength = Math.max(
    0,
    Math.min(MAX_FEEDBACK_STRENGTH, feedbackStrength),
  );
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;

  return (
    1 +
    Math.sin(phase) * safeAmplitude +
    safeFeedbackStrength * FEEDBACK_SCALE_BOOST
  );
};
