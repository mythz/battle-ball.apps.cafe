# Sword Ball Battle Royale - Complete Implementation Plan

## Game Overview
A 2D top-down battle royale game where players use swords to deflect a bouncing ball to eliminate AI opponents. Last player standing wins the round and earns coins for cosmetic upgrades.

---

## Technical Architecture

### Stack
- **Framework**: React 18 + Vite + TypeScript
- **Rendering**: HTML5 Canvas
- **Storage**: IndexedDB (primary) + localStorage (backup)
- **Styling**: Tailwind CSS (via CDN or inline)
- **State Management**: React Context + useReducer
- **Animation Loop**: requestAnimationFrame

### Project Structure
```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component with routing
├── components/
│   ├── Game.tsx               # Main game canvas component
│   ├── MainMenu.tsx           # Start screen
│   ├── Shop.tsx               # Purchase swords/skins
│   ├── GameHUD.tsx            # In-game UI (coins, health)
│   ├── GameOver.tsx           # Round end screen
│   └── Settings.tsx           # Audio/controls settings
├── game/
│   ├── GameEngine.ts          # Core game loop
│   ├── entities/
│   │   ├── Player.ts          # Player entity
│   │   ├── AIBot.ts           # AI opponent
│   │   ├── Ball.ts            # Ball physics
│   │   └── Sword.ts           # Sword collision/rendering
│   ├── physics/
│   │   ├── CollisionDetection.ts
│   │   ├── Vector2D.ts        # Math utilities
│   │   └── PhysicsEngine.ts
│   ├── ai/
│   │   └── BotBehavior.ts     # AI decision making
│   └── rendering/
│       ├── Renderer.ts        # Canvas drawing
│       └── ParticleSystem.ts  # Visual effects
├── store/
│   ├── GameContext.tsx        # Global game state
│   ├── DatabaseService.ts     # IndexedDB wrapper
│   └── types.ts               # TypeScript interfaces
├── data/
│   ├── swords.ts              # Sword definitions
│   ├── skins.ts               # Character skins
│   └── constants.ts           # Game constants
└── utils/
    ├── sound.ts               # Audio management
    └── helpers.ts             # Utility functions
```

---

## Detailed Implementation Plan

## Phase 1: Project Setup & Storage Layer

### 1.1 Initialize Project
```bash
npm create vite@latest sword-ball-battle -- --template react-ts
cd sword-ball-battle
npm install
```

### 1.2 Database Service (DatabaseService.ts)
Create IndexedDB wrapper with these methods:

**Database Schema:**
```typescript
interface GameData {
  playerStats: {
    coins: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
  };
  inventory: {
    ownedSwords: string[];     // IDs of purchased swords
    ownedSkins: string[];      // IDs of purchased skins
    equippedSword: string;     // Currently equipped sword ID
    equippedSkin: string;      // Currently equipped skin ID
  };
  settings: {
    musicVolume: number;       // 0-1
    sfxVolume: number;         // 0-1
    difficulty: 'easy' | 'medium' | 'hard';
  };
}
```

**Required Methods:**
- `initDatabase()`: Create object stores on first load
- `getGameData()`: Retrieve all player data
- `updateCoins(amount: number)`: Add/subtract coins
- `purchaseItem(itemId: string, itemType: 'sword' | 'skin', cost: number)`: Buy item
- `equipItem(itemId: string, itemType: 'sword' | 'skin')`: Set active cosmetic
- `incrementWins()`: Update win counter
- `updateSettings(settings: Partial<Settings>)`: Save preferences
- `resetProgress()`: Clear all data (for testing)

**Fallback to localStorage:**
- Implement try-catch wrappers
- If IndexedDB fails, serialize to JSON in localStorage
- Key: `sword-ball-game-data`

### 1.3 TypeScript Interfaces (types.ts)
```typescript
interface Vector2D {
  x: number;
  y: number;
}

interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
}

interface Player extends Entity {
  swordAngle: number;
  swordLength: number;
  swordWidth: number;
  isBlocking: boolean;
  skinId: string;
  swordId: string;
}

interface AIBot extends Entity {
  difficulty: number;        // 0-1 skill level
  targetPosition: Vector2D;
  reactionTime: number;      // ms delay for decisions
  lastDecisionTime: number;
}

interface Ball extends Entity {
  speed: number;
  lastHitBy: string | null;  // Entity ID
  trailPositions: Vector2D[]; // Visual trail
}

interface SwordItem {
  id: string;
  name: string;
  cost: number;
  length: number;            // Affects range
  width: number;             // Affects hitbox
  damageMultiplier: number;  // Affects ball speed on hit
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

interface SkinItem {
  id: string;
  name: string;
  cost: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'roundEnd';
  player: Player;
  aiBots: AIBot[];
  ball: Ball;
  roundNumber: number;
  remainingPlayers: number;
  particles: Particle[];
}
```

