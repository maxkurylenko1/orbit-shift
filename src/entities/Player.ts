import { Graphics } from 'pixi.js';

export type OrbitLane = 'inner' | 'outer';

const PLAYER_COLOR = 0x42e8ff;
const PLAYER_RADIUS_RATIO = 0.018;
const MIN_PLAYER_RADIUS = 5;
const TAU = Math.PI * 2;

export class Player {
  public readonly view = new Graphics();

  public lane: OrbitLane = 'outer';
  public angle = -Math.PI / 2;
  public angularSpeed = 1.2;
  public alive = true;

  private centerX = 0;
  private centerY = 0;
  private innerRadius = 0;
  private outerRadius = 0;

  public update(deltaSeconds: number): void {
    if (!this.alive) {
      return;
    }

    this.angle += this.angularSpeed * deltaSeconds;

    if (this.angle >= TAU) {
      this.angle %= TAU;
    }

    this.updatePosition();
  }

  public resize(
    width: number,
    height: number,
    innerRadius: number,
    outerRadius: number,
  ): void {
    const base = Math.min(width, height);
    const playerRadius = Math.max(MIN_PLAYER_RADIUS, base * PLAYER_RADIUS_RATIO);

    this.centerX = width * 0.5;
    this.centerY = height * 0.5;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;

    this.view.clear().circle(0, 0, playerRadius).fill({ color: PLAYER_COLOR });
    this.updatePosition();
  }

  private updatePosition(): void {
    const radius = this.lane === 'inner' ? this.innerRadius : this.outerRadius;

    this.view.position.set(
      this.centerX + Math.cos(this.angle) * radius,
      this.centerY + Math.sin(this.angle) * radius,
    );
  }
}
