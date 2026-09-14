import { Application } from 'pixi.js';

const BACKGROUND_COLOR = 0x050816;
const MAX_DEVICE_PIXEL_RATIO = 2;

export class Game {
  private readonly app = new Application();

  public async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      antialias: true,
      autoDensity: true,
      backgroundColor: BACKGROUND_COLOR,
      resolution: Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO),
      resizeTo: host,
    });

    this.app.canvas.classList.add('game-canvas');
    host.appendChild(this.app.canvas);
  }

  public destroy(): void {
    this.app.destroy({ removeView: true }, { children: true });
  }
}
