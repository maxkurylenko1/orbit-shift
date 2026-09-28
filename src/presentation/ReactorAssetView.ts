import { Container, Sprite } from 'pixi.js';
import {
  calculateReactorAssetPulse,
  getReactorAssetVisual,
} from './reactorAssetVisual';

const REACTOR_ASSET_URL = 'assets/reactor.webp';
const FEEDBACK_DECAY_SECONDS = 0.42;

export class ReactorAssetView {
  public readonly view = new Container();

  private readonly pulseContainer = new Container();
  private readonly sprite = Sprite.from(REACTOR_ASSET_URL);
  private elapsedSeconds = 0;
  private pulseAmplitude = 0.015;
  private feedbackStrength = 0;

  public constructor() {
    this.sprite.anchor.set(0.5);
    this.pulseContainer.addChild(this.sprite);
    this.view.addChild(this.pulseContainer);
  }

  public update(deltaSeconds: number): void {
    const delta = Math.max(0, deltaSeconds);

    this.elapsedSeconds += delta;
    this.feedbackStrength = Math.max(
      0,
      this.feedbackStrength - delta / FEEDBACK_DECAY_SECONDS,
    );

    const pulse = calculateReactorAssetPulse(
      this.elapsedSeconds,
      this.pulseAmplitude,
      this.feedbackStrength,
    );
    this.pulseContainer.scale.set(pulse);
  }

  public resize(size: number): void {
    const visual = getReactorAssetVisual(size);

    this.pulseAmplitude = visual.pulseAmplitude;
    this.sprite.width = visual.spriteSize;
    this.sprite.height = visual.spriteSize;
    this.pulseContainer.scale.set(1);
  }

  public pulse(strength: number): void {
    this.feedbackStrength = Math.max(
      this.feedbackStrength,
      Math.max(0, Math.min(1, strength)),
    );
  }

  public resetFeedback(): void {
    this.feedbackStrength = 0;
    this.pulseContainer.scale.set(1);
  }
}
