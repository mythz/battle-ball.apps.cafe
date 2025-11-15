import { GameState, SwordItem, SkinItem } from '../store/types';
import { PlayerEntity } from './entities/Player';
import { AIBotEntity } from './entities/AIBot';
import { BallEntity } from './entities/Ball';
import { GameRenderer } from './rendering/Renderer';
import { ParticleSystem } from './rendering/ParticleSystem';
import { InputManager } from './InputManager';
import { BotAI } from './ai/BotBehavior';
import { CollisionDetection } from './physics/CollisionDetection';
import { BallPhysics } from './physics/PhysicsEngine';
import { Vector2D } from './physics/Vector2D';
import { GAME_CONFIG } from '../data/constants';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

export class GameEngine {
  private gameState: GameState;
  private renderer: GameRenderer;
  private particleSystem: ParticleSystem;
  private inputManager: InputManager;
  private lastFrameTime: number = 0;
  private isRunning: boolean = false;
  private equippedSword: SwordItem;
  private equippedSkin: SkinItem;
  private difficulty: 'easy' | 'medium' | 'hard' = 'medium';

  public onRoundEnd: (playerWon: boolean) => void = () => {};

  constructor(
    canvas: HTMLCanvasElement,
    swordId: string,
    skinId: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ) {
    this.renderer = new GameRenderer(canvas);
    this.particleSystem = new ParticleSystem();
    this.inputManager = new InputManager(canvas);
    this.difficulty = difficulty;

    this.equippedSword = SWORDS.find(s => s.id === swordId) || SWORDS[0];
    this.equippedSkin = SKINS.find(s => s.id === skinId) || SKINS[0];

    this.gameState = {
      phase: 'playing',
      player: null,
      aiBots: [],
      ball: null,
      roundNumber: 1,
      remainingPlayers: 0,
      particles: [],
    };

    this.initializeGame();
  }

