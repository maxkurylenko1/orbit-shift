import { Container, Graphics } from 'pixi.js';
import { createSpaceField, getBackgroundMetrics } from './spaceField';

const BASE_COLOR = 0x02050d;
const WASH_COLOR = 0x06162a;
const STAR_COLOR = 0xe8fbff;
const STAR_FLARE_COLOR = 0x8eeeff;
const NEBULA_COLOR = 0x076b96;
const NEBULA_CORE_COLOR = 0x0aa9cf;
const GALAXY_COLOR = 0xc8f5ff;
const GALAXY_CORE_COLOR = 0xffd9a0;
const ASTEROID_COLOR = 0x05080f;
const ASTEROID_EDGE = 0x285a70;
const ASTEROID_HIGHLIGHT = 0x183d4d;
const ASTEROID_CRATER = 0x010309;
const VIGNETTE_COLOR = 0x01030a;
const FIELD_SEED = 0x0b17;

export class SpaceBackground {
  public readonly view = new Container();

  private readonly baseLayer = new Graphics();
  private readonly nebulaLayer = new Graphics();
  private readonly starLayer = new Graphics();
  private readonly galaxyLayer = new Graphics();
  private readonly asteroidLayer = new Graphics();
  private readonly vignetteLayer = new Graphics();

  public constructor() {
    this.view.addChild(
      this.baseLayer,
      this.nebulaLayer,
      this.starLayer,
      this.galaxyLayer,
      this.asteroidLayer,
      this.vignetteLayer,
    );
  }

  public resize(width: number, height: number): void {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const layout = createSpaceField(safeWidth, safeHeight, FIELD_SEED);
    const { base, vignetteInset } = getBackgroundMetrics(safeWidth, safeHeight);

    this.baseLayer
      .clear()
      .rect(0, 0, safeWidth, safeHeight)
      .fill({ color: BASE_COLOR })
      .rect(0, 0, safeWidth, safeHeight)
      .fill({ color: WASH_COLOR, alpha: 0.34 });

    this.nebulaLayer.clear();

    for (const patch of layout.nebulae) {
      for (let layer = 3; layer >= 1; layer -= 1) {
        const progress = layer / 3;
        const radiusX = patch.radius * (0.72 + progress * 0.72);
        const radiusY = patch.radius * (0.22 + progress * 0.28);
        const offset = patch.radius * (1 - progress) * 0.16;

        this.nebulaLayer
          .ellipse(
            patch.x + offset,
            patch.y - offset * 0.35,
            radiusX,
            radiusY,
          )
          .fill({
            color: layer === 1 ? NEBULA_CORE_COLOR : NEBULA_COLOR,
            alpha: patch.alpha * (0.28 + (1 - progress) * 0.48),
          });
      }
    }

    this.starLayer.clear();

    for (const star of layout.stars) {
      this.starLayer
        .circle(star.x, star.y, star.radius)
        .fill({ color: STAR_COLOR, alpha: star.alpha });

      if (star.radius > 1.25 && star.alpha > 0.6) {
        const flare = star.radius * 3.4;
        const flareWidth = Math.max(0.55, star.radius * 0.34);
        this.starLayer
          .moveTo(star.x - flare, star.y)
          .lineTo(star.x + flare, star.y)
          .stroke({
            color: STAR_FLARE_COLOR,
            alpha: star.alpha * 0.24,
            width: flareWidth,
          })
          .moveTo(star.x, star.y - flare)
          .lineTo(star.x, star.y + flare)
          .stroke({
            color: STAR_FLARE_COLOR,
            alpha: star.alpha * 0.18,
            width: flareWidth,
          });
      }
    }

    this.galaxyLayer.clear();

    for (const star of layout.galaxyStars) {
      this.galaxyLayer
        .circle(star.x, star.y, star.radius)
        .fill({ color: GALAXY_COLOR, alpha: star.alpha });
    }

    const galaxyCenterX = safeWidth * 0.86;
    const galaxyCenterY = safeHeight * 0.18;
    for (let layer = 3; layer >= 1; layer -= 1) {
      const progress = layer / 3;
      this.galaxyLayer
        .circle(galaxyCenterX, galaxyCenterY, base * 0.032 * progress)
        .fill({
          color: GALAXY_CORE_COLOR,
          alpha: 0.015 + (1 - progress) * 0.045,
        });
    }

    this.asteroidLayer.clear();

    for (const asteroid of layout.asteroids) {
      const edgeWidth = Math.max(0.8, asteroid.radius * 0.018);

      this.asteroidLayer
        .circle(asteroid.x, asteroid.y, asteroid.radius)
        .fill({ color: ASTEROID_COLOR, alpha: 1 })
        .circle(asteroid.x, asteroid.y, asteroid.radius * 0.96)
        .stroke({ color: ASTEROID_EDGE, alpha: 0.22, width: edgeWidth })
        .circle(
          asteroid.x - asteroid.radius * 0.18,
          asteroid.y - asteroid.radius * 0.2,
          asteroid.radius * 0.5,
        )
        .fill({ color: ASTEROID_HIGHLIGHT, alpha: asteroid.highlightAlpha })
        .circle(
          asteroid.x + asteroid.radius * 0.2,
          asteroid.y - asteroid.radius * 0.12,
          asteroid.radius * 0.15,
        )
        .fill({ color: ASTEROID_CRATER, alpha: 0.86 })
        .circle(
          asteroid.x - asteroid.radius * 0.24,
          asteroid.y + asteroid.radius * 0.18,
          asteroid.radius * 0.1,
        )
        .fill({ color: ASTEROID_CRATER, alpha: 0.76 });
    }

    this.vignetteLayer
      .clear()
      .rect(0, 0, safeWidth, vignetteInset)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.12 })
      .rect(0, safeHeight - vignetteInset, safeWidth, vignetteInset)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.16 })
      .rect(0, 0, vignetteInset, safeHeight)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.1 })
      .rect(safeWidth - vignetteInset, 0, vignetteInset, safeHeight)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.1 });
  }
}
