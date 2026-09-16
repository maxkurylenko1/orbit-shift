import { Container, Graphics } from 'pixi.js';
import { createSpaceField, getBackgroundMetrics } from './spaceField';

const BASE_COLOR = 0x030713;
const WASH_COLOR = 0x08142b;
const STAR_COLOR = 0xd9f6ff;
const NEBULA_COLOR = 0x164b73;
const CENTER_GLOW_COLOR = 0x0d6a86;
const VIGNETTE_COLOR = 0x01030a;
const FIELD_SEED = 0x0b17;

export class SpaceBackground {
  public readonly view = new Container();

  private readonly baseLayer = new Graphics();
  private readonly nebulaLayer = new Graphics();
  private readonly starLayer = new Graphics();
  private readonly vignetteLayer = new Graphics();

  public constructor() {
    this.view.addChild(
      this.baseLayer,
      this.nebulaLayer,
      this.starLayer,
      this.vignetteLayer,
    );
  }

  public resize(width: number, height: number): void {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const centerX = safeWidth * 0.5;
    const centerY = safeHeight * 0.5;
    const layout = createSpaceField(safeWidth, safeHeight, FIELD_SEED);
    const { centerGlowRadius, vignetteInset } = getBackgroundMetrics(
      safeWidth,
      safeHeight,
    );

    this.baseLayer
      .clear()
      .rect(0, 0, safeWidth, safeHeight)
      .fill({ color: BASE_COLOR })
      .rect(0, 0, safeWidth, safeHeight)
      .fill({ color: WASH_COLOR, alpha: 0.34 });

    this.nebulaLayer.clear();

    for (const patch of layout.nebulae) {
      for (let layer = 3; layer >= 1; layer -= 1) {
        const progress = layer / 3;
        this.nebulaLayer
          .circle(patch.x, patch.y, patch.radius * progress)
          .fill({
            color: NEBULA_COLOR,
            alpha: patch.alpha * (0.45 + (1 - progress) * 0.55),
          });
      }
    }

    for (let ring = 5; ring >= 1; ring -= 1) {
      const progress = ring / 5;
      this.nebulaLayer
        .circle(centerX, centerY, centerGlowRadius * progress)
        .fill({
          color: CENTER_GLOW_COLOR,
          alpha: 0.012 + (1 - progress) * 0.018,
        });
    }

    this.starLayer.clear();

    for (const star of layout.stars) {
      this.starLayer
        .circle(star.x, star.y, star.radius)
        .fill({ color: STAR_COLOR, alpha: star.alpha });
    }

    this.vignetteLayer
      .clear()
      .rect(0, 0, safeWidth, vignetteInset)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.14 })
      .rect(0, safeHeight - vignetteInset, safeWidth, vignetteInset)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.18 })
      .rect(0, 0, vignetteInset, safeHeight)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.12 })
      .rect(safeWidth - vignetteInset, 0, vignetteInset, safeHeight)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.12 });
  }
}
