import { Container, Graphics, Text } from 'pixi.js';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';

const TITLE_COLOR = 0xe8f7ff;
const ACCENT_COLOR = 0x42e8ff;
const MUTED_COLOR = 0x86a3b8;

export class MenuScene implements Scene {
  public readonly view = new Container();

  private readonly title = new Text({
    text: 'ORBIT SHIFT',
    style: {
      fill: TITLE_COLOR,
      fontFamily: 'Arial',
      fontSize: 42,
      fontWeight: '700',
      letterSpacing: 3,
    },
  });
  private readonly playButton = new Graphics();
  private readonly playText = new Text({
    text: 'PLAY',
    style: {
      fill: TITLE_COLOR,
      fontFamily: 'Arial',
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 2,
    },
  });
  private readonly hint = new Text({
    text: 'Tap to switch orbit',
    style: {
      fill: MUTED_COLOR,
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: '400',
    },
  });

  private unsubscribeInput: (() => void) | null = null;

  public constructor(
    private readonly input: InputManager,
    private readonly onPlay: () => void,
  ) {
    this.title.anchor.set(0.5);
    this.playText.anchor.set(0.5);
    this.hint.anchor.set(0.5);
    this.view.addChild(this.title, this.playButton, this.playText, this.hint);
  }

  public start(): void {
    this.unsubscribeInput = this.input.subscribe(this.onPlay);
  }

  public update(_deltaSeconds: number): void {}

  public resize(width: number, height: number): void {
    const base = Math.min(width, height);
    const buttonWidth = Math.max(180, base * 0.34);
    const buttonHeight = Math.max(54, base * 0.09);
    const buttonRadius = buttonHeight * 0.5;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.title.position.set(centerX, centerY - base * 0.16);

    this.playButton
      .clear()
      .roundRect(
        centerX - buttonWidth * 0.5,
        centerY - buttonHeight * 0.5,
        buttonWidth,
        buttonHeight,
        buttonRadius,
      )
      .fill({ color: ACCENT_COLOR, alpha: 0.16 })
      .stroke({ color: ACCENT_COLOR, alpha: 0.85, width: Math.max(2, base * 0.003) });

    this.playText.position.set(centerX, centerY);
    this.hint.position.set(centerX, centerY + base * 0.11);
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.view.destroy({ children: true });
  }
}
