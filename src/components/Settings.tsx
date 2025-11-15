import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import './Settings.css';

interface SettingsProps {
  navigate: (screen: 'menu' | 'game' | 'shop' | 'settings') => void;
}

const Settings: React.FC<SettingsProps> = ({ navigate }) => {
  const { gameData, updateSettings, resetProgress } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVolumeChange = (type: 'music' | 'sfx', value: number) => {
    updateSettings({
      [`${type}Volume`]: value
    });
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    updateSettings({
      difficulty
    });
  };

  const handleReset = async () => {
    await resetProgress();
    setShowResetConfirm(false);
    navigate('menu');
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="setting-section">
        <h2>Audio</h2>
        <div className="setting-item">
          <label>Music Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={gameData.settings.musicVolume * 100}
            onChange={e => handleVolumeChange('music', parseInt(e.target.value) / 100)}
            className="slider"
          />
          <span className="value">{Math.round(gameData.settings.musicVolume * 100)}%</span>
        </div>
        <div className="setting-item">
          <label>SFX Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={gameData.settings.sfxVolume * 100}
            onChange={e => handleVolumeChange('sfx', parseInt(e.target.value) / 100)}
            className="slider"
          />
          <span className="value">{Math.round(gameData.settings.sfxVolume * 100)}%</span>
        </div>
      </div>

      <div className="setting-section">
        <h2>Difficulty</h2>
        <div className="difficulty-buttons">
          {['easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              className={`difficulty-btn ${
                gameData.settings.difficulty === diff ? 'active' : ''
              }`}
              onClick={() => handleDifficultyChange(diff as 'easy' | 'medium' | 'hard')}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
        <p className="difficulty-description">
          {gameData.settings.difficulty === 'easy' &&
            'Easy: AI bots have slower reactions and lower accuracy.'}
          {gameData.settings.difficulty === 'medium' &&
            'Medium: Balanced AI behavior for a fair challenge.'}
          {gameData.settings.difficulty === 'hard' &&
            'Hard: AI bots are highly skilled and aggressive!'}
        </p>
      </div>

      <div className="setting-section danger-zone">
        <h2>Danger Zone</h2>
        <p className="warning">This action cannot be undone!</p>
        <button className="btn btn-danger" onClick={() => setShowResetConfirm(true)}>
          Reset All Progress
        </button>
      </div>

      {showResetConfirm && (
        <div className="overlay">
          <div className="confirm-dialog">
            <h2>Reset Progress?</h2>
            <p>This will delete all your coins, items, and stats. This cannot be undone.</p>
            <div className="button-group">
              <button className="btn btn-danger" onClick={handleReset}>
                Confirm Reset
              </button>
              <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => navigate('menu')} className="btn btn-secondary back-button">
        Back to Menu
      </button>
    </div>
  );
};

export default Settings;
