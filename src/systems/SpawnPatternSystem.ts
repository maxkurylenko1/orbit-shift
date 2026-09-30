import type { OrbitLane } from '../entities/Player';

export interface SpawnStep {
  lane: OrbitLane | null;
  intervalMultiplier: number;
}

interface SpawnPattern {
  minTier: number;
  steps: readonly SpawnStep[];
}

const PATTERNS: readonly SpawnPattern[] = [
  {
    minTier: 0,
    steps: [
      { lane: 'inner', intervalMultiplier: 1 },
      { lane: 'outer', intervalMultiplier: 1 },
      { lane: 'inner', intervalMultiplier: 1 },
      { lane: 'outer', intervalMultiplier: 1 },
    ],
  },
  {
    minTier: 0,
    steps: [
      { lane: 'inner', intervalMultiplier: 1.1 },
      { lane: null, intervalMultiplier: 1.35 },
      { lane: 'outer', intervalMultiplier: 1.1 },
      { lane: null, intervalMultiplier: 1.35 },
    ],
  },
  {
    minTier: 1,
    steps: [
      { lane: 'outer', intervalMultiplier: 1.15 },
      { lane: 'outer', intervalMultiplier: 0.62 },
      { lane: 'inner', intervalMultiplier: 1.15 },
      { lane: 'inner', intervalMultiplier: 0.62 },
    ],
  },
  {
    minTier: 2,
    steps: [
      { lane: 'inner', intervalMultiplier: 0.95 },
      { lane: 'outer', intervalMultiplier: 0.68 },
      { lane: 'outer', intervalMultiplier: 0.85 },
      { lane: 'inner', intervalMultiplier: 0.62 },
      { lane: null, intervalMultiplier: 1.05 },
    ],
  },
  {
    minTier: 3,
    steps: [
      { lane: 'outer', intervalMultiplier: 0.9 },
      { lane: 'inner', intervalMultiplier: 0.6 },
      { lane: 'outer', intervalMultiplier: 0.58 },
      { lane: 'inner', intervalMultiplier: 0.6 },
      { lane: null, intervalMultiplier: 0.9 },
    ],
  },
  {
    minTier: 4,
    steps: [
      { lane: 'inner', intervalMultiplier: 0.78 },
      { lane: 'outer', intervalMultiplier: 0.55 },
      { lane: 'inner', intervalMultiplier: 0.55 },
      { lane: 'outer', intervalMultiplier: 0.55 },
      { lane: 'inner', intervalMultiplier: 0.62 },
      { lane: null, intervalMultiplier: 0.85 },
    ],
  },
  {
    minTier: 4,
    steps: [
      { lane: 'outer', intervalMultiplier: 0.9 },
      { lane: 'outer', intervalMultiplier: 0.55 },
      { lane: null, intervalMultiplier: 0.55 },
      { lane: 'inner', intervalMultiplier: 0.55 },
      { lane: 'outer', intervalMultiplier: 0.55 },
      { lane: null, intervalMultiplier: 0.75 },
    ],
  },
];

export const SPAWN_PATTERN_COUNT = PATTERNS.length;

const clampTier = (tier: number): number =>
  Math.max(0, Math.min(4, Math.floor(tier)));

// Late runs rotate through challenging sequences instead of resetting
// to full tutorial patterns. Advanced patterns include their own rest beats.
const PATTERN_ROTATIONS: readonly (readonly number[])[] = [
  [0, 1],
  [0, 2, 1],
  [0, 2, 3],
  [2, 3, 4],
  [3, 4, 5, 6],
];

const getEligiblePatternIndices = (tier: number): number[] => {
  const safeTier = clampTier(tier);

  return PATTERN_ROTATIONS[safeTier].filter(
    (index) => PATTERNS[index].minTier <= safeTier,
  );
};

export class SpawnPatternSystem {
  private patternIndex = 0;
  private stepIndex = 0;
  private tier = 0;

  public reset(
    patternIndex = 0,
    phaseRatio = 0,
    tier = 0,
  ): void {
    this.tier = clampTier(tier);

    const eligibleIndices = getEligiblePatternIndices(this.tier);
    const safePatternIndex = Math.max(0, Math.floor(patternIndex));
    const selectedPatternIndex =
      eligibleIndices[safePatternIndex % eligibleIndices.length];
    const pattern = PATTERNS[selectedPatternIndex];
    const safePhaseRatio = Math.min(0.999999, Math.max(0, phaseRatio));

    this.patternIndex = selectedPatternIndex;
    this.stepIndex = Math.floor(
      safePhaseRatio * pattern.steps.length,
    );
  }

  public setTier(tier: number): void {
    this.tier = clampTier(tier);
  }

  public currentStep(): SpawnStep {
    return PATTERNS[this.patternIndex].steps[this.stepIndex];
  }

  public advance(): void {
    const pattern = PATTERNS[this.patternIndex];
    this.stepIndex += 1;

    if (this.stepIndex < pattern.steps.length) {
      return;
    }

    this.stepIndex = 0;

    const eligibleIndices = getEligiblePatternIndices(this.tier);
    const currentEligibleIndex = eligibleIndices.indexOf(this.patternIndex);
    const nextEligibleIndex =
      currentEligibleIndex < 0
        ? 0
        : (currentEligibleIndex + 1) % eligibleIndices.length;

    this.patternIndex = eligibleIndices[nextEligibleIndex];
  }
}
