import { Player, AIBot, Ball, Particle, SwordItem, SkinItem } from '../../store/types';
import { GAME_CONFIG, COLORS } from '../../data/constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawArena(): void {
    const padding = GAME_CONFIG.ARENA_PADDING;

    // Draw background
    this.ctx.fillStyle = COLORS.ARENA;
    this.ctx.fillRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Draw border
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(
      padding,
      padding,
      this.canvas.width - padding * 2,
      this.canvas.height - padding * 2
    );

    // Draw grid pattern
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

    // Draw body
    this.ctx.save();

    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      player.position.x,
      player.position.y,
      player.radius * 0.5,
      player.position.x,
      player.position.y,
      player.radius * 1.5
    );
    gradient.addColorStop(0, skin.colors.primary);
    gradient.addColorStop(0.7, skin.colors.secondary);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Main body
    this.ctx.fillStyle = skin.colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner circle
    this.ctx.fillStyle = skin.colors.secondary;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Accent
    this.ctx.fillStyle = skin.colors.accent;
    this.ctx.beginPath();
    this.ctx.arc(player.position.x, player.position.y, player.radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // Draw health bar
    this.drawHealthBar(player.position.x, player.position.y - player.radius - 10, player.health, player.maxHealth);
  }

  drawAIBot(bot: AIBot): void {
    if (!bot.isAlive) return;

    // Draw body
    this.ctx.save();

    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      bot.position.x,
      bot.position.y,
      bot.radius * 0.5,
      bot.position.x,
      bot.position.y,
      bot.radius * 1.5
    );
    gradient.addColorStop(0, COLORS.AI_BOT);
    gradient.addColorStop(0.7, '#cc3a47');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(bot.position.x, bot.position.y, bot.radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Main body
    this.ctx.fillStyle = COLORS.AI_BOT;
    this.ctx.beginPath();
    this.ctx.arc(bot.position.x, bot.position.y, bot.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner circle
    this.ctx.fillStyle = '#ff6b7a';
    this.ctx.beginPath();
    this.ctx.arc(bot.position.x, bot.position.y, bot.radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // Draw health bar
    this.drawHealthBar(bot.position.x, bot.position.y - bot.radius - 10, bot.health, bot.maxHealth);
  }

  drawBall(ball: Ball): void {
    // Draw trail
    this.ctx.save();
    ball.trailPositions.forEach((pos, index) => {
      const alpha = (1 - index / ball.trailPositions.length) * 0.5;
      const size = ball.radius * (1 - index / ball.trailPositions.length * 0.5);

      this.ctx.fillStyle = `rgba(255, 165, 2, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();

    // Draw main ball
    this.ctx.save();

    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      ball.position.x,
      ball.position.y,
      ball.radius * 0.3,
      ball.position.x,
      ball.position.y,
      ball.radius * 2
    );
    gradient.addColorStop(0, COLORS.BALL);
    gradient.addColorStop(0.5, '#ff8c42');
    gradient.addColorStop(1, 'rgba(255, 165, 2, 0)');

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
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(
      ball.position.x - ball.radius * 0.3,
      ball.position.y - ball.radius * 0.3,
      ball.radius * 0.4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.restore();
  }

  drawSword(entity: Player | AIBot, sword: SwordItem, angle: number): void {
    if (!entity.isAlive) return;

    this.ctx.save();
    this.ctx.translate(entity.position.x, entity.position.y);
    this.ctx.rotate(angle);

    // Sword glow (for epic/legendary)
    if (sword.rarity === 'epic' || sword.rarity === 'legendary') {
      const glowGradient = this.ctx.createLinearGradient(0, 0, sword.length, 0);
      glowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      glowGradient.addColorStop(0.5, sword.color + '33');
      glowGradient.addColorStop(1, sword.color + '66');

      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(-5, -sword.width - 2, sword.length + 10, sword.width * 2 + 4);
    }

    // Sword gradient
    const gradient = this.ctx.createLinearGradient(0, 0, sword.length, 0);
    gradient.addColorStop(0, '#555');
    gradient.addColorStop(0.1, sword.color);
    gradient.addColorStop(0.9, sword.color);
    gradient.addColorStop(1, '#888');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, -sword.width / 2, sword.length, sword.width);

    // Sword edge highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillRect(0, -sword.width / 2, sword.length, 2);

    // Handle
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(-8, -sword.width, 8, sword.width * 2);

    this.ctx.restore();
  }

  drawParticles(particles: Particle[]): void {
    this.ctx.save();

    particles.forEach(particle => {
      const alpha = particle.life;
      const size = particle.size * particle.life;

      this.ctx.fillStyle = particle.color.includes('rgba')
        ? particle.color
        : particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');

      this.ctx.beginPath();
      this.ctx.arc(particle.position.x, particle.position.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  private drawHealthBar(x: number, y: number, health: number, maxHealth: number): void {
    const barWidth = 40;
    const barHeight = 5;
    const healthPercent = health / maxHealth;

    // Background
    this.ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    this.ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    // Health
    const healthColor = healthPercent > 0.5 ? COLORS.HEALTH_BAR_FILL : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(x - barWidth / 2, y, barWidth * healthPercent, barHeight);

    // Border
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
  }

  drawHUD(remainingPlayers: number, coins: number): void {
    this.ctx.save();
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;

    // Remaining players
    const playersText = `Players: ${remainingPlayers}`;
    this.ctx.strokeText(playersText, 20, 30);
    this.ctx.fillText(playersText, 20, 30);

    // Coins (top right)
    const coinsText = `Coins: ${coins}`;
    const textWidth = this.ctx.measureText(coinsText).width;
    this.ctx.strokeText(coinsText, this.canvas.width - textWidth - 20, 30);
    this.ctx.fillText(coinsText, this.canvas.width - textWidth - 20, 30);

    this.ctx.restore();
  }
}
