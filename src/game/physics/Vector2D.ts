import { Vector2D as Vec2 } from '../../store/types';

export class Vector2D {
  static add(v1: Vec2, v2: Vec2): Vec2 {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  static subtract(v1: Vec2, v2: Vec2): Vec2 {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  static multiply(v: Vec2, scalar: number): Vec2 {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  static magnitude(v: Vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static normalize(v: Vec2): Vec2 {
    const mag = Vector2D.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  }

  static distance(v1: Vec2, v2: Vec2): number {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static dot(v1: Vec2, v2: Vec2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static angle(v: Vec2): number {
    return Math.atan2(v.y, v.x);
  }

  static angleBetween(v1: Vec2, v2: Vec2): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }

  static rotate(v: Vec2, angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos
    };
  }

  static lerp(v1: Vec2, v2: Vec2, t: number): Vec2 {
    return {
      x: v1.x + (v2.x - v1.x) * t,
      y: v1.y + (v2.y - v1.y) * t
    };
  }

  static reflect(v: Vec2, normal: Vec2): Vec2 {
    const dot = Vector2D.dot(v, normal);
    return {
      x: v.x - 2 * dot * normal.x,
      y: v.y - 2 * dot * normal.y
    };
  }

  static clamp(v: Vec2, min: number, max: number): Vec2 {
    const mag = Vector2D.magnitude(v);
    if (mag < min) return Vector2D.multiply(Vector2D.normalize(v), min);
    if (mag > max) return Vector2D.multiply(Vector2D.normalize(v), max);
    return v;
  }
}
