import React from 'react';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';
import './MainMenu.css';

interface MainMenuProps {
  navigate: (screen: 'menu' | 'game' | 'shop' | 'settings') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ navigate }) => {
  const { gameData, loading } = useGame();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const equippedSword = SWORDS.find(s => s.id === gameData.inventory.equippedSword) || SWORDS[0];
  const equippedSkin = SKINS.find(s => s.id === gameData.inventory.equippedSkin) || SKINS[0];

  return (
    <div className="main-menu">
      <div className="header">
        <h1 className="title">Sword Ball Royale</h1>
        <p className="subtitle">Deflect the ball. Eliminate opponents. Be the last one standing.</p>
      </div>

      <div className="stats">
        <div className="stat-item">
          <div className="stat-value">{gameData.playerStats.coins}</div>
          <div className="stat-label">Coins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{gameData.playerStats.wins}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{gameData.playerStats.gamesPlayed}</div>
          <div className="stat-label">Games Played</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {gameData.playerStats.gamesPlayed > 0
              ? Math.round((gameData.playerStats.wins / gameData.playerStats.gamesPlayed) * 100)
              : 0}
            %
          </div>
          <div className="stat-label">Win Rate</div>
        </div>
      </div>

      <div className="equipped-preview">
        <div className="equipped-item">
          <h3>Equipped Sword</h3>
          <div className={`item-card rarity-${equippedSword.rarity}`}>
            <div className="item-visual" style={{ background: equippedSword.color }}></div>
            <div className="item-name">{equippedSword.name}</div>
          </div>
        </div>
        <div className="equipped-item">
          <h3>Equipped Skin</h3>
          <div className={`item-card rarity-${equippedSkin.rarity}`}>
            <div
              className="item-visual"
              style={{
                background: `linear-gradient(135deg, ${equippedSkin.colors.primary}, ${equippedSkin.colors.secondary})`
              }}
            ></div>
            <div className="item-name">{equippedSkin.name}</div>
          </div>
        </div>
      </div>

      <div className="button-grid">
        <button className="btn btn-primary" onClick={() => navigate('game')}>
          Start Game
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('shop')}>
          Shop
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('settings')}>
          Settings
        </button>
      </div>

      <div className="controls-hint">
        <h3>Controls:</h3>
        <p>WASD / Arrow Keys - Move | Mouse - Aim Sword | Click / E - Swing | Space - Block</p>
      </div>
    </div>
  );
};

export default MainMenu;
