export class ScoreSystem {
  public elapsedSeconds = 0;
  public score = 0;

  private bonusScore = 0;

  public update(deltaSeconds: number): void {
    const safeDelta = Math.max(0, deltaSeconds);
    this.elapsedSeconds += safeDelta;
    this.refreshScore();
  }

  public addPoints(points: number): void {
    this.bonusScore += Math.max(0, Math.floor(points));
    this.refreshScore();
  }

  public reset(): void {
    this.elapsedSeconds = 0;
    this.bonusScore = 0;
    this.score = 0;
  }

  private refreshScore(): void {
    this.score = Math.floor(this.elapsedSeconds * 10) + this.bonusScore;
  }
}
