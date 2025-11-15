import { AIBot, Ball, Entity, Vector2D as IVector2D } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';

interface DecisionOutput {
  targetPosition: IVector2D;
  shouldBlock: boolean;
  shouldSwing: boolean;
}

export class BotAI {
  private bot: AIBot;
  private difficulty: number;

  constructor(bot: AIBot) {
    this.bot = bot;
    this.difficulty = bot.difficulty;
  }

  decide(ball: Ball, allEntities: Entity[]): DecisionOutput {
    const ballTrajectory = this.predictTrajectory(ball, 60);
    const threatLevel = this.assessThreat(ball, ballTrajectory);

    if (threatLevel > 0.7) {
      return this.defensiveBehavior(ball);
    } else if (threatLevel > 0.3) {
      return this.aggressiveBehavior(ball, allEntities);
    } else {
      return this.positioningBehavior(allEntities);
    }
  }

  private defensiveBehavior(ball: Ball): DecisionOutput {
    const distanceToBall = Vector2D.distance(this.bot.position, ball.position);
    const ballVelocity = Vector2D.magnitude(ball.velocity);

    // Predict where ball will be
    const predictedBallPos = this.predictBallPosition(ball, 30);

    // Check if ball is heading toward bot
    const ballDirection = Vector2D.normalize(ball.velocity);
    const toBotDirection = Vector2D.normalize(
      Vector2D.subtract(this.bot.position, ball.position)
    );
    const dotProduct = Vector2D.dot(ballDirection, toBotDirection);

    if (dotProduct > 0.5 && distanceToBall < 200) {
      // Ball is coming toward us
      if (distanceToBall < 100 && this.difficulty > 0.3) {
        // Try to deflect with sword
        return {
          targetPosition: this.bot.position, // Stay in place
          shouldBlock: true,
          shouldSwing: distanceToBall < 80,
        };
      } else {
        // Move to intercept
        return {
          targetPosition: predictedBallPos,
          shouldBlock: distanceToBall < 120,
          shouldSwing: false,
        };
      }
    } else {
      // Evade
      const evadeDirection = Vector2D.subtract(this.bot.position, ball.position);
      const evadeTarget = Vector2D.add(
        this.bot.position,
        Vector2D.multiply(Vector2D.normalize(evadeDirection), 100)
      );
      return {
        targetPosition: evadeTarget,
        shouldBlock: false,
        shouldSwing: false,
      };
    }
  }

  private aggressiveBehavior(ball: Ball, others: Entity[]): DecisionOutput {
    // Find nearest enemy
    const enemies = others.filter(e => e.isAlive && e.id !== this.bot.id);
    let nearestEnemy: Entity | null = null;
    let nearestDistance = Infinity;

    for (const enemy of enemies) {
      const dist = Vector2D.distance(this.bot.position, enemy.position);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestEnemy = enemy;
      }
    }

    const distanceToBall = Vector2D.distance(this.bot.position, ball.position);

    if (distanceToBall < 150 && nearestEnemy && this.difficulty > 0.4) {
      // Try to hit ball toward enemy
      const toBall = Vector2D.subtract(ball.position, this.bot.position);
      const interceptPoint = Vector2D.add(
        this.bot.position,
        Vector2D.multiply(Vector2D.normalize(toBall), distanceToBall * 0.8)
      );

      return {
        targetPosition: interceptPoint,
        shouldBlock: false,
        shouldSwing: distanceToBall < 100,
      };
    } else {
      // Move toward ball
      return {
        targetPosition: ball.position,
        shouldBlock: false,
        shouldSwing: distanceToBall < 80,
      };
    }
  }

  private positioningBehavior(others: Entity[]): DecisionOutput {
    // Move to center of arena, but avoid other entities
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;
    let targetX = centerX;
    let targetY = centerY;

    // Add some randomness based on bot ID
    const offset = parseInt(this.bot.id.replace('ai_', '')) * 100;
    targetX += Math.cos(offset) * 150;
    targetY += Math.sin(offset) * 150;

    // Avoid other entities
    for (const other of others) {
      if (other.id === this.bot.id || !other.isAlive) continue;

      const distance = Vector2D.distance(this.bot.position, other.position);
      if (distance < 100) {
        const away = Vector2D.subtract(this.bot.position, other.position);
        const normalized = Vector2D.normalize(away);
        targetX += normalized.x * 50;
        targetY += normalized.y * 50;
      }
    }

    // Constrain to arena
    targetX = Math.max(
      GAME_CONFIG.ARENA_PADDING + 50,
      Math.min(targetX, GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ARENA_PADDING - 50)
    );
    targetY = Math.max(
      GAME_CONFIG.ARENA_PADDING + 50,
      Math.min(targetY, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ARENA_PADDING - 50)
    );

    return {
      targetPosition: { x: targetX, y: targetY },
      shouldBlock: false,
      shouldSwing: false,
    };
  }

  private predictTrajectory(ball: Ball, frames: number): IVector2D[] {
    const trajectory: IVector2D[] = [];
    let pos = { ...ball.position };
    let vel = { ...ball.velocity };

    const padding = GAME_CONFIG.ARENA_PADDING;
    const width = GAME_CONFIG.CANVAS_WIDTH;
    const height = GAME_CONFIG.CANVAS_HEIGHT;

    for (let i = 0; i < frames; i++) {
      pos = Vector2D.add(pos, vel);

      // Simple wall bounce prediction
      if (pos.x < padding || pos.x > width - padding) {
        vel.x *= -1;
      }
      if (pos.y < padding || pos.y > height - padding) {
        vel.y *= -1;
      }

      trajectory.push({ ...pos });
    }

    return trajectory;
  }

  private predictBallPosition(ball: Ball, frames: number): IVector2D {
    const trajectory = this.predictTrajectory(ball, frames);
    return trajectory[Math.min(frames - 1, trajectory.length - 1)] || ball.position;
  }

  private assessThreat(ball: Ball, trajectory: IVector2D[]): number {
    let minDistance = Infinity;

    for (const pos of trajectory) {
      const distance = Vector2D.distance(pos, this.bot.position);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    // Normalize threat level (0-1)
    // Closer = higher threat
    const threatDistance = 300;
    const threat = 1 - Math.min(minDistance / threatDistance, 1);

    // Factor in ball speed
    const speedFactor = ball.speed / GAME_CONFIG.BALL_MAX_SPEED;

    return (threat * 0.7 + speedFactor * 0.3) * (this.difficulty * 0.5 + 0.5);
  }
}
