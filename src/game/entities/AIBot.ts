import { AIBot as IAIBot, Vector2D as IVector2D, Ball } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';
import { SWORDS } from '../../data/swords';

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
  swordId: string;
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
    this.reactionTime = 200 - difficulty * 100; // 200ms for easy, 100ms for hard
    this.lastDecisionTime = 0;
    this.swordAngle = 0;
    this.isBlocking = false;
    this.swordId = 'wooden_sword';
    this.lastSwingTime = 0;

    const sword = SWORDS.find((s) => s.id === this.swordId) || SWORDS[0];
    this.swordLength = sword.length;
    this.swordWidth = sword.width;
  }

  moveTowardTarget(deltaTime: number): void {
    if (!this.isAlive) return;

    const dt = deltaTime / 16.67; // Normalize to 60fps
    const direction = Vector2D.subtract(this.targetPosition, this.position);
    const distance = Vector2D.magnitude(direction);

    if (distance > 5) {
      const normalized = Vector2D.normalize(direction);
      const speed = this.isBlocking ? GAME_CONFIG.PLAYER_SPEED * 0.5 : GAME_CONFIG.PLAYER_SPEED;

      this.velocity.x = normalized.x * speed;
      this.velocity.y = normalized.y * speed;

      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;

      // Keep in bounds
      const padding = GAME_CONFIG.ARENA_PADDING;
      this.position.x = Math.max(
        padding + this.radius,
        Math.min(GAME_CONFIG.CANVAS_WIDTH - padding - this.radius, this.position.x)
      );
      this.position.y = Math.max(
        padding + this.radius,
        Math.min(GAME_CONFIG.CANVAS_HEIGHT - padding - this.radius, this.position.y)
      );
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  updateSwordAngle(ball: Ball): void {
    // Point sword toward ball
    this.swordAngle = Math.atan2(
      ball.position.y - this.position.y,
      ball.position.x - this.position.x
    );
  }

  takeDamage(amount: number, _ball: Ball): void {
    if (!this.isAlive) return;

    const damage = this.isBlocking ? amount * 0.5 : amount;
    this.health = Math.max(0, this.health - damage);

    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  swing(): boolean {
    const now = Date.now();
    if (now - this.lastSwingTime < GAME_CONFIG.SWORD_COOLDOWN) {
      return false;
    }

    this.lastSwingTime = now;
    return true;
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

  reset(): void {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.isBlocking = false;
    this.velocity = { x: 0, y: 0 };
  }
}
