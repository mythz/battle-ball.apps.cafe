import { Player, Ball, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';
import { SWORDS } from '../../data/swords';

export class PlayerEntity implements Player {
  id: string;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  swordAngle: number;
  swordLength: number;
  swordWidth: number;
  isBlocking: boolean;
  skinId: string;
  swordId: string;
  private lastSwingTime: number = 0;

  constructor(startPosition: Vec2, swordId: string, skinId: string) {
    this.id = 'player';
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.radius = GAME_CONFIG.PLAYER_RADIUS;
    this.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.isAlive = true;
    this.swordAngle = 0;
    this.isBlocking = false;
    this.skinId = skinId;
    this.swordId = swordId;

    const sword = SWORDS.find(s => s.id === swordId) || SWORDS[0];
    this.swordLength = sword.length;
    this.swordWidth = sword.width;
  }

  updateSwordAngle(targetX: number, targetY: number): void {
    this.swordAngle = Vector2D.angleBetween(this.position, { x: targetX, y: targetY });
  }

  move(direction: Vec2, deltaTime: number): void {
    const dt = deltaTime / 16.67;
    const speed = GAME_CONFIG.PLAYER_SPEED;
    const normalized = Vector2D.normalize(direction);

    this.velocity = Vector2D.multiply(normalized, speed);
    const movement = Vector2D.multiply(this.velocity, dt);
    this.position = Vector2D.add(this.position, movement);

    // Clamp to arena bounds
    const padding = GAME_CONFIG.ARENA_PADDING;
    this.position.x = Math.max(
      padding + this.radius,
      Math.min(GAME_CONFIG.CANVAS_WIDTH - padding - this.radius, this.position.x)
    );
    this.position.y = Math.max(
      padding + this.radius,
      Math.min(GAME_CONFIG.CANVAS_HEIGHT - padding - this.radius, this.position.y)
    );
  }

  block(): void {
    this.isBlocking = true;
  }

  swing(): boolean {
    const now = Date.now();
    if (now - this.lastSwingTime < GAME_CONFIG.SWORD_COOLDOWN) {
      return false;
    }
    this.lastSwingTime = now;
    return true;
  }

  takeDamage(amount: number, _ball: Ball): void {
    const actualDamage = this.isBlocking ? amount * 0.5 : amount;
    this.health = Math.max(0, this.health - actualDamage);

    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  getSwordTip(): Vec2 {
    return {
      x: this.position.x + Math.cos(this.swordAngle) * this.swordLength,
      y: this.position.y + Math.sin(this.swordAngle) * this.swordLength
    };
  }

  getSwordBase(): Vec2 {
    return { ...this.position };
  }

  reset(): void {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.isBlocking = false;
    this.velocity = { x: 0, y: 0 };
  }
}
