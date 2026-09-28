const HALF_TURN = Math.PI;
const DEFAULT_IMPACT_DURATION = 0.22;

export interface LaneSwitchVisual {
  scaleX: number;
  scaleY: number;
  rotationOffset: number;
  trailBoost: number;
  glowBoost: number;
}

export interface ShakeOffset {
  x: number;
  y: number;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const getLaneSwitchVisual = (
  progress: number,
  direction: number,
): LaneSwitchVisual => {
  const safeProgress = clamp01(progress);
  const impulse = Math.sin(safeProgress * HALF_TURN);
  const directionSign = direction < 0 ? -1 : direction > 0 ? 1 : 0;

  return {
    scaleX: 1 + impulse * 0.075,
    scaleY: 1 - impulse * 0.055,
    rotationOffset: directionSign * impulse * 0.12,
    trailBoost: 1 + impulse * 0.72,
    glowBoost: 1 + impulse * 0.58,
  };
};

export const getImpactShake = (
  elapsedSeconds: number,
  amplitude: number,
  durationSeconds = DEFAULT_IMPACT_DURATION,
): ShakeOffset => {
  const safeDuration = Math.max(0, durationSeconds);
  const safeElapsed = Math.max(0, elapsedSeconds);
  const safeAmplitude = Math.max(0, amplitude);

  if (safeDuration === 0 || safeElapsed >= safeDuration || safeAmplitude === 0) {
    return { x: 0, y: 0 };
  }

  const envelope = 1 - safeElapsed / safeDuration;
  const dampedEnvelope = envelope * envelope;

  return {
    x: Math.sin(safeElapsed * 96) * safeAmplitude * dampedEnvelope,
    y:
      Math.sin(safeElapsed * 127 + 0.8) *
      safeAmplitude *
      0.62 *
      dampedEnvelope,
  };
};

export const getTransientAlpha = (
  elapsedSeconds: number,
  durationSeconds: number,
): number => {
  const safeDuration = Math.max(0, durationSeconds);

  if (safeDuration === 0) {
    return 0;
  }

  return 1 - clamp01(Math.max(0, elapsedSeconds) / safeDuration);
};
