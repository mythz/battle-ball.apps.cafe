import { Vector2D as Vec2 } from '../store/types';
import { PlayerEntity } from './entities/Player';
import { AIBotEntity } from './entities/AIBot';
import { BallEntity } from './entities/Ball';
import { GameRenderer } from './rendering/Renderer';
import { ParticleSystem } from './rendering/ParticleSystem';
import { InputManager } from '../utils/InputManager';
import { CollisionDetection } from './physics/CollisionDetection';
import { BallPhysics } from './physics/PhysicsEngine';
import { BotAI } from './ai/BotBehavior';
import { GAME_CONFIG } from '../data/constants';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

interface EngineGameState {
  phase: 'menu' | 'playing' | 'paused' | 'roundEnd';
  player: PlayerEntity;
  aiBots: AIBotEntity[];
  ball: BallEntity;
  roundNumber: number;
  remainingPlayers: number;
}

export class GameEngine {
  private gameState: EngineGameState;
  private renderer: GameRenderer;
  private particleSystem: ParticleSystem;
  private inputManager: InputManager;
  private lastFrameTime: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private equippedSwordId: string;
  private equippedSkinId: string;
  private difficulty: 'easy' | 'medium' | 'hard';

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
    this.equippedSwordId = swordId;
    this.equippedSkinId = skinId;
    this.difficulty = difficulty;

