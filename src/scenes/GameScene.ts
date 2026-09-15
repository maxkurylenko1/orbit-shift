import { Container, Graphics, Text } from 'pixi.js';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { Obstacle } from '../entities/Obstacle';
import { Player, type OrbitLane } from '../entities/Player';
import { CollisionSystem } from '../systems/CollisionSystem';
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

export class GameScene implements Scene {
  public readonly view = new Container();

  private readonly orbits = new Graphics();
  private readonly obstacleLayer = new Container();
  private readonly player = new Player();
  private readonly obstacles: Obstacle[] = [];
  private readonly collisionSystem = new CollisionSystem();
  private readonly scoreSystem = new ScoreSystem();
  private readonly spawnSystem = new SpawnSystem((lane, angle) => {
    this.spawnObstacle(lane, angle);
  });
  private readonly scoreText = new Text({
    text: 'SCORE 0',
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
  private unsubscribeInput: (() => void) | null = null;

  private readonly handleAction = (): void => {
    if (this.player.alive) {
      this.player.switchLane();
      return;
    }

    this.restartRun();
  };

  public constructor(private readonly input: InputManager) {
    this.timeText.anchor.set(1, 0);
    this.view.addChild(
      this.orbits,
      this.obstacleLayer,
      this.player.view,
      this.scoreText,
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

    this.player.update(deltaSeconds);
    this.spawnSystem.update(deltaSeconds, this.player.angle);
    this.scoreSystem.update(deltaSeconds);
    this.updateHud();

    if (this.collisionSystem.hasPlayerCollision(this.player, this.obstacles)) {
      this.player.alive = false;
      this.gameOverOverlay.show(
        this.scoreSystem.score,
        this.scoreSystem.elapsedSeconds,
      );
    }
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
    this.timeText.position.set(width - hudPadding, hudPadding);
    this.gameOverOverlay.resize(width, height);

    for (const obstacle of this.obstacles) {
      obstacle.resize(width, height, innerRadius, outerRadius);
    }
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.clearObstacles();
    this.view.destroy({ children: true });
  }

  private restartRun(): void {
    this.clearObstacles();
    this.spawnSystem.reset();
    this.scoreSystem.reset();
    this.player.reset();
    this.gameOverOverlay.hide();
    this.updateHud();
  }

  private updateHud(): void {
    this.scoreText.text = `SCORE ${this.scoreSystem.score}`;
    this.timeText.text = `${this.scoreSystem.elapsedSeconds.toFixed(1)}s`;
  }

  private clearObstacles(): void {
    for (const obstacle of this.obstacles) {
      this.obstacleLayer.removeChild(obstacle.view);
      obstacle.destroy();
    }

    this.obstacles.length = 0;
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
