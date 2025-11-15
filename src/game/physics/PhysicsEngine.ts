import { Ball, Entity, Vector2D as IVector2D } from '../../store/types';
import { Vector2D } from './Vector2D';
import { CollisionDetection } from './CollisionDetection';
import { GAME_CONFIG } from '../../data/constants';

export class BallPhysics {
  // Update ball position with velocity
  static updatePosition(ball: Ball, deltaTime: number): void {
    const dt = deltaTime / 16.67; // Normalize to 60fps
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;

    // Update trail
    ball.trailPositions.unshift({ ...ball.position });
    if (ball.trailPositions.length > GAME_CONFIG.BALL_TRAIL_LENGTH) {
      ball.trailPositions.pop();
    }
  }

  // Handle wall bounces with slight randomization
  static handleWallBounce(ball: Ball, canvasWidth: number, canvasHeight: number): void {
    const padding = GAME_CONFIG.ARENA_PADDING;
    let bounced = false;

    // Left/Right walls
    if (ball.position.x - ball.radius < padding) {
      ball.position.x = padding + ball.radius;
      ball.velocity.x = Math.abs(ball.velocity.x) * (0.95 + Math.random() * 0.1);
      bounced = true;
    } else if (ball.position.x + ball.radius > canvasWidth - padding) {
      ball.position.x = canvasWidth - padding - ball.radius;
      ball.velocity.x = -Math.abs(ball.velocity.x) * (0.95 + Math.random() * 0.1);
      bounced = true;
    }

    // Top/Bottom walls
    if (ball.position.y - ball.radius < padding) {
      ball.position.y = padding + ball.radius;
      ball.velocity.y = Math.abs(ball.velocity.y) * (0.95 + Math.random() * 0.1);
      bounced = true;
    } else if (ball.position.y + ball.radius > canvasHeight - padding) {
      ball.position.y = canvasHeight - padding - ball.radius;
      ball.velocity.y = -Math.abs(ball.velocity.y) * (0.95 + Math.random() * 0.1);
      bounced = true;
    }

    // Add slight randomness to prevent perfect loops
    if (bounced) {
      const randomAngle = (Math.random() - 0.5) * 0.1;
      const rotated = Vector2D.rotate(ball.velocity, randomAngle);
      ball.velocity.x = rotated.x;
      ball.velocity.y = rotated.y;
    }
  }

  // Reflect ball off entity (player/AI)
  static reflectOffEntity(ball: Ball, entity: Entity): void {
    // Calculate normal from entity center to ball
    const normal = Vector2D.subtract(ball.position, entity.position);
    const reflected = CollisionDetection.reflect(ball.velocity, normal);

    ball.velocity.x = reflected.x;
    ball.velocity.y = reflected.y;

    // Add slight speed boost
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    const newSpeed = Math.min(
      currentSpeed * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    const normalized = Vector2D.normalize(ball.velocity);
    ball.velocity.x = normalized.x * newSpeed;
    ball.velocity.y = normalized.y * newSpeed;

    // Push ball away from entity to prevent multiple collisions
    const pushDirection = Vector2D.normalize(normal);
    const pushDistance = entity.radius + ball.radius + 2;
    ball.position = Vector2D.add(
      entity.position,
      Vector2D.multiply(pushDirection, pushDistance)
    );
  }

  // Reflect ball off sword with speed boost
  static reflectOffSword(
    ball: Ball,
    swordStart: IVector2D,
    swordEnd: IVector2D,
    swordOwner: Entity,
    damageMultiplier: number
  ): void {
    // Calculate sword normal (perpendicular to sword)
    const swordVec = Vector2D.subtract(swordEnd, swordStart);
    const swordNormal = new Vector2D(-swordVec.y, swordVec.x);

    // Reflect ball velocity
    const reflected = CollisionDetection.reflect(ball.velocity, swordNormal);

    // Apply damage multiplier to speed
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    const newSpeed = Math.min(
      currentSpeed * GAME_CONFIG.BALL_ACCELERATION * damageMultiplier,
      GAME_CONFIG.BALL_MAX_SPEED
    );

    const normalized = Vector2D.normalize(reflected);
    ball.velocity.x = normalized.x * newSpeed;
    ball.velocity.y = normalized.y * newSpeed;

    // Mark who last hit the ball
    ball.lastHitBy = swordOwner.id;

    // Push ball away from sword
    const pushDirection = Vector2D.normalize(swordNormal);
    ball.position = Vector2D.add(
      ball.position,
      Vector2D.multiply(pushDirection, ball.radius + 2)
    );
  }

  // Add slight curve to ball trajectory
  static applySpin(ball: Ball, direction: IVector2D): void {
    const spin = Vector2D.multiply(direction, 0.1);
    ball.velocity.x += spin.x;
    ball.velocity.y += spin.y;

    // Limit speed
    const speed = Vector2D.magnitude(ball.velocity);
    if (speed > GAME_CONFIG.BALL_MAX_SPEED) {
      const normalized = Vector2D.normalize(ball.velocity);
      ball.velocity.x = normalized.x * GAME_CONFIG.BALL_MAX_SPEED;
      ball.velocity.y = normalized.y * GAME_CONFIG.BALL_MAX_SPEED;
    }
  }
}
