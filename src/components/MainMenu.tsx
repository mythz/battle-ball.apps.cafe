import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

export const MainMenu: React.FC = () => {
  const { gameData } = useGame();
  const navigate = useNavigate();

  const equippedSword = SWORDS.find(s => s.id === gameData.inventory.equippedSword) || SWORDS[0];
  const equippedSkin = SKINS.find(s => s.id === gameData.inventory.equippedSkin) || SKINS[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <h1 className="text-6xl font-bold text-white mb-4 text-center">
        <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          Sword Ball
        </span>
        <br />
        <span className="text-4xl">Battle Royale</span>
      </h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-2xl">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-yellow-400 text-3xl font-bold">{gameData.playerStats.coins}</div>
            <div className="text-gray-400 text-sm">Coins</div>
          </div>
          <div>
            <div className="text-green-400 text-3xl font-bold">{gameData.playerStats.wins}</div>
            <div className="text-gray-400 text-sm">Wins</div>
          </div>
          <div>
            <div className="text-blue-400 text-3xl font-bold">{gameData.playerStats.gamesPlayed}</div>
            <div className="text-gray-400 text-sm">Games</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md mb-8">
        <button
          onClick={() => navigate('/game')}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-4 rounded-lg text-2xl font-bold shadow-lg transform transition"
        >
          Start Game
        </button>
        <button
          onClick={() => navigate('/shop')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transform transition"
        >
          Shop
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transform transition"
        >
          Settings
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md w-full">
        <h3 className="text-white text-xl font-bold mb-4 text-center">Equipped Items</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Sword</div>
            <div className="text-white font-bold">{equippedSword.name}</div>
            <div className="text-xs text-gray-500 mt-1">{equippedSword.rarity}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Skin</div>
            <div className="text-white font-bold">{equippedSkin.name}</div>
            <div className="text-xs text-gray-500 mt-1">{equippedSkin.rarity}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm text-center max-w-md">
        <p>Use WASD to move, mouse to aim, click to swing, space to block</p>
      </div>
    </div>
  );
};
