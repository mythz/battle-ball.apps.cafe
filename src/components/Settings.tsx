import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

export const Settings: React.FC = () => {
  const { gameData, updateSettings, resetProgress } = useGame();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVolumeChange = (type: 'music' | 'sfx', value: number) => {
    updateSettings({
      [`${type}Volume`]: value / 100,
    } as any);
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateSettings({ difficulty });
  };

  const handleReset = async () => {
    await resetProgress();
    setShowResetConfirm(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Audio</h2>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Music Volume: {Math.round(gameData.settings.musicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={gameData.settings.musicVolume * 100}
              onChange={e => handleVolumeChange('music', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              SFX Volume: {Math.round(gameData.settings.sfxVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={gameData.settings.sfxVolume * 100}
              onChange={e => handleVolumeChange('sfx', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Difficulty</h2>
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`flex-1 px-6 py-3 rounded-lg font-bold text-lg transition ${
                  gameData.settings.difficulty === diff
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-3">
            {gameData.settings.difficulty === 'easy' && 'AI opponents are less aggressive'}
            {gameData.settings.difficulty === 'medium' && 'Balanced challenge'}
            {gameData.settings.difficulty === 'hard' && 'AI opponents are highly skilled'}
          </p>
        </div>

        <div className="bg-red-900 bg-opacity-30 border-2 border-red-600 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-300 mb-4">
            Reset all your progress, including coins, items, and stats.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            Reset All Progress
          </button>
        </div>

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md">
              <h3 className="text-2xl font-bold text-white mb-4">Are you sure?</h3>
              <p className="text-gray-300 mb-6">
                This will delete all your coins, items, and stats. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
