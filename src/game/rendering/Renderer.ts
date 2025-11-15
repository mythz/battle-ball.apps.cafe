import { Player, AIBot, Ball, SwordItem, SkinItem, Particle } from '../../store/types';
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

    // Draw border
    this.ctx.strokeStyle = '#ffffff33';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Draw grid pattern
    this.ctx.strokeStyle = '#ffffff11';
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

    // Draw shadow
    this.ctx.fillStyle = '#00000033';
    this.ctx.beginPath();
    this.ctx.ellipse(
      player.position.x,
      player.position.y + 5,
      player.radius * 0.8,
      player.radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw outer glow
    const gradient = this.ctx.createRadialGradient(
      player.position.x,
      player.position.y,
      0,
      player.position.x,
      player.position.y,
      player.radius * 1.5
    );
    gradient.addColorStop(0, skin.colors.primary + '66');
    gradient.addColorStop(1, skin.colors.primary + '00');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw body
    this.ctx.fillStyle = skin.colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw inner circle
    this.ctx.fillStyle = skin.colors.secondary;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw accent dot
    this.ctx.fillStyle = skin.colors.accent;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw blocking indicator
    if (player.isBlocking) {
      this.ctx.strokeStyle = '#00ffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(player.position.x, player.position.y, player.radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw health bar
    this.drawHealthBar(player);
  }

  drawAIBot(bot: AIBot): void {
    if (!bot.isAlive) return;

    // Draw shadow
    this.ctx.fillStyle = '#00000033';
    this.ctx.beginPath();
    this.ctx.ellipse(
      bot.position.x,
      bot.position.y + 5,
      bot.radius * 0.8,
      bot.radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw body
    this.ctx.fillStyle = COLORS.AI_BOT;
    this.ctx.beginPath();
    this.ctx.arc(bot.position.x, bot.position.y, bot.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw inner circle
    this.ctx.fillStyle = '#c23616';
    this.ctx.beginPath();
    this.ctx.arc(bot.position.x, bot.position.y, bot.radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw blocking indicator
    if (bot.isBlocking) {
      this.ctx.strokeStyle = '#ffaa00';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(bot.position.x, bot.position.y, bot.radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw health bar
    this.drawHealthBar(bot);
  }

  drawBall(ball: Ball): void {
    // Draw trail
    for (let i = 0; i < ball.trailPositions.length; i++) {
      const pos = ball.trailPositions[i];
      const alpha = (ball.trailPositions.length - i) / ball.trailPositions.length;
      const size = ball.radius * (0.5 + alpha * 0.5);

      this.ctx.fillStyle = COLORS.BALL + Math.floor(alpha * 100).toString(16).padStart(2, '0');
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
    gradient.addColorStop(0, COLORS.BALL + 'aa');
    gradient.addColorStop(1, COLORS.BALL + '00');
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
    this.ctx.fillStyle = '#ffffff88';
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
    const startX = entity.position.x;
    const startY = entity.position.y;
    const endX = startX + Math.cos(angle) * sword.length;
    const endY = startY + Math.sin(angle) * sword.length;

    // Draw glow for legendary swords
    if (sword.rarity === 'legendary') {
      this.ctx.strokeStyle = sword.color + '66';
      this.ctx.lineWidth = sword.width + 8;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw sword gradient
    const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, sword.color + '88');
    gradient.addColorStop(0.5, sword.color);
    gradient.addColorStop(1, sword.color + 'cc');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = sword.width;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Draw sword tip
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(endX, endY, sword.width / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawParticles(particles: Particle[]): void {
    for (const particle of particles) {
      const alpha = Math.floor(particle.life * 255).toString(16).padStart(2, '0');
      this.ctx.fillStyle = particle.color + alpha;
      this.ctx.beginPath();
      this.ctx.arc(
        particle.position.x,
        particle.position.y,
        particle.size * particle.life,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  private drawHealthBar(entity: Player | AIBot): void {
    const barWidth = entity.radius * 2;
    const barHeight = 5;
    const x = entity.position.x - barWidth / 2;
    const y = entity.position.y - entity.radius - 15;

    // Background
    this.ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Health fill
    const healthPercent = entity.health / entity.maxHealth;
    const healthColor = healthPercent > 0.5
      ? COLORS.HEALTH_BAR_FILL
      : healthPercent > 0.25
      ? '#f39c12'
      : '#e74c3c';

    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    this.ctx.strokeStyle = '#ffffff44';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, barWidth, barHeight);
  }
}
