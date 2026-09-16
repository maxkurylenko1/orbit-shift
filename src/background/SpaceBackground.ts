import { Container, Graphics, Sprite } from 'pixi.js';
import { getEdgePlateLayout } from './edgePlates';
import { createSpaceField, getBackgroundMetrics } from './spaceField';

const BASE_COLOR = 0x02050d;
const WASH_COLOR = 0x071a31;
const STAR_COLOR = 0xd9f6ff;
const NEBULA_COLOR = 0x0874a5;
const NEBULA_CORE_COLOR = 0x16b7dd;
const GALAXY_COLOR = 0xbdefff;
const GALAXY_CORE_COLOR = 0xffd69a;
const ASTEROID_COLOR = 0x05080f;
const ASTEROID_HIGHLIGHT = 0x1f5a75;
const ASTEROID_CRATER = 0x010309;
const VIGNETTE_COLOR = 0x01030a;
const FIELD_SEED = 0x0b17;
const EDGE_ALPHA = 0.94;

export class SpaceBackground {
  public readonly view = new Container();

  private readonly baseLayer = new Graphics();
  private readonly nebulaLayer = new Graphics();
  private readonly starLayer = new Graphics();
  private readonly galaxyLayer = new Graphics();
  private readonly asteroidLayer = new Graphics();
  private readonly leftEdge = Sprite.from('assets/space-edge-left.webp');
  private readonly rightEdge = Sprite.from('assets/space-edge-right.webp');
  private readonly vignetteLayer = new Graphics();

  public constructor() {
    this.leftEdge.alpha = EDGE_ALPHA;
    this.rightEdge.alpha = EDGE_ALPHA;

    this.view.addChild(
      this.baseLayer,
      this.nebulaLayer,
      this.starLayer,
      this.galaxyLayer,
      this.asteroidLayer,
      this.leftEdge,
      this.rightEdge,
      this.vignetteLayer,
    );
  }

  public resize(width: number, height: number): void {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const layout = createSpaceField(safeWidth, safeHeight, FIELD_SEED);
    const { base, vignetteInset } = getBackgroundMetrics(safeWidth, safeHeight);
    const edgeLayout = getEdgePlateLayout(safeWidth, safeHeight);

    this.baseLayer
      .clear()
      .rect(0, 0, safeWidth, safeHeight)
      .fill({ color: BASE_COLOR })
      .rect(0, 0, safeWidth, safeHeight)
      .fill({ color: WASH_COLOR, alpha: 0.38 });

    this.nebulaLayer.clear();

    for (const patch of layout.nebulae) {
      for (let layer = 5; layer >= 1; layer -= 1) {
        const progress = layer / 5;
        const offset = patch.radius * (1 - progress) * 0.12;
        this.nebulaLayer
          .circle(
            patch.x + offset,
            patch.y - offset * 0.55,
            patch.radius * progress,
          )
          .fill({
            color: layer <= 2 ? NEBULA_CORE_COLOR : NEBULA_COLOR,
            alpha: patch.alpha * (0.26 + (1 - progress) * 0.74),
          });
      }
    }

    this.starLayer.clear();

    for (const star of layout.stars) {
      this.starLayer
        .circle(star.x, star.y, star.radius)
        .fill({ color: STAR_COLOR, alpha: star.alpha });

      if (star.radius > 1.45) {
        this.starLayer
          .circle(star.x, star.y, star.radius * 3.2)
          .fill({ color: STAR_COLOR, alpha: star.alpha * 0.055 });
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
    for (let layer = 4; layer >= 1; layer -= 1) {
      const progress = layer / 4;
      this.galaxyLayer
        .circle(galaxyCenterX, galaxyCenterY, base * 0.045 * progress)
        .fill({
          color: GALAXY_CORE_COLOR,
          alpha: 0.012 + (1 - progress) * 0.035,
        });
    }

    this.asteroidLayer.clear();

    for (const asteroid of layout.asteroids) {
      this.asteroidLayer
        .circle(asteroid.x, asteroid.y, asteroid.radius)
        .fill({ color: ASTEROID_COLOR, alpha: 0.98 })
        .circle(
          asteroid.x - asteroid.radius * 0.16,
          asteroid.y - asteroid.radius * 0.18,
          asteroid.radius * 0.78,
        )
        .fill({
          color: ASTEROID_HIGHLIGHT,
          alpha: asteroid.highlightAlpha,
        })
        .circle(
          asteroid.x + asteroid.radius * 0.2,
          asteroid.y - asteroid.radius * 0.12,
          asteroid.radius * 0.17,
        )
        .fill({ color: ASTEROID_CRATER, alpha: 0.72 })
        .circle(
          asteroid.x - asteroid.radius * 0.24,
          asteroid.y + asteroid.radius * 0.18,
          asteroid.radius * 0.11,
        )
        .fill({ color: ASTEROID_CRATER, alpha: 0.62 });
    }

    this.leftEdge.position.set(edgeLayout.leftX, 0);
    this.leftEdge.width = edgeLayout.width;
    this.leftEdge.height = edgeLayout.height;

    this.rightEdge.position.set(edgeLayout.rightX, 0);
    this.rightEdge.width = edgeLayout.width;
    this.rightEdge.height = edgeLayout.height;

    this.vignetteLayer
      .clear()
      .rect(0, 0, safeWidth, vignetteInset)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.16 })
      .rect(0, safeHeight - vignetteInset, safeWidth, vignetteInset)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.2 })
      .rect(0, 0, vignetteInset, safeHeight)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.14 })
      .rect(safeWidth - vignetteInset, 0, vignetteInset, safeHeight)
      .fill({ color: VIGNETTE_COLOR, alpha: 0.14 });
  }
}
