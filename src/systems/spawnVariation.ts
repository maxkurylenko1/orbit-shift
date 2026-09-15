const LEAD_ANGLE_VARIATION = 0.3;

const clampSample = (value: number): number =>
  Math.min(0.999999, Math.max(0, value));

export interface SpawnRunVariation {
  patternIndex: number;
  phaseRatio: number;
  leadAngleOffset: number;
}

export const createSpawnRunVariation = (
  patternCount: number,
  random: () => number = Math.random,
): SpawnRunVariation => {
  const safePatternCount = Math.max(1, Math.floor(patternCount));
  const patternSample = clampSample(random());
  const phaseSample = clampSample(random());
  const angleSample = clampSample(random());

  return {
    patternIndex: Math.floor(patternSample * safePatternCount),
    phaseRatio: phaseSample,
    leadAngleOffset: (angleSample * 2 - 1) * LEAD_ANGLE_VARIATION,
  };
};
