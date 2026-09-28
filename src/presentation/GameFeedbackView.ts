import { Container, Graphics } from 'pixi.js';
import {
  getImpactShake,
  getTransientAlpha,
  type ShakeOffset,
} from './gameFeelVisual';

const SHARD_COLOR = 0xffdf58;
const SHARD_ACCENT_COLOR = 0xffffff;
const IMPACT_COLOR = 0xff563d;
const IMPACT_ACCENT_COLOR = 0xffc45b;
const PICKUP_RING_DURATION = 0.28;
const IMPACT_RING_DURATION = 0.24;
const IMPACT_FLASH_DURATION = 0.16;
const PARTICLE_LIFETIME = 0.32;

interface FeedbackParticle {
  view: Graphics;
  originX: number;
  originY: number;
  velocityX: number;
  velocityY: number;
  age: number;
  lifetime: number;
  rotationSpeed: number;
}

export class GameFeedbackView {
  public readonly view = new Container();

  private readonly particleLayer = new Container();
  private readonly pickupRing = new Graphics();
  private readonly impactRing = new Graphics();
  private readonly flash = new Graphics();
  private readonly particles: FeedbackParticle[] = [];

  private viewportWidth = 1;
  private viewportHeight = 1;
  private pickupRingElapsed = Number.POSITIVE_INFINITY;
  private pickupRingX = 0;
  private pickupRingY = 0;
  private pickupRingBaseRadius = 10;
  private impactElapsed = Number.POSITIVE_INFINITY;
  private impactX = 0;
  private impactY = 0;
  private impactBaseRadius = 18;
  private impactAmplitude = 0;
  private flashElapsed = Number.POSITIVE_INFINITY;

  public constructor() {
    this.view.addChild(
      this.particleLayer,
      this.pickupRing,
      this.impactRing,
      this.flash,
    );
  }

  public update(deltaSeconds: number): void {
    const delta = Math.max(0, deltaSeconds);

    this.updateParticles(delta);
    this.updatePickupRing(delta);
    this.updateImpact(delta);
  }

  public resize(width: number, height: number): void {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);

