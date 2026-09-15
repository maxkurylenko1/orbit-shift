const BEST_SCORE_KEY = 'orbit-shift.best-score';

export interface ScoreStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class BestScoreStore {
  private readonly storage: ScoreStorage;

  public constructor(storage: ScoreStorage) {
    this.storage = storage;
  }

  public load(): number {
    try {
      const rawValue = this.storage.getItem(BEST_SCORE_KEY);

      if (rawValue === null) {
        return 0;
      }

      const score = Number(rawValue);
      return Number.isFinite(score) && score >= 0 ? Math.floor(score) : 0;
    } catch {
      return 0;
    }
  }

  public submit(score: number): number {
    const safeScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const currentBest = this.load();
    const nextBest = Math.max(currentBest, safeScore);

    if (nextBest === currentBest) {
      return currentBest;
    }

    try {
      this.storage.setItem(BEST_SCORE_KEY, String(nextBest));
    } catch {
      return currentBest;
    }

    return nextBest;
  }
}
