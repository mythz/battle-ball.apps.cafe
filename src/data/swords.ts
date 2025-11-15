import { SwordItem } from '../store/types';

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
    id: 'bronze_saber',
    name: 'Bronze Saber',
    cost: 300,
    length: 75,
    width: 14,
    damageMultiplier: 1.15,
    color: '#cd7f32',
    rarity: 'rare',
    description: 'Tested in countless battles'
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
    id: 'thunder_edge',
    name: 'Thunder Edge',
    cost: 600,
    length: 82,
    width: 13,
    damageMultiplier: 1.35,
    color: '#f1c40f',
    rarity: 'epic',
    description: 'Crackles with electricity'
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
  {
    id: 'celestial_blade',
    name: 'Celestial Blade',
    cost: 1200,
    length: 95,
    width: 12,
    damageMultiplier: 1.7,
    color: '#00d2d3',
    rarity: 'legendary',
    description: 'Blessed by the heavens'
  },
  {
    id: 'void_striker',
    name: 'Void Striker',
    cost: 1300,
    length: 88,
    width: 16,
    damageMultiplier: 1.65,
    color: '#2c2c54',
    rarity: 'legendary',
    description: 'Tears through reality itself'
  },
  {
    id: 'emerald_edge',
    name: 'Emerald Edge',
    cost: 450,
    length: 78,
    width: 11,
    damageMultiplier: 1.25,
    color: '#27ae60',
    rarity: 'epic',
    description: 'Sharp as nature itself'
  }
];
