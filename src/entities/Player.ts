import { Graphics } from 'pixi.js';

export type OrbitLane = 'inner' | 'outer';

const PLAYER_COLOR = 0x42e8ff;
const PLAYER_RADIUS_RATIO = 0.018;
const MIN_PLAYER_RADIUS = 5;
const LANE_SWITCH_DURATION = 0.14;
const TAU = Math.PI * 2;

const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export class Player {
  public readonly view = new Graphics();

  public lane: OrbitLane = 'outer';
  public angle = -Math.PI / 2;
  public angularSpeed = 1.2;
  public alive = true;
  public transitionFromLane: OrbitLane = 'outer';
  public transitionToLane: OrbitLane = 'outer';
  public transitionProgress = 1;

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

    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(
        1,
        this.transitionProgress + deltaSeconds / LANE_SWITCH_DURATION,
      );

      if (this.transitionProgress === 1) {
        this.lane = this.transitionToLane;
        this.transitionFromLane = this.lane;
      }
    }

    this.updatePosition();
  }

  public switchLane(): void {
    if (!this.alive || this.transitionProgress < 1) {
      return;
    }

    this.transitionFromLane = this.lane;
    this.transitionToLane = this.lane === 'outer' ? 'inner' : 'outer';
    this.transitionProgress = 0;
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
    const fromRadius = this.getLaneRadius(this.transitionFromLane);
    const toRadius = this.getLaneRadius(this.transitionToLane);
    const easedProgress = easeInOutQuad(this.transitionProgress);
    const radius = fromRadius + (toRadius - fromRadius) * easedProgress;

    this.view.position.set(
      this.centerX + Math.cos(this.angle) * radius,
      this.centerY + Math.sin(this.angle) * radius,
    );
  }

  private getLaneRadius(lane: OrbitLane): number {
    return lane === 'inner' ? this.innerRadius : this.outerRadius;
  }
}
