import { Container, Graphics, Text } from 'pixi.js';

const OVERLAY_COLOR = 0x02040b;
const OVERLAY_ALPHA = 0.72;
const TITLE_COLOR = 0xffffff;
const ACCENT_COLOR = 0x42e8ff;
const MUTED_COLOR = 0xb7c8d4;

export class GameOverOverlay {
  public readonly view = new Container();

  private readonly dimmer = new Graphics();
  private readonly title = new Text({
    text: 'GAME OVER',
    style: { fill: TITLE_COLOR, fontFamily: 'Arial', fontSize: 40, fontWeight: '700' },
  });
  private readonly result = new Text({
    text: 'SCORE 0 · 0.0s',
    style: { fill: ACCENT_COLOR, fontFamily: 'Arial', fontSize: 20, fontWeight: '600' },
  });
  private readonly hint = new Text({
    text: 'Tap / Space to restart',
    style: { fill: MUTED_COLOR, fontFamily: 'Arial', fontSize: 16, fontWeight: '500' },
  });

  public constructor() {
    this.title.anchor.set(0.5);
    this.result.anchor.set(0.5);
    this.hint.anchor.set(0.5);
    this.view.addChild(this.dimmer, this.title, this.result, this.hint);
    this.hide();
  }

  public show(score: number, elapsedSeconds: number): void {
    this.result.text = `SCORE ${score} · ${elapsedSeconds.toFixed(1)}s`;
    this.view.visible = true;
  }

  public hide(): void {
    this.view.visible = false;
  }

  public resize(width: number, height: number): void {
    const base = Math.min(width, height);
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.dimmer
      .clear()
      .rect(0, 0, width, height)
      .fill({ color: OVERLAY_COLOR, alpha: OVERLAY_ALPHA });

    this.title.style.fontSize = Math.max(30, base * 0.065);
    this.result.style.fontSize = Math.max(17, base * 0.03);
    this.hint.style.fontSize = Math.max(14, base * 0.022);

    this.title.position.set(centerX, centerY - base * 0.07);
    this.result.position.set(centerX, centerY + base * 0.01);
    this.hint.position.set(centerX, centerY + base * 0.08);
  }
}
