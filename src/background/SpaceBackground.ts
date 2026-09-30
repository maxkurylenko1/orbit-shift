import { Container, Graphics, Sprite } from 'pixi.js';
import {
  getBackgroundTone,
  type BackgroundVariant,
} from './backgroundTone';
import { getCoverLayout } from './backgroundLayout';

const BACKGROUND_ASSET_URL = 'assets/space-background.webp';
const BACKGROUND_SOURCE_WIDTH = 2560;
const BACKGROUND_SOURCE_HEIGHT = 1440;
const MIN_RADIUS_FRACTION = 0.14;

export class SpaceBackground {
  public readonly view = new Container();

  private readonly background = Sprite.from(BACKGROUND_ASSET_URL);
  private readonly toneOverlay = new Graphics();

  public constructor(private readonly variant: BackgroundVariant = 'game') {
    this.background.anchor.set(0.5);
    this.view.addChild(this.background, this.toneOverlay);
  }

  public resize(width: number, height: number): void {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const layout = getCoverLayout(
      safeWidth,
      safeHeight,
      BACKGROUND_SOURCE_WIDTH,
      BACKGROUND_SOURCE_HEIGHT,
    );
    const tone = getBackgroundTone(safeWidth, safeHeight, this.variant);

    this.background.position.set(safeWidth * 0.5, safeHeight * 0.5);
    this.background.width = layout.width;
    this.background.height = layout.height;
    this.background.tint = tone.tint;

    // Static geometry: redraw only on resize, never on each game tick.
    this.toneOverlay
      .clear()
      .rect(0, 0, safeWidth, safeHeight)
      .fill({
        color: tone.overlayColor,
        alpha: tone.globalAlpha,
      });

    // Subtle concentric layers approximate a soft radial vignette
    // without a full-screen filter or another image asset.
    for (let index = 0; index < tone.radialLayers; index += 1) {
      const progress =
        tone.radialLayers > 1
          ? index / (tone.radialLayers - 1)
          : 0;
      const radius =
        tone.centerRadius *
        (1 - progress * (1 - MIN_RADIUS_FRACTION));

      this.toneOverlay
        .circle(safeWidth * 0.5, safeHeight * 0.5, radius)
        .fill({
          color: tone.overlayColor,
          alpha: tone.radialLayerAlpha,
        });
    }
  }
}
