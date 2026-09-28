import { Container, Graphics, Text } from 'pixi.js';
import { getResponsiveViewportMetrics } from '../config/responsiveLayout';
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
    text: 'Tap / Click / Space to shift orbit',
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
    const viewport = getResponsiveViewportMetrics(width, height);
    const base = viewport.visualBase;
    const buttonWidth = Math.min(
      320,
      Math.max(180, base * 0.34),
    );
    const buttonHeight = Math.min(
      72,
      Math.max(54, base * 0.09),
    );
    const buttonRadius = buttonHeight * 0.5;
    const centerX = viewport.centerX;
    const centerY = viewport.centerY;

    this.title.style.fontSize = Math.min(
      58,
      Math.max(38, base * 0.06),
    );
    this.playText.style.fontSize = Math.min(
      24,
      Math.max(19, base * 0.03),
    );
    this.hint.style.fontSize = Math.min(
      18,
      Math.max(14, base * 0.02),
    );

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
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.85,
        width: Math.max(2, base * 0.003),
      });

    this.playText.position.set(centerX, centerY);
    this.hint.position.set(centerX, centerY + base * 0.11);
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.view.destroy({ children: true });
  }
}
