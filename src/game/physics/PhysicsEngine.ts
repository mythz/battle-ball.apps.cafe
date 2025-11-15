import { Ball, Entity, Vector2D as IVector2D } from '../../store/types';
import { Vector2D } from './Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class BallPhysics {
  static updatePosition(ball: Ball, deltaTime: number): void {
    const dt = deltaTime / 16.67; // Normalize to 60 FPS
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
  }

  static handleWallBounce(
    ball: Ball,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const padding = GAME_CONFIG.ARENA_PADDING;
    let bounced = false;

    // Left/right walls
    if (
      ball.position.x - ball.radius <= padding ||
      ball.position.x + ball.radius >= canvasWidth - padding
    ) {
      ball.velocity.x *= -1;
      // Add slight randomization
      ball.velocity.y += (Math.random() - 0.5) * 0.5;
      bounced = true;

      // Constrain position
      if (ball.position.x - ball.radius <= padding) {
        ball.position.x = padding + ball.radius;
      } else {
        ball.position.x = canvasWidth - padding - ball.radius;
      }
    }

    // Top/bottom walls
    if (
      ball.position.y - ball.radius <= padding ||
      ball.position.y + ball.radius >= canvasHeight - padding
    ) {
      ball.velocity.y *= -1;
      // Add slight randomization
      ball.velocity.x += (Math.random() - 0.5) * 0.5;
      bounced = true;

      // Constrain position
      if (ball.position.y - ball.radius <= padding) {
        ball.position.y = padding + ball.radius;
      } else {
        ball.position.y = canvasHeight - padding - ball.radius;
      }
    }

    // Normalize speed if bounced
    if (bounced) {
      const currentSpeed = Vector2D.magnitude(ball.velocity);
      const normalized = Vector2D.normalize(ball.velocity);
      ball.velocity.x = normalized.x * currentSpeed;
      ball.velocity.y = normalized.y * currentSpeed;
    }
  }

  static reflectOffEntity(ball: Ball, entity: Entity): void {
    // Calculate collision normal
    const normal = Vector2D.subtract(ball.position, entity.position);
    const normalizedNormal = Vector2D.normalize(normal);

    // Reflect velocity
    const dot = Vector2D.dot(ball.velocity, normalizedNormal);
    ball.velocity.x = ball.velocity.x - 2 * dot * normalizedNormal.x;
    ball.velocity.y = ball.velocity.y - 2 * dot * normalizedNormal.y;

    // Add slight randomization
    ball.velocity.x += (Math.random() - 0.5) * 0.5;
    ball.velocity.y += (Math.random() - 0.5) * 0.5;

    // Separate ball from entity
    const distance = Vector2D.distance(ball.position, entity.position);
    const overlap = ball.radius + entity.radius - distance;
    if (overlap > 0) {
      ball.position.x += normalizedNormal.x * overlap;
      ball.position.y += normalizedNormal.y * overlap;
    }

    // Slightly increase speed
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    const newSpeed = Math.min(
      currentSpeed * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    const normalized = Vector2D.normalize(ball.velocity);
    ball.velocity.x = normalized.x * newSpeed;
    ball.velocity.y = normalized.y * newSpeed;
    ball.speed = newSpeed;
  }

  static reflectOffSword(
    ball: Ball,
    swordStart: IVector2D,
    swordEnd: IVector2D,
    swordOwner: Entity,
    damageMultiplier: number
  ): void {
    // Calculate sword normal (perpendicular to sword)
    const swordVector = Vector2D.subtract(swordEnd, swordStart);
    const swordNormal = Vector2D.normalize({
      x: -swordVector.y,
      y: swordVector.x,
    });

    // Reflect velocity off sword
    const dot = Vector2D.dot(ball.velocity, swordNormal);
    ball.velocity.x = ball.velocity.x - 2 * dot * swordNormal.x;
    ball.velocity.y = ball.velocity.y - 2 * dot * swordNormal.y;

    // Add owner's influence (hit direction away from owner)
    const awayFromOwner = Vector2D.subtract(ball.position, swordOwner.position);
    const awayNormalized = Vector2D.normalize(awayFromOwner);

    ball.velocity.x += awayNormalized.x * 1.5;
    ball.velocity.y += awayNormalized.y * 1.5;

    // Boost speed based on damage multiplier
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    const newSpeed = Math.min(
      currentSpeed * GAME_CONFIG.BALL_ACCELERATION * damageMultiplier,
      GAME_CONFIG.BALL_MAX_SPEED
    );

    const normalized = Vector2D.normalize(ball.velocity);
    ball.velocity.x = normalized.x * newSpeed;
    ball.velocity.y = normalized.y * newSpeed;
    ball.speed = newSpeed;
  }

  static applySpin(ball: Ball, direction: IVector2D): void {
    const spinForce = 0.1;
    ball.velocity.x += direction.x * spinForce;
    ball.velocity.y += direction.y * spinForce;

    // Limit speed
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    if (currentSpeed > GAME_CONFIG.BALL_MAX_SPEED) {
      const normalized = Vector2D.normalize(ball.velocity);
      ball.velocity.x = normalized.x * GAME_CONFIG.BALL_MAX_SPEED;
      ball.velocity.y = normalized.y * GAME_CONFIG.BALL_MAX_SPEED;
    }
  }
}
