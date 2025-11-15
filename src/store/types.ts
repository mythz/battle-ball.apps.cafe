export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
}

export interface Player extends Entity {
  swordAngle: number;
  swordLength: number;
  swordWidth: number;
  isBlocking: boolean;
  skinId: string;
  swordId: string;
}

export interface AIBot extends Entity {
  difficulty: number;
  targetPosition: Vector2D;
  reactionTime: number;
  lastDecisionTime: number;
  swordAngle: number;
  swordLength: number;
  swordWidth: number;
  isBlocking: boolean;
  swordId: string;
}

export interface Ball extends Entity {
  speed: number;
  lastHitBy: string | null;
  trailPositions: Vector2D[];
}

export interface SwordItem {
  id: string;
  name: string;
  cost: number;
  length: number;
  width: number;
  damageMultiplier: number;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface SkinItem {
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

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  birthTime: number;
}

export interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'roundEnd';
  player: Player;
  aiBots: AIBot[];
  ball: Ball;
  roundNumber: number;
  remainingPlayers: number;
  particles: Particle[];
}

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PlayerStats {
  coins: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

export interface Inventory {
  ownedSwords: string[];
  ownedSkins: string[];
  equippedSword: string;
  equippedSkin: string;
}

export interface GameData {
  playerStats: PlayerStats;
  inventory: Inventory;
  settings: Settings;
}

export interface InputState {
  keys: {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
    e: boolean;
    escape: boolean;
  };
  mouse: {
    x: number;
    y: number;
    leftButton: boolean;
    rightButton: boolean;
  } | null;
}

export interface DecisionOutput {
  movement: Vector2D | null;
  shouldBlock: boolean;
  shouldSwing: boolean;
}
