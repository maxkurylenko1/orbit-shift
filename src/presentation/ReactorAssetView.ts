import { Container, Graphics, Sprite } from 'pixi.js';
import {
  calculateReactorAssetPulse,
  getReactorAssetVisual,
} from './reactorAssetVisual';

const REACTOR_ASSET_URL = 'assets/reactor.webp';
const HALO_COLOR = 0xff8b1f;

export class ReactorAssetView {
  public readonly view = new Container();

  private readonly halo = new Graphics();
  private readonly pulseContainer = new Container();
  private readonly sprite = Sprite.from(REACTOR_ASSET_URL);
  private elapsedSeconds = 0;
  private pulseAmplitude = 0.02;

  public constructor() {
    this.sprite.anchor.set(0.5);
    this.pulseContainer.addChild(this.sprite);
    this.view.addChild(this.halo, this.pulseContainer);
  }

  public update(deltaSeconds: number): void {
    this.elapsedSeconds += Math.max(0, deltaSeconds);
    const pulse = calculateReactorAssetPulse(
      this.elapsedSeconds,
      this.pulseAmplitude,
    );
    this.pulseContainer.scale.set(pulse);
  }

  public resize(size: number): void {
    const visual = getReactorAssetVisual(size);

    this.pulseAmplitude = visual.pulseAmplitude;
    this.sprite.width = visual.spriteSize;
    this.sprite.height = visual.spriteSize;
    this.pulseContainer.scale.set(1);

    this.halo
      .clear()
      .circle(0, 0, visual.outerHaloRadius)
      .fill({ color: HALO_COLOR, alpha: visual.outerHaloAlpha })
      .circle(0, 0, visual.innerHaloRadius)
      .fill({ color: HALO_COLOR, alpha: visual.innerHaloAlpha });
  }
}
