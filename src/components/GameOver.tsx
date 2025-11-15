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
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-md">
        <h1
          className={`text-5xl font-bold mb-6 ${
            won
              ? 'text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text'
              : 'text-red-500'
          }`}
        >
          {won ? 'Victory!' : 'Defeated'}
        </h1>

        {won && (
          <div className="mb-6">
            <p className="text-gray-300 text-lg mb-2">You earned</p>
            <div className="text-yellow-400 text-4xl font-bold">
              +{coinsEarned} Coins
            </div>
          </div>
        )}

        {!won && (
          <p className="text-gray-400 text-lg mb-6">
            Better luck next round!
          </p>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={onNextRound}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg"
          >
            Next Round
          </button>
          <button
            onClick={onMainMenu}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-3 rounded-lg font-bold text-lg"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
