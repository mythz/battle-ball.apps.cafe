import {
  Player,
  AIBot,
  Ball,
  Particle,
  SwordItem,
  SkinItem,
} from '../../store/types';
import { GAME_CONFIG, COLORS } from '../../data/constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawArena(): void {
    const padding = GAME_CONFIG.ARENA_PADDING;

    // Arena background
    this.ctx.fillStyle = COLORS.ARENA;
    this.ctx.fillRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Arena border
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Grid pattern (optional)
    this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    this.ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = padding; x < this.canvas.width - padding; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, this.canvas.height - padding);
      this.ctx.stroke();
    }
    for (let y = padding; y < this.canvas.height - padding; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(this.canvas.width - padding, y);
      this.ctx.stroke();
    }
  }

  drawPlayer(player: Player, skin: SkinItem): void {
    if (!player.isAlive) return;

    const { position, radius, health, maxHealth } = player;

    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(position.x + 5, position.y + 5, radius, radius * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Glow effect for player
    const gradient = this.ctx.createRadialGradient(
      position.x,
      position.y,
      0,
      position.x,
      position.y,
      radius * 1.5
    );
    gradient.addColorStop(0, skin.colors.primary);
    gradient.addColorStop(0.7, skin.colors.secondary);
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Main body
    this.ctx.fillStyle = skin.colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner circle
    this.ctx.fillStyle = skin.colors.secondary;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
    this.ctx.fill();

    // Accent dot
    this.ctx.fillStyle = skin.colors.accent;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Health bar
    this.drawHealthBar(position.x, position.y - radius - 10, health, maxHealth);

    // Blocking indicator
    if (player.isBlocking) {
      this.ctx.strokeStyle = '#00d2ff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawAIBot(bot: AIBot): void {
    if (!bot.isAlive) return;

    const { position, radius, health, maxHealth } = bot;

    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(position.x + 5, position.y + 5, radius, radius * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Main body
    this.ctx.fillStyle = COLORS.AI_BOT;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner circle
    this.ctx.fillStyle = '#e35f6c';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
    this.ctx.fill();

    // Accent
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Health bar
    this.drawHealthBar(position.x, position.y - radius - 10, health, maxHealth);

    // Blocking indicator
    if (bot.isBlocking) {
      this.ctx.strokeStyle = '#00d2ff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawBall(ball: Ball): void {
    // Trail effect
    const trail = ball.trailPositions;
    trail.forEach((pos, index) => {
      const alpha = (index / trail.length) * 0.5;
      const size = (index / trail.length) * ball.radius;

      this.ctx.fillStyle = `rgba(255, 165, 2, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Glow
    const gradient = this.ctx.createRadialGradient(
      ball.position.x,
      ball.position.y,
      0,
      ball.position.x,
      ball.position.y,
      ball.radius * 2
    );
    gradient.addColorStop(0, '#ffa502');
    gradient.addColorStop(0.5, '#ff6348');
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, ball.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Main ball
    this.ctx.fillStyle = COLORS.BALL;
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Highlight
    this.ctx.fillStyle = '#ffe66d';
    this.ctx.beginPath();
    this.ctx.arc(
      ball.position.x - ball.radius * 0.3,
      ball.position.y - ball.radius * 0.3,
      ball.radius * 0.4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  drawSword(
    entity: Player | AIBot,
    sword: SwordItem,
    angle: number
  ): void {
    if (!entity.isAlive) return;

    const baseX = entity.position.x + Math.cos(angle) * 5;
    const baseY = entity.position.y + Math.sin(angle) * 5;
    const tipX = entity.position.x + Math.cos(angle) * sword.length;
    const tipY = entity.position.y + Math.sin(angle) * sword.length;

    // Sword glow for legendary items
    if (sword.rarity === 'legendary') {
      this.ctx.strokeStyle = sword.color;
      this.ctx.lineWidth = sword.width + 8;
      this.ctx.globalAlpha = 0.3;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(baseX, baseY);
      this.ctx.lineTo(tipX, tipY);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }

    // Main sword
    const gradient = this.ctx.createLinearGradient(baseX, baseY, tipX, tipY);
    gradient.addColorStop(0, '#666');
    gradient.addColorStop(0.3, sword.color);
    gradient.addColorStop(1, this.lightenColor(sword.color, 40));

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = sword.width;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(baseX, baseY);
    this.ctx.lineTo(tipX, tipY);
    this.ctx.stroke();

    // Sword edge highlight
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(baseX, baseY);
    this.ctx.lineTo(tipX, tipY);
    this.ctx.stroke();
  }

  drawParticles(particles: Particle[]): void {
    particles.forEach((particle) => {
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(
        particle.position.x,
        particle.position.y,
        particle.size * particle.life,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  private drawHealthBar(
    x: number,
    y: number,
    health: number,
    maxHealth: number
  ): void {
    const width = 40;
    const height = 5;
    const healthPercent = health / maxHealth;

    // Background
    this.ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    this.ctx.fillRect(x - width / 2, y, width, height);

    // Health fill
    this.ctx.fillStyle = healthPercent > 0.5 ? COLORS.HEALTH_BAR_FILL : '#e74c3c';
    this.ctx.fillRect(x - width / 2, y, width * healthPercent, height);

    // Border
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - width / 2, y, width, height);
  }

  private lightenColor(color: string, amount: number): string {
    // Simple color lightening (works for hex colors)
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
