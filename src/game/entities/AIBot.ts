import { AIBot, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class AIBotEntity implements AIBot {
  id: string;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  difficulty: number;
  targetPosition: Vec2;
  reactionTime: number;
  lastDecisionTime: number;
  swordAngle: number;
  swordLength: number;
  swordWidth: number;
  isBlocking: boolean;
  swordId: string;
  lastSwingTime: number;

  constructor(startPosition: Vec2, difficulty: number, id: string) {
    this.id = id;
    this.position = startPosition;
    this.velocity = { x: 0, y: 0 };
    this.radius = GAME_CONFIG.PLAYER_RADIUS;
    this.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.isAlive = true;
    this.difficulty = difficulty;
    this.targetPosition = { ...startPosition };
    this.reactionTime = 150 + (1 - difficulty) * 350; // 150-500ms
    this.lastDecisionTime = 0;
    this.swordAngle = 0;
    this.swordLength = GAME_CONFIG.SWORD_BASE_LENGTH;
    this.swordWidth = GAME_CONFIG.SWORD_BASE_WIDTH;
    this.isBlocking = false;
    this.swordId = 'wooden_sword';
    this.lastSwingTime = 0;
  }

  setTargetPosition(target: Vec2): void {
    this.targetPosition = target;
  }

  moveTowardTarget(deltaTime: number): void {
    if (!this.isAlive) return;

    const dt = deltaTime / 1000;
    const direction = Vector2D.subtract(this.targetPosition, this.position);
    const distance = Vector2D.magnitude(direction);

    if (distance > 5) {
      const normalized = Vector2D.normalize(direction);
      const moveSpeed = GAME_CONFIG.PLAYER_SPEED * (0.8 + this.difficulty * 0.2);

      this.velocity = Vector2D.multiply(normalized, moveSpeed * 60);
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;

      // Constrain to arena bounds
      const padding = GAME_CONFIG.ARENA_PADDING;
      this.position.x = Math.max(
        padding + this.radius,
        Math.min(
          GAME_CONFIG.CANVAS_WIDTH - padding - this.radius,
          this.position.x
        )
      );
      this.position.y = Math.max(
        padding + this.radius,
        Math.min(
          GAME_CONFIG.CANVAS_HEIGHT - padding - this.radius,
          this.position.y
        )
      );
    } else {
      this.velocity = { x: 0, y: 0 };
    }
  }

  updateSwordAngle(targetX: number, targetY: number): void {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    this.swordAngle = Math.atan2(dy, dx);
  }

  block(): void {
    this.isBlocking = true;
  }

  unblock(): void {
    this.isBlocking = false;
  }

  swing(): boolean {
    const now = performance.now();
    if (now - this.lastSwingTime < GAME_CONFIG.SWORD_COOLDOWN) {
      return false;
    }

    this.lastSwingTime = now;
    return true;
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;

    const actualDamage = this.isBlocking ? amount * 0.5 : amount;
    this.health = Math.max(0, this.health - actualDamage);

    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  getSwordTip(): Vec2 {
    return {
      x: this.position.x + Math.cos(this.swordAngle) * this.swordLength,
      y: this.position.y + Math.sin(this.swordAngle) * this.swordLength,
    };
  }

  getSwordBase(): Vec2 {
    return {
      x: this.position.x + Math.cos(this.swordAngle) * 5,
      y: this.position.y + Math.sin(this.swordAngle) * 5,
    };
  }

  reset(): void {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.isBlocking = false;
    this.velocity = { x: 0, y: 0 };
  }
}
