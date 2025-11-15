import { Particle, Vector2D } from '../../store/types';

export class ParticleSystem {
  private particles: Particle[] = [];

  createHitEffect(position: Vector2D, color: string): void {
    const particleCount = 8;
    const now = Date.now();

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      const life = 0.5 + Math.random() * 0.5;

      this.particles.push({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life: 1,
        maxLife: life * 1000,
        size: 4 + Math.random() * 4,
        color,
        birthTime: now,
      });
    }
  }

  createTrailParticle(position: Vector2D, color: string): void {
    const now = Date.now();

    this.particles.push({
      position: { ...position },
      velocity: { x: 0, y: 0 },
      life: 1,
      maxLife: 300,
      size: 3,
      color,
      birthTime: now,
    });
  }

  createDeathEffect(position: Vector2D): void {
    const particleCount = 20;
    const now = Date.now();

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const life = 0.8 + Math.random() * 0.7;

      this.particles.push({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life: 1,
        maxLife: life * 1000,
        size: 6 + Math.random() * 6,
        color: '#ff6b6b',
        birthTime: now,
      });
    }
  }

  update(deltaTime: number): void {
    const now = Date.now();

    // Update all particles
    for (const particle of this.particles) {
      // Update position
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;

      // Apply gravity/friction
      particle.velocity.y += 0.1;
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;

      // Update life
      const age = now - particle.birthTime;
      particle.life = Math.max(0, 1 - age / particle.maxLife);
    }

    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }
}
