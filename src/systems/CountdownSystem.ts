const COUNTDOWN_SECONDS = 3;
const GO_DISPLAY_SECONDS = 0.5;
const TOTAL_DURATION_SECONDS = COUNTDOWN_SECONDS + GO_DISPLAY_SECONDS;

export class CountdownSystem {
  public elapsedSeconds = 0;
  public label = '3';
  public finished = false;

  public update(deltaSeconds: number): void {
    if (this.finished) {
      return;
    }

    this.elapsedSeconds += Math.max(0, deltaSeconds);

    if (this.elapsedSeconds >= TOTAL_DURATION_SECONDS) {
      this.finished = true;
      this.label = '';
      return;
    }

    if (this.elapsedSeconds >= COUNTDOWN_SECONDS) {
      this.label = 'GO';
      return;
    }

    this.label = String(COUNTDOWN_SECONDS - Math.floor(this.elapsedSeconds));
  }

  public reset(): void {
    this.elapsedSeconds = 0;
    this.label = '3';
    this.finished = false;
  }
}
