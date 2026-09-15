import { Graphics } from 'pixi.js';
import type { OrbitLane } from './Player';

const COLLECTIBLE_COLOR = 0xffd166;
const COLLECTIBLE_SIZE_RATIO = 0.018;
const MIN_COLLECTIBLE_SIZE = 7;

export class Collectible {
  public readonly view = new Graphics();

  public constructor(
    public readonly lane: OrbitLane,
    public readonly angle: number,
  ) {}

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

    this.view
      .clear()
      .rect(-size * 0.5, -size * 0.5, size, size)
      .fill({ color: COLLECTIBLE_COLOR });
    this.view.rotation = Math.PI * 0.25;
    this.view.position.set(
      centerX + Math.cos(this.angle) * radius,
      centerY + Math.sin(this.angle) * radius,
    );
  }

  public destroy(): void {
    this.view.destroy();
  }
}
