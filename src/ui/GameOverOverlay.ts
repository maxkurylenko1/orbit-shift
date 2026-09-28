import { Container, Graphics, Text } from 'pixi.js';
import {
  getResponsiveViewportMetrics,
  readSafeAreaInsets,
} from '../config/responsiveLayout';

const OVERLAY_COLOR = 0x02040b;
const OVERLAY_ALPHA = 0.72;
const PANEL_COLOR = 0x07101d;
const TITLE_COLOR = 0xffffff;
const ACCENT_COLOR = 0x42e8ff;
const MUTED_COLOR = 0xb7c8d4;

export class GameOverOverlay {
  public readonly view = new Container();

  private readonly dimmer = new Graphics();
  private readonly panel = new Graphics();
  private readonly eyebrow = new Text({
    text: 'RUN COMPLETE',
    style: {
      fill: ACCENT_COLOR,
      fontFamily: 'Arial',
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 2,
    },
  });
  private readonly title = new Text({
    text: 'GAME OVER',
    style: {
      fill: TITLE_COLOR,
      fontFamily: 'Arial',
      fontSize: 40,
      fontWeight: '700',
    },
  });
  private readonly result = new Text({
    text: 'SCORE 0 · 0.0s',
    style: {
      fill: TITLE_COLOR,
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: '600',
    },
  });
  private readonly best = new Text({
    text: 'BEST · 0',
    style: {
      fill: ACCENT_COLOR,
      fontFamily: 'Arial',
      fontSize: 17,
      fontWeight: '600',
    },
  });
  private readonly divider = new Graphics();
  private readonly hint = new Text({
    text: 'Tap / Click / Space to run again',
    style: {
      fill: MUTED_COLOR,
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: '500',
    },
  });

  public constructor() {
    this.eyebrow.anchor.set(0.5);
    this.title.anchor.set(0.5);
    this.result.anchor.set(0.5);
    this.best.anchor.set(0.5);
    this.hint.anchor.set(0.5);
    this.view.addChild(
      this.dimmer,
      this.panel,
      this.eyebrow,
      this.title,
      this.result,
      this.best,
      this.divider,
      this.hint,
    );
    this.hide();
  }

  public show(
    score: number,
    bestScore: number,
    elapsedSeconds: number,
    isNewBest = false,
    previousBestScore = bestScore,
  ): void {
    this.eyebrow.text = isNewBest ? 'NEW RECORD' : 'RUN COMPLETE';
    this.result.text = `SCORE ${score} · ${elapsedSeconds.toFixed(1)}s`;

    if (isNewBest) {
      this.best.text = `NEW BEST · ${bestScore}`;
    } else if (previousBestScore > score) {
      this.best.text = `TO BEST · ${previousBestScore - score}`;
    } else {
      this.best.text = `BEST · ${bestScore}`;
    }

    this.view.visible = true;
  }

  public hide(): void {
    this.view.visible = false;
  }

  public resize(width: number, height: number): void {
    const viewport = getResponsiveViewportMetrics(
      width,
      height,
      readSafeAreaInsets(),
    );
    const base = viewport.visualBase;
    const centerX = viewport.centerX;
    const centerY = viewport.centerY;
    const panelWidth = Math.min(
      viewport.width - 32,
      Math.max(290, base * 0.56),
    );
    const panelHeight = Math.min(
      330,
      Math.max(260, base * 0.37),
    );
    const radius = Math.min(28, panelHeight * 0.09);

    this.dimmer
      .clear()
      .rect(0, 0, viewport.width, viewport.height)
      .fill({ color: OVERLAY_COLOR, alpha: OVERLAY_ALPHA });

    this.panel
      .clear()
      .roundRect(
        centerX - panelWidth * 0.5,
        centerY - panelHeight * 0.5,
        panelWidth,
        panelHeight,
        radius,
      )
      .fill({ color: PANEL_COLOR, alpha: 0.9 })
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.28,
        width: 1.5,
      });

    this.eyebrow.style.fontSize = Math.min(
      14,
      Math.max(11, base * 0.014),
    );
    this.title.style.fontSize = Math.min(
      54,
      Math.max(30, base * 0.058),
    );
    this.result.style.fontSize = Math.min(
      24,
      Math.max(17, base * 0.026),
    );
    this.best.style.fontSize = Math.min(
      20,
      Math.max(15, base * 0.021),
    );
    this.hint.style.fontSize = Math.min(
      17,
      Math.max(13, base * 0.018),
    );

    this.eyebrow.position.set(
      centerX,
      centerY - panelHeight * 0.31,
    );
    this.title.position.set(
      centerX,
      centerY - panelHeight * 0.18,
    );
    this.result.position.set(
      centerX,
      centerY + panelHeight * 0.01,
    );
    this.best.position.set(
      centerX,
      centerY + panelHeight * 0.13,
    );

    const dividerY = centerY + panelHeight * 0.24;
    this.divider
      .clear()
      .moveTo(centerX - panelWidth * 0.32, dividerY)
      .lineTo(centerX + panelWidth * 0.32, dividerY)
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.18,
        width: 1,
      });

    this.hint.position.set(
      centerX,
      centerY + panelHeight * 0.34,
    );
  }
}
