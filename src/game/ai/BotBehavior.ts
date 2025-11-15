import { AIBot, Ball, Entity, AIDecision, Vector2D as IVector2D } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class BotAI {
  private bot: AIBot;
  private difficulty: number;

  constructor(bot: AIBot, difficulty: number) {
    this.bot = bot;
    this.difficulty = difficulty;
  }

  decide(ball: Ball, allEntities: Entity[]): AIDecision {
    // Predict ball trajectory
    const ballTrajectory = this.predictTrajectory(ball, 60);
    const threatLevel = this.assessThreat(ball, ballTrajectory);

    // High threat - defensive behavior
    if (threatLevel > 0.7) {
      return this.defensiveBehavior(ball);
    }
    // Medium threat - aggressive behavior
    else if (threatLevel > 0.3) {
      return this.aggressiveBehavior(ball, allEntities);
    }
    // Low threat - positioning behavior
    else {
      return this.positioningBehavior(allEntities);
    }
  }

  private defensiveBehavior(ball: Ball): AIDecision {
    const distanceToBall = Vector2D.distance(this.bot.position, ball.position);

    // If ball is very close and coming toward us
    if (distanceToBall < 150) {
      // Try to predict where ball will be
      const predictedPos = this.predictBallPosition(ball, 20);
      const directionToPredicted = Vector2D.subtract(predictedPos, this.bot.position);

      // Move to intercept with some randomness based on difficulty
      const accuracy = 0.5 + this.difficulty * 0.5;
      const randomOffset = Vector2D.random(-20, 20, -20, 20);
      const targetOffset = Vector2D.multiply(randomOffset, 1 - accuracy);

      this.bot.targetPosition = Vector2D.add(predictedPos, targetOffset);

      // Should we block or swing?
      const shouldBlock = distanceToBall < 80 && Math.random() > this.difficulty;
      const shouldSwing = distanceToBall < 100 && Math.random() < this.difficulty;

      return {
        movement: Vector2D.normalize(directionToPredicted),
        shouldBlock,
        shouldSwing,
      };
    }

    // Move away from ball
    const awayDirection = Vector2D.subtract(this.bot.position, ball.position);
    this.bot.targetPosition = Vector2D.add(
      this.bot.position,
      Vector2D.multiply(Vector2D.normalize(awayDirection), 100)
    );

    return {
      movement: Vector2D.normalize(awayDirection),
      shouldBlock: false,
      shouldSwing: false,
    };
  }

  private aggressiveBehavior(ball: Ball, allEntities: Entity[]): AIDecision {
    // Find nearest opponent
    const opponents = allEntities.filter((e) => e.id !== this.bot.id && e.isAlive);
    let nearestOpponent: Entity | null = null;
    let nearestDistance = Infinity;

    for (const opponent of opponents) {
      const dist = Vector2D.distance(this.bot.position, opponent.position);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestOpponent = opponent;
      }
    }

    if (nearestOpponent) {
      // Try to position to deflect ball toward opponent
      const toBall = Vector2D.subtract(ball.position, this.bot.position);

      // Position between ball and opponent
      const idealPosition = Vector2D.lerp(ball.position, this.bot.position, 0.3);
      this.bot.targetPosition = idealPosition;

      const distanceToBall = Vector2D.magnitude(toBall);
      const shouldSwing = distanceToBall < 120 && Math.random() < this.difficulty * 0.8;

      return {
        movement: Vector2D.normalize(toBall),
        shouldBlock: false,
        shouldSwing,
      };
    }

    // No opponents, move toward ball
    const direction = Vector2D.subtract(ball.position, this.bot.position);
    this.bot.targetPosition = { ...ball.position };

    return {
      movement: Vector2D.normalize(direction),
      shouldBlock: false,
      shouldSwing: false,
    };
  }

  private positioningBehavior(allEntities: Entity[]): AIDecision {
    // Move to strategic position (center with some randomness)
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

    // Add randomness to prevent bunching
    const randomOffsetX = (Math.random() - 0.5) * 200;
    const randomOffsetY = (Math.random() - 0.5) * 200;

    this.bot.targetPosition = {
      x: centerX + randomOffsetX,
      y: centerY + randomOffsetY,
    };

    // Avoid other entities
    const tooClose = allEntities.filter((e) => {
      if (e.id === this.bot.id || !e.isAlive) return false;
      return Vector2D.distance(this.bot.position, e.position) < 100;
    });

    if (tooClose.length > 0) {
      // Move away from crowded areas
      let avoidanceVector = Vector2D.zero();
      for (const entity of tooClose) {
        const away = Vector2D.subtract(this.bot.position, entity.position);
        avoidanceVector = Vector2D.add(avoidanceVector, away);
      }

      this.bot.targetPosition = Vector2D.add(
        this.bot.position,
        Vector2D.multiply(Vector2D.normalize(avoidanceVector), 80)
      );
    }

    const direction = Vector2D.subtract(this.bot.targetPosition, this.bot.position);

    return {
      movement: Vector2D.magnitude(direction) > 10 ? Vector2D.normalize(direction) : null,
      shouldBlock: false,
      shouldSwing: false,
    };
  }

  private predictTrajectory(ball: Ball, frames: number): IVector2D[] {
    const trajectory: IVector2D[] = [];
    let pos = { ...ball.position };
    let vel = { ...ball.velocity };

    for (let i = 0; i < frames; i++) {
      pos = Vector2D.add(pos, vel);

      // Simple wall bounce prediction
      const padding = GAME_CONFIG.ARENA_PADDING;
      if (pos.x < padding || pos.x > GAME_CONFIG.CANVAS_WIDTH - padding) {
        vel.x = -vel.x;
      }
      if (pos.y < padding || pos.y > GAME_CONFIG.CANVAS_HEIGHT - padding) {
        vel.y = -vel.y;
      }

      trajectory.push({ ...pos });
    }

    return trajectory;
  }

  private predictBallPosition(ball: Ball, frames: number): IVector2D {
    let pos = { ...ball.position };
    let vel = { ...ball.velocity };

    for (let i = 0; i < frames; i++) {
      pos = Vector2D.add(pos, vel);

      // Account for wall bounces
      const padding = GAME_CONFIG.ARENA_PADDING;
      if (pos.x < padding || pos.x > GAME_CONFIG.CANVAS_WIDTH - padding) {
        vel.x = -vel.x;
      }
      if (pos.y < padding || pos.y > GAME_CONFIG.CANVAS_HEIGHT - padding) {
        vel.y = -vel.y;
      }
    }

    return pos;
  }

  private assessThreat(ball: Ball, trajectory: IVector2D[]): number {
    const distanceToBall = Vector2D.distance(this.bot.position, ball.position);

    // Check if ball is heading toward bot
    const ballDirection = Vector2D.normalize(ball.velocity);
    const toBotDirection = Vector2D.normalize(
      Vector2D.subtract(this.bot.position, ball.position)
    );
    const dotProduct = Vector2D.dot(ballDirection, toBotDirection);

    // High threat if ball is close and heading toward us
    if (dotProduct > 0.5 && distanceToBall < 200) {
      return Math.min(1, (1 - distanceToBall / 200) * (dotProduct + 0.5));
    }

    // Check if trajectory will pass near bot
    for (let i = 0; i < Math.min(trajectory.length, 30); i++) {
      const dist = Vector2D.distance(this.bot.position, trajectory[i]);
      if (dist < this.bot.radius * 3) {
        return 0.6 + (1 - i / 30) * 0.3;
      }
    }

    return Math.max(0, 1 - distanceToBall / 300);
  }
}
