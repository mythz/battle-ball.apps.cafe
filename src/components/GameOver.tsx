import React from 'react';
import './GameOver.css';

interface GameOverProps {
  won: boolean;
  coinsEarned: number;
  onNextRound: () => void;
  onMainMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ won, coinsEarned, onNextRound, onMainMenu }) => {
  return (
    <div className="overlay">
      <div className="game-over-modal">
        <h1 className={won ? 'victory' : 'defeat'}>
          {won ? 'Victory!' : 'Defeated'}
        </h1>

        {won && (
          <div className="rewards">
            <p>You earned</p>
            <div className="coins-earned">+{coinsEarned} Coins</div>
          </div>
        )}

        {!won && (
          <p className="encouragement">Better luck next round!</p>
        )}

        <div className="button-group">
          <button onClick={onNextRound} className="btn btn-primary">
            Next Round
          </button>
          <button onClick={onMainMenu} className="btn btn-secondary">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
