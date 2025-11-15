import { Vector2D as IVector2D } from '../../store/types';

export class Vector2D implements IVector2D {
  constructor(public x: number, public y: number) {}

  static add(v1: IVector2D, v2: IVector2D): Vector2D {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1: IVector2D, v2: IVector2D): Vector2D {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  static multiply(v: IVector2D, scalar: number): Vector2D {
    return new Vector2D(v.x * scalar, v.y * scalar);
  }

  static magnitude(v: IVector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static normalize(v: IVector2D): Vector2D {
    const mag = Vector2D.magnitude(v);
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(v.x / mag, v.y / mag);
  }

  static distance(v1: IVector2D, v2: IVector2D): number {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static dot(v1: IVector2D, v2: IVector2D): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static angle(v: IVector2D): number {
    return Math.atan2(v.y, v.x);
  }

  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  static rotate(v: IVector2D, angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      v.x * cos - v.y * sin,
      v.x * sin + v.y * cos
    );
  }

  static lerp(v1: IVector2D, v2: IVector2D, t: number): Vector2D {
    return new Vector2D(
      v1.x + (v2.x - v1.x) * t,
      v1.y + (v2.y - v1.y) * t
    );
  }

  static angleBetween(v1: IVector2D, v2: IVector2D): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }

  static limit(v: IVector2D, max: number): Vector2D {
    const mag = Vector2D.magnitude(v);
    if (mag > max) {
      return Vector2D.multiply(Vector2D.normalize(v), max);
    }
    return new Vector2D(v.x, v.y);
  }

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static random(minX: number, maxX: number, minY: number, maxY: number): Vector2D {
    return new Vector2D(
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
    );
  }
}
