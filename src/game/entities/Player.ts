import { Player as IPlayer, Vector2D as IVector2D, Ball } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { CollisionDetection } from '../physics/CollisionDetection';
import { GAME_CONFIG } from '../../data/constants';

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
    this.swordLength = GAME_CONFIG.SWORD_BASE_LENGTH;
    this.swordWidth = GAME_CONFIG.SWORD_BASE_WIDTH;
    this.isBlocking = false;
    this.skinId = skinId;
    this.swordId = swordId;
    this.lastSwingTime = 0;
  }

  updateSwordAngle(targetX: number, targetY: number): void {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    this.swordAngle = Math.atan2(dy, dx);
  }

  move(direction: IVector2D, deltaTime: number): void {
    const dt = deltaTime / 16.67;
    const speed = GAME_CONFIG.PLAYER_SPEED;

    this.velocity.x = direction.x * speed;
    this.velocity.y = direction.y * speed;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Constrain to arena bounds
    CollisionDetection.constrainToBounds(this, {
      left: GAME_CONFIG.ARENA_PADDING,
      right: GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ARENA_PADDING,
      top: GAME_CONFIG.ARENA_PADDING,
      bottom: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ARENA_PADDING,
    });
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

  setSwordStats(length: number, width: number): void {
    this.swordLength = length;
    this.swordWidth = width;
  }
}