---

## Phase 2: Game Data & Constants

### 2.1 Constants (constants.ts)
```typescript
export const GAME_CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  FPS: 60,
  FRAME_TIME: 1000 / 60,
  
  PLAYER_RADIUS: 25,
  PLAYER_MAX_HEALTH: 100,
  PLAYER_SPEED: 5,
  
  BALL_RADIUS: 15,
  BALL_INITIAL_SPEED: 4,
  BALL_MAX_SPEED: 12,
  BALL_ACCELERATION: 1.1,
  
  SWORD_BASE_LENGTH: 60,
  SWORD_BASE_WIDTH: 10,
  SWORD_COOLDOWN: 300,        // ms between swings
  
  AI_COUNT: 4,
  AI_UPDATE_RATE: 100,        // ms between AI decisions
  
  DAMAGE_PER_HIT: 25,
  ROUND_WIN_REWARD: 50,
  
  ARENA_PADDING: 50,          // Distance from canvas edge
};

export const COLORS = {
  BACKGROUND: '#1a1a2e',
  ARENA: '#16213e',
  PLAYER: '#00ff88',
  AI_BOT: '#ff4757',
  BALL: '#ffa502',
  SWORD_DEFAULT: '#ecf0f1',
  HEALTH_BAR_BG: '#333',
  HEALTH_BAR_FILL: '#2ecc71',
  PARTICLE: '#fff',
};
```

### 2.2 Swords Data (swords.ts)
Create array of 12-15 swords with progression:

```typescript
export const SWORDS: SwordItem[] = [
  {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    cost: 0,
    length: 60,
    width: 10,
    damageMultiplier: 1.0,
    color: '#8B4513',
    rarity: 'common',
    description: 'A basic training sword'
  },
  {
    id: 'iron_blade',
    name: 'Iron Blade',
    cost: 100,
    length: 70,
    width: 12,
    damageMultiplier: 1.1,
    color: '#7f8c8d',
    rarity: 'common',
    description: 'Standard issue blade'
  },
  {
    id: 'steel_katana',
    name: 'Steel Katana',
    cost: 250,
    length: 80,
    width: 8,
    damageMultiplier: 1.2,
    color: '#95a5a6',
    rarity: 'rare',
    description: 'Swift and deadly'
  },
  {
    id: 'flame_sword',
    name: 'Flame Sword',
    cost: 500,
    length: 75,
    width: 15,
    damageMultiplier: 1.4,
    color: '#e74c3c',
    rarity: 'epic',
    description: 'Burns with inner fire'
  },
  {
    id: 'ice_blade',
    name: 'Ice Blade',
    cost: 500,
    length: 85,
    width: 10,
    damageMultiplier: 1.3,
    color: '#3498db',
    rarity: 'epic',
    description: 'Freezes enemies in fear'
  },
  {
    id: 'shadow_reaper',
    name: 'Shadow Reaper',
    cost: 1000,
    length: 90,
    width: 14,
    damageMultiplier: 1.6,
    color: '#9b59b6',
    rarity: 'legendary',
    description: 'Forged in darkness'
  },
  {
    id: 'dragon_fang',
    name: 'Dragon Fang',
    cost: 1500,
    length: 100,
    width: 18,
    damageMultiplier: 1.8,
    color: '#f39c12',
    rarity: 'legendary',
    description: 'The ultimate weapon'
  },
  // Add 5-8 more with creative names and balanced stats
];
```

### 2.3 Skins Data (skins.ts)
Create 10-12 character skins:

```typescript
export const SKINS: SkinItem[] = [
  {
    id: 'default_hero',
    name: 'Default Hero',
    cost: 0,
    colors: { primary: '#00ff88', secondary: '#00cc6a', accent: '#ffffff' },
    rarity: 'common',
    description: 'The classic look'
  },
  {
    id: 'shadow_ninja',
    name: 'Shadow Ninja',
    cost: 200,
    colors: { primary: '#2c3e50', secondary: '#34495e', accent: '#e74c3c' },
    rarity: 'rare',
    description: 'Stealth and style'
  },
  {
    id: 'golden_knight',
    name: 'Golden Knight',
    cost: 400,
    colors: { primary: '#f39c12', secondary: '#f1c40f', accent: '#e67e22' },
    rarity: 'epic',
    description: 'Shines with valor'
  },
  {
    id: 'neon_samurai',
    name: 'Neon Samurai',
    cost: 800,
    colors: { primary: '#ff006e', secondary: '#8338ec', accent: '#00f5ff' },
    rarity: 'legendary',
    description: 'Cyberpunk warrior'
  },
  // Add 6-8 more creative skins
];
```

---

## Phase 3: Core Game Engine

