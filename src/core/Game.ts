import { Application, type Ticker } from 'pixi.js';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';

const BACKGROUND_COLOR = 0x050816;
const MAX_DEVICE_PIXEL_RATIO = 2;

export class Game {
  private readonly app = new Application();
  private sceneManager: SceneManager | null = null;
  private inputManager: InputManager | null = null;

  private readonly handleResize = (): void => {
    if (!this.sceneManager) {
      return;
    }

    this.app.resize();
    this.sceneManager.resize(this.app.screen.width, this.app.screen.height);
  };

  private readonly handleTick = (ticker: Ticker): void => {
    this.sceneManager?.update(ticker.deltaMS / 1000);
  };

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

    this.inputManager = new InputManager(this.app.canvas);
    this.inputManager.start();
    this.sceneManager = new SceneManager(this.app.stage);
    this.app.ticker.add(this.handleTick);
    window.addEventListener('resize', this.handleResize);

    const showGameScene = (): void => {
      if (!this.inputManager) {
        return;
      }

      this.sceneManager?.changeScene(
        new GameScene(this.inputManager),
        this.app.screen.width,
        this.app.screen.height,
      );
    };

    this.sceneManager.changeScene(
      new BootScene(showGameScene),
      this.app.screen.width,
      this.app.screen.height,
    );
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.app.ticker.remove(this.handleTick);
    this.sceneManager?.destroy();
    this.sceneManager = null;
    this.inputManager?.destroy();
    this.inputManager = null;
    this.app.destroy({ removeView: true }, { children: true });
  }
}