  private initializeGame(): void {
    // Create player at bottom center
    const player = new PlayerEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ARENA_PADDING - 100,
      },
      this.equippedSword.id,
      this.equippedSkin.id
    );
    player.setSwordStats(this.equippedSword.length, this.equippedSword.width);

    // Create AI bots at various positions
    const aiBots: AIBotEntity[] = [];
    const difficultyValue = this.difficulty === 'easy' ? 0.3 : this.difficulty === 'medium' ? 0.5 : 0.8;

    for (let i = 0; i < GAME_CONFIG.AI_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / GAME_CONFIG.AI_COUNT;
      const distance = 200;
      const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
      const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

      const bot = new AIBotEntity(
        {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        },
        difficultyValue,
        `ai_${i}`
      );
      aiBots.push(bot);
    }

    // Create ball at center with random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = GAME_CONFIG.BALL_INITIAL_SPEED;
    const ball = new BallEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      },
      {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      }
    );

    this.gameState.player = player;
    this.gameState.aiBots = aiBots;
    this.gameState.ball = ball;
    this.gameState.remainingPlayers = 1 + aiBots.length;
    this.particleSystem.clear();
  }

  start(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (!this.gameState.player || !this.gameState.ball) return;

    this.handleInput();
    this.updateAI(deltaTime);
    this.updatePlayer(deltaTime);
    this.updateAIBots(deltaTime);
    this.updateBall(deltaTime);
    this.checkCollisions();
    this.particleSystem.update(deltaTime);
    this.checkRoundEnd();
  }

  private handleInput(): void {
    if (!this.gameState.player) return;

    const input = this.inputManager.getInput();

    // Movement
    const moveDir = { x: 0, y: 0 };
    if (input.keys.w || input.keys.up) moveDir.y -= 1;
    if (input.keys.s || input.keys.down) moveDir.y += 1;
    if (input.keys.a || input.keys.left) moveDir.x -= 1;
    if (input.keys.d || input.keys.right) moveDir.x += 1;

    if (moveDir.x !== 0 || moveDir.y !== 0) {
      const normalized = Vector2D.normalize(moveDir);
      this.gameState.player.move(normalized, 16.67);
    }

    // Sword angle
    if (input.mouse) {
      this.gameState.player.updateSwordAngle(input.mouse.x, input.mouse.y);
    }

    // Blocking
    if (input.keys.space || (input.mouse && input.mouse.rightButton)) {
      this.gameState.player.block();
    } else {
      this.gameState.player.releaseBlock();
    }

    // Swing
    if ((input.mouse && input.mouse.leftButton) || input.keys.e) {
      this.gameState.player.swing();
    }
  }

  private updateAI(deltaTime: number): void {
    if (!this.gameState.ball) return;

    for (const bot of this.gameState.aiBots) {
      if (!bot.isAlive) continue;

      const ai = new BotAI(bot);
      const decision = ai.decide(this.gameState.ball, this.getAllEntities());

      bot.targetPosition = decision.targetPosition;
      bot.updateSwordAngle(this.gameState.ball);

      if (decision.shouldBlock) {
        bot.block();
      } else {
        bot.releaseBlock();
      }

      if (decision.shouldSwing) {
        bot.swing();
      }
    }
  }

  private updatePlayer(deltaTime: number): void {
    // Player movement is handled in handleInput
  }

  private updateAIBots(deltaTime: number): void {
    for (const bot of this.gameState.aiBots) {
      if (!bot.isAlive) continue;
      bot.moveTowardTarget(deltaTime);
    }
  }

  private updateBall(deltaTime: number): void {
    if (!this.gameState.ball) return;

    BallPhysics.updatePosition(this.gameState.ball, deltaTime);
    BallPhysics.handleWallBounce(
      this.gameState.ball,
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    );
    this.gameState.ball.update(deltaTime);
  }

  private checkCollisions(): void {
    if (!this.gameState.ball || !this.gameState.player) return;

    const ball = this.gameState.ball;
    const allEntities = this.getAllEntities();

    for (const entity of allEntities) {
      if (!entity.isAlive) continue;

      // Check sword collision first
      const swordStart = 'getSwordBase' in entity ? (entity as any).getSwordBase() : entity.position;
      const swordEnd = 'getSwordTip' in entity ? (entity as any).getSwordTip() : entity.position;
      const swordCollision = CollisionDetection.lineCircleCollision(swordStart, swordEnd, {
        position: ball.position,
        radius: ball.radius,
      });

      if (swordCollision.collides) {
        const sword = entity.id === 'player' ? this.equippedSword : SWORDS[0];
        BallPhysics.reflectOffSword(
          ball,
          swordStart,
          swordEnd,
          entity,
          sword.damageMultiplier
        );
        ball.lastHitBy = entity.id;
        this.particleSystem.createHitEffect(ball.position, '#00ff88');
        continue;
      }

      // Check body collision
      if (CollisionDetection.circleCollision(ball, entity)) {
        (entity as any).takeDamage(GAME_CONFIG.DAMAGE_PER_HIT, ball);
        BallPhysics.reflectOffEntity(ball, entity);
        this.particleSystem.createHitEffect(entity.position, '#ff0000');

        if (!entity.isAlive) {
          this.particleSystem.createDeathEffect(entity.position);
          this.gameState.remainingPlayers--;
        }
      }
    }
  }

  private getAllEntities() {
    const entities: any[] = [];
    if (this.gameState.player) entities.push(this.gameState.player);
    entities.push(...this.gameState.aiBots);
    return entities;
  }

  private checkRoundEnd(): void {
    if (this.gameState.remainingPlayers <= 1) {
      this.isRunning = false;

      const aliveEntities = this.getAllEntities().filter(e => e.isAlive);
      const playerWon = aliveEntities.length === 1 && aliveEntities[0].id === 'player';

      setTimeout(() => {
        this.onRoundEnd(playerWon);
      }, 1000);
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawArena();

    // Draw AI bots
    for (const bot of this.gameState.aiBots) {
      if (bot.isAlive) {
        this.renderer.drawAIBot(bot);
        this.renderer.drawSword(bot, SWORDS[0], bot.swordAngle);
      }
    }

    // Draw player
    if (this.gameState.player && this.gameState.player.isAlive) {
      this.renderer.drawPlayer(this.gameState.player, this.equippedSkin);
      this.renderer.drawSword(this.gameState.player, this.equippedSword, this.gameState.player.swordAngle);
    }

    // Draw ball
    if (this.gameState.ball) {
      this.renderer.drawBall(this.gameState.ball);
    }

    // Draw particles
    this.renderer.drawParticles(this.particleSystem.getParticles());
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.gameLoop();
    }
  }

  reset(): void {
    this.initializeGame();
  }

  destroy(): void {
    this.isRunning = false;
    this.inputManager.destroy();
  }
}
