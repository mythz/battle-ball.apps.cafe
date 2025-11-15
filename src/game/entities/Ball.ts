import { Ball, Entity, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class BallEntity implements Ball {
  id: string;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  speed: number;
  lastHitBy: string | null;
  trailPositions: Vec2[];

  constructor(startPosition: Vec2, startVelocity?: Vec2) {
    this.id = 'ball';
    this.position = { ...startPosition };

    if (startVelocity) {
      this.velocity = { ...startVelocity };
    } else {
      // Random direction
      const angle = Math.random() * Math.PI * 2;
      this.velocity = {
        x: Math.cos(angle) * GAME_CONFIG.BALL_INITIAL_SPEED,
        y: Math.sin(angle) * GAME_CONFIG.BALL_INITIAL_SPEED
      };
    }

    this.radius = GAME_CONFIG.BALL_RADIUS;
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    this.speed = GAME_CONFIG.BALL_INITIAL_SPEED;
    this.lastHitBy = null;
    this.trailPositions = [];
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 16.67;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Update speed
    this.speed = Vector2D.magnitude(this.velocity);

    // Update trail
    this.trailPositions.unshift({ ...this.position });
    if (this.trailPositions.length > 10) {
      this.trailPositions.pop();
    }
  }

  hitEntity(entity: Entity, _damageMultiplier: number = 1.0): void {
    this.lastHitBy = entity.id;
    // Damage is handled by the entity's takeDamage method
  }

  accelerate(): void {
    const currentSpeed = Vector2D.magnitude(this.velocity);
    const newSpeed = Math.min(
      currentSpeed * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    this.velocity = Vector2D.multiply(Vector2D.normalize(this.velocity), newSpeed);
  }

  reset(position: Vec2): void {
    this.position = { ...position };

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(angle) * GAME_CONFIG.BALL_INITIAL_SPEED,
      y: Math.sin(angle) * GAME_CONFIG.BALL_INITIAL_SPEED
    };

    this.speed = GAME_CONFIG.BALL_INITIAL_SPEED;
    this.lastHitBy = null;
    this.trailPositions = [];
  }
}
