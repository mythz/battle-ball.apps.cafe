import { Entity, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from './Vector2D';

export class CollisionDetection {
  // Circle-circle collision
  static circleCollision(e1: Entity, e2: Entity): boolean {
    const distance = Vector2D.distance(e1.position, e2.position);
    return distance < e1.radius + e2.radius;
  }

  // Line-circle collision (for sword-ball interaction)
  static lineCircleCollision(
    lineStart: Vec2,
    lineEnd: Vec2,
    circle: { position: Vec2; radius: number }
  ): { collides: boolean; point: Vec2 | null } {
    const lineVec = Vector2D.subtract(lineEnd, lineStart);
    const circleVec = Vector2D.subtract(circle.position, lineStart);

    const lineLength = Vector2D.magnitude(lineVec);
    const lineDir = Vector2D.normalize(lineVec);

    // Project circle center onto line
    const projection = Vector2D.dot(circleVec, lineDir);

    // Find closest point on line segment
    let closestPoint: Vec2;

    if (projection <= 0) {
      closestPoint = lineStart;
    } else if (projection >= lineLength) {
      closestPoint = lineEnd;
    } else {
      closestPoint = Vector2D.add(
        lineStart,
        Vector2D.multiply(lineDir, projection)
      );
    }

    // Check distance from closest point to circle center
    const distance = Vector2D.distance(closestPoint, circle.position);

    if (distance <= circle.radius) {
      return { collides: true, point: closestPoint };
    }

    return { collides: false, point: null };
  }

  // Point in circle
  static pointInCircle(point: Vec2, circle: Entity): boolean {
    const distance = Vector2D.distance(point, circle.position);
    return distance <= circle.radius;
  }

  // Wall collision (arena boundaries)
  static wallCollision(
    entity: Entity,
    bounds: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
  ): { x: boolean; y: boolean } {
    return {
      x:
        entity.position.x - entity.radius <= bounds.left ||
        entity.position.x + entity.radius >= bounds.right,
      y:
        entity.position.y - entity.radius <= bounds.top ||
        entity.position.y + entity.radius >= bounds.bottom,
    };
  }

  // Constrain entity within bounds
  static constrainToBounds(
    entity: Entity,
    bounds: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
  ): void {
    if (entity.position.x - entity.radius < bounds.left) {
      entity.position.x = bounds.left + entity.radius;
    }
    if (entity.position.x + entity.radius > bounds.right) {
      entity.position.x = bounds.right - entity.radius;
    }
    if (entity.position.y - entity.radius < bounds.top) {
      entity.position.y = bounds.top + entity.radius;
    }
    if (entity.position.y + entity.radius > bounds.bottom) {
      entity.position.y = bounds.bottom - entity.radius;
    }
  }
}
