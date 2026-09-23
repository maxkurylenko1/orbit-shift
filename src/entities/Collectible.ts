import { Sprite } from 'pixi.js';
import type { OrbitLane } from './Player';

const SHARD_ASSET_URL = 'assets/shard.webp';
const COLLECTIBLE_SIZE_RATIO = 0.03;
const MIN_COLLECTIBLE_SIZE = 14;

export class Collectible {
  public readonly view = Sprite.from(SHARD_ASSET_URL);

  public constructor(
    public readonly lane: OrbitLane,
    public readonly angle: number,
  ) {
    this.view.anchor.set(0.5);
  }

  public resize(
    width: number,
    height: number,
    innerRadius: number,
    outerRadius: number,
  ): void {
    const base = Math.min(width, height);
    const size = Math.max(MIN_COLLECTIBLE_SIZE, base * COLLECTIBLE_SIZE_RATIO);
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
