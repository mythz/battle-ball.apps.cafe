import { AIBot as IAIBot, Vector2D as IVector2D, Ball } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { CollisionDetection } from '../physics/CollisionDetection';
import { GAME_CONFIG } from '../../data/constants';

export class AIBotEntity implements IAIBot {
  id: string;
  position: IVector2D;
  velocity: IVector2D;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  difficulty: number;
  targetPosition: IVector2D;
  reactionTime: number;
  lastDecisionTime: number;
  swordAngle: number;
  swordLength: number;
  swordWidth: number;
  isBlocking: boolean;
  lastSwingTime: number;

  constructor(startPosition: IVector2D, difficulty: number, id: string) {
    this.id = id;
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.radius = GAME_CONFIG.PLAYER_RADIUS;
    this.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.isAlive = true;
    this.difficulty = difficulty;
    this.targetPosition = { ...startPosition };
    this.reactionTime = 300 - (difficulty * 200); // 300ms to 100ms
    this.lastDecisionTime = 0;
    this.swordAngle = 0;
    this.swordLength = GAME_CONFIG.SWORD_BASE_LENGTH;
    this.swordWidth = GAME_CONFIG.SWORD_BASE_WIDTH;
    this.isBlocking = false;
    this.lastSwingTime = 0;
  }

  moveTowardTarget(deltaTime: number): void {
    const dt = deltaTime / 16.67;
    const direction = Vector2D.subtract(this.targetPosition, this.position);
    const distance = Vector2D.magnitude(direction);

    if (distance > 5) {
      const normalized = Vector2D.normalize(direction);
      const speed = GAME_CONFIG.PLAYER_SPEED;

      this.velocity.x = normalized.x * speed;
      this.velocity.y = normalized.y * speed;

      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
    } else {
      this.velocity = { x: 0, y: 0 };
    }

    // Constrain to arena bounds
    CollisionDetection.constrainToBounds(this, {
      left: GAME_CONFIG.ARENA_PADDING,
      right: GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ARENA_PADDING,
      top: GAME_CONFIG.ARENA_PADDING,
      bottom: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ARENA_PADDING,
    });
  }

  updateSwordAngle(ball: Ball): void {
    const dx = ball.position.x - this.position.x;
    const dy = ball.position.y - this.position.y;
    this.swordAngle = Math.atan2(dy, dx);
  }

  block(): void {
    this.isBlocking = true;
  }

  releaseBlock(): void {
    this.isBlocking = false;
  }

  swing(): void {
    const now = Date.now();
    if (now - this.lastSwingTime < GAME_CONFIG.SWORD_COOLDOWN) {
      return;
    }
    this.lastSwingTime = now;
  }

  takeDamage(amount: number, ball: Ball): void {
    const actualDamage = this.isBlocking ? amount * 0.5 : amount;
    this.health -= actualDamage;

    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  getSwordTip(): IVector2D {
    return {
      x: this.position.x + Math.cos(this.swordAngle) * this.swordLength,
      y: this.position.y + Math.sin(this.swordAngle) * this.swordLength,
    };
  }

  getSwordBase(): IVector2D {
    return { ...this.position };
  }
}
