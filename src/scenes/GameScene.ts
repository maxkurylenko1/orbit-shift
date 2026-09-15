import { Container, Graphics, Text } from 'pixi.js';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { Collectible } from '../entities/Collectible';
import { Obstacle } from '../entities/Obstacle';
import { Player, type OrbitLane } from '../entities/Player';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { GameOverOverlay } from '../ui/GameOverOverlay';

const ORBIT_COLOR = 0x2bc7d9;
const HUD_COLOR = 0xe8f7ff;
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

  private readonly orbits = new Graphics();
  private readonly obstacleLayer = new Container();
  private readonly collectibleLayer = new Container();
  private readonly player = new Player();
  private readonly obstacles: Obstacle[] = [];
  private readonly collectibles: Collectible[] = [];
  private readonly collisionSystem = new CollisionSystem();
  private readonly comboSystem = new ComboSystem();
  private readonly difficultySystem = new DifficultySystem();
  private readonly scoreSystem = new ScoreSystem();
  private readonly spawnSystem = new SpawnSystem((lane, angle) => {
    this.spawnObstacle(lane, angle);
  });
  private readonly scoreText = new Text({
    text: 'SCORE 0',
    style: { fill: HUD_COLOR, fontFamily: 'Arial', fontSize: 18, fontWeight: '600' },
  });
  private readonly comboText = new Text({
    text: 'COMBO x2',
    style: { fill: HUD_COLOR, fontFamily: 'Arial', fontSize: 18, fontWeight: '600' },
  });
  private readonly timeText = new Text({
    text: '0.0s',
    style: { fill: HUD_COLOR, fontFamily: 'Arial', fontSize: 18, fontWeight: '600' },
  });
  private readonly gameOverOverlay = new GameOverOverlay();

  private viewportWidth = 0;
  private viewportHeight = 0;
  private innerRadius = 0;
  private outerRadius = 0;
  private collectibleSpawnElapsed = 0;
  private nextCollectibleLane: OrbitLane = 'outer';
  private unsubscribeInput: (() => void) | null = null;

  private readonly handleAction = (): void => {
    if (this.player.alive) {
      this.player.switchLane();
      return;
    }

    this.restartRun();
  };

  public constructor(private readonly input: InputManager) {
    this.comboText.anchor.set(0.5, 0);
    this.timeText.anchor.set(1, 0);
    this.view.addChild(
      this.orbits,
      this.obstacleLayer,
      this.collectibleLayer,
      this.player.view,
      this.scoreText,
      this.comboText,
      this.timeText,
      this.gameOverOverlay.view,
    );
  }

  public start(): void {
    this.restartRun();
    this.unsubscribeInput = this.input.subscribe(this.handleAction);
  }

  public update(deltaSeconds: number): void {
    if (!this.player.alive) {
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
      this.updateHud();
      this.gameOverOverlay.show(
        this.scoreSystem.score,
        this.scoreSystem.elapsedSeconds,
      );
      return;
    }

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
    const lineWidth = Math.max(1, base * 0.003);
    const hudPadding = Math.max(MIN_HUD_PADDING, base * HUD_PADDING_RATIO);

    this.viewportWidth = width;
    this.viewportHeight = height;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;

    this.orbits
      .clear()
      .circle(centerX, centerY, innerRadius)
      .stroke({ color: ORBIT_COLOR, alpha: 0.32, width: lineWidth })
      .circle(centerX, centerY, outerRadius)
      .stroke({ color: ORBIT_COLOR, alpha: 0.2, width: lineWidth });

    this.player.resize(width, height, innerRadius, outerRadius);
    this.scoreText.position.set(hudPadding, hudPadding);
    this.comboText.position.set(width * 0.5, hudPadding);
    this.timeText.position.set(width - hudPadding, hudPadding);
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
    this.difficultySystem.reset();
    this.collectibleSpawnElapsed = 0;
    this.nextCollectibleLane = 'outer';
    this.player.reset();
    this.player.angularSpeed = this.difficultySystem.playerAngularSpeed;
    this.gameOverOverlay.hide();
    this.updateHud();
  }

  private updateHud(): void {
    this.scoreText.text = `SCORE ${this.scoreSystem.score}`;
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

    const obstacle = new Obstacle(lane, angle);
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