### 3.1 Vector Math (Vector2D.ts)
```typescript
export class Vector2D {
  constructor(public x: number, public y: number) {}
  
  static add(v1: Vector2D, v2: Vector2D): Vector2D
  static subtract(v1: Vector2D, v2: Vector2D): Vector2D
  static multiply(v: Vector2D, scalar: number): Vector2D
  static magnitude(v: Vector2D): number
  static normalize(v: Vector2D): Vector2D
  static distance(v1: Vector2D, v2: Vector2D): number
  static dot(v1: Vector2D, v2: Vector2D): number
  static angle(v: Vector2D): number
  static rotate(v: Vector2D, angle: number): Vector2D
  static lerp(v1: Vector2D, v2: Vector2D, t: number): Vector2D
}
```

### 3.2 Physics Engine (PhysicsEngine.ts)

**Collision Detection:**
```typescript
class CollisionDetection {
  // Circle-circle collision
  static circleCollision(e1: Entity, e2: Entity): boolean {
    const distance = Vector2D.distance(e1.position, e2.position);
    return distance < (e1.radius + e2.radius);
  }
  
  // Line-circle collision (for sword-ball interaction)
  static lineCircleCollision(
    lineStart: Vector2D,
    lineEnd: Vector2D,
    circle: { position: Vector2D; radius: number }
  ): { collides: boolean; point: Vector2D | null }
  
  // Point in circle
  static pointInCircle(point: Vector2D, circle: Entity): boolean
  
  // Wall collision (arena boundaries)
  static wallCollision(entity: Entity, bounds: {
    left: number; right: number; top: number; bottom: number;
  }): { x: boolean; y: boolean }
}
```

**Ball Physics:**
```typescript
class BallPhysics {
  // Update ball position with velocity
  static updatePosition(ball: Ball, deltaTime: number): void
  
  // Handle wall bounces with slight randomization
  static handleWallBounce(ball: Ball, canvasWidth: number, canvasHeight: number): void
  
  // Reflect ball off entity (player/AI)
  static reflectOffEntity(ball: Ball, entity: Entity): void
  
  // Reflect ball off sword with speed boost
  static reflectOffSword(
    ball: Ball,
    swordStart: Vector2D,
    swordEnd: Vector2D,
    swordOwner: Entity,
    damageMultiplier: number
  ): void
  
  // Add slight curve to ball trajectory
  static applySpin(ball: Ball, direction: Vector2D): void
}
```

### 3.3 Entity Classes

**Player.ts:**
```typescript
export class PlayerEntity implements Player {
  constructor(
    startPosition: Vector2D,
    swordId: string,
    skinId: string
  ) {
    // Initialize player with position, health, equipped items
  }
  
  // Update sword angle to point toward mouse/touch
  updateSwordAngle(targetX: number, targetY: number): void
  
  // Move player with WASD or arrow keys
  move(direction: Vector2D, deltaTime: number): void
  
  // Activate blocking state (reduces damage, perfect deflection window)
  block(): void
  
  // Swing sword attack
  swing(): void
  
  // Take damage from ball hit
  takeDamage(amount: number, ball: Ball): void
  
  // Get sword tip position for collision detection
  getSwordTip(): Vector2D
  getSwordBase(): Vector2D
}
```

**AIBot.ts:**
```typescript
export class AIBotEntity implements AIBot {
  constructor(
    startPosition: Vector2D,
    difficulty: number,
    id: string
  ) {
    // Initialize with difficulty affecting reaction time and accuracy
  }
  
  // AI decision-making (called every AI_UPDATE_RATE ms)
  makeDecision(ball: Ball, allEntities: Entity[]): void {
    // 1. Calculate ball trajectory
    // 2. Predict if ball is heading toward this bot
    // 3. If threat detected: move to intercept or evade
    // 4. If safe: move toward strategic position (center weighted)
    // 5. Random chance to swing when ball is near
  }
  
  // Move toward target position
  moveTowardTarget(deltaTime: number): void
  
  // Predict where ball will be in N frames
  predictBallPosition(ball: Ball, frames: number): Vector2D
  
  // Check if should block (ball incoming)
  shouldBlock(ball: Ball): boolean
  
  // Swing at ball if in range
  attemptSwing(ball: Ball): void
  
  takeDamage(amount: number, ball: Ball): void
}
```

**Ball.ts:**
```typescript
export class BallEntity implements Ball {
  constructor(startPosition: Vector2D, startVelocity: Vector2D) {
    // Initialize ball with random direction
  }
  
  update(deltaTime: number): void {
    // Update position based on velocity
    // Update trail positions for visual effect
  }
  
  // Hit a player/AI, dealing damage
  hitEntity(entity: Entity, damageMultiplier: number): void
  
  // Increase speed slightly on each hit (up to MAX_SPEED)
  accelerate(): void
  
  reset(position: Vector2D): void
}
```

### 3.4 AI Behavior (BotBehavior.ts)

