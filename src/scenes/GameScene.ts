import { Container, Graphics, Text } from 'pixi.js';
import { SpaceBackground } from '../background/SpaceBackground';
import { calculateVisualSizes } from '../config/visualSizing';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { Collectible } from '../entities/Collectible';
import { Obstacle } from '../entities/Obstacle';
import { Player, type OrbitLane } from '../entities/Player';
import { getHudVisualMetrics, snapHudCoordinate } from '../presentation/hudVisual';
import { getOrbitVisuals } from '../presentation/orbitVisual';
import { ReactorVisual } from '../presentation/ReactorVisual';
import { BestScoreStore } from '../systems/BestScoreStore';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { CountdownSystem } from '../systems/CountdownSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import {
  advanceObstacleTravelBudget,
  createObstacleTravelBudget,
} from '../systems/obstacleLifetime';
import { ScoreSystem } from '../systems/ScoreSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { GameOverOverlay } from '../ui/GameOverOverlay';

const ORBIT_COLOR = 0x2bc7d9;
const ORBIT_CORE_COLOR = 0x63efff;
const HUD_COLOR = 0xe8f7ff;
const MUTED_HUD_COLOR = 0x86a3b8;
const HUD_FONT_FAMILY = ['Inter', 'Segoe UI', 'Arial', 'sans-serif'];
const INNER_RADIUS_RATIO = 0.2;
const OUTER_RADIUS_RATIO = 0.31;
const MAX_OBSTACLES = 8;
const HUD_PADDING_RATIO = 0.025;
const MIN_HUD_PADDING = 16;
const COLLECTIBLE_SPAWN_INTERVAL_SECONDS = 6;
const COLLECTIBLE_LEAD_ANGLE = 1.35;
const COLLECTIBLE_SCORE_BONUS = 50;
const TAU = Math.PI * 2;

export class GameScene implements Scene {
  public readonly view = new Container();

