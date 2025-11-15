import { Particle, Vector2D as IVector2D } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';

export class ParticleSystem {
  private particles: Particle[] = [];

  createHitEffect(position: IVector2D, color: string): void {
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
        birthTime: Date.now(),
      });
    }
  }

  createTrailParticle(position: IVector2D, color: string): void {
    this.particles.push({
      position: { ...position },
      velocity: { x: 0, y: 0 },
      life: 1,
      maxLife: 300,
      size: 2,
      color,
      birthTime: Date.now(),
    });
  }

  createDeathEffect(position: IVector2D): void {
    const particleCount = 20 + Math.floor(Math.random() * 15);

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
        maxLife: 800 + Math.random() * 500,
        size: 4 + Math.random() * 4,
        color: `hsl(${Math.random() * 60}, 100%, 50%)`,
        birthTime: Date.now(),
      });
    }
  }

  createSwordSwingEffect(start: IVector2D, end: IVector2D, color: string): void {
    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const pos = Vector2D.lerp(start, end, t);

      this.particles.push({
        position: { ...pos },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        life: 1,
        maxLife: 200 + Math.random() * 200,
        size: 2 + Math.random() * 2,
        color,
        birthTime: Date.now(),
      });
    }
  }

  update(deltaTime: number): void {
    const now = Date.now();

    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const age = now - particle.birthTime;

      // Update life
      particle.life = 1 - age / particle.maxLife;

      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      const dt = deltaTime / 16.67;
      particle.position.x += particle.velocity.x * dt;
      particle.position.y += particle.velocity.y * dt;

      // Apply gravity/friction
      particle.velocity.y += 0.1 * dt;
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;
    }
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }
}