```typescript
export class BotAI {
  private bot: AIBot;
  private difficulty: number; // 0 = easy, 0.5 = medium, 1 = hard
  
  // Main decision function
  decide(ball: Ball, allEntities: Entity[]): {
    movement: Vector2D;
    shouldBlock: boolean;
    shouldSwing: boolean;
  } {
    // Predict ball trajectory
    const ballTrajectory = this.predictTrajectory(ball, 60);
    const threatLevel = this.assessThreat(ballTrajectory);
    
    if (threatLevel > 0.7) {
      return this.defensiveBehavior(ball);
    } else if (threatLevel > 0.3) {
      return this.aggressiveBehavior(ball, allEntities);
    } else {
      return this.positioningBehavior(allEntities);
    }
  }
  
  private defensiveBehavior(ball: Ball): DecisionOutput {
    // Move away from ball or prepare to block
    // Higher difficulty = better blocking timing
  }
  
  private aggressiveBehavior(ball: Ball, others: Entity[]): DecisionOutput {
    // Try to hit ball toward weakest opponent
    // Calculate angle to nearest enemy
  }
  
  private positioningBehavior(others: Entity[]): DecisionOutput {
    // Move to strategic position (avoid corners, stay central)
    // Maintain distance from other entities
  }
  
  private predictTrajectory(ball: Ball, frames: number): Vector2D[] {
    // Simulate ball movement for N frames
    // Account for wall bounces
  }
  
  private assessThreat(trajectory: Vector2D[]): number {
    // Return 0-1 score of how dangerous ball is to this bot
    // Based on distance and velocity
  }
}
```

---

## Phase 4: Rendering System

### 4.1 Renderer (Renderer.ts)

```typescript
export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }
  
  // Clear canvas
  clear(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Draw arena background
  drawArena(): void {
    // Draw border and background
    // Optional: grid pattern or decorative elements
  }
  
  // Draw player with equipped skin
  drawPlayer(player: Player, skin: SkinItem): void {
    // Circle body with skin colors
    // Inner circle for body
    // Outer glow effect
    // Health bar above head
  }
  
  // Draw AI bot
  drawAIBot(bot: AIBot): void {
    // Similar to player but with AI color scheme
    // Difficulty indicator (easy/medium/hard)
  }
  
  // Draw ball with trail effect
  drawBall(ball: Ball): void {
    // Trail of fading circles behind ball
    // Main ball with glow
    // Speed indicator (particles)
  }
  
  // Draw sword
  drawSword(
    entity: Player | AIBot,
    sword: SwordItem,
    angle: number
  ): void {
    // Draw from entity center at angle
    // Gradient fill with sword color
    // Glow effect if legendary rarity
  }
  
  // Draw particles (hit effects, sparks)
  drawParticles(particles: Particle[]): void
  
  // Draw game HUD (overlaid on canvas)
  drawHUD(gameState: GameState, coins: number): void {
    // Top left: Coins display
    // Top right: Remaining players
    // Mini-map (optional)
  }
}
```

### 4.2 Particle System (ParticleSystem.ts)

```typescript
interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;      // 0-1, decays over time
  maxLife: number;   // ms
  size: number;
  color: string;
  birthTime: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  
  // Create explosion effect on ball hit
  createHitEffect(position: Vector2D, color: string): void {
    // Spawn 8-12 particles radiating outward
  }
  
  // Create trail particles
  createTrailParticle(position: Vector2D, color: string): void
  
  // Create death explosion
  createDeathEffect(position: Vector2D): void {
    // Large burst of particles
  }
  
  update(deltaTime: number): void {
    // Update all particles
    // Remove dead particles
  }
  
  getParticles(): Particle[] {
    return this.particles;
  }
}
```

---

## Phase 5: Game Loop & State Management

### 5.1 Game Engine (GameEngine.ts)

