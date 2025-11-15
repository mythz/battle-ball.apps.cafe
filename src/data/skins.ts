import { SkinItem } from '../store/types';

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
    id: 'red_warrior',
    name: 'Red Warrior',
    cost: 150,
    colors: { primary: '#e74c3c', secondary: '#c0392b', accent: '#f39c12' },
    rarity: 'common',
    description: 'Bold and fierce'
  },
  {
    id: 'blue_guardian',
    name: 'Blue Guardian',
    cost: 150,
    colors: { primary: '#3498db', secondary: '#2980b9', accent: '#ecf0f1' },
    rarity: 'common',
    description: 'Cool and collected'
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
    id: 'forest_ranger',
    name: 'Forest Ranger',
    cost: 250,
    colors: { primary: '#27ae60', secondary: '#229954', accent: '#f39c12' },
    rarity: 'rare',
    description: 'One with nature'
  },
  {
    id: 'royal_knight',
    name: 'Royal Knight',
    cost: 300,
    colors: { primary: '#9b59b6', secondary: '#8e44ad', accent: '#f1c40f' },
    rarity: 'rare',
    description: 'Noble and proud'
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
    id: 'ice_mage',
    name: 'Ice Mage',
    cost: 450,
    colors: { primary: '#00d4ff', secondary: '#0099cc', accent: '#ffffff' },
    rarity: 'epic',
    description: 'Master of frost'
  },
  {
    id: 'flame_champion',
    name: 'Flame Champion',
    cost: 500,
    colors: { primary: '#ff6b35', secondary: '#ff4500', accent: '#ffff00' },
    rarity: 'epic',
    description: 'Burning with passion'
  },
  {
    id: 'neon_samurai',
    name: 'Neon Samurai',
    cost: 800,
    colors: { primary: '#ff006e', secondary: '#8338ec', accent: '#00f5ff' },
    rarity: 'legendary',
    description: 'Cyberpunk warrior'
  },
  {
    id: 'void_walker',
    name: 'Void Walker',
    cost: 1000,
    colors: { primary: '#1a1a2e', secondary: '#0f0f1e', accent: '#8b00ff' },
    rarity: 'legendary',
    description: 'Traveler between worlds'
  },
  {
    id: 'celestial_being',
    name: 'Celestial Being',
    cost: 1200,
    colors: { primary: '#ffffff', secondary: '#f0f8ff', accent: '#ffd700' },
    rarity: 'legendary',
    description: 'Divine presence'
  }
];
