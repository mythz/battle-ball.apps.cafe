import { Entity, Vector2D as IVector2D } from '../../store/types';
import { Vector2D } from './Vector2D';

export class CollisionDetection {
  static circleCollision(e1: Entity, e2: Entity): boolean {
    const distance = Vector2D.distance(e1.position, e2.position);
    return distance < (e1.radius + e2.radius);
  }

  static lineCircleCollision(
    lineStart: IVector2D,
    lineEnd: IVector2D,
    circle: { position: IVector2D; radius: number }
  ): { collides: boolean; point: IVector2D | null } {
    const line = Vector2D.subtract(lineEnd, lineStart);
    const circleToStart = Vector2D.subtract(circle.position, lineStart);

    const lineLength = Vector2D.magnitude(line);
    if (lineLength === 0) {
      return { collides: false, point: null };
    }

    const lineNorm = Vector2D.normalize(line);
    const projection = Vector2D.dot(circleToStart, lineNorm);

    let closestPoint: IVector2D;

    if (projection <= 0) {
      closestPoint = lineStart;
    } else if (projection >= lineLength) {
      closestPoint = lineEnd;
    } else {
      closestPoint = Vector2D.add(
        lineStart,
        Vector2D.multiply(lineNorm, projection)
      );
    }

    const distance = Vector2D.distance(closestPoint, circle.position);
    const collides = distance <= circle.radius;

    return {
      collides,
      point: collides ? closestPoint : null,
    };
  }

  static pointInCircle(point: IVector2D, circle: Entity): boolean {
    const distance = Vector2D.distance(point, circle.position);
    return distance <= circle.radius;
  }

  static wallCollision(
    entity: Entity,
    bounds: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
  ): { x: boolean; y: boolean } {
    const hitLeft = entity.position.x - entity.radius <= bounds.left;
    const hitRight = entity.position.x + entity.radius >= bounds.right;
    const hitTop = entity.position.y - entity.radius <= bounds.top;
    const hitBottom = entity.position.y + entity.radius >= bounds.bottom;

    return {
      x: hitLeft || hitRight,
      y: hitTop || hitBottom,
    };
  }

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
