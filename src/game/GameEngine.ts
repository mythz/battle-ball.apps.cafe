import { GameState, Entity, SwordItem, SkinItem } from '../store/types';
import { Vector2D } from './physics/Vector2D';
import { CollisionDetection } from './physics/CollisionDetection';
import { BallPhysics } from './physics/PhysicsEngine';
import { PlayerEntity } from './entities/Player';
import { AIBotEntity } from './entities/AIBot';
import { BallEntity } from './entities/Ball';
import { GameRenderer } from './rendering/Renderer';
import { ParticleSystem } from './rendering/ParticleSystem';
import { InputManager } from './InputManager';
import { BotAI } from './ai/BotBehavior';
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
  private difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  private equippedSwordId: string = 'wooden_sword';
  private equippedSkinId: string = 'default_hero';

  // Callback for round end
  public onRoundEnd: (playerWon: boolean) => void = () => {};

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new GameRenderer(canvas);
    this.particleSystem = new ParticleSystem();
    this.inputManager = new InputManager(canvas);
    this.gameState = this.createInitialState();
  }

  private createInitialState(): GameState {
    // Create player at bottom center
    const player = new PlayerEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ARENA_PADDING - 100,
      },
      this.equippedSwordId,
      this.equippedSkinId
    );

    // Create AI bots at random positions
    const aiBots: AIBotEntity[] = [];
    const difficultyValue = this.difficulty === 'easy' ? 0.3 : this.difficulty === 'medium' ? 0.6 : 0.9;

    for (let i = 0; i < GAME_CONFIG.AI_COUNT; i++) {
      const position = Vector2D.random(
        GAME_CONFIG.ARENA_PADDING + 50,
        GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ARENA_PADDING - 50,
        GAME_CONFIG.ARENA_PADDING + 50,
        GAME_CONFIG.CANVAS_HEIGHT / 2
      );

      aiBots.push(new AIBotEntity(position, difficultyValue, `ai_${i}`));
    }

    // Create ball at center with random velocity
    const ball = new BallEntity(
      {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      },
      {
        x: (Math.random() - 0.5) * GAME_CONFIG.BALL_INITIAL_SPEED * 2,
        y: (Math.random() - 0.5) * GAME_CONFIG.BALL_INITIAL_SPEED * 2,
      }
    );

    return {
      phase: 'playing',
      player,
      aiBots,
      ball,
      roundNumber: 1,
      remainingPlayers: 1 + GAME_CONFIG.AI_COUNT,
      particles: [],
    };
  }

  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.difficulty = difficulty;
  }

  setEquippedItems(swordId: string, skinId: string): void {
    this.equippedSwordId = swordId;
    this.equippedSkinId = skinId;
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

    // Update phase
    this.update(Math.min(deltaTime, 50)); // Cap delta time to prevent large jumps

    // Render phase
    this.render();

    // Next frame
    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // 1. Process input
    this.handleInput();

    // 2. Update AI decisions
    this.updateAI(deltaTime);

    // 3. Update player physics
    if (this.gameState.player.isAlive) {
      // Movement is handled in handleInput
    }

    // 4. Update AI bots physics
    this.updateAIBots(deltaTime);

    // 5. Update ball physics
    this.updateBall(deltaTime);

    // 6. Check collisions
    this.checkCollisions();

    // 7. Update particles
    this.particleSystem.update(deltaTime);

    // 8. Check win condition
    this.checkRoundEnd();
  }

  private handleInput(): void {
    const input = this.inputManager.getInput();

    if (!this.gameState.player.isAlive) return;

    // Movement (WASD or Arrow keys)
    const moveDir = new Vector2D(0, 0);
    if (input.keys.w || input.keys.up) moveDir.y -= 1;
    if (input.keys.s || input.keys.down) moveDir.y += 1;
    if (input.keys.a || input.keys.left) moveDir.x -= 1;
    if (input.keys.d || input.keys.right) moveDir.x += 1;

    if (moveDir.x !== 0 || moveDir.y !== 0) {
      (this.gameState.player as PlayerEntity).move(Vector2D.normalize(moveDir), 16.67);
    }

    // Sword angle (mouse position or touch)
    if (input.mouse) {
      (this.gameState.player as PlayerEntity).updateSwordAngle(input.mouse.x, input.mouse.y);

      // Swing (left-click)
      if (input.mouse.leftButton) {
        if ((this.gameState.player as PlayerEntity).swing()) {
          const sword = this.getSwordById(this.gameState.player.swordId);
          this.particleSystem.createSwordSwingEffect(
            (this.gameState.player as PlayerEntity).getSwordBase(),
            (this.gameState.player as PlayerEntity).getSwordTip(),
            sword.color
          );
        }
      }
    }

    // Blocking (Space)
    (this.gameState.player as PlayerEntity).block(input.keys.space);
  }

  private updateAI(_deltaTime: number): void {
    this.gameState.aiBots.forEach((bot) => {
      if (!bot.isAlive) return;

      const ai = new BotAI(bot, bot.difficulty);
      const decision = ai.decide(this.gameState.ball, this.getAllEntities());

      // Update sword angle to point at ball
      (bot as AIBotEntity).updateSwordAngle(this.gameState.ball);

      // Apply AI decision
      bot.isBlocking = decision.shouldBlock;

      if (decision.shouldSwing) {
        (bot as AIBotEntity).swing();
      }
    });
  }

  private updateAIBots(deltaTime: number): void {
    this.gameState.aiBots.forEach((bot) => {
      if (bot.isAlive) {
        (bot as AIBotEntity).moveTowardTarget(deltaTime);
      }
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

    for (const entity of allEntities) {
      if (!entity.isAlive) continue;

      // Check sword collision first
      const swordBase = entity.position;
      const swordAngle = ('swordAngle' in entity ? entity.swordAngle : 0) as number;
      const swordLength = ('swordLength' in entity ? entity.swordLength : GAME_CONFIG.SWORD_BASE_LENGTH) as number;
      const swordTip = {
        x: swordBase.x + Math.cos(swordAngle) * swordLength,
        y: swordBase.y + Math.sin(swordAngle) * swordLength,
      };

      const swordCollision = CollisionDetection.lineCircleCollision(swordBase, swordTip, ball);

      if (swordCollision.collides && swordCollision.point) {
        const sword = this.getSwordById(('swordId' in entity ? entity.swordId : 'wooden_sword') as string);

        BallPhysics.reflectOffSword(
          ball,
          swordBase,
          swordTip,
          entity,
          sword.damageMultiplier
        );

        ball.lastHitBy = entity.id;
        this.particleSystem.createHitEffect(swordCollision.point, sword.color);
        continue; // Skip body collision if sword hit
      }

      // Check body collision
      if (CollisionDetection.circleCollision(ball, entity)) {
        // Only damage if ball wasn't just hit by this entity
        if (ball.lastHitBy !== entity.id) {
          if (entity.id === 'player') {
            (entity as PlayerEntity).takeDamage(GAME_CONFIG.DAMAGE_PER_HIT, ball);
          } else {
            (entity as AIBotEntity).takeDamage(GAME_CONFIG.DAMAGE_PER_HIT, ball);
          }
          this.particleSystem.createHitEffect(entity.position, '#ff0000');

          if (!entity.isAlive) {
            this.particleSystem.createDeathEffect(entity.position);
            this.gameState.remainingPlayers--;
          }
        }

        BallPhysics.reflectOffEntity(ball, entity);
      }
    }
  }

  private checkRoundEnd(): void {
    if (this.gameState.remainingPlayers <= 1) {
      this.isRunning = false;

      const winner = this.getAllEntities().find((e) => e.isAlive);
      const playerWon = winner?.id === 'player';

      // Trigger round end event
      setTimeout(() => {
        this.onRoundEnd(playerWon);
      }, 1000);
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawArena();

    // Draw AI bots and their swords
    this.gameState.aiBots.forEach((bot) => {
      if (bot.isAlive) {
        this.renderer.drawAIBot(bot);
        const sword = this.getSwordById(bot.swordId);
        this.renderer.drawSword(bot, sword, bot.swordAngle);
      }
    });

    // Draw player and sword
    if (this.gameState.player.isAlive) {
      const playerSkin = this.getSkinById(this.gameState.player.skinId);
      this.renderer.drawPlayer(this.gameState.player, playerSkin);
      const playerSword = this.getSwordById(this.gameState.player.swordId);
      this.renderer.drawSword(this.gameState.player, playerSword, this.gameState.player.swordAngle);
    }

    // Draw ball
    this.renderer.drawBall(this.gameState.ball);

    // Draw particles
    this.renderer.drawParticles(this.particleSystem.getParticles());
  }

  private getAllEntities(): Entity[] {
    return [this.gameState.player, ...this.gameState.aiBots].filter((e) => e.isAlive);
  }

  private getSwordById(id: string): SwordItem {
    return SWORDS.find((s) => s.id === id) || SWORDS[0];
  }

  private getSkinById(id: string): SkinItem {
    return SKINS.find((s) => s.id === id) || SKINS[0];
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

  reset(): void {
    this.particleSystem.clear();
    this.gameState = this.createInitialState();
  }

  destroy(): void {
    this.isRunning = false;
    this.inputManager.destroy();
  }

  getRemainingPlayers(): number {
    return this.gameState.remainingPlayers;
  }
}