  private readonly spaceBackground = new SpaceBackground();
  private readonly reactorVisual = new ReactorVisual();
  private readonly orbits = new Graphics();
  private readonly obstacleLayer = new Container();
  private readonly collectibleLayer = new Container();
  private readonly player = new Player();
  private readonly obstacles: Obstacle[] = [];
  private readonly collectibles: Collectible[] = [];
  private readonly bestScoreStore = new BestScoreStore(window.localStorage);
  private readonly collisionSystem = new CollisionSystem();
  private readonly comboSystem = new ComboSystem();
  private readonly countdownSystem = new CountdownSystem();
  private readonly difficultySystem = new DifficultySystem();
  private readonly scoreSystem = new ScoreSystem();
  private readonly spawnSystem = new SpawnSystem((lane, angle) => {
    this.spawnObstacle(lane, angle);
  });
  private readonly scoreText = new Text({
    text: 'SCORE 0',
    roundPixels: true,
    style: {
      fill: HUD_COLOR,
      fontFamily: HUD_FONT_FAMILY,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
  private readonly bestText = new Text({
    text: 'BEST 0',
    roundPixels: true,
    style: {
      fill: MUTED_HUD_COLOR,
      fontFamily: HUD_FONT_FAMILY,
      fontSize: 15,
      fontWeight: '500',
      letterSpacing: 0.45,
    },
  });
  private readonly comboText = new Text({
    text: 'COMBO x2',
    roundPixels: true,
    style: {
      fill: HUD_COLOR,
      fontFamily: HUD_FONT_FAMILY,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
  private readonly timeText = new Text({
    text: '0.0s',
    roundPixels: true,
    style: {
      fill: HUD_COLOR,
      fontFamily: HUD_FONT_FAMILY,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
  private readonly countdownText = new Text({
    text: '3',
    style: { fill: HUD_COLOR, fontFamily: 'Arial', fontSize: 64, fontWeight: '700' },
  });
  private readonly gameOverOverlay = new GameOverOverlay();

  private viewportWidth = 0;
  private viewportHeight = 0;
  private innerRadius = 0;
  private outerRadius = 0;
  private collectibleSpawnElapsed = 0;
  private nextCollectibleLane: OrbitLane = 'outer';
  private bestScore = 0;
  private unsubscribeInput: (() => void) | null = null;

  private readonly handleAction = (): void => {
    if (this.player.alive) {
      if (!this.countdownSystem.finished) {
        return;
      }

      this.player.switchLane();
      return;
    }

    this.restartRun();
  };

  public constructor(private readonly input: InputManager) {
    this.comboText.anchor.set(0.5, 0);
    this.timeText.anchor.set(1, 0);
    this.countdownText.anchor.set(0.5);
    this.view.addChild(
      this.spaceBackground.view,
      this.reactorVisual.view,
      this.orbits,
      this.player.trailView,
      this.obstacleLayer,
      this.collectibleLayer,
      this.player.view,
      this.scoreText,
      this.bestText,
      this.comboText,
      this.timeText,
      this.countdownText,
      this.gameOverOverlay.view,
    );
  }

  public start(): void {
    this.bestScore = this.bestScoreStore.load();
    this.restartRun();
    this.unsubscribeInput = this.input.subscribe(this.handleAction);
  }

  public update(deltaSeconds: number): void {
    this.reactorVisual.update(deltaSeconds);

    if (!this.player.alive) {
      return;
    }

    if (!this.countdownSystem.finished) {
      this.countdownSystem.update(deltaSeconds);
      this.countdownText.text = this.countdownSystem.label;
      this.countdownText.visible = !this.countdownSystem.finished;
      return;
    }

    this.scoreSystem.update(deltaSeconds);
    this.difficultySystem.update(this.scoreSystem.elapsedSeconds);
    this.player.angularSpeed = this.difficultySystem.playerAngularSpeed;

    this.player.update(deltaSeconds);
    this.spawnSystem.update(
      deltaSeconds,
      this.player.angle,
      this.difficultySystem.spawnIntervalSeconds,
      this.player.angularSpeed,
    );

    if (this.collisionSystem.hasPlayerCollision(this.player, this.obstacles)) {
      this.player.alive = false;
      this.bestScore = this.bestScoreStore.submit(this.scoreSystem.score);
      this.updateHud();
      this.gameOverOverlay.show(
        this.scoreSystem.score,
        this.bestScore,
        this.scoreSystem.elapsedSeconds,
      );
      return;
    }

    this.updateObstacleLifetimes(deltaSeconds);
    this.collectTouchedShard();
    this.updateCollectibleSpawn(deltaSeconds);
    this.updateHud();
  }

  public resize(width: number, height: number): void {
    const base = Math.min(width, height);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const innerRadius = base * INNER_RADIUS_RATIO;
    const outerRadius = base * OUTER_RADIUS_RATIO;
    const orbitVisuals = getOrbitVisuals(base);
    const hudVisuals = getHudVisualMetrics(base, window.devicePixelRatio || 1);
    const hudPadding = snapHudCoordinate(
      Math.max(MIN_HUD_PADDING, base * HUD_PADDING_RATIO),
    );
    const { reactor: reactorSize } = calculateVisualSizes(base);

    this.viewportWidth = width;
    this.viewportHeight = height;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;

    this.spaceBackground.resize(width, height);
    this.reactorVisual.view.position.set(centerX, centerY);
    this.reactorVisual.resize(reactorSize);

    this.orbits
      .clear()
      .circle(centerX, centerY, innerRadius)
      .stroke({
        color: ORBIT_COLOR,
        alpha: 0.12,
        width: orbitVisuals.gameplayGlowWidth,
      })
      .circle(centerX, centerY, innerRadius)
      .stroke({
        color: ORBIT_CORE_COLOR,
        alpha: orbitVisuals.innerAlpha,
        width: orbitVisuals.gameplayCoreWidth,
      })
      .circle(centerX, centerY, outerRadius)
      .stroke({
        color: ORBIT_COLOR,
        alpha: 0.1,
        width: orbitVisuals.gameplayGlowWidth,
      })
      .circle(centerX, centerY, outerRadius)
      .stroke({
        color: ORBIT_CORE_COLOR,
        alpha: orbitVisuals.outerAlpha,
        width: orbitVisuals.gameplayCoreWidth,
      })
      .circle(centerX, centerY, orbitVisuals.decorativeRadius)
      .stroke({
        color: ORBIT_COLOR,
        alpha: orbitVisuals.decorativeAlpha,
        width: orbitVisuals.decorativeWidth,
      });

    const markerRadius = Math.max(1.3, base * 0.0022);
    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      this.orbits
        .circle(
          centerX + Math.cos(angle) * orbitVisuals.decorativeRadius,
          centerY + Math.sin(angle) * orbitVisuals.decorativeRadius,
          markerRadius,
        )
        .fill({ color: ORBIT_CORE_COLOR, alpha: 0.22 });
    }

    this.player.resize(width, height, innerRadius, outerRadius);

    this.scoreText.resolution = hudVisuals.resolution;
    this.bestText.resolution = hudVisuals.resolution;
    this.comboText.resolution = hudVisuals.resolution;
    this.timeText.resolution = hudVisuals.resolution;

    this.scoreText.style.fontSize = hudVisuals.primaryFontSize;
    this.scoreText.style.letterSpacing = hudVisuals.letterSpacing;
    this.bestText.style.fontSize = hudVisuals.secondaryFontSize;
    this.bestText.style.letterSpacing = hudVisuals.letterSpacing * 0.85;
    this.comboText.style.fontSize = hudVisuals.primaryFontSize;
    this.comboText.style.letterSpacing = hudVisuals.letterSpacing;
    this.timeText.style.fontSize = hudVisuals.primaryFontSize;
    this.timeText.style.letterSpacing = hudVisuals.letterSpacing;

    this.scoreText.position.set(hudPadding, hudPadding);
    this.bestText.position.set(
      hudPadding,
      snapHudCoordinate(hudPadding + hudVisuals.lineGap),
    );
    this.comboText.position.set(snapHudCoordinate(width * 0.5), hudPadding);
    this.timeText.position.set(snapHudCoordinate(width - hudPadding), hudPadding);
    this.countdownText.style.fontSize = Math.max(48, base * 0.1);
    this.countdownText.position.set(centerX, centerY);
    this.gameOverOverlay.resize(width, height);

    for (const obstacle of this.obstacles) {
      obstacle.resize(width, height, innerRadius, outerRadius);
    }

    for (const collectible of this.collectibles) {
      collectible.resize(width, height, innerRadius, outerRadius);
    }
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.clearObstacles();
    this.clearCollectibles();
    this.view.destroy({ children: true });
  }

  private restartRun(): void {
    this.clearObstacles();
    this.clearCollectibles();
    this.spawnSystem.reset();
    this.scoreSystem.reset();
    this.comboSystem.resetChain();
    this.countdownSystem.reset();
    this.difficultySystem.reset();
    this.collectibleSpawnElapsed = 0;
    this.nextCollectibleLane = 'outer';
    this.player.reset();
    this.player.angularSpeed = this.difficultySystem.playerAngularSpeed;
    this.countdownText.text = this.countdownSystem.label;
    this.countdownText.visible = true;
    this.gameOverOverlay.hide();
    this.updateHud();
  }

  private updateHud(): void {
    this.scoreText.text = `SCORE ${this.scoreSystem.score}`;
    this.bestText.text = `BEST ${Math.max(this.bestScore, this.scoreSystem.score)}`;
    this.comboText.visible = this.comboSystem.streak > 1;
    this.comboText.text = `COMBO x${this.comboSystem.multiplier}`;
    this.timeText.text = `${this.scoreSystem.elapsedSeconds.toFixed(1)}s`;
  }

  private updateCollectibleSpawn(deltaSeconds: number): void {
    this.collectibleSpawnElapsed += deltaSeconds;

    if (this.collectibleSpawnElapsed < COLLECTIBLE_SPAWN_INTERVAL_SECONDS) {
      return;
    }

    this.collectibleSpawnElapsed %= COLLECTIBLE_SPAWN_INTERVAL_SECONDS;

    if (this.collectibles.length > 0) {
      this.comboSystem.resetChain();
    }

    this.clearCollectibles();

    const angle = (this.player.angle + COLLECTIBLE_LEAD_ANGLE) % TAU;
    const collectible = new Collectible(this.nextCollectibleLane, angle);
    collectible.resize(
      this.viewportWidth,
      this.viewportHeight,
      this.innerRadius,
      this.outerRadius,
    );

    this.collectibles.push(collectible);
    this.collectibleLayer.addChild(collectible.view);
    this.nextCollectibleLane = this.nextCollectibleLane === 'outer' ? 'inner' : 'outer';
  }

  private collectTouchedShard(): void {
    const index = this.collisionSystem.findCollectibleIndex(
      this.player,
      this.collectibles,
    );

    if (index < 0) {
      return;
    }

    const [collectible] = this.collectibles.splice(index, 1);
    this.collectibleLayer.removeChild(collectible.view);
    collectible.destroy();

    this.comboSystem.recordCollect();
    this.scoreSystem.addPoints(
      COLLECTIBLE_SCORE_BONUS * this.comboSystem.multiplier,
    );
  }

  private updateObstacleLifetimes(deltaSeconds: number): void {
    for (let index = this.obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = this.obstacles[index];
      obstacle.remainingTravelRadians = advanceObstacleTravelBudget(
        obstacle.remainingTravelRadians,
        this.player.angularSpeed,
        deltaSeconds,
      );

      if (obstacle.remainingTravelRadians > 0) {
        continue;
      }

      this.obstacles.splice(index, 1);
      this.obstacleLayer.removeChild(obstacle.view);
      obstacle.destroy();
    }
  }

  private clearObstacles(): void {
    for (const obstacle of this.obstacles) {
      this.obstacleLayer.removeChild(obstacle.view);
      obstacle.destroy();
    }

    this.obstacles.length = 0;
  }

  private clearCollectibles(): void {
    for (const collectible of this.collectibles) {
      this.collectibleLayer.removeChild(collectible.view);
      collectible.destroy();
    }

    this.collectibles.length = 0;
  }

  private spawnObstacle(lane: OrbitLane, angle: number): void {
    if (this.obstacles.length >= MAX_OBSTACLES) {
      const oldest = this.obstacles.shift();

      if (oldest) {
        this.obstacleLayer.removeChild(oldest.view);
        oldest.destroy();
      }
    }

    const obstacle = new Obstacle(
      lane,
      angle,
      createObstacleTravelBudget(this.player.angle, angle),
    );
    obstacle.resize(
      this.viewportWidth,
      this.viewportHeight,
      this.innerRadius,
      this.outerRadius,
    );

    this.obstacles.push(obstacle);
    this.obstacleLayer.addChild(obstacle.view);
  }
}
