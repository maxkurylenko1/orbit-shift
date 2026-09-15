import type { OrbitLane } from '../entities/Player';

export interface SpawnStep {
  lane: OrbitLane | null;
  intervalMultiplier: number;
}

const PATTERNS: readonly (readonly SpawnStep[])[] = [
  [
    { lane: 'inner', intervalMultiplier: 1 },
    { lane: 'outer', intervalMultiplier: 1 },
    { lane: 'inner', intervalMultiplier: 1 },
    { lane: 'outer', intervalMultiplier: 1 },
  ],
  [
    { lane: 'outer', intervalMultiplier: 1.35 },
    { lane: 'outer', intervalMultiplier: 0.45 },
    { lane: 'inner', intervalMultiplier: 1.5 },
    { lane: 'inner', intervalMultiplier: 0.45 },
  ],
  [
    { lane: 'inner', intervalMultiplier: 1 },
    { lane: null, intervalMultiplier: 1.8 },
    { lane: 'outer', intervalMultiplier: 1 },
    { lane: null, intervalMultiplier: 1.8 },
  ],
];

export const SPAWN_PATTERN_COUNT = PATTERNS.length;

export class SpawnPatternSystem {
  private patternIndex = 0;
  private stepIndex = 0;

  public reset(patternIndex = 0, phaseRatio = 0): void {
    const safePatternIndex = Math.min(
      PATTERNS.length - 1,
      Math.max(0, Math.floor(patternIndex)),
    );
    const pattern = PATTERNS[safePatternIndex];
    const safePhaseRatio = Math.min(0.999999, Math.max(0, phaseRatio));

    this.patternIndex = safePatternIndex;
    this.stepIndex = Math.floor(safePhaseRatio * pattern.length);
  }

  public currentStep(): SpawnStep {
    return PATTERNS[this.patternIndex][this.stepIndex];
  }

  public advance(): void {
    const pattern = PATTERNS[this.patternIndex];
    this.stepIndex += 1;

    if (this.stepIndex >= pattern.length) {
      this.stepIndex = 0;
      this.patternIndex = (this.patternIndex + 1) % PATTERNS.length;
    }
  }
}