```typescript
export class GameEngine {
  private gameState: GameState;
  private renderer: GameRenderer;
  private particleSystem: ParticleSystem;
  private inputManager: InputManager;
  private lastFrameTime: number = 0;
  private isRunning: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new GameRenderer(canvas);
    this.particleSystem = new ParticleSystem();
    this.inputManager = new InputManager(canvas);
    this.initializeGame();
  }
  
  private initializeGame(): void {
    // Create player at bottom center
    // Create 4 AI bots at random positions
    // Create ball at center with random velocity
  }
  
  // Main game loop
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
    this.update(deltaTime);
    
    // Render phase
    this.render();
    
    // Next frame
    requestAnimationFrame(this.gameLoop);
  }
  
  private update(deltaTime: number): void {
    // 1. Process input (player movement, sword angle)
    this.handleInput();
    
    // 2. Update AI decisions
    this.updateAI(deltaTime);
    
    // 3. Update player physics
    this.updatePlayer(deltaTime);
    
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
    
    // Movement (WASD or Arrow keys)
    const moveDir = new Vector2D(0, 0);
    if (input.keys.w || input.keys.up) moveDir.y -= 1;
    if (input.keys.s || input.keys.down) moveDir.y += 1;
    if (input.keys.a || input.keys.left) moveDir.x -= 1;
    if (input.keys.d || input.keys.right) moveDir.x += 1;
    
    if (moveDir.x !== 0 || moveDir.y !== 0) {
      this.gameState.player.move(Vector2D.normalize(moveDir), deltaTime);
    }
    
    // Sword angle (mouse position or touch)
    if (input.mouse) {
      this.gameState.player.updateSwordAngle(input.mouse.x, input.mouse.y);
    }
    
    // Blocking (Space or right-click)
    if (input.keys.space || input.mouse.rightButton) {
      this.gameState.player.block();
    }
    
    // Swing (left-click or E key)
    if (input.mouse.leftButton || input.keys.e) {
      this.gameState.player.swing();
    }
  }
  
  private updateAI(deltaTime: number): void {
    // Each AI makes decision every AI_UPDATE_RATE ms
    this.gameState.aiBots.forEach(bot => {
      if (!bot.isAlive) return;
      
      const ai = new BotAI(bot, bot.difficulty);
      const decision = ai.decide(this.gameState.ball, this.getAllEntities());
      
      // Apply AI decision
      if (decision.movement) {
        bot.moveTowardTarget(deltaTime);
      }
      if (decision.shouldBlock) {
        bot.block();
      }
      if (decision.shouldSwing) {
        bot.swing();
      }
    });
  }
  
  private checkCollisions(): void {
    const ball = this.gameState.ball;
    
    // Check ball vs entities
    const allEntities = this.getAllEntities();
    allEntities.forEach(entity => {
      if (!entity.isAlive) return;
      
      // Ball hit entity body
      if (CollisionDetection.circleCollision(ball, entity)) {
        entity.takeDamage(DAMAGE_PER_HIT, ball);
        BallPhysics.reflectOffEntity(ball, entity);
        this.particleSystem.createHitEffect(entity.position, '#ff0000');
        
        if (!entity.isAlive) {
          this.particleSystem.createDeathEffect(entity.position);
          this.gameState.remainingPlayers--;
        }
      }
      
      // Ball hit sword
      const swordCollision = this.checkSwordCollision(ball, entity);
      if (swordCollision.hit) {
        BallPhysics.reflectOffSword(
          ball,
          swordCollision.swordStart,
          swordCollision.swordEnd,
          entity,
          this.getSwordDamageMultiplier(entity)
        );
        ball.lastHitBy = entity.id;
        this.particleSystem.createHitEffect(swordCollision.point, '#00ff88');
      }
    });
    
    // Check ball vs walls
    BallPhysics.handleWallBounce(ball, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
  }
  
  private checkRoundEnd(): void {
    if (this.gameState.remainingPlayers <= 1) {
      this.isRunning = false;
      
      const winner = this.getAllEntities().find(e => e.isAlive);
      const playerWon = winner?.id === 'player';
      
      // Trigger round end event
      this.onRoundEnd(playerWon);
    }
  }
  
  private render(): void {
    this.renderer.clear();
    this.renderer.drawArena();
    
    // Draw entities
    this.gameState.aiBots.forEach(bot => {
      if (bot.isAlive) {
        this.renderer.drawAIBot(bot);
        this.renderer.drawSword(bot, this.getSword(bot), bot.swordAngle);
      }
    });
    
    if (this.gameState.player.isAlive) {
      const playerSkin = this.getSkin(this.gameState.player.skinId);
      this.renderer.drawPlayer(this.gameState.player, playerSkin);
      const playerSword = this.getSword(this.gameState.player);
      this.renderer.drawSword(this.gameState.player, playerSword, this.gameState.player.swordAngle);
    }
    
    // Draw ball
    this.renderer.drawBall(this.gameState.ball);
    
    // Draw particles
    this.renderer.drawParticles(this.particleSystem.getParticles());
  }
  
  // Public methods for React integration
  pause(): void { this.isRunning = false; }
  resume(): void { this.start(); }
  reset(): void { this.initializeGame(); }
  
  // Callback for round end (handled by React component)
  onRoundEnd: (playerWon: boolean) => void = () => {};
}
```

### 5.2 Input Manager (InputManager.ts)

```typescript
interface InputState {
  keys: {
    w: boolean; a: boolean; s: boolean; d: boolean;
    up: boolean; down: boolean; left: boolean; right: boolean;
    space: boolean; e: boolean; escape: boolean;
  };
  mouse: {
    x: number;
    y: number;
    leftButton: boolean;
    rightButton: boolean;
  } | null;
}

export class InputManager {
  private inputState: InputState;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.inputState = this.getEmptyInputState();
    this.attachEventListeners();
  }
  
  private attachEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse events
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Touch events (for mobile)
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }
  
  getInput(): InputState {
    return { ...this.inputState };
  }
  
  destroy(): void {
    // Remove all event listeners
  }
}
```

