const TAU = Math.PI * 2;
const PULSE_PERIOD_SECONDS = 3;
const PULSE_BASE_ALPHA = 0.975;
const PULSE_AMPLITUDE = 0.025;

const CYAN_GLOW_COLOR = 0x2bc7d9;
const AMBER_GLOW_COLOR = 0xffb02e;
const ORANGE_GLOW_COLOR = 0xff7a18;

export interface ReactorGlowRing {
  radius: number;
  color: number;
  alpha: number;
}

export const createReactorGlowRings = (reactorSize: number): ReactorGlowRing[] => {
  const safeSize = Math.max(0, reactorSize);

  return [
    { radius: safeSize * 0.62, color: CYAN_GLOW_COLOR, alpha: 0.006 },
    { radius: safeSize * 0.55, color: CYAN_GLOW_COLOR, alpha: 0.009 },
    { radius: safeSize * 0.48, color: AMBER_GLOW_COLOR, alpha: 0.013 },
    { radius: safeSize * 0.4, color: ORANGE_GLOW_COLOR, alpha: 0.019 },
    { radius: safeSize * 0.31, color: ORANGE_GLOW_COLOR, alpha: 0.026 },
  ];
};

export const calculateReactorPulseAlpha = (elapsedSeconds: number): number => {
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;
  return PULSE_BASE_ALPHA + Math.sin(phase) * PULSE_AMPLITUDE;
};
