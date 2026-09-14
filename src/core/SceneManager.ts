import { Container } from 'pixi.js';

export interface Scene {
  readonly view: Container;
  start(): void;
  update(deltaSeconds: number): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

export class SceneManager {
  private currentScene: Scene | null = null;

  public constructor(private readonly stage: Container) {}

  public changeScene(scene: Scene, width: number, height: number): void {
    if (this.currentScene) {
      this.stage.removeChild(this.currentScene.view);
      this.currentScene.destroy();
    }

    this.currentScene = scene;
    this.stage.addChild(scene.view);
    scene.resize(width, height);
    scene.start();
  }

  public update(deltaSeconds: number): void {
    this.currentScene?.update(deltaSeconds);
  }

  public resize(width: number, height: number): void {
    this.currentScene?.resize(width, height);
  }

  public destroy(): void {
    if (!this.currentScene) {
      return;
    }

    this.stage.removeChild(this.currentScene.view);
    this.currentScene.destroy();
    this.currentScene = null;
  }
}
