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
    colors: { primary: '#e74c3c', secondary: '#c0392b', accent: '#ecf0f1' },
    rarity: 'common',
    description: 'Bold and fierce'
  },
  {
    id: 'blue_knight',
    name: 'Blue Knight',
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
    id: 'golden_knight',
    name: 'Golden Knight',
    cost: 400,
    colors: { primary: '#f39c12', secondary: '#f1c40f', accent: '#e67e22' },
    rarity: 'epic',
    description: 'Shines with valor'
  },
  {
    id: 'ice_guardian',
    name: 'Ice Guardian',
    cost: 450,
    colors: { primary: '#00d2d3', secondary: '#3498db', accent: '#ffffff' },
    rarity: 'epic',
    description: 'Frozen in time'
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
    id: 'cosmic_champion',
    name: 'Cosmic Champion',
    cost: 900,
    colors: { primary: '#9b59b6', secondary: '#5f27cd', accent: '#ffd93d' },
    rarity: 'legendary',
    description: 'From beyond the stars'
  },
  {
    id: 'inferno_demon',
    name: 'Inferno Demon',
    cost: 750,
    colors: { primary: '#ff4757', secondary: '#ee5a6f', accent: '#000000' },
    rarity: 'legendary',
    description: 'Harbinger of flames'
  },
  {
    id: 'royal_paladin',
    name: 'Royal Paladin',
    cost: 500,
    colors: { primary: '#ffffff', secondary: '#ecf0f1', accent: '#f39c12' },
    rarity: 'epic',
    description: 'Noble and pure'
  },
  {
    id: 'void_walker',
    name: 'Void Walker',
    cost: 850,
    colors: { primary: '#1e1e1e', secondary: '#2c2c54', accent: '#9b59b6' },
    rarity: 'legendary',
    description: 'Master of shadows'
  }
];
