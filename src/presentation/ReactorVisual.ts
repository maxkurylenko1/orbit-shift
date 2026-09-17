import { Container, Graphics } from 'pixi.js';
import {
  calculateCorePulseScale,
  calculateReactorPulseAlpha,
  calculateReactorRingRotation,
  createReactorGlowRings,
  getReactorAssemblyMetrics,
} from './reactorVisual';

const BODY_DARK = 0x070d14;
const BODY_MID = 0x111c29;
const BODY_LIGHT = 0x223246;
const METAL_EDGE = 0x607b91;
const ORANGE = 0xff8b1f;
const AMBER = 0xffbd52;
const CORE_LIGHT = 0xfff1bd;
const CYAN = 0x35d9ff;

export class ReactorVisual {
  public readonly view = new Container();

  private readonly glow = new Graphics();
  private readonly body = new Graphics();
  private readonly innerRing = new Graphics();
  private readonly arms = new Graphics();
  private readonly core = new Graphics();
  private elapsedSeconds = 0;

  public constructor() {
    this.view.addChild(this.glow, this.body, this.innerRing, this.arms, this.core);
  }

  public update(deltaSeconds: number): void {
    this.elapsedSeconds += Math.max(0, deltaSeconds);
    this.glow.alpha = calculateReactorPulseAlpha(this.elapsedSeconds);
    this.core.scale.set(calculateCorePulseScale(this.elapsedSeconds));
    this.innerRing.rotation = calculateReactorRingRotation(this.elapsedSeconds);
  }

  public resize(size: number): void {
    const metrics = getReactorAssemblyMetrics(size);
    const outerStroke = Math.max(2, size * 0.014);
    const innerStroke = Math.max(1.5, size * 0.01);

    this.glow.clear();
    for (const ring of createReactorGlowRings(size)) {
      this.glow
        .circle(0, 0, ring.radius)
        .fill({ color: ring.color, alpha: ring.alpha });
    }

    this.body
      .clear()
      .circle(0, 0, metrics.outerRadius)
      .fill({ color: BODY_DARK, alpha: 0.98 })
      .circle(0, 0, metrics.bodyRadius)
      .fill({ color: BODY_MID, alpha: 1 })
      .circle(0, 0, metrics.bodyRadius)
      .stroke({ color: METAL_EDGE, alpha: 0.58, width: outerStroke })
      .circle(0, 0, metrics.bodyRadius * 0.82)
      .stroke({ color: BODY_LIGHT, alpha: 0.9, width: innerStroke })
      .circle(0, 0, metrics.innerRingRadius * 1.28)
      .fill({ color: 0x0a121d, alpha: 1 });

    const halfArm = metrics.armLength * 0.5;
    const halfThickness = metrics.armThickness * 0.5;
    const panelLength = metrics.armLength * 0.68;
    const panelThickness = metrics.armThickness * 0.58;

    this.arms
      .clear()
      .rect(
        -halfThickness,
        -metrics.armOffset - halfArm,
        metrics.armThickness,
        metrics.armLength,
      )
      .fill({ color: BODY_LIGHT, alpha: 1 })
      .rect(
        -halfThickness,
        metrics.armOffset - halfArm,
        metrics.armThickness,
        metrics.armLength,
      )
      .fill({ color: BODY_LIGHT, alpha: 1 })
      .rect(
        -metrics.armOffset - halfArm,
        -halfThickness,
        metrics.armLength,
        metrics.armThickness,
      )
      .fill({ color: BODY_LIGHT, alpha: 1 })
      .rect(
        metrics.armOffset - halfArm,
        -halfThickness,
        metrics.armLength,
        metrics.armThickness,
      )
      .fill({ color: BODY_LIGHT, alpha: 1 })
      .rect(
        -panelThickness * 0.5,
        -metrics.armOffset - panelLength * 0.5,
        panelThickness,
        panelLength,
      )
      .fill({ color: BODY_DARK, alpha: 0.92 })
      .rect(
        -panelThickness * 0.5,
        metrics.armOffset - panelLength * 0.5,
        panelThickness,
        panelLength,
      )
      .fill({ color: BODY_DARK, alpha: 0.92 })
      .rect(
        -metrics.armOffset - panelLength * 0.5,
        -panelThickness * 0.5,
        panelLength,
        panelThickness,
      )
      .fill({ color: BODY_DARK, alpha: 0.92 })
      .rect(
        metrics.armOffset - panelLength * 0.5,
        -panelThickness * 0.5,
        panelLength,
        panelThickness,
      )
      .fill({ color: BODY_DARK, alpha: 0.92 });

    const verticalLightLength = panelLength * 0.5;
    const verticalLightWidth = Math.max(2, metrics.armThickness * 0.12);

    this.arms
      .rect(
        -verticalLightWidth * 0.5,
        -metrics.armOffset - verticalLightLength * 0.5,
        verticalLightWidth,
        verticalLightLength,
      )
      .fill({ color: ORANGE, alpha: 0.92 })
      .rect(
        -verticalLightWidth * 0.5,
        metrics.armOffset - verticalLightLength * 0.5,
        verticalLightWidth,
        verticalLightLength,
      )
      .fill({ color: ORANGE, alpha: 0.92 })
      .circle(-metrics.armOffset, 0, metrics.indicatorRadius)
      .fill({ color: CYAN, alpha: 0.92 })
      .circle(metrics.armOffset, 0, metrics.indicatorRadius)
      .fill({ color: CYAN, alpha: 0.92 });

    this.innerRing
      .clear()
      .circle(0, 0, metrics.innerRingRadius)
      .stroke({ color: METAL_EDGE, alpha: 0.7, width: innerStroke });

    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      this.innerRing
        .arc(
          0,
          0,
          metrics.innerRingRadius * 1.08,
          angle - 0.34,
          angle + 0.34,
        )
        .stroke({ color: ORANGE, alpha: 0.92, width: metrics.segmentStroke });
    }

    for (const angle of [Math.PI / 4, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
      this.innerRing
        .circle(
          Math.cos(angle) * metrics.innerRingRadius * 0.83,
          Math.sin(angle) * metrics.innerRingRadius * 0.83,
          Math.max(1.4, metrics.indicatorRadius * 0.45),
        )
        .fill({ color: CYAN, alpha: 0.72 });
    }

    this.core
      .clear()
      .circle(0, 0, metrics.coreRadius * 1.7)
      .fill({ color: ORANGE, alpha: 0.06 })
      .circle(0, 0, metrics.coreRadius * 1.35)
      .stroke({ color: ORANGE, alpha: 0.78, width: innerStroke })
      .circle(0, 0, metrics.coreRadius)
      .fill({ color: ORANGE, alpha: 1 })
      .circle(0, 0, metrics.coreRadius * 0.72)
      .fill({ color: AMBER, alpha: 1 })
      .circle(0, 0, metrics.coreRadius * 0.36)
      .fill({ color: CORE_LIGHT, alpha: 1 });
  }
}
