import { Sprite } from 'pixi.js';
import { getGameItemVisuals } from '../presentation/gameItemVisual';
import type { OrbitLane } from './Player';

const OBSTACLE_ASSET_URL = 'assets/obstacle.webp';

export class Obstacle {
  public readonly view = Sprite.from(OBSTACLE_ASSET_URL);

  public constructor(
    public readonly lane: OrbitLane,
    public readonly angle: number,
    public remainingTravelRadians: number,
  ) {
    this.view.anchor.set(0.5);
    this.view.rotation = Math.PI / 4;
  }

  public resize(
    width: number,
    height: number,
    innerRadius: number,
    outerRadius: number,
  ): void {
    const base = Math.min(width, height);
    const size = getGameItemVisuals(base).obstacle;
    const radius = this.lane === 'inner' ? innerRadius : outerRadius;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.view.width = size;
    this.view.height = size;
    this.view.position.set(
      centerX + Math.cos(this.angle) * radius,
      centerY + Math.sin(this.angle) * radius,
    );
  }

  public destroy(): void {
    this.view.destroy();
  }
}
