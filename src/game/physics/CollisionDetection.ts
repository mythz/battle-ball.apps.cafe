import { Entity, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from './Vector2D';

export class CollisionDetection {
  static circleCollision(e1: Entity, e2: Entity): boolean {
    const distance = Vector2D.distance(e1.position, e2.position);
    return distance < (e1.radius + e2.radius);
  }

  static lineCircleCollision(
    lineStart: Vec2,
    lineEnd: Vec2,
    circle: { position: Vec2; radius: number }
  ): { collides: boolean; point: Vec2 | null } {
    const d = Vector2D.subtract(lineEnd, lineStart);
    const f = Vector2D.subtract(lineStart, circle.position);

    const a = Vector2D.dot(d, d);
    const b = 2 * Vector2D.dot(f, d);
    const c = Vector2D.dot(f, f) - circle.radius * circle.radius;

    let discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return { collides: false, point: null };
    }

    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    if (t1 >= 0 && t1 <= 1) {
      const point = Vector2D.lerp(lineStart, lineEnd, t1);
      return { collides: true, point };
    }

    if (t2 >= 0 && t2 <= 1) {
      const point = Vector2D.lerp(lineStart, lineEnd, t2);
      return { collides: true, point };
    }

    // Also check endpoints
    const distToStart = Vector2D.distance(lineStart, circle.position);
    const distToEnd = Vector2D.distance(lineEnd, circle.position);

    if (distToStart < circle.radius) {
      return { collides: true, point: lineStart };
    }

    if (distToEnd < circle.radius) {
      return { collides: true, point: lineEnd };
    }

    return { collides: false, point: null };
  }

  static pointInCircle(point: Vec2, circle: Entity): boolean {
    const distance = Vector2D.distance(point, circle.position);
    return distance < circle.radius;
  }

  static wallCollision(
    entity: Entity,
    bounds: { left: number; right: number; top: number; bottom: number }
  ): { x: boolean; y: boolean } {
    const hitX =
      entity.position.x - entity.radius < bounds.left ||
      entity.position.x + entity.radius > bounds.right;

    const hitY =
      entity.position.y - entity.radius < bounds.top ||
      entity.position.y + entity.radius > bounds.bottom;

    return { x: hitX, y: hitY };
  }

  static closestPointOnLine(point: Vec2, lineStart: Vec2, lineEnd: Vec2): Vec2 {
    const line = Vector2D.subtract(lineEnd, lineStart);
    const len = Vector2D.magnitude(line);
    if (len === 0) return lineStart;

    const lineNorm = Vector2D.normalize(line);
    const v = Vector2D.subtract(point, lineStart);
    const d = Vector2D.dot(v, lineNorm);
    const t = Math.max(0, Math.min(len, d));

    return Vector2D.add(lineStart, Vector2D.multiply(lineNorm, t));
  }
}
