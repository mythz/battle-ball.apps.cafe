import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

export const Settings: React.FC = () => {
  const { gameData, updateSettings, resetProgress } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const navigate = useNavigate();

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
            onChange={(e) => handleVolumeChange('music', parseInt(e.target.value))}
          />
          <span>{Math.round(gameData.settings.musicVolume * 100)}%</span>
        </div>
        <div className="slider-control">
          <label>SFX Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={gameData.settings.sfxVolume * 100}
            onChange={(e) => handleVolumeChange('sfx', parseInt(e.target.value))}
          />
          <span>{Math.round(gameData.settings.sfxVolume * 100)}%</span>
        </div>
      </div>

      <div className="setting-group">
        <h2>Difficulty</h2>
        <div className="difficulty-buttons">
          {(['easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              className={`difficulty-btn ${
                gameData.settings.difficulty === diff ? 'active' : ''
              }`}
              onClick={() => handleDifficultyChange(diff)}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
        <p className="difficulty-hint">
          {gameData.settings.difficulty === 'easy' &&
            'AI opponents are slower and less accurate'}
          {gameData.settings.difficulty === 'medium' &&
            'Balanced challenge for most players'}
          {gameData.settings.difficulty === 'hard' &&
            'AI opponents are fast and skilled'}
        </p>
      </div>

      <div className="setting-group danger-zone">
        <h2>Danger Zone</h2>
        <button onClick={() => setShowResetConfirm(true)} className="reset-button">
          Reset All Progress
        </button>
      </div>

      {showResetConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h2>Reset Progress?</h2>
            <p>
              This will delete all your coins, items, and stats. This cannot be undone.
            </p>
            <div className="confirm-buttons">
              <button onClick={handleReset} className="confirm-yes">
                Yes, Reset
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="confirm-no">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => navigate('/')} className="back-button">
        Back
      </button>
    </div>
  );
};
