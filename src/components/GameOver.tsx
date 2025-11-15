import React from 'react';

interface GameOverProps {
  won: boolean;
  coinsEarned: number;
  onNextRound: () => void;
  onMainMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ won, coinsEarned, onNextRound, onMainMenu }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h1 className={`text-5xl font-bold text-center mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
          {won ? '🎉 Victory!' : '💀 Defeated'}
        </h1>

        {won && (
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">You earned</p>
            <div className="text-4xl font-bold text-yellow-400">+{coinsEarned} Coins</div>
          </div>
        )}

        {!won && (
          <p className="text-center text-gray-400 mb-6">
            Better luck next round!
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onNextRound}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Next Round
          </button>
          <button
            onClick={onMainMenu}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
