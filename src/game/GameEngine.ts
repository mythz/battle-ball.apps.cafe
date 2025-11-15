import { Entity } from '../store/types';
import { PlayerEntity } from './entities/Player';
import { AIBotEntity } from './entities/AIBot';
import { BallEntity } from './entities/Ball';
import { GameRenderer } from './rendering/Renderer';
import { ParticleSystem } from './rendering/ParticleSystem';
import { InputManager } from './InputManager';
import { Vector2D } from './physics/Vector2D';
import { CollisionDetection } from './physics/CollisionDetection';
import { BallPhysics } from './physics/PhysicsEngine';
import { BotAI } from './ai/BotBehavior';
import { GAME_CONFIG, DIFFICULTY_SETTINGS } from '../data/constants';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

export class GameEngine {
  private player: PlayerEntity;
  private aiBots: AIBotEntity[] = [];
  private ball!: BallEntity;
  private renderer: GameRenderer;
  private particleSystem: ParticleSystem;
  private inputManager: InputManager;
  private lastFrameTime: number = 0;
  private isRunning: boolean = false;
  private lastAIUpdateTime: number = 0;
  private remainingPlayers: number = 0;
  private difficulty: 'easy' | 'medium' | 'hard';

  // Callback for round end
  onRoundEnd: (playerWon: boolean) => void = () => {};

