import { Container, Graphics, Sprite } from 'pixi.js';
import { calculateVisualSizes } from '../config/visualSizing';
import { getLaneSwitchVisual } from '../presentation/gameFeelVisual';
import {
  getPlayerPresentationMetrics,
  PLAYER_TRAIL_POINT_COUNT,
} from '../presentation/playerVisual';
import { calculatePlayerVisualRotation } from '../utils/playerVisual';

export type OrbitLane = 'inner' | 'outer';

const PLAYER_ASSET_URL = 'assets/player-simple.webp';
const LANE_SWITCH_DURATION = 0.14;
const INITIAL_LANE: OrbitLane = 'outer';
const INITIAL_ANGLE = -Math.PI / 2;
const TAU = Math.PI * 2;
const TRAIL_COLOR = 0x42e8ff;

const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export class Player {
  public readonly trailView = new Graphics();
  public readonly view = new Container();

  public lane: OrbitLane = INITIAL_LANE;
  public angle = INITIAL_ANGLE;
  public angularSpeed = 1.2;
  public alive = true;
  public transitionFromLane: OrbitLane = INITIAL_LANE;
  public transitionToLane: OrbitLane = INITIAL_LANE;
  public transitionProgress = 1;

  private readonly motionView = new Container();
  private readonly sprite = Sprite.from(PLAYER_ASSET_URL);
  private centerX = 0;
  private centerY = 0;
  private innerRadius = 0;
  private outerRadius = 0;
  private trailWidth = 2.5;
  private trailTailAlpha = 0.025;
  private trailHeadAlpha = 0.48;
  private glowRadius = 18;
  private glowAlpha = 0.11;
  private trailBoost = 1;
  private glowBoost = 1;
  private trailCount = 0;
  private trailHead = 0;
  private readonly trailX = new Float32Array(PLAYER_TRAIL_POINT_COUNT);
  private readonly trailY = new Float32Array(PLAYER_TRAIL_POINT_COUNT);

  public constructor() {
    this.sprite.anchor.set(0.5);
    this.motionView.addChild(this.sprite);
    this.view.addChild(this.motionView);
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

  public switchLane(): boolean {
    if (!this.alive || this.transitionProgress < 1) {
      return false;
    }

    this.transitionFromLane = this.lane;
    this.transitionToLane = this.lane === 'outer' ? 'inner' : 'outer';
    this.transitionProgress = 0;

    return true;
  }

  public reset(): void {
    this.lane = INITIAL_LANE;
    this.angle = INITIAL_ANGLE;
    this.alive = true;
    this.transitionFromLane = INITIAL_LANE;
    this.transitionToLane = INITIAL_LANE;
    this.transitionProgress = 1;
    this.trailBoost = 1;
    this.glowBoost = 1;
    this.motionView.scale.set(1);
    this.motionView.rotation = 0;
    this.clearTrail();
    this.updatePosition();
    this.redrawTrail();
  }

  public resize(
    width: number,
    height: number,
    innerRadius: number,
    outerRadius: number,
  ): void {
    const base = Math.min(width, height);
    const { player: visualSize } = calculateVisualSizes(base);
    const presentation = getPlayerPresentationMetrics(base);

    this.centerX = width * 0.5;
    this.centerY = height * 0.5;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.trailWidth = presentation.trailWidth;
    this.trailTailAlpha = presentation.trailTailAlpha;
    this.trailHeadAlpha = presentation.trailHeadAlpha;
    this.glowRadius = presentation.glowRadius;
    this.glowAlpha = presentation.glowAlpha;
    this.sprite.width = visualSize;
    this.sprite.height = visualSize;
    this.motionView.scale.set(1);
    this.clearTrail();
    this.updatePosition();
    this.redrawTrail();
  }

  private updatePosition(): void {
    const fromRadius = this.getLaneRadius(this.transitionFromLane);
    const toRadius = this.getLaneRadius(this.transitionToLane);
    const easedProgress = easeInOutQuad(this.transitionProgress);
    const radius = fromRadius + (toRadius - fromRadius) * easedProgress;
    const switchDirection = this.transitionToLane === 'inner' ? -1 : 1;
    const switchVisual = getLaneSwitchVisual(
      this.transitionProgress,
      switchDirection,
    );

    this.view.position.set(
      this.centerX + Math.cos(this.angle) * radius,
      this.centerY + Math.sin(this.angle) * radius,
    );
    this.view.rotation = calculatePlayerVisualRotation(this.angle);
    this.motionView.rotation = switchVisual.rotationOffset;
    this.motionView.scale.set(switchVisual.scaleX, switchVisual.scaleY);
    this.trailBoost = switchVisual.trailBoost;
    this.glowBoost = switchVisual.glowBoost;
  }

  private recordTrailPoint(): void {
    this.trailX[this.trailHead] = this.view.x;
    this.trailY[this.trailHead] = this.view.y;
    this.trailHead = (this.trailHead + 1) % PLAYER_TRAIL_POINT_COUNT;
    this.trailCount = Math.min(
      PLAYER_TRAIL_POINT_COUNT,
      this.trailCount + 1,
    );
  }

  private redrawTrail(): void {
    this.trailView.clear();

    const boostedGlowRadius = this.glowRadius * this.glowBoost;

    this.trailView
      .circle(this.view.x, this.view.y, boostedGlowRadius)
      .fill({
        color: TRAIL_COLOR,
        alpha: this.glowAlpha * 0.12 * this.glowBoost,
      })
      .circle(this.view.x, this.view.y, boostedGlowRadius * 0.64)
      .fill({
        color: TRAIL_COLOR,
        alpha: this.glowAlpha * 0.22 * this.glowBoost,
      })
      .circle(this.view.x, this.view.y, boostedGlowRadius * 0.34)
      .fill({
        color: TRAIL_COLOR,
        alpha: this.glowAlpha * 0.38 * this.glowBoost,
      });

    if (this.trailCount < 2) {
      return;
    }

    const oldestIndex =
      (this.trailHead - this.trailCount + PLAYER_TRAIL_POINT_COUNT) %
      PLAYER_TRAIL_POINT_COUNT;

    for (let index = 1; index < this.trailCount; index += 1) {
      const previousIndex =
        (oldestIndex + index - 1) % PLAYER_TRAIL_POINT_COUNT;
      const currentIndex = (oldestIndex + index) % PLAYER_TRAIL_POINT_COUNT;
      const progress = index / (this.trailCount - 1);
      const alpha =
        this.trailTailAlpha +
        (this.trailHeadAlpha - this.trailTailAlpha) * progress;

      this.trailView
        .moveTo(this.trailX[previousIndex], this.trailY[previousIndex])
        .lineTo(this.trailX[currentIndex], this.trailY[currentIndex])
        .stroke({
          color: TRAIL_COLOR,
          alpha: Math.min(0.72, alpha * this.trailBoost),
          width:
            this.trailWidth *
            (0.35 + progress * 0.65) *
            (0.88 + this.trailBoost * 0.12),
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
