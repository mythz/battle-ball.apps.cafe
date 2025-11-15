import { AIBot, Ball, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';
import { SWORDS } from '../../data/swords';

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
  private lastSwingTime: number = 0;

  constructor(startPosition: Vec2, difficulty: number, id: string) {
    this.id = id;
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.radius = GAME_CONFIG.PLAYER_RADIUS;
    this.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER_MAX_HEALTH;
    this.isAlive = true;
    this.difficulty = difficulty;
    this.targetPosition = { ...startPosition };
    this.reactionTime = GAME_CONFIG.AI_UPDATE_RATE * (1.5 - difficulty);
    this.lastDecisionTime = 0;
    this.swordAngle = 0;
    this.isBlocking = false;
    this.swordId = 'wooden_sword';

    const sword = SWORDS.find(s => s.id === this.swordId) || SWORDS[0];
    this.swordLength = sword.length;
    this.swordWidth = sword.width;
  }

  moveTowardTarget(deltaTime: number): void {
    const dt = deltaTime / 16.67;
    const direction = Vector2D.subtract(this.targetPosition, this.position);
    const distance = Vector2D.magnitude(direction);

    if (distance < 5) {
      this.velocity = { x: 0, y: 0 };
      return;
    }

    const speed = GAME_CONFIG.PLAYER_SPEED * (0.8 + this.difficulty * 0.2);
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

  predictBallPosition(ball: Ball, frames: number): Vec2 {
    const position = { ...ball.position };
    const velocity = { ...ball.velocity };

    for (let i = 0; i < frames; i++) {
      position.x += velocity.x;
      position.y += velocity.y;

      // Simple wall bounce prediction
      const padding = GAME_CONFIG.ARENA_PADDING;
      if (position.x - ball.radius < padding || position.x + ball.radius > GAME_CONFIG.CANVAS_WIDTH - padding) {
        velocity.x *= -1;
      }
      if (position.y - ball.radius < padding || position.y + ball.radius > GAME_CONFIG.CANVAS_HEIGHT - padding) {
        velocity.y *= -1;
      }
    }

    return position;
  }

  shouldBlock(ball: Ball): boolean {
    const ballDistance = Vector2D.distance(this.position, ball.position);

    // Calculate if ball is heading toward this bot
    const toBall = Vector2D.subtract(ball.position, this.position);
    const ballVelNorm = Vector2D.normalize(ball.velocity);
    const toBotNorm = Vector2D.normalize(Vector2D.multiply(toBall, -1));
    const dotProduct = Vector2D.dot(ballVelNorm, toBotNorm);

    const threatLevel = dotProduct > 0.5 && ballDistance < 150;
    return threatLevel && Math.random() < this.difficulty;
  }

  attemptSwing(ball: Ball): boolean {
    const now = Date.now();
    if (now - this.lastSwingTime < GAME_CONFIG.SWORD_COOLDOWN) {
      return false;
    }

    const ballDistance = Vector2D.distance(this.position, ball.position);
    const swingRange = this.swordLength + ball.radius + 20;

    if (ballDistance < swingRange && Math.random() < this.difficulty * 0.8) {
      // Point sword at ball
      this.swordAngle = Vector2D.angleBetween(this.position, ball.position);
      this.lastSwingTime = now;
      return true;
    }

    return false;
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
}
