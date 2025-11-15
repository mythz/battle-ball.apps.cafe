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
    colors: { primary: '#e74c3c', secondary: '#c0392b', accent: '#ffffff' },
    rarity: 'common',
    description: 'Bold and fierce'
  },
  {
    id: 'blue_guardian',
    name: 'Blue Guardian',
    cost: 150,
    colors: { primary: '#3498db', secondary: '#2980b9', accent: '#ecf0f1' },
    rarity: 'common',
    description: 'Calm and steady'
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
    id: 'forest_ranger',
    name: 'Forest Ranger',
    cost: 250,
    colors: { primary: '#27ae60', secondary: '#2ecc71', accent: '#7f8c8d' },
    rarity: 'rare',
    description: 'One with nature'
  },
  {
    id: 'arctic_warrior',
    name: 'Arctic Warrior',
    cost: 300,
    colors: { primary: '#ecf0f1', secondary: '#bdc3c7', accent: '#3498db' },
    rarity: 'rare',
    description: 'Cold as ice'
  },
  {
    id: 'purple_mage',
    name: 'Purple Mage',
    cost: 350,
    colors: { primary: '#9b59b6', secondary: '#8e44ad', accent: '#f1c40f' },
    rarity: 'epic',
    description: 'Mystical power'
  },
  {
    id: 'crimson_demon',
    name: 'Crimson Demon',
    cost: 500,
    colors: { primary: '#8b0000', secondary: '#ff0000', accent: '#ff4500' },
    rarity: 'epic',
    description: 'Fearsome presence'
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
    id: 'obsidian_phantom',
    name: 'Obsidian Phantom',
    cost: 700,
    colors: { primary: '#1a1a1a', secondary: '#4a4a4a', accent: '#9b59b6' },
    rarity: 'legendary',
    description: 'Dark as the void'
  },
  {
    id: 'solar_champion',
    name: 'Solar Champion',
    cost: 900,
    colors: { primary: '#ffd700', secondary: '#ff8c00', accent: '#ffffff' },
    rarity: 'legendary',
    description: 'Radiant and powerful'
  },
];
