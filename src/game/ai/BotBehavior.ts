import { AIBot, Ball, Entity, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { BallPhysics } from '../physics/PhysicsEngine';
import { GAME_CONFIG } from '../../data/constants';

interface DecisionOutput {
  targetPosition: Vec2;
  shouldBlock: boolean;
  shouldSwing: boolean;
  swordAngle: number;
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
      return this.positioningBehavior(ball, allEntities);
    }
  }

  private defensiveBehavior(ball: Ball): DecisionOutput {
    // Move away from ball or try to deflect
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const distance = Vector2D.magnitude(toBall);

    // Point sword at ball
    const swordAngle = Math.atan2(toBall.y, toBall.x);

    // If ball is close and coming toward us, block
    const shouldBlock = distance < 150 && this.isBallComingToward(ball);

    let targetPosition: Vec2;

    if (shouldBlock && this.difficulty > 0.5) {
      // Higher difficulty bots stand their ground and block
      targetPosition = this.bot.position;
    } else {
      // Move perpendicular to ball's trajectory
      const perpendicular = {
        x: -ball.velocity.y,
        y: ball.velocity.x,
      };
      const normalized = Vector2D.normalize(perpendicular);
      targetPosition = Vector2D.add(
        this.bot.position,
        Vector2D.multiply(normalized, 100)
      );

      // Keep in bounds
      targetPosition = this.clampToBounds(targetPosition);
    }

    // Try to swing if ball is very close
    const shouldSwing = distance < this.bot.swordLength + 30 && this.difficulty > Math.random();

    return {
      targetPosition,
      shouldBlock,
      shouldSwing,
      swordAngle,
    };
  }

  private aggressiveBehavior(ball: Ball, others: Entity[]): DecisionOutput {
    // Try to hit ball toward weakest opponent
    const livingEnemies = others.filter(
      (e) => e.isAlive && e.id !== this.bot.id
    );

    if (livingEnemies.length === 0) {
      return this.defensiveBehavior(ball);
    }

    // Find weakest enemy (lowest health)
    const weakestEnemy = livingEnemies.reduce((weakest, current) => {
      return current.health < weakest.health ? current : weakest;
    });

    // Position to intercept ball
    const predictedBallPos = BallPhysics.predictPosition(ball, 30);
    const interceptPos = Vector2D.lerp(
      this.bot.position,
      predictedBallPos,
      this.difficulty
    );

    // Point sword toward target enemy
    const toEnemy = Vector2D.subtract(weakestEnemy.position, this.bot.position);
    const swordAngle = Math.atan2(toEnemy.y, toEnemy.x);

    // Swing if ball is in range and we're facing it
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const ballDistance = Vector2D.magnitude(toBall);
    const shouldSwing =
      ballDistance < this.bot.swordLength + 30 &&
      Math.random() < this.difficulty;

    return {
      targetPosition: this.clampToBounds(interceptPos),
      shouldBlock: false,
      shouldSwing,
      swordAngle,
    };
  }

  private positioningBehavior(ball: Ball, others: Entity[]): DecisionOutput {
    // Move to strategic position (center-weighted, avoid corners)
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

    // Avoid clustering with other bots
    const livingEnemies = others.filter(
      (e) => e.isAlive && e.id !== this.bot.id
    );

    let avoidanceVector: Vec2 = { x: 0, y: 0 };
    livingEnemies.forEach((enemy) => {
      const toEnemy = Vector2D.subtract(enemy.position, this.bot.position);
      const distance = Vector2D.magnitude(toEnemy);

      if (distance < 150) {
        const away = Vector2D.normalize(
          Vector2D.subtract(this.bot.position, enemy.position)
        );
        avoidanceVector = Vector2D.add(
          avoidanceVector,
          Vector2D.multiply(away, (150 - distance) / 150)
        );
      }
    });

    // Blend center position with avoidance
    const toCenter = {
      x: centerX - this.bot.position.x,
      y: centerY - this.bot.position.y,
    };

    const targetPosition = Vector2D.add(
      this.bot.position,
      Vector2D.add(
        Vector2D.multiply(Vector2D.normalize(toCenter), 50),
        Vector2D.multiply(avoidanceVector, 30)
      )
    );

    // Point sword toward ball
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const swordAngle = Math.atan2(toBall.y, toBall.x);

    return {
      targetPosition: this.clampToBounds(targetPosition),
      shouldBlock: false,
      shouldSwing: false,
      swordAngle,
    };
  }

  private predictTrajectory(ball: Ball, frames: number): Vec2[] {
    const trajectory: Vec2[] = [];
    let pos = { ...ball.position };
    let vel = { ...ball.velocity };

    for (let i = 0; i < frames; i++) {
      pos = Vector2D.add(pos, vel);
      trajectory.push({ ...pos });

      // Simple wall bounce prediction
      const padding = GAME_CONFIG.ARENA_PADDING;
      if (
        pos.x - ball.radius <= padding ||
        pos.x + ball.radius >= GAME_CONFIG.CANVAS_WIDTH - padding
      ) {
        vel.x = -vel.x;
      }
      if (
        pos.y - ball.radius <= padding ||
        pos.y + ball.radius >= GAME_CONFIG.CANVAS_HEIGHT - padding
      ) {
        vel.y = -vel.y;
      }
    }

    return trajectory;
  }

  private assessThreat(ball: Ball, trajectory: Vec2[]): number {
    // Check if any point in trajectory is close to bot
    let minDistance = Infinity;

    trajectory.forEach((point) => {
      const distance = Vector2D.distance(point, this.bot.position);
      minDistance = Math.min(minDistance, distance);
    });

    // Normalize to 0-1 (0 = far, 1 = close)
    const threatDistance = Math.max(0, 1 - minDistance / 300);

    // Factor in ball speed
    const ballSpeed = Vector2D.magnitude(ball.velocity);
    const speedThreat = Math.min(1, ballSpeed / GAME_CONFIG.BALL_MAX_SPEED);

    // Check if ball is moving toward us
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const dotProduct = Vector2D.dot(Vector2D.normalize(toBall), Vector2D.normalize(ball.velocity));
    const directionThreat = dotProduct < -0.5 ? 1 : 0;

    return (threatDistance * 0.5 + speedThreat * 0.3 + directionThreat * 0.2);
  }

  private isBallComingToward(ball: Ball): boolean {
    const ballDirection = Vector2D.normalize(ball.velocity);
    const toBot = Vector2D.normalize(
      Vector2D.subtract(this.bot.position, ball.position)
    );
    const dotProduct = Vector2D.dot(ballDirection, toBot);
    return dotProduct > 0.5;
  }

  private clampToBounds(pos: Vec2): Vec2 {
    const padding = GAME_CONFIG.ARENA_PADDING + this.bot.radius;
    return {
      x: Math.max(
        padding,
        Math.min(GAME_CONFIG.CANVAS_WIDTH - padding, pos.x)
      ),
      y: Math.max(
        padding,
        Math.min(GAME_CONFIG.CANVAS_HEIGHT - padding, pos.y)
      ),
    };
  }
}
