import { Graphics } from 'pixi.js';
import type { OrbitLane } from './Player';

const HAZARD_COLOR = 0xff3d72;
const OBSTACLE_SIZE_RATIO = 0.026;
const MIN_OBSTACLE_SIZE = 8;

export class Obstacle {
  public readonly view = new Graphics();

  public constructor(
    public readonly lane: OrbitLane,
    public readonly angle: number,
  ) {
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

    this.view
      .clear()
      .rect(-size * 0.5, -size * 0.5, size, size)
      .fill({ color: HAZARD_COLOR });

    this.view.position.set(
      centerX + Math.cos(this.angle) * radius,
      centerY + Math.sin(this.angle) * radius,
    );
  }

  public destroy(): void {
    this.view.destroy();
  }
}
