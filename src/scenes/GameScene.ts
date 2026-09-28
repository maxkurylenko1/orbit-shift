import { Container, Graphics, Text } from 'pixi.js';
import type { GameAudio } from '../audio/GameAudio';
import { SpaceBackground } from '../background/SpaceBackground';
import {
  getHudLayoutMetrics,
  getResponsiveViewportMetrics,
  readSafeAreaInsets,
} from '../config/responsiveLayout';
import { calculateVisualSizes } from '../config/visualSizing';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { Collectible } from '../entities/Collectible';
import { Obstacle } from '../entities/Obstacle';
import { Player, type OrbitLane } from '../entities/Player';
import { GameFeedbackView } from '../presentation/GameFeedbackView';
import { getHudVisualMetrics, snapHudCoordinate } from '../presentation/hudVisual';
import { getOrbitVisuals } from '../presentation/orbitVisual';
import { ReactorAssetView } from '../presentation/ReactorAssetView';
import { BestScoreStore } from '../systems/BestScoreStore';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { CountdownSystem } from '../systems/CountdownSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import {
  findSafeCollectiblePlacement,
  resolveSafeObstacleLane,
} from '../systems/gameplaySafety';
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
const MAX_OBSTACLES = 8;
const COLLECTIBLE_SPAWN_INTERVAL_SECONDS = 6;
const COLLECTIBLE_LEAD_ANGLE = 1.35;
const COLLECTIBLE_SCORE_BONUS = 50;
const GAME_OVER_REVEAL_DELAY_SECONDS = 0.22;
const COUNTDOWN_BACKDROP_COLOR = 0x020712;
const COUNTDOWN_ACCENT_COLOR = 0x42e8ff;
const TAU = Math.PI * 2;

export class GameScene implements Scene {
  public readonly view = new Container();

  private readonly spaceBackground = new SpaceBackground();
  private readonly gameplayLayer = new Container();
  private readonly feedbackView = new GameFeedbackView();
  private readonly reactorVisual = new ReactorAssetView();
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
  private readonly countdownBackdrop = new Graphics();
  private readonly countdownText = new Text({
    text: '3',
    style: {
      fill: HUD_COLOR,
      fontFamily: 'Arial',
      fontSize: 64,
      fontWeight: '700',
    },
  });
  private readonly gameOverOverlay = new GameOverOverlay();

  private viewportWidth = 0;
  private viewportHeight = 0;
  private innerRadius = 0;
  private outerRadius = 0;
  private visualBase = 1;
  private collectibleSpawnElapsed = 0;
  private nextCollectibleLane: OrbitLane = 'outer';
  private bestScore = 0;
  private previousBestScore = 0;
  private runWasNewBest = false;
  private gameOverDelayRemaining = 0;
  private lastCountdownLabel = '';
  private lastSurgeIndex = -1;
  private unsubscribeInput: (() => void) | null = null;

  private readonly handleAction = (): void => {
    this.audio.unlock();

    if (this.player.alive) {
      if (!this.countdownSystem.finished) {
        return;
      }

      if (this.player.switchLane()) {
        this.reactorVisual.pulse(0.24);
        this.audio.playSwitch();
      }
      return;
    }

    if (this.gameOverDelayRemaining > 0) {
      return;
    }

    this.restartRun();
  };

  public constructor(
    private readonly input: InputManager,
    private readonly audio: GameAudio,
  ) {
    this.comboText.anchor.set(0.5, 0);
    this.timeText.anchor.set(1, 0);
    this.countdownText.anchor.set(0.5);
    this.gameplayLayer.addChild(
      this.reactorVisual.view,
      this.orbits,
      this.player.trailView,
      this.obstacleLayer,
      this.collectibleLayer,
      this.player.view,
    );
    this.view.addChild(
      this.spaceBackground.view,
      this.gameplayLayer,
      this.feedbackView.view,
      this.scoreText,
      this.bestText,
      this.comboText,
      this.timeText,
      this.countdownBackdrop,
      this.countdownText,
      this.gameOverOverlay.view,
    );
  }

  public start(): void {
    this.bestScore = this.bestScoreStore.load();
    this.audio.startAmbient();
    this.restartRun();
    this.unsubscribeInput = this.input.subscribe(this.handleAction);
  }

