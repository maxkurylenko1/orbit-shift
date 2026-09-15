import { Container, Graphics } from 'pixi.js';
import type { InputManager } from '../core/InputManager';
import type { Scene } from '../core/SceneManager';
import { Obstacle } from '../entities/Obstacle';
import { Player, type OrbitLane } from '../entities/Player';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SpawnSystem } from '../systems/SpawnSystem';

const ORBIT_COLOR = 0x2bc7d9;
const INNER_RADIUS_RATIO = 0.2;
const OUTER_RADIUS_RATIO = 0.31;
const MAX_OBSTACLES = 8;

export class GameScene implements Scene {
  public readonly view = new Container();

  private readonly orbits = new Graphics();
  private readonly obstacleLayer = new Container();
  private readonly player = new Player();
  private readonly obstacles: Obstacle[] = [];
  private readonly collisionSystem = new CollisionSystem();
  private readonly spawnSystem = new SpawnSystem((lane, angle) => {
    this.spawnObstacle(lane, angle);
  });

  private viewportWidth = 0;
  private viewportHeight = 0;
  private innerRadius = 0;
  private outerRadius = 0;
  private unsubscribeInput: (() => void) | null = null;

  private readonly handleAction = (): void => {
    this.player.switchLane();
  };

  public constructor(private readonly input: InputManager) {
    this.view.addChild(this.orbits, this.obstacleLayer, this.player.view);
  }

  public start(): void {
    this.spawnSystem.reset();
    this.unsubscribeInput = this.input.subscribe(this.handleAction);
  }

  public update(deltaSeconds: number): void {
    if (!this.player.alive) {
      return;
    }

    this.player.update(deltaSeconds);
    this.spawnSystem.update(deltaSeconds, this.player.angle);

    if (this.collisionSystem.hasPlayerCollision(this.player, this.obstacles)) {
      this.player.alive = false;
    }
  }

  public resize(width: number, height: number): void {
    const base = Math.min(width, height);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const innerRadius = base * INNER_RADIUS_RATIO;
    const outerRadius = base * OUTER_RADIUS_RATIO;
    const lineWidth = Math.max(1, base * 0.003);

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

    for (const obstacle of this.obstacles) {
      obstacle.resize(width, height, innerRadius, outerRadius);
    }
  }

  public destroy(): void {
    this.unsubscribeInput?.();
    this.unsubscribeInput = null;
    this.obstacles.length = 0;
    this.view.destroy({ children: true });
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
