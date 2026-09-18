import { Container, Sprite } from 'pixi.js';
import { getCoverLayout } from './backgroundLayout';

const BACKGROUND_ASSET_URL = 'assets/space-background.webp';
const BACKGROUND_SOURCE_WIDTH = 1672;
const BACKGROUND_SOURCE_HEIGHT = 941;

export class SpaceBackground {
  public readonly view = new Container();

  private readonly background = Sprite.from(BACKGROUND_ASSET_URL);

  public constructor() {
    this.background.anchor.set(0.5);
    this.view.addChild(this.background);
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

    this.background.position.set(safeWidth * 0.5, safeHeight * 0.5);
    this.background.width = layout.width;
    this.background.height = layout.height;
  }
}
