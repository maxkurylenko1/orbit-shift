import { Container, Graphics } from 'pixi.js';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { Player } from '../entities/Player';

const ORBIT_COLOR = 0x2bc7d9;
const INNER_RADIUS_RATIO = 0.2;
const OUTER_RADIUS_RATIO = 0.31;

export class GameScene implements Scene {
  public readonly view = new Container();

  private readonly orbits = new Graphics();
  private readonly player = new Player();
  private unsubscribeInput: (() => void) | null = null;

  private readonly handleAction = (): void => {
    this.player.switchLane();
  };

  public constructor(private readonly input: InputManager) {
    this.view.addChild(this.orbits, this.player.view);
  }

  public start(): void {
    this.unsubscribeInput = this.input.subscribe(this.handleAction);
  }

  public update(deltaSeconds: number): void {
    this.player.update(deltaSeconds);
  }

  public resize(width: number, height: number): void {
    const base = Math.min(width, height);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const innerRadius = base * INNER_RADIUS_RATIO;
    const outerRadius = base * OUTER_RADIUS_RATIO;
    const lineWidth = Math.max(1, base * 0.003);

    this.orbits
      .clear()
      .circle(centerX, centerY, innerRadius)
      .stroke({ color: ORBIT_COLOR, alpha: 0.32, width: lineWidth })
      .circle(centerX, centerY, outerRadius)
      .stroke({ color: ORBIT_COLOR, alpha: 0.2, width: lineWidth });

    this.player.resize(width, height, innerRadius, outerRadius);
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.view.destroy({ children: true });
  }
}