---

## Phase 6: React Components

### 6.1 Game Context (GameContext.tsx)

```typescript
interface GameContextType {
  gameData: GameData;
  updateCoins: (amount: number) => Promise<void>;
  purchaseItem: (itemId: string, type: 'sword' | 'skin', cost: number) => Promise<boolean>;
  equipItem: (itemId: string, type: 'sword' | 'skin') => Promise<void>;
  incrementWins: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  resetProgress: () => Promise<void>;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<GameData>(getDefaultGameData());
  
  // Load data from IndexedDB on mount
  useEffect(() => {
    DatabaseService.initDatabase().then(() => {
      DatabaseService.getGameData().then(setGameData);
    });
  }, []);
  
  // Implement all context methods
  // Each method updates state AND persists to IndexedDB
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
```

### 6.2 Main Menu (MainMenu.tsx)

```typescript
export const MainMenu: React.FC = () => {
  const { gameData } = useGame();
  const navigate = useNavigate();
  
  return (
    <div className="menu-container">
      <h1 className="game-title">Sword Ball Royale</h1>
      
      <div className="player-stats">
        <div>Coins: {gameData.playerStats.coins}</div>
        <div>Wins: {gameData.playerStats.wins}</div>
        <div>Games: {gameData.playerStats.gamesPlayed}</div>
      </div>
      
      <div className="menu-buttons">
        <button onClick={() => navigate('/game')}>
          Start Game
        </button>
        <button onClick={() => navigate('/shop')}>
          Shop
        </button>
        <button onClick={() => navigate('/settings')}>
          Settings
        </button>
      </div>
      
      {/* Display equipped items */}
      <div className="equipped-preview">
        <EquippedSwordPreview />
        <EquippedSkinPreview />
      </div>
    </div>
  );
};
```

### 6.3 Game Component (Game.tsx)

```typescript
export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameData, updateCoins, incrementWins } = useGame();
  const [gamePhase, setGamePhase] = useState<'playing' | 'paused' | 'roundEnd'>('playing');
  const [roundResult, setRoundResult] = useState<{ won: boolean } | null>(null);
  
  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(canvasRef.current);
    
    // Setup round end callback
    engine.onRoundEnd = (playerWon: boolean) => {
      setGamePhase('roundEnd');
      setRoundResult({ won: playerWon });
      
      if (playerWon) {
        updateCoins(GAME_CONFIG.ROUND_WIN_REWARD);
        incrementWins();
      }
    };
    
    engine.start();
    engineRef.current = engine;
    
    return () => {
      engine.pause();
    };
  }, []);
  
  // Handle pause/resume
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGamePhase(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  
  useEffect(() => {
    if (!engineRef.current) return;
    
    if (gamePhase === 'playing') {
      engineRef.current.resume();
    } else {
      engineRef.current.pause();
    }
  }, [gamePhase]);
  
  const handleNextRound = () => {
    engineRef.current?.reset();
    engineRef.current?.start();
    setGamePhase('playing');
    setRoundResult(null);
  };
  
  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        className="game-canvas"
      />
      
      {/* Overlays */}
      {gamePhase === 'paused' && (
        <PauseMenu onResume={() => setGamePhase('playing')} />
      )}
      
      {gamePhase === 'roundEnd' && roundResult && (
        <GameOver
          won={roundResult.won}
          coinsEarned={roundResult.won ? GAME_CONFIG.ROUND_WIN_REWARD : 0}
          onNextRound={handleNextRound}
          onMainMenu={() => navigate('/')}
        />
      )}
      
      {/* HUD overlay */}
      <GameHUD coins={gameData.playerStats.coins} />
    </div>
  );
};
```

### 6.4 Shop Component (Shop.tsx)