  public update(deltaSeconds: number): void {
    this.feedbackView.update(deltaSeconds);
    const shake = this.feedbackView.getShakeOffset();
    this.gameplayLayer.position.set(shake.x, shake.y);
    this.reactorVisual.update(deltaSeconds);

    if (!this.player.alive) {
      if (this.gameOverDelayRemaining > 0) {
        this.gameOverDelayRemaining = Math.max(
          0,
          this.gameOverDelayRemaining - Math.max(0, deltaSeconds),
        );

        if (this.gameOverDelayRemaining === 0) {
          this.gameOverOverlay.show(
            this.scoreSystem.score,
            this.bestScore,
            this.scoreSystem.elapsedSeconds,
            this.runWasNewBest,
            this.previousBestScore,
          );
        }
      }

      return;
    }

    if (!this.countdownSystem.finished) {
      this.countdownSystem.update(deltaSeconds);

      if (this.countdownSystem.label !== this.lastCountdownLabel) {
        this.lastCountdownLabel = this.countdownSystem.label;
        this.audio.playCountdown(this.lastCountdownLabel);
      }

      this.countdownText.text = this.countdownSystem.label;
      const countdownVisible = !this.countdownSystem.finished;
      this.countdownText.visible = countdownVisible;
      this.countdownBackdrop.visible = countdownVisible;
      return;
    }

    this.scoreSystem.update(deltaSeconds);
    this.difficultySystem.update(this.scoreSystem.elapsedSeconds);
    this.player.angularSpeed = this.difficultySystem.playerAngularSpeed;

    this.audio.setAmbientIntensity(
      this.difficultySystem.intensity,
      this.difficultySystem.surgeStrength,
    );

    if (
      this.difficultySystem.surgeIndex >= 0 &&
      this.difficultySystem.surgeIndex !== this.lastSurgeIndex
    ) {
      this.lastSurgeIndex = this.difficultySystem.surgeIndex;
      this.audio.playSurge(this.difficultySystem.patternTier);
      this.reactorVisual.pulse(0.5);
    }

    this.player.update(deltaSeconds);
    this.spawnSystem.update(
      deltaSeconds,
      this.player.angle,
      this.difficultySystem.spawnIntervalSeconds,
      this.player.angularSpeed,
      this.difficultySystem.patternTier,
    );

    if (this.collisionSystem.hasPlayerCollision(this.player, this.obstacles)) {
      this.player.alive = false;
      this.previousBestScore = this.bestScore;
      this.runWasNewBest = this.scoreSystem.score > this.bestScore;
      this.bestScore = this.bestScoreStore.submit(this.scoreSystem.score);
      this.gameOverDelayRemaining = GAME_OVER_REVEAL_DELAY_SECONDS;

      this.feedbackView.triggerCollision(
        this.player.view.x,
        this.player.view.y,
        this.visualBase,
      );
      this.reactorVisual.pulse(1);
      this.audio.playCollision();
      this.updateHud();
      return;
    }

    this.updateObstacleLifetimes(deltaSeconds);
    this.collectTouchedShard();
    this.updateCollectibleSpawn(deltaSeconds);
    this.updateHud();
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
    const orbitVisuals = getOrbitVisuals(base);
    const innerRadius = orbitVisuals.innerRadius;
    const outerRadius = orbitVisuals.outerRadius;
    const hudVisuals = getHudVisualMetrics(
      base,
      window.devicePixelRatio || 1,
    );
    const hudLayout = getHudLayoutMetrics(viewport, hudVisuals.lineGap);
    const { reactor: reactorSize } = calculateVisualSizes(base);

    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.visualBase = base;

    this.spaceBackground.resize(width, height);
    this.feedbackView.resize(width, height);
    this.gameplayLayer.position.set(0);
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

    this.scoreText.position.set(
      snapHudCoordinate(hudLayout.scoreX),
      snapHudCoordinate(hudLayout.scoreY),
    );
    this.bestText.position.set(
      snapHudCoordinate(hudLayout.bestX),
      snapHudCoordinate(hudLayout.bestY),
    );
    this.comboText.position.set(
      snapHudCoordinate(hudLayout.comboX),
      snapHudCoordinate(hudLayout.comboY),
    );
    this.timeText.position.set(
      snapHudCoordinate(hudLayout.timeX),
      snapHudCoordinate(hudLayout.timeY),
    );
    const countdownFontSize = Math.min(
      96,
      Math.max(48, base * 0.1),
    );
    const countdownRadius = Math.max(
      42,
      countdownFontSize * 0.78,
    );
    const countdownRingWidth = Math.max(1.5, base * 0.0022);

    this.countdownBackdrop
      .clear()
      .circle(centerX, centerY, countdownRadius * 1.16)
      .fill({
        color: COUNTDOWN_BACKDROP_COLOR,
        alpha: 0.26,
      })
      .circle(centerX, centerY, countdownRadius)
      .fill({
        color: COUNTDOWN_BACKDROP_COLOR,
        alpha: 0.86,
      })
      .stroke({
        color: COUNTDOWN_ACCENT_COLOR,
        alpha: 0.62,
        width: countdownRingWidth,
      })
      .circle(centerX, centerY, countdownRadius * 0.78)
      .stroke({
        color: COUNTDOWN_ACCENT_COLOR,
        alpha: 0.12,
        width: Math.max(1, countdownRingWidth * 0.6),
      });

    this.countdownText.style.fontSize = countdownFontSize;
    this.countdownText.position.set(centerX, centerY);
    this.gameOverOverlay.resize(viewport.width, viewport.height);

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
    this.feedbackView.clear();
    this.audio.stopAmbient();
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
    this.previousBestScore = this.bestScore;
    this.runWasNewBest = false;
    this.lastSurgeIndex = -1;
    this.audio.setAmbientIntensity(0, 0);
    this.lastCountdownLabel = this.countdownSystem.label;
    this.audio.playCountdown(this.lastCountdownLabel);
    this.collectibleSpawnElapsed = 0;
    this.nextCollectibleLane = 'outer';
    this.gameOverDelayRemaining = 0;
    this.feedbackView.clear();
    this.reactorVisual.resetFeedback();
    this.gameplayLayer.position.set(0);
    this.player.reset();
    this.player.angularSpeed = this.difficultySystem.playerAngularSpeed;
    this.countdownText.text = this.countdownSystem.label;
    this.countdownText.visible = true;
    this.countdownBackdrop.visible = true;
    this.gameOverOverlay.hide();
    this.updateHud();
  }

