import { Ball, Vector2D as Vec2 } from '../../store/types';
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

  constructor(startPosition: Vec2, startVelocity: Vec2) {
    this.id = 'ball';
    this.position = startPosition;
    this.velocity = startVelocity;
    this.radius = GAME_CONFIG.BALL_RADIUS;
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    this.speed = GAME_CONFIG.BALL_INITIAL_SPEED;
    this.lastHitBy = null;
    this.trailPositions = [];

    // Ensure initial velocity has correct magnitude
    this.velocity = Vector2D.setMagnitude(this.velocity, this.speed);
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    // Update position
    this.position.x += this.velocity.x * dt * 60;
    this.position.y += this.velocity.y * dt * 60;

    // Update trail
    this.trailPositions.push({ ...this.position });
    if (this.trailPositions.length > 10) {
      this.trailPositions.shift();
    }
  }

  accelerate(): void {
    this.speed = Math.min(
      this.speed * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    this.velocity = Vector2D.setMagnitude(this.velocity, this.speed);
  }

  reset(position: Vec2): void {
    this.position = position;

    // Random initial direction
    const angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(angle) * GAME_CONFIG.BALL_INITIAL_SPEED,
      y: Math.sin(angle) * GAME_CONFIG.BALL_INITIAL_SPEED,
    };

    this.speed = GAME_CONFIG.BALL_INITIAL_SPEED;
    this.lastHitBy = null;
    this.trailPositions = [];
  }

  getTrail(): Vec2[] {
    return this.trailPositions;
  }

  takeDamage(_amount: number): void {
    // Ball doesn't take damage
  }
}
