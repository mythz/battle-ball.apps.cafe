import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';

export const MainMenu: React.FC = () => {
  const { gameData } = useGame();
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1 className="game-title">Sword Ball Royale</h1>
        <p className="game-subtitle">Deflect the ball. Eliminate your opponents. Be the last one standing!</p>

        <div className="player-stats">
          <div className="stat-item">
            <span className="stat-label">Coins:</span>
            <span className="stat-value">
              <span className="coin-icon">🪙</span> {gameData.playerStats.coins}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wins:</span>
            <span className="stat-value">{gameData.playerStats.wins}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Games:</span>
            <span className="stat-value">{gameData.playerStats.gamesPlayed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Win Rate:</span>
            <span className="stat-value">
              {gameData.playerStats.gamesPlayed > 0
                ? Math.round((gameData.playerStats.wins / gameData.playerStats.gamesPlayed) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        <div className="menu-buttons">
          <button onClick={() => navigate('/game')} className="menu-btn primary">
            Start Game
          </button>
          <button onClick={() => navigate('/shop')} className="menu-btn">
            Shop
          </button>
          <button onClick={() => navigate('/settings')} className="menu-btn">
            Settings
          </button>
        </div>

        <div className="how-to-play">
          <h3>How to Play</h3>
          <ul>
            <li>Use <kbd>WASD</kbd> or arrow keys to move</li>
            <li>Aim with your <kbd>mouse</kbd></li>
            <li><kbd>Click</kbd> to swing your sword</li>
            <li>Hold <kbd>Space</kbd> to block incoming balls</li>
            <li>Hit the ball with your sword to deflect it toward enemies</li>
            <li>Last player standing wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
