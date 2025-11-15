import { Particle, Vector2D as Vec2 } from '../../store/types';
import { Vector2D } from '../physics/Vector2D';

export class ParticleSystem {
  private particles: Particle[] = [];

  createHitEffect(position: Vec2, color: string): void {
    const particleCount = 8 + Math.floor(Math.random() * 4);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };

      this.particles.push({
        position: { ...position },
        velocity,
        life: 1,
        maxLife: 500 + Math.random() * 300,
        size: 3 + Math.random() * 3,
        color,
        birthTime: Date.now()
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
      birthTime: Date.now()
    });
  }

  createDeathEffect(position: Vec2): void {
    const particleCount = 20 + Math.floor(Math.random() * 10);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };

      const colors = ['#ff4757', '#ffa502', '#ffffff', '#fffa65'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        position: { ...position },
        velocity,
        life: 1,
        maxLife: 800 + Math.random() * 400,
        size: 4 + Math.random() * 4,
        color,
        birthTime: Date.now()
      });
    }
  }

  createSwordSwingEffect(start: Vec2, end: Vec2, color: string): void {
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const position = Vector2D.lerp(start, end, t);

      const perpendicular = Vector2D.normalize({
        x: -(end.y - start.y),
        y: end.x - start.x
      });

      const velocity = Vector2D.multiply(perpendicular, 1 + Math.random() * 2);

      this.particles.push({
        position,
        velocity,
        life: 1,
        maxLife: 300,
        size: 2 + Math.random() * 2,
        color,
        birthTime: Date.now()
      });
    }
  }

  update(deltaTime: number): void {
    const now = Date.now();

    this.particles = this.particles.filter(particle => {
      const age = now - particle.birthTime;
      particle.life = 1 - age / particle.maxLife;

      if (particle.life <= 0) {
        return false;
      }

      // Update position
      const dt = deltaTime / 16.67;
      particle.position.x += particle.velocity.x * dt;
      particle.position.y += particle.velocity.y * dt;

      // Apply gravity and drag
      particle.velocity.y += 0.1 * dt;
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;

      return true;
    });
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }
}
