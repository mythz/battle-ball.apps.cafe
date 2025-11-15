import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

const Settings: React.FC = () => {
  const { gameData, updateSettings, resetProgress } = useGame();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVolumeChange = (type: 'music' | 'sfx', value: number) => {
    updateSettings({
      [`${type}Volume`]: value,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Back
          </button>
        </div>

        {/* Audio Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Audio</h2>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Music Volume</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={gameData.settings.musicVolume * 100}
                onChange={(e) => handleVolumeChange('music', parseInt(e.target.value) / 100)}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-white w-12 text-right">
                {Math.round(gameData.settings.musicVolume * 100)}%
              </span>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">SFX Volume</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={gameData.settings.sfxVolume * 100}
                onChange={(e) => handleVolumeChange('sfx', parseInt(e.target.value) / 100)}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-white w-12 text-right">
                {Math.round(gameData.settings.sfxVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Settings */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Difficulty</h2>
          <p className="text-gray-400 text-sm mb-4">Controls how challenging the AI opponents are</p>

          <div className="grid grid-cols-3 gap-4">
            {['easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff as any)}
                className={`py-3 px-6 rounded-lg font-bold transition-all ${
                  gameData.settings.difficulty === diff
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Controls</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Movement</div>
              <div className="text-white">WASD or Arrow Keys</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Aim Sword</div>
              <div className="text-white">Mouse/Touch</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Swing Sword</div>
              <div className="text-white">Left Click or E</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Block</div>
              <div className="text-white">Spacebar</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Pause</div>
              <div className="text-white">ESC</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900 bg-opacity-30 border-2 border-red-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-4">
            This will delete all your progress, coins, and unlocked items.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Reset All Progress
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-4">
              <h2 className="text-2xl font-bold text-white mb-4">Reset Progress?</h2>
              <p className="text-gray-400 mb-6">
                This will delete all your coins, items, and stats. This cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
