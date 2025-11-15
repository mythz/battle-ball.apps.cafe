import { Particle, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';

export class ParticleSystem {
  private particles: Particle[] = [];

  createHitEffect(position: Vec2, color: string): void {
    const particleCount = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;

      this.particles.push({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life: 1,
        maxLife: 500 + Math.random() * 300,
        size: 3 + Math.random() * 3,
        color,
        birthTime: performance.now(),
      });
    }
  }

  createTrailParticle(position: Vec2, color: string): void {
    this.particles.push({
      position: { ...position },
      velocity: { x: 0, y: 0 },
      life: 1,
      maxLife: 200,
      size: 2,
      color,
      birthTime: performance.now(),
    });
  }

  createDeathEffect(position: Vec2): void {
    const particleCount = 20 + Math.floor(Math.random() * 10);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;

      this.particles.push({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life: 1,
        maxLife: 800 + Math.random() * 400,
        size: 4 + Math.random() * 4,
        color: '#ff4757',
        birthTime: performance.now(),
      });
    }
  }

  createSwordSwingEffect(start: Vec2, end: Vec2, color: string): void {
    const particleCount = 5;
    const direction = Vector2D.subtract(end, start);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const position = Vector2D.lerp(start, end, t);
      const perpendicular = Vector2D.normalize({
        x: -direction.y,
        y: direction.x,
      });

      this.particles.push({
        position,
        velocity: Vector2D.multiply(perpendicular, (Math.random() - 0.5) * 2),
        life: 1,
        maxLife: 300,
        size: 2,
        color,
        birthTime: performance.now(),
      });
    }
  }

  update(_deltaTime: number): void {
    const now = performance.now();

    // Update all particles
    this.particles.forEach((particle) => {
      const age = now - particle.birthTime;
      particle.life = 1 - age / particle.maxLife;

      // Update position with velocity and gravity
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.velocity.y += 0.1; // Gravity

      // Slow down velocity
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;
    });

    // Remove dead particles
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }
}
