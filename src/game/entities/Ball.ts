import { Ball as IBall, Vector2D as IVector2D, Entity } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class BallEntity implements IBall {
  id: string;
  position: IVector2D;
  velocity: IVector2D;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  speed: number;
  lastHitBy: string | null;
  trailPositions: IVector2D[];

  constructor(startPosition: IVector2D, startVelocity: IVector2D) {
    this.id = 'ball';
    this.position = { ...startPosition };
    this.velocity = { ...startVelocity };
    this.radius = GAME_CONFIG.BALL_RADIUS;
    this.health = 1;
    this.maxHealth = 1;
    this.isAlive = true;
    this.speed = Vector2D.magnitude(startVelocity);
    this.lastHitBy = null;
    this.trailPositions = [];
  }

  update(deltaTime: number): void {
    // Update trail
    this.trailPositions.unshift({ ...this.position });
    if (this.trailPositions.length > GAME_CONFIG.BALL_TRAIL_LENGTH) {
      this.trailPositions.pop();
    }

    // Update speed
    this.speed = Vector2D.magnitude(this.velocity);
  }

  hitEntity(entity: Entity, damageMultiplier: number): void {
    this.lastHitBy = entity.id;
  }

  accelerate(): void {
    const currentSpeed = Vector2D.magnitude(this.velocity);
    const newSpeed = Math.min(
      currentSpeed * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    const normalized = Vector2D.normalize(this.velocity);
    this.velocity.x = normalized.x * newSpeed;
    this.velocity.y = normalized.y * newSpeed;
    this.speed = newSpeed;
  }

  reset(position: IVector2D): void {
    this.position = { ...position };
    // Random initial direction
    const angle = Math.random() * Math.PI * 2;
    const speed = GAME_CONFIG.BALL_INITIAL_SPEED;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
    this.speed = speed;
    this.lastHitBy = null;
    this.trailPositions = [];
  }
}
