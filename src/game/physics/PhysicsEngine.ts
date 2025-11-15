import { Ball, Entity, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from './Vector2D';
import { GAME_CONFIG } from '../../data/constants';

export class BallPhysics {
  static updatePosition(ball: Ball, deltaTime: number): void {
    const dt = deltaTime / 16.67;
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;

    // Update trail
    ball.trailPositions.unshift({ ...ball.position });
    if (ball.trailPositions.length > 10) {
      ball.trailPositions.pop();
    }
  }

  static handleWallBounce(ball: Ball, canvasWidth: number, canvasHeight: number): void {
    const padding = GAME_CONFIG.ARENA_PADDING;
    let bounced = false;

    if (ball.position.x - ball.radius < padding) {
      ball.position.x = padding + ball.radius;
      ball.velocity.x = Math.abs(ball.velocity.x) * 0.98;
      ball.velocity.y *= 0.98;
      bounced = true;
    } else if (ball.position.x + ball.radius > canvasWidth - padding) {
      ball.position.x = canvasWidth - padding - ball.radius;
      ball.velocity.x = -Math.abs(ball.velocity.x) * 0.98;
      ball.velocity.y *= 0.98;
      bounced = true;
    }

    if (ball.position.y - ball.radius < padding) {
      ball.position.y = padding + ball.radius;
      ball.velocity.y = Math.abs(ball.velocity.y) * 0.98;
      ball.velocity.x *= 0.98;
      bounced = true;
    } else if (ball.position.y + ball.radius > canvasHeight - padding) {
      ball.position.y = canvasHeight - padding - ball.radius;
      ball.velocity.y = -Math.abs(ball.velocity.y) * 0.98;
      ball.velocity.x *= 0.98;
      bounced = true;
    }

    if (bounced) {
      // Add slight randomness to prevent predictable patterns
      const randomAngle = (Math.random() - 0.5) * 0.2;
      const velocity = { ...ball.velocity };
      ball.velocity = Vector2D.rotate(velocity, randomAngle);
    }
  }

  static reflectOffEntity(ball: Ball, entity: Entity): void {
    // Calculate normal from entity to ball
    const normal = Vector2D.normalize(Vector2D.subtract(ball.position, entity.position));

    // Reflect velocity
    ball.velocity = Vector2D.reflect(ball.velocity, normal);

    // Push ball outside entity
    const overlap = entity.radius + ball.radius - Vector2D.distance(ball.position, entity.position);
    if (overlap > 0) {
      ball.position = Vector2D.add(ball.position, Vector2D.multiply(normal, overlap + 1));
    }

    // Speed boost
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    const newSpeed = Math.min(currentSpeed * 1.05, GAME_CONFIG.BALL_MAX_SPEED);
    ball.velocity = Vector2D.multiply(Vector2D.normalize(ball.velocity), newSpeed);
  }

  static reflectOffSword(
    ball: Ball,
    swordStart: Vec2,
    swordEnd: Vec2,
    swordOwner: Entity,
    damageMultiplier: number
  ): void {
    // Calculate sword direction and normal
    const swordDir = Vector2D.normalize(Vector2D.subtract(swordEnd, swordStart));
    const swordNormal = { x: -swordDir.y, y: swordDir.x };

    // Reflect ball velocity off sword
    ball.velocity = Vector2D.reflect(ball.velocity, swordNormal);

    // Add sword owner's velocity for extra momentum
    if (Vector2D.magnitude(swordOwner.velocity) > 0) {
      const ownerVel = Vector2D.multiply(swordOwner.velocity, 0.3);
      ball.velocity = Vector2D.add(ball.velocity, ownerVel);
    }

    // Apply damage multiplier as speed boost
    const currentSpeed = Vector2D.magnitude(ball.velocity);
    const newSpeed = Math.min(
      currentSpeed * damageMultiplier * GAME_CONFIG.BALL_ACCELERATION,
      GAME_CONFIG.BALL_MAX_SPEED
    );
    ball.velocity = Vector2D.multiply(Vector2D.normalize(ball.velocity), newSpeed);

    // Push ball away from sword
    const closestPoint = this.closestPointOnSword(ball.position, swordStart, swordEnd);
    const pushDir = Vector2D.normalize(Vector2D.subtract(ball.position, closestPoint));
    ball.position = Vector2D.add(ball.position, Vector2D.multiply(pushDir, ball.radius + 2));
  }

  static applySpin(ball: Ball, direction: Vec2): void {
    const spinAmount = 0.02;
    const perpendicular = { x: -direction.y, y: direction.x };
    ball.velocity = Vector2D.add(ball.velocity, Vector2D.multiply(perpendicular, spinAmount));
  }

  private static closestPointOnSword(point: Vec2, swordStart: Vec2, swordEnd: Vec2): Vec2 {
    const line = Vector2D.subtract(swordEnd, swordStart);
    const len = Vector2D.magnitude(line);
    if (len === 0) return swordStart;

    const lineNorm = Vector2D.normalize(line);
    const v = Vector2D.subtract(point, swordStart);
    const d = Vector2D.dot(v, lineNorm);
    const t = Math.max(0, Math.min(len, d));

    return Vector2D.add(swordStart, Vector2D.multiply(lineNorm, t));
  }
}
