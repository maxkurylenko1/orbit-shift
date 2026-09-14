import { Container, Graphics } from 'pixi.js';
import type { Scene } from '../core/SceneManager';

const ORBIT_COLOR = 0x2bc7d9;
const INNER_RADIUS_RATIO = 0.2;
const OUTER_RADIUS_RATIO = 0.31;

export class GameScene implements Scene {
  public readonly view = new Container();

  private readonly orbits = new Graphics();

  public constructor() {
    this.view.addChild(this.orbits);
  }

  public start(): void {}

  public update(_deltaSeconds: number): void {}

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
  }

  public destroy(): void {
    this.view.destroy({ children: true });
  }
}