  private updateHud(): void {
    this.scoreText.text = `SCORE ${this.scoreSystem.score}`;

    if (this.bestScore > 0 && this.scoreSystem.score > this.bestScore) {
      this.bestText.text = `NEW BEST +${this.scoreSystem.score - this.bestScore}`;
    } else {
      this.bestText.text = `BEST ${this.bestScore}`;
    }

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

    const baseAngle = (this.player.angle + COLLECTIBLE_LEAD_ANGLE) % TAU;
    const placement = findSafeCollectiblePlacement(
      this.nextCollectibleLane,
      baseAngle,
      this.obstacles,
    );

    if (!placement) {
      this.nextCollectibleLane =
        this.nextCollectibleLane === 'outer' ? 'inner' : 'outer';
      return;
    }

    const collectible = new Collectible(placement.lane, placement.angle);
    collectible.resize(
      this.viewportWidth,
      this.viewportHeight,
      this.innerRadius,
      this.outerRadius,
    );

    this.collectibles.push(collectible);
    this.collectibleLayer.addChild(collectible.view);
    this.nextCollectibleLane =
      placement.lane === 'outer' ? 'inner' : 'outer';
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
    const pickupX = collectible.view.x;
    const pickupY = collectible.view.y;
    this.collectibleLayer.removeChild(collectible.view);
    collectible.destroy();

    this.feedbackView.triggerShardPickup(
      pickupX,
      pickupY,
      this.visualBase,
    );
    this.reactorVisual.pulse(0.65);
    this.comboSystem.recordCollect();
    this.audio.playPickup(this.comboSystem.multiplier);
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
    const safeLane = resolveSafeObstacleLane(
      lane,
      angle,
      this.obstacles,
      this.collectibles,
    );

    if (!safeLane) {
      return;
    }

    if (this.obstacles.length >= MAX_OBSTACLES) {
      const oldest = this.obstacles.shift();

      if (oldest) {
        this.obstacleLayer.removeChild(oldest.view);
        oldest.destroy();
      }
    }

    const obstacle = new Obstacle(
      safeLane,
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