  constructor(
    canvas: HTMLCanvasElement,
    equippedSwordId: string,
    equippedSkinId: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) {
    this.renderer = new GameRenderer(canvas);
    this.particleSystem = new ParticleSystem();
    this.inputManager = new InputManager(canvas);
    this.difficulty = difficulty;

    // Initialize entities
    this.player = new PlayerEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT - 100,
      },
      equippedSwordId,
      equippedSkinId
    );

    this.initializeAI();
    this.initializeBall();

    this.remainingPlayers = 1 + this.aiBots.length;
  }

  private initializeAI(): void {
    const difficultySettings = DIFFICULTY_SETTINGS[this.difficulty];
    const positions = [
      { x: 200, y: 150 },
      { x: GAME_CONFIG.CANVAS_WIDTH - 200, y: 150 },
      { x: 200, y: GAME_CONFIG.CANVAS_HEIGHT - 150 },
      { x: GAME_CONFIG.CANVAS_WIDTH - 200, y: GAME_CONFIG.CANVAS_HEIGHT - 150 },
    ];

    for (let i = 0; i < GAME_CONFIG.AI_COUNT; i++) {
      const bot = new AIBotEntity(
        positions[i],
        difficultySettings.aiDifficulty,
        `ai_${i}`
      );
      bot.reactionTime = difficultySettings.aiReactionTime;
      this.aiBots.push(bot);
    }
  }

  private initializeBall(): void {
    const angle = Math.random() * Math.PI * 2;
    this.ball = new BallEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      },
      {
        x: Math.cos(angle) * GAME_CONFIG.BALL_INITIAL_SPEED,
        y: Math.sin(angle) * GAME_CONFIG.BALL_INITIAL_SPEED,
      }
    );
  }

  start(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastAIUpdateTime = performance.now();
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
    // 1. Process input
    this.handleInput();

    // 2. Update AI
    const currentTime = performance.now();
    if (currentTime - this.lastAIUpdateTime >= GAME_CONFIG.AI_UPDATE_RATE) {
      this.updateAI();
      this.lastAIUpdateTime = currentTime;
    }

    // 3. Update AI movement
    this.aiBots.forEach((bot) => {
      if (bot.isAlive) {
        bot.moveTowardTarget(deltaTime);
      }
    });

    // 4. Update ball
    this.ball.update(deltaTime);
    BallPhysics.handleWallBounce(
      this.ball,
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    );

    // 5. Check collisions
    this.checkCollisions();

    // 6. Update particles
    this.particleSystem.update(deltaTime);

    // 7. Check win condition
    this.checkRoundEnd();
  }

  private handleInput(): void {
    const input = this.inputManager.getInput();

    if (!this.player.isAlive) return;

    // Movement
    const moveDir = { x: 0, y: 0 };
    if (input.keys.w || input.keys.up) moveDir.y -= 1;
    if (input.keys.s || input.keys.down) moveDir.y += 1;
    if (input.keys.a || input.keys.left) moveDir.x -= 1;
    if (input.keys.d || input.keys.right) moveDir.x += 1;

    if (moveDir.x !== 0 || moveDir.y !== 0) {
      this.player.move(Vector2D.normalize(moveDir), 16);
    }

    // Sword angle
    if (input.mouse) {
      this.player.updateSwordAngle(input.mouse.x, input.mouse.y);
    }

    // Blocking
    if (input.keys.space || input.mouse?.rightButton) {
      this.player.block();
    } else {
      this.player.unblock();
    }

    // Swing
    if (input.mouse?.leftButton || input.keys.e) {
      if (this.player.swing()) {
        const sword = SWORDS.find((s) => s.id === this.player.swordId);
        if (sword) {
          this.particleSystem.createSwordSwingEffect(
            this.player.getSwordBase(),
            this.player.getSwordTip(),
            sword.color
          );
        }
      }
    }
  }

  private updateAI(): void {
    const allEntities = this.getAllEntities();

    this.aiBots.forEach((bot) => {
      if (!bot.isAlive) return;

      const ai = new BotAI(bot);
      const decision = ai.decide(this.ball, allEntities);

      bot.setTargetPosition(decision.targetPosition);
      bot.updateSwordAngle(decision.swordAngle, 0);

      // Handle blocking
      if (decision.shouldBlock) {
        bot.block();
      } else {
        bot.unblock();
      }

      // Handle swinging
      if (decision.shouldSwing) {
        bot.swing();
      }
    });
  }

  private checkCollisions(): void {
    const allEntities = this.getAllEntities();

    allEntities.forEach((entity) => {
      if (!entity.isAlive) return;

      // Ball vs entity body
      if (CollisionDetection.circleCollision(this.ball, entity)) {
        entity.takeDamage(GAME_CONFIG.DAMAGE_PER_HIT);
        BallPhysics.reflectOffEntity(this.ball, entity);
        this.particleSystem.createHitEffect(entity.position, '#ff0000');

        if (!entity.isAlive) {
          this.particleSystem.createDeathEffect(entity.position);
          this.remainingPlayers--;
        }
      }

      // Ball vs sword
      const swordStart =
        entity.id === 'player'
          ? this.player.getSwordBase()
          : (entity as AIBotEntity).getSwordBase();
      const swordEnd =
        entity.id === 'player'
          ? this.player.getSwordTip()
          : (entity as AIBotEntity).getSwordTip();

      const swordCollision = CollisionDetection.lineCircleCollision(
        swordStart,
        swordEnd,
        this.ball
      );

      if (swordCollision.collides) {
        const sword = SWORDS.find((s) => {
          if (entity.id === 'player') {
            return s.id === this.player.swordId;
          } else {
            return s.id === (entity as AIBotEntity).swordId;
          }
        });

        const damageMultiplier = sword?.damageMultiplier || 1.0;

        BallPhysics.reflectOffSword(
          this.ball,
          swordStart,
          swordEnd,
          entity,
          damageMultiplier
        );

        this.particleSystem.createHitEffect(
          swordCollision.point!,
          sword?.color || '#ffffff'
        );
      }
    });
  }

  private checkRoundEnd(): void {
    if (this.remainingPlayers <= 1) {
      this.isRunning = false;

      const winner = this.getAllEntities().find((e) => e.isAlive);
      const playerWon = winner?.id === 'player';

      setTimeout(() => {
        this.onRoundEnd(playerWon);
      }, 1000);
    }
  }

  private getAllEntities(): Entity[] {
    return [this.player, ...this.aiBots];
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawArena();

    // Draw AI bots
    this.aiBots.forEach((bot) => {
      if (bot.isAlive) {
        this.renderer.drawAIBot(bot);

        const sword = SWORDS.find((s) => s.id === bot.swordId) || SWORDS[0];
        this.renderer.drawSword(bot, sword, bot.swordAngle);
      }
    });

    // Draw player
    if (this.player.isAlive) {
      const skin =
        SKINS.find((s) => s.id === this.player.skinId) || SKINS[0];
      const sword =
        SWORDS.find((s) => s.id === this.player.swordId) || SWORDS[0];

      this.renderer.drawPlayer(this.player, skin);
      this.renderer.drawSword(this.player, sword, this.player.swordAngle);
    }

    // Draw ball
    this.renderer.drawBall(this.ball);

    // Draw particles
    this.renderer.drawParticles(this.particleSystem.getParticles());
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    if (!this.isRunning) {
      this.lastFrameTime = performance.now();
      this.start();
    }
  }

  reset(equippedSwordId: string, equippedSkinId: string): void {
    // Reset player
    this.player = new PlayerEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT - 100,
      },
      equippedSwordId,
      equippedSkinId
    );

    // Reset AI
    this.aiBots = [];
    this.initializeAI();

    // Reset ball
    this.initializeBall();

    // Reset particles
    this.particleSystem.clear();

    this.remainingPlayers = 1 + this.aiBots.length;
  }

  destroy(): void {
    this.isRunning = false;
    this.inputManager.destroy();
  }
}
