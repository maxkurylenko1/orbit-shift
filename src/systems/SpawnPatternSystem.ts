import type { OrbitLane } from '../entities/Player';

type SpawnStep = OrbitLane | null;

const PATTERNS: readonly (readonly SpawnStep[])[] = [
  ['inner', 'outer', 'inner', 'outer'],
  ['outer', 'outer', 'inner', 'inner'],
  ['inner', null, 'outer', null],
];

export class SpawnPatternSystem {
  private patternIndex = 0;
  private stepIndex = 0;

  public reset(): void {
    this.patternIndex = 0;
    this.stepIndex = 0;
  }

  public nextStep(): SpawnStep {
    const pattern = PATTERNS[this.patternIndex];
    const step = pattern[this.stepIndex];

    this.stepIndex += 1;

    if (this.stepIndex >= pattern.length) {
      this.stepIndex = 0;
      this.patternIndex = (this.patternIndex + 1) % PATTERNS.length;
    }

    return step;
  }
}
