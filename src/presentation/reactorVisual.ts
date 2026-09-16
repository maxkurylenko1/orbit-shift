const TAU = Math.PI * 2;
const PULSE_PERIOD_SECONDS = 3.2;
const PULSE_BASE_ALPHA = 0.97;
const PULSE_AMPLITUDE = 0.03;

const CYAN_GLOW_COLOR = 0x38dfff;
const AMBER_GLOW_COLOR = 0xffb02e;
const ORANGE_GLOW_COLOR = 0xff6a16;

export interface ReactorGlowRing {
  radius: number;
  color: number;
  alpha: number;
}

export interface ReactorFrameMetrics {
  spriteSize: number;
  maskRadius: number;
  frameRadius: number;
  armOffset: number;
  armLength: number;
  armThickness: number;
}

export const createReactorGlowRings = (reactorSize: number): ReactorGlowRing[] => {
  const safeSize = Math.max(0, reactorSize);

  return [
    { radius: safeSize * 0.66, color: CYAN_GLOW_COLOR, alpha: 0.012 },
    { radius: safeSize * 0.58, color: CYAN_GLOW_COLOR, alpha: 0.018 },
    { radius: safeSize * 0.5, color: AMBER_GLOW_COLOR, alpha: 0.026 },
    { radius: safeSize * 0.42, color: ORANGE_GLOW_COLOR, alpha: 0.034 },
    { radius: safeSize * 0.33, color: ORANGE_GLOW_COLOR, alpha: 0.04 },
  ];
};

export const getReactorFrameMetrics = (reactorSize: number): ReactorFrameMetrics => {
  const safeSize = Math.max(0, reactorSize);

  return {
    spriteSize: safeSize * 0.78,
    maskRadius: safeSize * 0.38,
    frameRadius: safeSize * 0.5,
    armOffset: safeSize * 0.34,
    armLength: safeSize * 0.28,
    armThickness: safeSize * 0.115,
  };
};

export const calculateReactorPulseAlpha = (elapsedSeconds: number): number => {
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;
  return PULSE_BASE_ALPHA + Math.sin(phase) * PULSE_AMPLITUDE;
};
