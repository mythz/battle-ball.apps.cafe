import React from 'react';

interface GameHUDProps {
  coins: number;
  remainingPlayers?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ coins, remainingPlayers = 0 }) => {
  return (
    <div className="game-hud">
      <div className="hud-top-left">
        <div className="coins-display">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{coins}</span>
        </div>
      </div>
      {remainingPlayers > 0 && (
        <div className="hud-top-right">
          <div className="players-remaining">
            <span>Players: {remainingPlayers}</span>
          </div>
        </div>
      )}
      <div className="hud-controls">
        <div className="control-hint">
          <kbd>WASD</kbd> Move
        </div>
        <div className="control-hint">
          <kbd>Mouse</kbd> Aim
        </div>
        <div className="control-hint">
          <kbd>Click</kbd> Swing
        </div>
        <div className="control-hint">
          <kbd>Space</kbd> Block
        </div>
      </div>
    </div>
  );
};
