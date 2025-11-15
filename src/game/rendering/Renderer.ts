import { Player, AIBot, Ball, Particle, SwordItem, SkinItem } from '../../store/types';
import { GAME_CONFIG, COLORS } from '../../data/constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawArena(): void {
    const padding = GAME_CONFIG.ARENA_PADDING;

    // Draw arena background
    this.ctx.fillStyle = COLORS.ARENA;
    this.ctx.fillRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Draw arena border
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Draw grid pattern
    this.ctx.strokeStyle = '#1a2332';
    this.ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = padding + gridSize; x < this.canvas.width - padding; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, this.canvas.height - padding);
      this.ctx.stroke();
    }

    for (let y = padding + gridSize; y < this.canvas.height - padding; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(this.canvas.width - padding, y);
      this.ctx.stroke();
    }
  }

  drawPlayer(player: Player, skin: SkinItem): void {
    if (!player.isAlive) return;

    const { position, radius } = player;

    // Draw outer glow
    const gradient = this.ctx.createRadialGradient(
      position.x,
      position.y,
      0,
      position.x,
      position.y,
      radius * 1.5
    );
    gradient.addColorStop(0, skin.colors.primary + '80');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw body
    this.ctx.fillStyle = skin.colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw inner circle
    this.ctx.fillStyle = skin.colors.secondary;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw accent
    this.ctx.fillStyle = skin.colors.accent;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw health bar
    this.drawHealthBar(position.x, position.y - radius - 10, radius * 2, player.health, player.maxHealth);
  }

  drawAIBot(bot: AIBot): void {
    if (!bot.isAlive) return;

    const { position, radius } = bot;

    // Draw outer glow
    const gradient = this.ctx.createRadialGradient(
      position.x,
      position.y,
      0,
      position.x,
      position.y,
      radius * 1.5
    );
    gradient.addColorStop(0, COLORS.AI_BOT + '80');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw body
    this.ctx.fillStyle = COLORS.AI_BOT;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw inner circle
    this.ctx.fillStyle = '#c0392b';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw health bar
    this.drawHealthBar(position.x, position.y - radius - 10, radius * 2, bot.health, bot.maxHealth);
  }

  drawBall(ball: Ball): void {
    // Draw trail
    for (let i = 0; i < ball.trailPositions.length; i++) {
      const pos = ball.trailPositions[i];
      const alpha = 1 - i / ball.trailPositions.length;
      const size = ball.radius * (1 - i / ball.trailPositions.length * 0.5);

      this.ctx.fillStyle = COLORS.BALL + Math.floor(alpha * 50).toString(16).padStart(2, '0');
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw glow
    const gradient = this.ctx.createRadialGradient(
      ball.position.x,
      ball.position.y,
      0,
      ball.position.x,
      ball.position.y,
      ball.radius * 2
    );
    gradient.addColorStop(0, COLORS.BALL);
    gradient.addColorStop(0.5, COLORS.BALL + '80');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, ball.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw main ball
    this.ctx.fillStyle = COLORS.BALL;
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw highlight
    this.ctx.fillStyle = '#ffffff80';
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

  drawSword(entity: Player | AIBot, sword: SwordItem, angle: number): void {
    if (!entity.isAlive) return;

    const startX = entity.position.x;
    const startY = entity.position.y;
    const endX = startX + Math.cos(angle) * sword.length;
    const endY = startY + Math.sin(angle) * sword.length;

    // Draw sword glow for epic/legendary
    if (sword.rarity === 'epic' || sword.rarity === 'legendary') {
      this.ctx.strokeStyle = sword.color + '40';
      this.ctx.lineWidth = sword.width + 6;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw main sword
    const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.3, sword.color);
    gradient.addColorStop(1, sword.color + 'cc');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = sword.width;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Draw highlight
    this.ctx.strokeStyle = '#ffffff60';
    this.ctx.lineWidth = sword.width * 0.3;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  drawParticles(particles: Particle[]): void {
    particles.forEach((particle) => {
      this.ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
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
  }

  private drawHealthBar(x: number, y: number, width: number, health: number, maxHealth: number): void {
    const healthPercent = health / maxHealth;

    // Background
    this.ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    this.ctx.fillRect(x - width / 2, y, width, 5);

    // Health fill
    const healthColor = healthPercent > 0.5 ? COLORS.HEALTH_BAR_FILL : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(x - width / 2, y, width * healthPercent, 5);

    // Border
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - width / 2, y, width, 5);
  }

  drawHUD(remainingPlayers: number, coins: number): void {
    this.ctx.font = 'bold 24px sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Players: ${remainingPlayers}`, 20, 40);

    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Coins: ${coins}`, this.canvas.width - 20, 40);
  }
}