    this.gameState = this.createInitialState();
  }

  private createInitialState(): EngineGameState {
    const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
    const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;

    // Create player at bottom center
    const player = new PlayerEntity(
      { x: centerX, y: GAME_CONFIG.CANVAS_HEIGHT - 100 },
      this.equippedSwordId,
      this.equippedSkinId
    );

    // Create AI bots at different positions
    const difficultyMap = {
      easy: 0.3,
      medium: 0.6,
      hard: 0.9
    };
    const aiDifficulty = difficultyMap[this.difficulty];

    const aiBots: AIBotEntity[] = [];
    const positions = [
      { x: 200, y: 150 },
      { x: GAME_CONFIG.CANVAS_WIDTH - 200, y: 150 },
      { x: 200, y: GAME_CONFIG.CANVAS_HEIGHT - 150 },
      { x: GAME_CONFIG.CANVAS_WIDTH - 200, y: GAME_CONFIG.CANVAS_HEIGHT - 150 }
    ];

    for (let i = 0; i < GAME_CONFIG.AI_COUNT; i++) {
      const bot = new AIBotEntity(
        positions[i % positions.length],
        aiDifficulty,
        `ai-${i}`
      );
      aiBots.push(bot);
    }

    // Create ball at center
    const ball = new BallEntity({ x: centerX, y: centerY });

    return {
      phase: 'playing',
      player,
      aiBots,
      ball,
      roundNumber: 1,
      remainingPlayers: 1 + GAME_CONFIG.AI_COUNT
    };
  }

  start(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  pause(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.gameLoop();
    }
  }

  reset(): void {
    this.particleSystem.clear();
    this.gameState = this.createInitialState();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update phase
    this.update(deltaTime);

    // Render phase
    this.render();

    // Next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Cap delta time to prevent huge jumps
    const cappedDelta = Math.min(deltaTime, 100);

    // 1. Process input
    this.handleInput(cappedDelta);

    // 2. Update AI decisions
    this.updateAI(cappedDelta);

    // 3. Update ball physics
    this.updateBall(cappedDelta);

    // 4. Check collisions
    this.checkCollisions();

    // 5. Update particles
    this.particleSystem.update(cappedDelta);

    // 6. Check win condition
    this.checkRoundEnd();

    // 7. Reset blocking state
    this.gameState.player.isBlocking = false;
    this.gameState.aiBots.forEach(bot => (bot.isBlocking = false));
  }

  private handleInput(deltaTime: number): void {
    if (!this.gameState.player.isAlive) return;

    const input = this.inputManager.getInput();

    // Movement (WASD or Arrow keys)
    const moveDir = { x: 0, y: 0 };
    if (input.keys.w || input.keys.up) moveDir.y -= 1;
    if (input.keys.s || input.keys.down) moveDir.y += 1;
    if (input.keys.a || input.keys.left) moveDir.x -= 1;
    if (input.keys.d || input.keys.right) moveDir.x += 1;

    if (moveDir.x !== 0 || moveDir.y !== 0) {
      this.gameState.player.move(moveDir, deltaTime);
    } else {
      this.gameState.player.velocity = { x: 0, y: 0 };
    }

    // Sword angle (mouse position or touch)
    if (input.mouse) {
      this.gameState.player.updateSwordAngle(input.mouse.x, input.mouse.y);
    }

    // Blocking (Space or right-click)
    if (input.keys.space || (input.mouse && input.mouse.rightButton)) {
      this.gameState.player.block();
    }

    // Swing (left-click or E key)
    if ((input.mouse && input.mouse.leftButton) || input.keys.e) {
      const swung = this.gameState.player.swing();
      if (swung) {
        const sword = SWORDS.find(s => s.id === this.gameState.player.swordId) || SWORDS[0];
        this.particleSystem.createSwordSwingEffect(
          this.gameState.player.getSwordBase(),
          this.gameState.player.getSwordTip(),
          sword.color
        );
      }
    }
  }

  private updateAI(deltaTime: number): void {
    this.gameState.aiBots.forEach(bot => {
      if (!bot.isAlive) return;

      const now = Date.now();
      if (now - bot.lastDecisionTime >= bot.reactionTime) {
        bot.lastDecisionTime = now;

        const ai = new BotAI(bot);
        const allEntities = this.getAllEntities();
        const decision = ai.decide(this.gameState.ball, allEntities);

        // Apply AI decision
        if (decision.shouldBlock) {
          bot.isBlocking = true;
        }

        if (decision.shouldSwing) {
          const swung = bot.attemptSwing(this.gameState.ball);
          if (swung) {
            const sword = SWORDS.find(s => s.id === bot.swordId) || SWORDS[0];
            this.particleSystem.createSwordSwingEffect(
              bot.getSwordBase(),
              bot.getSwordTip(),
              sword.color
            );
          }
        }
      }

      bot.moveTowardTarget(deltaTime);
    });
  }

  private updateBall(deltaTime: number): void {
    BallPhysics.updatePosition(this.gameState.ball, deltaTime);
    BallPhysics.handleWallBounce(
      this.gameState.ball,
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    );
  }

  private checkCollisions(): void {
    const ball = this.gameState.ball;
    const allEntities = this.getAllEntities();

    allEntities.forEach(entity => {
      if (!entity.isAlive) return;

      // Check sword collision first (higher priority)
      const swordCollision = this.checkSwordCollision(ball, entity);
      if (swordCollision) {
        const sword = SWORDS.find(s => s.id === this.getSwordId(entity)) || SWORDS[0];
        const swordStart = this.getSwordBase(entity);
        const swordTip = this.getSwordTip(entity);

        BallPhysics.reflectOffSword(ball, swordStart, swordTip, entity, sword.damageMultiplier);
        ball.lastHitBy = entity.id;

        this.particleSystem.createHitEffect(swordCollision, sword.color);
        return;
      }

      // Check ball vs entity body
      if (CollisionDetection.circleCollision(ball, entity)) {
        // Only damage if ball wasn't just hit by this entity
        if (ball.lastHitBy !== entity.id) {
          const damage = GAME_CONFIG.DAMAGE_PER_HIT;
          entity.takeDamage(damage, ball);

          BallPhysics.reflectOffEntity(ball, entity);
          ball.lastHitBy = entity.id;

          this.particleSystem.createHitEffect(entity.position, '#ff0000');

          if (!entity.isAlive) {
            this.particleSystem.createDeathEffect(entity.position);
            this.gameState.remainingPlayers--;
          }
        }
      }
    });
  }

  private checkSwordCollision(ball: BallEntity, entity: PlayerEntity | AIBotEntity): Vec2 | null {
    const swordBase = entity.getSwordBase();
    const swordTip = entity.getSwordTip();

    const collision = CollisionDetection.lineCircleCollision(swordBase, swordTip, {
      position: ball.position,
      radius: ball.radius
    });

    return collision.collides ? collision.point : null;
  }

  private getSwordId(entity: PlayerEntity | AIBotEntity): string {
    return entity.swordId;
  }

  private getSwordBase(entity: PlayerEntity | AIBotEntity): Vec2 {
    return entity.getSwordBase();
  }

  private getSwordTip(entity: PlayerEntity | AIBotEntity): Vec2 {
    return entity.getSwordTip();
  }

  private getAllEntities(): (PlayerEntity | AIBotEntity)[] {
    return [this.gameState.player, ...this.gameState.aiBots];
  }

  private checkRoundEnd(): void {
    if (this.gameState.remainingPlayers <= 1 && this.isRunning) {
      this.pause();

      const winner = this.getAllEntities().find(e => e.isAlive);
      const playerWon = winner?.id === 'player';

      // Trigger round end event
      setTimeout(() => {
        this.onRoundEnd(playerWon);
      }, 100);
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawArena();

    // Draw AI bots
    this.gameState.aiBots.forEach(bot => {
      if (bot.isAlive) {
        this.renderer.drawAIBot(bot);
        const sword = SWORDS.find(s => s.id === bot.swordId) || SWORDS[0];
        this.renderer.drawSword(bot, sword, bot.swordAngle);
      }
    });

    // Draw player
    if (this.gameState.player.isAlive) {
      const playerSkin = SKINS.find(s => s.id === this.gameState.player.skinId) || SKINS[0];
      this.renderer.drawPlayer(this.gameState.player, playerSkin);
      const playerSword = SWORDS.find(s => s.id === this.gameState.player.swordId) || SWORDS[0];
      this.renderer.drawSword(this.gameState.player, playerSword, this.gameState.player.swordAngle);
    }

    // Draw ball
    this.renderer.drawBall(this.gameState.ball);

    // Draw particles
    this.renderer.drawParticles(this.particleSystem.getParticles());
  }

  destroy(): void {
    this.pause();
    this.inputManager.destroy();
  }
}
