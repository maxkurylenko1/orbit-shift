import type { Obstacle } from '../entities/Obstacle';
import type { Player } from '../entities/Player';

const COLLISION_ANGLE_THRESHOLD = 0.12;
const TAU = Math.PI * 2;
const PI = Math.PI;

export class CollisionSystem {
  public hasPlayerCollision(player: Player, obstacles: readonly Obstacle[]): boolean {
    if (!player.alive) {
      return false;
    }

    for (let index = 0; index < obstacles.length; index += 1) {
      const obstacle = obstacles[index];

      if (
        obstacle.lane === player.lane &&
        this.angularDistance(player.angle, obstacle.angle) < COLLISION_ANGLE_THRESHOLD
      ) {
        return true;
      }
    }

    return false;
  }

  private angularDistance(a: number, b: number): number {
    let delta = Math.abs(a - b) % TAU;

    if (delta > PI) {
      delta = TAU - delta;
    }

    return delta;
  }
}
