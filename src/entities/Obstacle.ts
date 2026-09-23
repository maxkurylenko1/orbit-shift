import { Sprite } from 'pixi.js';
import type { OrbitLane } from './Player';

const OBSTACLE_ASSET_URL = 'assets/obstacle.webp';
const OBSTACLE_SIZE_RATIO = 0.05;
const MIN_OBSTACLE_SIZE = 20;

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
    const size = Math.max(MIN_OBSTACLE_SIZE, base * OBSTACLE_SIZE_RATIO);
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
