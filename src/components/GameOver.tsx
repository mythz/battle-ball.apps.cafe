import React from 'react';

interface GameOverProps {
  won: boolean;
  coinsEarned: number;
  onNextRound: () => void;
  onMainMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  won,
  coinsEarned,
  onNextRound,
  onMainMenu,
}) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h1 className={won ? 'victory' : 'defeat'}>
          {won ? 'Victory!' : 'Defeated'}
        </h1>

        {won && (
          <div className="rewards">
            <p>You earned</p>
            <div className="coins-earned">
              <span className="coin-icon">🪙</span>
              <span>+{coinsEarned}</span>
            </div>
          </div>
        )}

        {!won && (
          <p className="encouragement">
            Better luck next round!
          </p>
        )}

        <div className="game-over-buttons">
          <button onClick={onNextRound} className="next-round-btn">
            Next Round
          </button>
          <button onClick={onMainMenu} className="main-menu-btn">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
