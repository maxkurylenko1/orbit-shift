import { Graphics, Sprite } from 'pixi.js';
import { calculateVisualSizes } from '../config/visualSizing';
import { calculatePlayerVisualRotation } from '../utils/playerVisual';

export type OrbitLane = 'inner' | 'outer';

const PLAYER_ASSET_URL = 'assets/player-simple.webp';
const LANE_SWITCH_DURATION = 0.14;
const INITIAL_LANE: OrbitLane = 'outer';
const INITIAL_ANGLE = -Math.PI / 2;
const TAU = Math.PI * 2;
const TRAIL_POINT_COUNT = 12;
const TRAIL_COLOR = 0x42e8ff;

const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export class Player {
  public readonly trailView = new Graphics();
  public readonly view = Sprite.from(PLAYER_ASSET_URL);

  public lane: OrbitLane = INITIAL_LANE;
  public angle = INITIAL_ANGLE;
  public angularSpeed = 1.2;
  public alive = true;
  public transitionFromLane: OrbitLane = INITIAL_LANE;
  public transitionToLane: OrbitLane = INITIAL_LANE;
  public transitionProgress = 1;

  private centerX = 0;
  private centerY = 0;
  private innerRadius = 0;
  private outerRadius = 0;
  private trailWidth = 2;
  private trailCount = 0;
  private trailHead = 0;
  private readonly trailX = new Float32Array(TRAIL_POINT_COUNT);
  private readonly trailY = new Float32Array(TRAIL_POINT_COUNT);

  public constructor() {
    this.view.anchor.set(0.5);
  }

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
    this.recordTrailPoint();
    this.redrawTrail();
  }

  public switchLane(): void {
    if (!this.alive || this.transitionProgress < 1) {
      return;
    }

    this.transitionFromLane = this.lane;
    this.transitionToLane = this.lane === 'outer' ? 'inner' : 'outer';
    this.transitionProgress = 0;
  }

  public reset(): void {
    this.lane = INITIAL_LANE;
    this.angle = INITIAL_ANGLE;
    this.alive = true;
    this.transitionFromLane = INITIAL_LANE;
    this.transitionToLane = INITIAL_LANE;
    this.transitionProgress = 1;
    this.clearTrail();
    this.updatePosition();
  }

  public resize(
    width: number,
    height: number,
    innerRadius: number,
    outerRadius: number,
  ): void {
    const base = Math.min(width, height);
    const { player: visualSize } = calculateVisualSizes(base);

    this.centerX = width * 0.5;
    this.centerY = height * 0.5;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.trailWidth = Math.max(2, base * 0.006);
    this.view.width = visualSize;
    this.view.height = visualSize;
    this.clearTrail();
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
    this.view.rotation = calculatePlayerVisualRotation(this.angle);
  }

  private recordTrailPoint(): void {
    this.trailX[this.trailHead] = this.view.x;
    this.trailY[this.trailHead] = this.view.y;
    this.trailHead = (this.trailHead + 1) % TRAIL_POINT_COUNT;
    this.trailCount = Math.min(TRAIL_POINT_COUNT, this.trailCount + 1);
  }

  private redrawTrail(): void {
    this.trailView.clear();

    if (this.trailCount < 2) {
      return;
    }

    const oldestIndex =
      (this.trailHead - this.trailCount + TRAIL_POINT_COUNT) % TRAIL_POINT_COUNT;

    for (let index = 1; index < this.trailCount; index += 1) {
      const previousIndex = (oldestIndex + index - 1) % TRAIL_POINT_COUNT;
      const currentIndex = (oldestIndex + index) % TRAIL_POINT_COUNT;
      const progress = index / (this.trailCount - 1);

      this.trailView
        .moveTo(this.trailX[previousIndex], this.trailY[previousIndex])
        .lineTo(this.trailX[currentIndex], this.trailY[currentIndex])
        .stroke({
          color: TRAIL_COLOR,
          alpha: 0.05 + progress * 0.38,
          width: this.trailWidth * (0.45 + progress * 0.55),
        });
    }
  }

  private clearTrail(): void {
    this.trailCount = 0;
    this.trailHead = 0;
    this.trailView.clear();
  }

  private getLaneRadius(lane: OrbitLane): number {
    return lane === 'inner' ? this.innerRadius : this.outerRadius;
  }
}
