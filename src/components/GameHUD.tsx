import React from 'react';

interface GameHUDProps {
  coins: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ coins }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
      <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg">
        <div className="text-yellow-400 font-bold text-xl">
          {coins} Coins
        </div>
      </div>

      <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg text-right">
        <div className="text-gray-300 text-sm">ESC - Pause</div>
      </div>
    </div>
  );
};
