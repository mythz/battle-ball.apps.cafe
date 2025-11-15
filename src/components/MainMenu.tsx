import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

const MainMenu: React.FC = () => {
  const { gameData } = useGame();
  const navigate = useNavigate();

  const equippedSword = SWORDS.find((s) => s.id === gameData.inventory.equippedSword);
  const equippedSkin = SKINS.find((s) => s.id === gameData.inventory.equippedSkin);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-2xl w-full">
        {/* Title */}
        <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Sword Ball Royale
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Deflect the ball with your sword and be the last one standing!
        </p>

        {/* Player Stats */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{gameData.playerStats.coins}</div>
              <div className="text-sm text-gray-400">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{gameData.playerStats.wins}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{gameData.playerStats.losses}</div>
              <div className="text-sm text-gray-400">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{gameData.playerStats.gamesPlayed}</div>
              <div className="text-sm text-gray-400">Games</div>
            </div>
          </div>
        </div>

        {/* Equipped Items */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-2">Equipped Sword</h3>
            <div className="text-xl font-bold" style={{ color: equippedSword?.color || '#fff' }}>
              {equippedSword?.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">{equippedSword?.rarity}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-2">Equipped Skin</h3>
            <div className="text-xl font-bold" style={{ color: equippedSkin?.colors.primary || '#fff' }}>
              {equippedSkin?.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">{equippedSkin?.rarity}</div>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/game')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Start Game
          </button>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Shop
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Controls Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Controls: WASD/Arrows to move • Mouse to aim • Click to swing • Space to block</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