    this.flash
      .clear()
      .rect(0, 0, this.viewportWidth, this.viewportHeight)
      .fill({ color: IMPACT_COLOR, alpha: 1 });
    this.flash.alpha = 0;
  }

  public triggerShardPickup(x: number, y: number, base: number): void {
    const safeBase = Math.max(1, base);

    this.pickupRingX = x;
    this.pickupRingY = y;
    this.pickupRingBaseRadius = Math.max(8, safeBase * 0.014);
    this.pickupRingElapsed = 0;

    this.spawnBurst(
      x,
      y,
      safeBase,
      SHARD_COLOR,
      SHARD_ACCENT_COLOR,
      8,
      0.16,
    );
  }

  public triggerCollision(x: number, y: number, base: number): void {
    const safeBase = Math.max(1, base);

    this.impactX = x;
    this.impactY = y;
    this.impactBaseRadius = Math.max(14, safeBase * 0.024);
    this.impactAmplitude = Math.max(4, Math.min(9, safeBase * 0.009));
    this.impactElapsed = 0;
    this.flashElapsed = 0;

    this.spawnBurst(
      x,
      y,
      safeBase,
      IMPACT_COLOR,
      IMPACT_ACCENT_COLOR,
      10,
      0.22,
    );
  }

  public getShakeOffset(): ShakeOffset {
    return getImpactShake(this.impactElapsed, this.impactAmplitude);
  }

  public clear(): void {
    this.pickupRingElapsed = Number.POSITIVE_INFINITY;
    this.impactElapsed = Number.POSITIVE_INFINITY;
    this.flashElapsed = Number.POSITIVE_INFINITY;
    this.pickupRing.clear();
    this.impactRing.clear();
    this.flash.alpha = 0;

    for (const particle of this.particles) {
      this.particleLayer.removeChild(particle.view);
      particle.view.destroy();
    }

    this.particles.length = 0;
  }

  private updateParticles(deltaSeconds: number): void {
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.age += deltaSeconds;

      const progress = Math.min(1, particle.age / particle.lifetime);
      const easeOut = 1 - Math.pow(1 - progress, 2);

      particle.view.position.set(
        particle.originX + particle.velocityX * particle.lifetime * easeOut,
        particle.originY + particle.velocityY * particle.lifetime * easeOut,
      );
      particle.view.rotation += particle.rotationSpeed * deltaSeconds;
      particle.view.alpha = Math.pow(1 - progress, 1.6);
      particle.view.scale.set(1 + progress * 0.38);

      if (progress < 1) {
        continue;
      }

      this.particles.splice(index, 1);
      this.particleLayer.removeChild(particle.view);
      particle.view.destroy();
    }
  }

  private updatePickupRing(deltaSeconds: number): void {
    if (!Number.isFinite(this.pickupRingElapsed)) {
      return;
    }

    this.pickupRingElapsed += deltaSeconds;
    const alpha = getTransientAlpha(
      this.pickupRingElapsed,
      PICKUP_RING_DURATION,
    );

    if (alpha <= 0) {
      this.pickupRingElapsed = Number.POSITIVE_INFINITY;
      this.pickupRing.clear();
      return;
    }

    const progress = 1 - alpha;
    const radius = this.pickupRingBaseRadius * (1 + progress * 1.9);

    this.pickupRing
      .clear()
      .circle(this.pickupRingX, this.pickupRingY, radius)
      .stroke({
        color: SHARD_COLOR,
        alpha: alpha * 0.88,
        width: Math.max(1.2, this.pickupRingBaseRadius * 0.16 * alpha),
      });
  }

  private updateImpact(deltaSeconds: number): void {
    if (Number.isFinite(this.impactElapsed)) {
      this.impactElapsed += deltaSeconds;
      const alpha = getTransientAlpha(
        this.impactElapsed,
        IMPACT_RING_DURATION,
      );

      if (alpha <= 0) {
        this.impactElapsed = Number.POSITIVE_INFINITY;
        this.impactRing.clear();
      } else {
        const progress = 1 - alpha;
        const radius = this.impactBaseRadius * (1 + progress * 2.1);

        this.impactRing
          .clear()
          .circle(this.impactX, this.impactY, radius)
          .stroke({
            color: IMPACT_ACCENT_COLOR,
            alpha: alpha * 0.9,
            width: Math.max(1.5, this.impactBaseRadius * 0.18 * alpha),
          });
      }
    }

    if (!Number.isFinite(this.flashElapsed)) {
      return;
    }

    this.flashElapsed += deltaSeconds;
    const flashAlpha = getTransientAlpha(
      this.flashElapsed,
      IMPACT_FLASH_DURATION,
    );

    if (flashAlpha <= 0) {
      this.flashElapsed = Number.POSITIVE_INFINITY;
      this.flash.alpha = 0;
      return;
    }

    this.flash.alpha = flashAlpha * 0.18;
  }

  private spawnBurst(
    x: number,
    y: number,
    base: number,
    color: number,
    accentColor: number,
    count: number,
    speedRatio: number,
  ): void {
    const size = Math.max(2, base * 0.0035);
    const speed = Math.max(70, base * speedRatio);

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const speedMultiplier = index % 2 === 0 ? 1 : 0.72;
      const particleView = new Graphics()
        .rect(-size * 0.5, -size * 0.5, size, size)
        .fill({
          color: index % 3 === 0 ? accentColor : color,
          alpha: 1,
        });

      particleView.position.set(x, y);
      particleView.rotation = angle + Math.PI * 0.25;
      this.particleLayer.addChild(particleView);

      this.particles.push({
        view: particleView,
        originX: x,
        originY: y,
        velocityX: Math.cos(angle) * speed * speedMultiplier,
        velocityY: Math.sin(angle) * speed * speedMultiplier,
        age: 0,
        lifetime: PARTICLE_LIFETIME,
        rotationSpeed: index % 2 === 0 ? 3.8 : -3.2,
      });
    }
  }
}
