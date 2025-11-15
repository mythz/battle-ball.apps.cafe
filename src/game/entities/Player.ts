import { Player as IPlayer, Vector2D as IVector2D, Ball } from '../../store/types';
import { GAME_CONFIG } from '../../data/constants';
import { SWORDS } from '../../data/swords';

export class PlayerEntity implements IPlayer {
  id: string;
  position: IVector2D;
  velocity: IVector2D;
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
  lastSwingTime: number;

  constructor(startPosition: IVector2D, swordId: string, skinId: string) {
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
    this.lastSwingTime = 0;

    const sword = SWORDS.find((s) => s.id === swordId) || SWORDS[0];
    this.swordLength = sword.length;
    this.swordWidth = sword.width;
  }

  updateSwordAngle(targetX: number, targetY: number): void {
    this.swordAngle = Math.atan2(
      targetY - this.position.y,
      targetX - this.position.x
    );
  }

  move(direction: IVector2D, deltaTime: number): void {
    if (!this.isAlive) return;

    const dt = deltaTime / 16.67; // Normalize to 60fps
    const speed = this.isBlocking ? GAME_CONFIG.PLAYER_SPEED * 0.5 : GAME_CONFIG.PLAYER_SPEED;

    this.velocity.x = direction.x * speed;
    this.velocity.y = direction.y * speed;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Keep player in bounds
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

  block(isBlocking: boolean): void {
    this.isBlocking = isBlocking;
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
    if (!this.isAlive) return;

    const damage = this.isBlocking ? amount * 0.5 : amount;
    this.health = Math.max(0, this.health - damage);

    if (this.health <= 0) {
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

  reset(): void {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.isBlocking = false;
    this.velocity = { x: 0, y: 0 };
  }
}
