import { Container } from 'pixi.js';
import type { Scene } from '../core/SceneManager';

export class BootScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly onReady: () => void) {}

  public start(): void {
    queueMicrotask(this.onReady);
  }

  public update(_deltaSeconds: number): void {}

  public resize(_width: number, _height: number): void {}

  public destroy(): void {
    this.view.destroy({ children: true });
  }
}
