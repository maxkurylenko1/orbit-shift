export class ScoreSystem {
  public elapsedSeconds = 0;
  public score = 0;

  public update(deltaSeconds: number): void {
    const safeDelta = Math.max(0, deltaSeconds);
    this.elapsedSeconds += safeDelta;
    this.score = Math.floor(this.elapsedSeconds * 10);
  }

  public reset(): void {
    this.elapsedSeconds = 0;
    this.score = 0;
  }
}
