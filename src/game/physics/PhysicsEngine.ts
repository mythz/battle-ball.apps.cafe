import { Ball, Entity, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from './Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class BallPhysics {
  // Update ball position with velocity
  static updatePosition(ball: Ball, deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds
    ball.position.x += ball.velocity.x * dt * 60;
    ball.position.y += ball.velocity.y * dt * 60;
  }

  // Handle wall bounces with slight randomization
  static handleWallBounce(
    ball: Ball,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const padding = GAME_CONFIG.ARENA_PADDING;

    // Check left/right walls
    if (
      ball.position.x - ball.radius <= padding ||
      ball.position.x + ball.radius >= canvasWidth - padding
    ) {
      ball.velocity.x = -ball.velocity.x;
      // Add slight random variation
      ball.velocity.y += (Math.random() - 0.5) * 0.5;

      // Constrain position
      if (ball.position.x - ball.radius <= padding) {
        ball.position.x = padding + ball.radius;
      } else {
        ball.position.x = canvasWidth - padding - ball.radius;
      }
    }

    // Check top/bottom walls
    if (
      ball.position.y - ball.radius <= padding ||
      ball.position.y + ball.radius >= canvasHeight - padding
    ) {
      ball.velocity.y = -ball.velocity.y;
      // Add slight random variation
      ball.velocity.x += (Math.random() - 0.5) * 0.5;

      // Constrain position
      if (ball.position.y - ball.radius <= padding) {
        ball.position.y = padding + ball.radius;
      } else {
        ball.position.y = canvasHeight - padding - ball.radius;
      }
    }

    // Ensure ball doesn't slow down too much from randomization
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    if (currentSpeed < ball.speed * 0.9) {
      ball.velocity = Vector2D.setMagnitude(ball.velocity, ball.speed);
    }
  }

  // Reflect ball off entity (player/AI)
  static reflectOffEntity(ball: Ball, entity: Entity): void {
    // Calculate reflection vector (ball to entity center)
    const normal = Vector2D.normalize(
      Vector2D.subtract(ball.position, entity.position)
    );

    // Reflect velocity
    const dotProduct = Vector2D.dot(ball.velocity, normal);
    const reflection = Vector2D.subtract(
      ball.velocity,
      Vector2D.multiply(normal, 2 * dotProduct)
    );

    ball.velocity = reflection;

    // Push ball away from entity to prevent sticking
    const pushDistance = ball.radius + entity.radius + 2;
    ball.position = Vector2D.add(
      entity.position,
      Vector2D.multiply(normal, pushDistance)
    );

    // Slight speed boost
    ball.speed = Math.min(
      ball.speed * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    ball.velocity = Vector2D.setMagnitude(ball.velocity, ball.speed);
  }

  // Reflect ball off sword with speed boost
  static reflectOffSword(
    ball: Ball,
    swordStart: Vec2,
    swordEnd: Vec2,
    swordOwner: Entity,
    damageMultiplier: number
  ): void {
    // Calculate sword normal
    const swordVec = Vector2D.subtract(swordEnd, swordStart);
    const swordNormal = Vector2D.normalize({
      x: -swordVec.y,
      y: swordVec.x,
    });

    // Determine which side the ball is on
    const toBall = Vector2D.subtract(ball.position, swordStart);
    const side = Vector2D.dot(toBall, swordNormal);
    const normal = side > 0 ? swordNormal : Vector2D.multiply(swordNormal, -1);

    // Reflect velocity
    const dotProduct = Vector2D.dot(ball.velocity, normal);
    const reflection = Vector2D.subtract(
      ball.velocity,
      Vector2D.multiply(normal, 2 * dotProduct)
    );

    ball.velocity = reflection;

    // Apply damage multiplier to speed
    ball.speed = Math.min(
      ball.speed * GAME_CONFIG.BALL_ACCELERATION * damageMultiplier,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    ball.velocity = Vector2D.setMagnitude(ball.velocity, ball.speed);

    // Push ball away from sword
    ball.position = Vector2D.add(
      ball.position,
      Vector2D.multiply(normal, ball.radius + 5)
    );

    ball.lastHitBy = swordOwner.id;
  }

  // Apply slight curve to ball trajectory
  static applySpin(ball: Ball, direction: Vec2): void {
    const spinForce = Vector2D.multiply(direction, 0.1);
    ball.velocity = Vector2D.add(ball.velocity, spinForce);
    ball.velocity = Vector2D.setMagnitude(ball.velocity, ball.speed);
  }

  // Predict ball position after N frames
  static predictPosition(ball: Ball, frames: number): Vec2 {
    const prediction: Vec2 = { ...ball.position };
    const velocity: Vec2 = { ...ball.velocity };

    for (let i = 0; i < frames; i++) {
      prediction.x += velocity.x;
      prediction.y += velocity.y;

      // Simple wall bounce prediction
      if (
        prediction.x - ball.radius <= GAME_CONFIG.ARENA_PADDING ||
        prediction.x + ball.radius >=
          GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ARENA_PADDING
      ) {
        velocity.x = -velocity.x;
      }
      if (
        prediction.y - ball.radius <= GAME_CONFIG.ARENA_PADDING ||
        prediction.y + ball.radius >=
          GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ARENA_PADDING
      ) {
        velocity.y = -velocity.y;
      }
    }

    return prediction;
  }
}