```typescript
export const Shop: React.FC = () => {
  const { gameData, purchaseItem, equipItem } = useGame();
  const [selectedTab, setSelectedTab] = useState<'swords' | 'skins'>('swords');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const handlePurchase = async (itemId: string, cost: number) => {
    const success = await purchaseItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin', cost);
    
    if (success) {
      // Show success notification
      playSound('purchase');
    } else {
      // Show error (insufficient coins)
      playSound('error');
    }
  };
  
  const handleEquip = async (itemId: string) => {
    await equipItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin');
    playSound('equip');
  };
  
  const items = selectedTab === 'swords' ? SWORDS : SKINS;
  const ownedItems = selectedTab === 'swords' 
    ? gameData.inventory.ownedSwords 
    : gameData.inventory.ownedSkins;
  const equippedItem = selectedTab === 'swords'
    ? gameData.inventory.equippedSword
    : gameData.inventory.equippedSkin;
  
  return (
    <div className="shop-container">
      <header className="shop-header">
        <h1>Shop</h1>
        <div className="coins-display">
          <span>Coins: {gameData.playerStats.coins}</span>
        </div>
      </header>
      
      <div className="shop-tabs">
        <button 
          className={selectedTab === 'swords' ? 'active' : ''}
          onClick={() => setSelectedTab('swords')}
        >
          Swords
        </button>
        <button 
          className={selectedTab === 'skins' ? 'active' : ''}
          onClick={() => setSelectedTab('skins')}
        >
          Skins
        </button>
      </div>
      
      <div className="shop-grid">
        {items.map(item => {
          const isOwned = ownedItems.includes(item.id);
          const isEquipped = equippedItem === item.id;
          const canAfford = gameData.playerStats.coins >= item.cost;
          
          return (
            <ShopItemCard
              key={item.id}
              item={item}
              isOwned={isOwned}
              isEquipped={isEquipped}
              canAfford={canAfford}
              onPurchase={() => handlePurchase(item.id, item.cost)}
              onEquip={() => handleEquip(item.id)}
              onPreview={() => setSelectedItem(item.id)}
            />
          );
        })}
      </div>
      
      {/* Item preview modal */}
      {selectedItem && (
        <ItemPreviewModal
          item={items.find(i => i.id === selectedItem)!}
          onClose={() => setSelectedItem(null)}
        />
      )}
      
      <button onClick={() => navigate('/')} className="back-button">
        Back to Menu
      </button>
    </div>
  );
};
```

### 6.5 Game Over Screen (GameOver.tsx)

