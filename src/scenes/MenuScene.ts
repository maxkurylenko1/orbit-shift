import { Container, Graphics, Text } from 'pixi.js';
import { SpaceBackground } from '../background/SpaceBackground';
import {
  getResponsiveViewportMetrics,
  readSafeAreaInsets,
} from '../config/responsiveLayout';
import { calculateVisualSizes } from '../config/visualSizing';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { ReactorAssetView } from '../presentation/ReactorAssetView';

const TITLE_COLOR = 0xe8f7ff;
const ACCENT_COLOR = 0x42e8ff;
const MUTED_COLOR = 0x86a3b8;
const PANEL_COLOR = 0x07101d;

export class MenuScene implements Scene {
  public readonly view = new Container();

  private readonly spaceBackground = new SpaceBackground('menu');
  private readonly reactor = new ReactorAssetView();
  private readonly orbitDecoration = new Graphics();
  private readonly panel = new Graphics();
  private readonly eyebrow = new Text({
    text: 'ONE INPUT · TWO ORBITS',
    style: {
      fill: ACCENT_COLOR,
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 2.2,
    },
  });
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
  private readonly subtitle = new Text({
    text: 'Switch lanes. Collect energy. Stay alive.',
    style: {
      fill: MUTED_COLOR,
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: '400',
    },
  });
  private readonly playButton = new Graphics();
  private readonly playText = new Text({
    text: 'START RUN',
    style: {
      fill: TITLE_COLOR,
      fontFamily: 'Arial',
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 2,
    },
  });
  private readonly hint = new Text({
    text: 'Tap / Click / Space anywhere to start',
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
    this.eyebrow.anchor.set(0.5);
    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);
    this.playText.anchor.set(0.5);
    this.hint.anchor.set(0.5);

    this.view.addChild(
      this.spaceBackground.view,
      this.orbitDecoration,
      this.reactor.view,
      this.panel,
      this.eyebrow,
      this.title,
      this.subtitle,
      this.playButton,
      this.playText,
      this.hint,
    );
  }

  public start(): void {
    this.unsubscribeInput = this.input.subscribe(this.onPlay);
  }

  public update(deltaSeconds: number): void {
    this.reactor.update(deltaSeconds);
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
    const { reactor: reactorSize } = calculateVisualSizes(base);
    const heroY = centerY - base * 0.005;
    const titleY = centerY - base * 0.285;
    const buttonWidth = Math.min(320, Math.max(190, base * 0.34));
    const buttonHeight = Math.min(70, Math.max(54, base * 0.085));
    const buttonRadius = buttonHeight * 0.5;
    const panelWidth = Math.min(
      viewport.width - 32,
      Math.max(300, base * 0.58),
    );
    const panelHeight = Math.min(240, Math.max(185, base * 0.23));
    const panelY = centerY + base * 0.16;
    const innerOrbit = base * 0.15;
    const outerOrbit = base * 0.215;

    this.spaceBackground.resize(viewport.width, viewport.height);

    this.reactor.view.position.set(centerX, heroY);
    this.reactor.resize(reactorSize * 0.82);

    this.orbitDecoration
      .clear()
      .circle(centerX, heroY, innerOrbit)
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.11,
        width: Math.max(1, base * 0.0018),
      })
      .circle(centerX, heroY, outerOrbit)
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.07,
        width: Math.max(1, base * 0.0014),
      });

    this.panel
      .clear()
      .roundRect(
        centerX - panelWidth * 0.5,
        panelY - panelHeight * 0.5,
        panelWidth,
        panelHeight,
        Math.min(26, panelHeight * 0.12),
      )
      .fill({ color: PANEL_COLOR, alpha: 0.62 })
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.13,
        width: 1,
      });

    this.eyebrow.style.fontSize = Math.min(
      15,
      Math.max(12, base * 0.016),
    );
    this.title.style.fontSize = Math.min(
      62,
      Math.max(38, base * 0.06),
    );
    this.subtitle.style.fontSize = Math.min(
      18,
      Math.max(14, base * 0.019),
    );
    this.playText.style.fontSize = Math.min(
      23,
      Math.max(19, base * 0.028),
    );
    this.hint.style.fontSize = Math.min(
      16,
      Math.max(13, base * 0.017),
    );

    this.eyebrow.position.set(centerX, titleY - base * 0.065);
    this.title.position.set(centerX, titleY);
    this.subtitle.position.set(centerX, titleY + base * 0.062);

    const buttonY = panelY - panelHeight * 0.12;

    this.playButton
      .clear()
      .roundRect(
        centerX - buttonWidth * 0.5,
        buttonY - buttonHeight * 0.5,
        buttonWidth,
        buttonHeight,
        buttonRadius,
      )
      .fill({ color: ACCENT_COLOR, alpha: 0.14 })
      .stroke({
        color: ACCENT_COLOR,
        alpha: 0.88,
        width: Math.max(2, base * 0.0024),
      });

    this.playText.position.set(centerX, buttonY);
    this.hint.position.set(
      centerX,
      panelY + panelHeight * 0.27,
    );
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.view.destroy({ children: true });
  }
}
