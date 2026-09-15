const MAX_COMBO_MULTIPLIER = 5;

export class ComboSystem {
  public streak = 0;
  public multiplier = 1;

  public recordCollect(): void {
    this.streak += 1;
    this.multiplier = Math.min(
      MAX_COMBO_MULTIPLIER,
      Math.max(1, this.streak),
    );
  }

  public resetChain(): void {
    this.streak = 0;
    this.multiplier = 1;
  }
}
