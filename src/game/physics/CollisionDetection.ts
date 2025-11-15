import { Entity, Vector2D as IVector2D, CollisionResult } from '../../store/types';
import { Vector2D } from './Vector2D';

export class CollisionDetection {
  // Circle-circle collision
  static circleCollision(e1: Entity, e2: Entity): boolean {
    const distance = Vector2D.distance(e1.position, e2.position);
    return distance < (e1.radius + e2.radius);
  }

  // Line-circle collision (for sword-ball interaction)
  static lineCircleCollision(
    lineStart: IVector2D,
    lineEnd: IVector2D,
    circle: { position: IVector2D; radius: number }
  ): CollisionResult {
    // Vector from line start to circle center
    const lineVec = Vector2D.subtract(lineEnd, lineStart);
    const circleVec = Vector2D.subtract(circle.position, lineStart);

    // Project circle center onto line
    const lineLength = Vector2D.magnitude(lineVec);
    if (lineLength === 0) {
      const dist = Vector2D.distance(lineStart, circle.position);
      return {
        collides: dist <= circle.radius,
        point: dist <= circle.radius ? { ...lineStart } : null,
      };
    }

    const lineDir = Vector2D.normalize(lineVec);
    const projection = Vector2D.dot(circleVec, lineDir);

    // Clamp projection to line segment
    const clampedProjection = Math.max(0, Math.min(lineLength, projection));

    // Find closest point on line segment
    const closestPoint = Vector2D.add(
      lineStart,
      Vector2D.multiply(lineDir, clampedProjection)
    );

    // Check distance from closest point to circle center
    const distance = Vector2D.distance(closestPoint, circle.position);

    return {
      collides: distance <= circle.radius,
      point: distance <= circle.radius ? closestPoint : null,
    };
  }

  // Point in circle
  static pointInCircle(point: IVector2D, circle: Entity): boolean {
    const distance = Vector2D.distance(point, circle.position);
    return distance <= circle.radius;
  }

  // Wall collision (arena boundaries)
  static wallCollision(
    entity: Entity,
    bounds: { left: number; right: number; top: number; bottom: number }
  ): { x: boolean; y: boolean } {
    const x =
      entity.position.x - entity.radius < bounds.left ||
      entity.position.x + entity.radius > bounds.right;
    const y =
      entity.position.y - entity.radius < bounds.top ||
      entity.position.y + entity.radius > bounds.bottom;

    return { x, y };
  }

  // Get reflection vector off a surface normal
  static reflect(velocity: IVector2D, normal: IVector2D): Vector2D {
    const normalizedNormal = Vector2D.normalize(normal);
    const dot = Vector2D.dot(velocity, normalizedNormal);
    return Vector2D.subtract(
      velocity,
      Vector2D.multiply(normalizedNormal, 2 * dot)
    );
  }
}
