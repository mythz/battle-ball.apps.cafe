import { AIBot, Ball, Entity, Vector2D as Vec2, DecisionOutput } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';
import { GAME_CONFIG } from '../../data/constants';

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
    const ballDistance = Vector2D.distance(this.bot.position, ball.position);

    // Calculate if ball is heading toward bot
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const ballVelNorm = Vector2D.normalize(ball.velocity);
    const toBotNorm = Vector2D.normalize(Vector2D.multiply(toBall, -1));
    const dotProduct = Vector2D.dot(ballVelNorm, toBotNorm);

    if (dotProduct > 0.5 && ballDistance < 200) {
      // Ball is coming toward us
      if (ballDistance < 100 && Math.random() < this.difficulty) {
        // Try to block
        this.bot.swordAngle = Vector2D.angleBetween(this.bot.position, ball.position);
        return {
          movement: null,
          shouldBlock: true,
          shouldSwing: ballDistance < this.bot.swordLength + 30
        };
      } else {
        // Evade perpendicular to ball trajectory
        const perpendicular = { x: -ball.velocity.y, y: ball.velocity.x };
        const evadeDir = Vector2D.normalize(perpendicular);
        const evadeDistance = 100;

        this.bot.targetPosition = Vector2D.add(
          this.bot.position,
          Vector2D.multiply(evadeDir, evadeDistance)
        );

        // Clamp to arena bounds
        this.bot.targetPosition = this.clampToArena(this.bot.targetPosition);

        return {
          movement: evadeDir,
          shouldBlock: false,
          shouldSwing: false
        };
      }
    }

    return {
      movement: null,
      shouldBlock: false,
      shouldSwing: false
    };
  }

  private aggressiveBehavior(ball: Ball, allEntities: Entity[]): DecisionOutput {
    // Find nearest opponent
    const opponents = allEntities.filter(e => e.id !== this.bot.id && e.isAlive);
    if (opponents.length === 0) {
      return this.positioningBehavior(allEntities);
    }

    const nearest = opponents.reduce((closest, entity) => {
      const dist = Vector2D.distance(this.bot.position, entity.position);
      const closestDist = Vector2D.distance(this.bot.position, closest.position);
      return dist < closestDist ? entity : closest;
    });

    // Try to hit ball toward nearest opponent
    const ballDistance = Vector2D.distance(this.bot.position, ball.position);
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const toOpponent = Vector2D.subtract(nearest.position, this.bot.position);

    // Angle between ball direction and opponent direction
    const ballAngle = Vector2D.angle(toBall);
    const opponentAngle = Vector2D.angle(toOpponent);
    const angleDiff = Math.abs(ballAngle - opponentAngle);

    if (ballDistance < this.bot.swordLength + 50 && angleDiff < Math.PI / 3) {
      // Ball is in position to hit toward opponent
      this.bot.swordAngle = Vector2D.angleBetween(this.bot.position, nearest.position);

      return {
        movement: null,
        shouldBlock: false,
        shouldSwing: ballDistance < this.bot.swordLength + 30
      };
    } else {
      // Move to intercept ball
      const trajectory = this.predictTrajectory(ball, 30);
      const predictedPos = trajectory[trajectory.length - 1] || ball.position;
      const interceptDist = Math.min(this.bot.swordLength + 20, ballDistance * 0.7);
      const interceptDir = Vector2D.normalize(Vector2D.subtract(predictedPos, this.bot.position));

      this.bot.targetPosition = Vector2D.add(
        this.bot.position,
        Vector2D.multiply(interceptDir, interceptDist)
      );

      this.bot.targetPosition = this.clampToArena(this.bot.targetPosition);
      this.bot.swordAngle = Vector2D.angleBetween(this.bot.position, ball.position);

      return {
        movement: interceptDir,
        shouldBlock: false,
        shouldSwing: false
      };
    }
  }

  private positioningBehavior(allEntities: Entity[]): DecisionOutput {
    // Move toward center of arena, avoiding edges
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;
    const center = { x: centerX, y: centerY };

    // Add some randomness based on difficulty
    const randomOffset = {
      x: (Math.random() - 0.5) * 200 * (1 - this.difficulty),
      y: (Math.random() - 0.5) * 200 * (1 - this.difficulty)
    };

    let targetPos = Vector2D.add(center, randomOffset);

    // Avoid other entities
    const nearbyEntities = allEntities.filter(e => {
      if (e.id === this.bot.id || !e.isAlive) return false;
      const dist = Vector2D.distance(this.bot.position, e.position);
      return dist < 150;
    });

    if (nearbyEntities.length > 0) {
      const avoidance = { x: 0, y: 0 };
      nearbyEntities.forEach(entity => {
        const away = Vector2D.subtract(this.bot.position, entity.position);
        const dist = Vector2D.magnitude(away);
        const strength = (150 - dist) / 150;
        avoidance.x += away.x * strength;
        avoidance.y += away.y * strength;
      });

      targetPos = Vector2D.add(targetPos, Vector2D.multiply(avoidance, 50));
    }

    this.bot.targetPosition = this.clampToArena(targetPos);

    const moveDir = Vector2D.normalize(Vector2D.subtract(this.bot.targetPosition, this.bot.position));

    return {
      movement: moveDir,
      shouldBlock: false,
      shouldSwing: false
    };
  }

  private predictTrajectory(ball: Ball, frames: number): Vec2[] {
    const trajectory: Vec2[] = [];
    const position = { ...ball.position };
    const velocity = { ...ball.velocity };
    const padding = GAME_CONFIG.ARENA_PADDING;

    for (let i = 0; i < frames; i++) {
      position.x += velocity.x;
      position.y += velocity.y;

      // Simple wall bounce prediction
      if (position.x - ball.radius < padding || position.x + ball.radius > GAME_CONFIG.CANVAS_WIDTH - padding) {
        velocity.x *= -0.98;
      }
      if (position.y - ball.radius < padding || position.y + ball.radius > GAME_CONFIG.CANVAS_HEIGHT - padding) {
        velocity.y *= -0.98;
      }

      trajectory.push({ ...position });
    }

    return trajectory;
  }

  private assessThreat(ball: Ball, trajectory: Vec2[]): number {
    let closestDist = Infinity;

    for (const pos of trajectory) {
      const dist = Vector2D.distance(this.bot.position, pos);
      if (dist < closestDist) {
        closestDist = dist;
      }
    }

    const ballSpeed = Vector2D.magnitude(ball.velocity);
    const speedFactor = ballSpeed / GAME_CONFIG.BALL_MAX_SPEED;
    const distanceFactor = Math.max(0, 1 - closestDist / 300);

    // Calculate if ball is heading generally toward bot
    const toBall = Vector2D.subtract(ball.position, this.bot.position);
    const ballVelNorm = Vector2D.normalize(ball.velocity);
    const toBotNorm = Vector2D.normalize(Vector2D.multiply(toBall, -1));
    const dotProduct = Vector2D.dot(ballVelNorm, toBotNorm);
    const directionFactor = Math.max(0, dotProduct);

    return (distanceFactor * 0.5 + speedFactor * 0.2 + directionFactor * 0.3);
  }

  private clampToArena(position: Vec2): Vec2 {
    const padding = GAME_CONFIG.ARENA_PADDING + this.bot.radius;
    return {
      x: Math.max(padding, Math.min(GAME_CONFIG.CANVAS_WIDTH - padding, position.x)),
      y: Math.max(padding, Math.min(GAME_CONFIG.CANVAS_HEIGHT - padding, position.y))
    };
  }
}