```typescript
interface GameOverProps {
  won: boolean;
  coinsEarned: number;
  onNextRound: () => void;
  onMainMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  won,
  coinsEarned,
  onNextRound,
  onMainMenu
}) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h1 className={won ? 'victory' : 'defeat'}>
          {won ? '🎉 Victory!' : '💀 Defeated'}
        </h1>
        
        {won && (
          <div className="rewards">
            <p>You earned</p>
            <div className="coins-earned">+{coinsEarned} Coins</div>
          </div>
        )}
        
        {!won && (
          <p className="encouragement">
            Better luck next round!
          </p>
        )}
        
        <div className="game-over-buttons">
          <button onClick={onNextRound} className="next-round-btn">
            Next Round
          </button>
          <button onClick={onMainMenu} className="main-menu-btn">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 6.6 Settings Component (Settings.tsx)

```typescript
export const Settings: React.FC = () => {
  const { gameData, updateSettings, resetProgress } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const handleVolumeChange = (type: 'music' | 'sfx', value: number) => {
    updateSettings({
      ...gameData.settings,
      [`${type}Volume`]: value
    });
  };
  
  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateSettings({
      ...gameData.settings,
      difficulty
    });
  };
  
  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      <div className="setting-group">
        <h2>Audio</h2>
        <div className="slider-control">
          <label>Music Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={gameData.settings.musicVolume * 100}
            onChange={(e) => handleVolumeChange('music', parseInt(e.target.value) / 100)}
          />
        </div>
        <div className="slider-control">
          <label>SFX Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={gameData.settings.sfxVolume * 100}
            onChange={(e) => handleVolumeChange('sfx', parseInt(e.target.value) / 100)}
          />
        </div>
      </div>
      
      <div className="setting-group">
        <h2>Difficulty</h2>
        <div className="difficulty-buttons">
          {['easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              className={gameData.settings.difficulty === diff ? 'active' : ''}
              onClick={() => handleDifficultyChange(diff as any)}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="setting-group danger-zone">
        <h2>Danger Zone</h2>
        <button 
          onClick={() => setShowResetConfirm(true)}
          className="reset-button"
        >
          Reset All Progress
        </button>
      </div>
      
      {showResetConfirm && (
        <ConfirmDialog
          title="Reset Progress?"
          message="This will delete all your coins, items, and stats. This cannot be undone."
          onConfirm={() => {
            resetProgress();
            setShowResetConfirm(false);
            navigate('/');
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
      
      <button onClick={() => navigate('/')} className="back-button">
        Back
      </button>
    </div>
  );
};
```

---

## Phase 7: Polish & Features

### 7.1 Sound System (sound.ts)

```typescript
// Use Web Audio API for game sounds
// Since we're static, generate sounds procedurally or use data URIs

class SoundManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer>;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.5;
  
  async init(): Promise<void> {
    this.audioContext = new AudioContext();
    // Preload/generate sounds
  }
  
  // Generate simple tones for SFX
  private generateTone(frequency: number, duration: number): AudioBuffer
  
  playSound(soundId: string): void
  
  // Background music (looping)
  playMusic(): void
  stopMusic(): void
  
  setVolume(type: 'music' | 'sfx', volume: number): void
}

export const soundManager = new SoundManager();

// Sound effects to generate:
// - hit: Short impact sound
// - swing: Whoosh sound
// - death: Explosion
// - purchase: Coin clink
// - victory: Fanfare
// - defeat: Sad trombone
```

### 7.2 Visual Polish

**Effects to implement:**
1. **Screen shake** on ball hit
2. **Slow motion** on final kill
3. **Glow effects** for legendary items
4. **Health bar animations** (smooth transitions)
5. **Sword trail** when swinging
6. **Ball trail** when moving fast
7. **Damage numbers** floating up from entities
8. **Coin animation** when earning rewards
9. **Flash effect** when taking damage
10. **Victory pose** animation for winner

### 7.3 Responsive Design

**Canvas scaling:**
```typescript
function resizeCanvas(canvas: HTMLCanvasElement): void {
  const container = canvas.parentElement!;
  const containerAspect = container.clientWidth / container.clientHeight;
  const canvasAspect = GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.CANVAS_HEIGHT;
  
  if (containerAspect > canvasAspect) {
    // Container wider than canvas
    canvas.style.height = '100%';
    canvas.style.width = 'auto';
  } else {
    // Container taller than canvas
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
  }
}
```

**Mobile controls:**
- Virtual joystick for movement (bottom left)
- Touch area for sword angle (entire screen)
- Block button (bottom right)
- Pause button (top right)

---

## Phase 8: Testing & Balancing

### 8.1 Balance Testing Checklist

- [ ] Player can survive first round with default sword
- [ ] AI difficulty scales appropriately (easy = 50% win rate, hard = 20%)
- [ ] Ball speed doesn't become unplayable after 5+ bounces
- [ ] Shop items are achievable (50-100 coins per round)
- [ ] Legendary swords feel powerful but not unfair
- [ ] Round duration: 1-3 minutes average
- [ ] No entity gets stuck in corners
- [ ] Ball doesn't clip through entities at high speed

### 8.2 Bug Testing

- [ ] Collision detection accurate at all speeds
- [ ] IndexedDB fallback to localStorage works
- [ ] No memory leaks in game loop
- [ ] Particles clean up properly
- [ ] Multiple rounds don't break state
- [ ] Shop purchases save correctly
- [ ] Settings persist across sessions
- [ ] Mobile touch controls responsive
- [ ] Canvas scales on window resize
- [ ] Pause/resume doesn't break physics

---

## Phase 9: Deployment

### 9.1 Build Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // Important for static hosting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-engine': [
            './src/game/GameEngine',
            './src/game/physics/PhysicsEngine',
            './src/game/rendering/Renderer'
          ]
        }
      }
    }
  }
});
```

### 9.2 Build Steps

```bash
npm run build
# Outputs to /dist folder

# Test locally
npm run preview

# Deploy dist folder to:
# - GitHub Pages
# - Netlify
# - Vercel
# - Any static host
```

### 9.3 Performance Optimization

- Lazy load shop images
- Memoize React components
- Use canvas off-screen rendering for complex effects
- Throttle AI decision-making
- Pool particle objects (reuse instead of creating new)
- Use sprite sheets if adding textures later

---

## Implementation Timeline

**Week 1: Foundation**
- Day 1-2: Project setup, database service, TypeScript types
- Day 3-4: Vector math, physics engine, collision detection
- Day 5-7: Entity classes (Player, AI, Ball, Sword)

**Week 2: Core Game**
- Day 8-10: Game engine, game loop, input manager
- Day 11-12: AI behavior system
- Day 13-14: Renderer and basic drawing

**Week 3: React Integration**
- Day 15-16: Game context, database integration
- Day 17-18: Main menu, game component
- Day 19-20: Shop component
- Day 21: Settings and game over screens

**Week 4: Polish**
- Day 22-24: Particle system, visual effects
- Day 25-26: Sound system
- Day 27: Mobile controls, responsive design
- Day 28: Testing and bug fixes

**Week 5: Final**
- Day 29-30: Balance tuning
- Day 31: Performance optimization
- Day 32: Documentation
- Day 33-35: Final testing and deployment

---

## Key Success Metrics

1. **Gameplay Feel**
   - Responsive controls (< 16ms input lag)
   - Satisfying sword impact feedback
   - Fair AI that feels beatable

2. **Progression System**
   - Players can unlock 1 item every 2-3 rounds
   - Clear path from starter sword to legendary
   - Shop items feel meaningful

3. **Technical Performance**
   - 60 FPS on mid-range devices
   - < 2 second load time
   - No crashes after 50+ rounds

4. **User Experience**
   - Intuitive controls (no tutorial needed)
   - Clear visual feedback
   - Fun to play repeatedly

---

This plan provides complete specifications for an LLM to implement the entire game. Each system is broken down into specific classes, methods, and logic flows. The game is designed to be engaging, progressively rewarding, and technically sound for static deployment.