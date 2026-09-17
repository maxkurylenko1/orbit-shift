const TAU = Math.PI * 2;
const PULSE_PERIOD_SECONDS = 3.2;
const CORE_PULSE_AMPLITUDE = 0.035;
const RING_ROTATION_SPEED = 0.12;

const CYAN_GLOW_COLOR = 0x38dfff;
const AMBER_GLOW_COLOR = 0xffb02e;
const ORANGE_GLOW_COLOR = 0xff6a16;

export interface ReactorGlowRing {
  radius: number;
  color: number;
  alpha: number;
}

export interface ReactorAssemblyMetrics {
  outerRadius: number;
  bodyRadius: number;
  innerRingRadius: number;
  coreRadius: number;
  armOffset: number;
  armLength: number;
  armThickness: number;
  segmentStroke: number;
  indicatorRadius: number;
}

export const createReactorGlowRings = (reactorSize: number): ReactorGlowRing[] => {
  const safeSize = Math.max(0, reactorSize);

  return [
    { radius: safeSize * 0.64, color: CYAN_GLOW_COLOR, alpha: 0.012 },
    { radius: safeSize * 0.54, color: CYAN_GLOW_COLOR, alpha: 0.018 },
    { radius: safeSize * 0.45, color: AMBER_GLOW_COLOR, alpha: 0.028 },
    { radius: safeSize * 0.34, color: ORANGE_GLOW_COLOR, alpha: 0.044 },
  ];
};

export const getReactorAssemblyMetrics = (
  reactorSize: number,
): ReactorAssemblyMetrics => {
  const safeSize = Math.max(0, reactorSize);

  return {
    outerRadius: safeSize * 0.5,
    bodyRadius: safeSize * 0.43,
    innerRingRadius: safeSize * 0.29,
    coreRadius: safeSize * 0.145,
    armOffset: safeSize * 0.34,
    armLength: safeSize * 0.26,
    armThickness: safeSize * 0.11,
    segmentStroke: Math.max(1.5, safeSize * 0.022),
    indicatorRadius: Math.max(2, safeSize * 0.024),
  };
};

export const calculateReactorPulseAlpha = (elapsedSeconds: number): number => {
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;
  return 0.965 + Math.sin(phase) * 0.025;
};

export const calculateCorePulseScale = (elapsedSeconds: number): number => {
  const phase = (Math.max(0, elapsedSeconds) / PULSE_PERIOD_SECONDS) * TAU;
  return 1 + Math.sin(phase) * CORE_PULSE_AMPLITUDE;
};

export const calculateReactorRingRotation = (elapsedSeconds: number): number =>
  (Math.max(0, elapsedSeconds) * RING_ROTATION_SPEED) % TAU;
