import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { GameEngine } from '../game/GameEngine';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';
import { GAME_CONFIG } from '../data/constants';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameData, updateCoins, incrementWins, incrementLosses } = useGame();
  const navigate = useNavigate();

  const [gamePhase, setGamePhase] = useState<'playing' | 'paused' | 'roundEnd'>('playing');
  const [roundResult, setRoundResult] = useState<{ won: boolean } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      gameData.inventory.equippedSword,
      gameData.inventory.equippedSkin,
      gameData.settings.difficulty
    );

    engine.onRoundEnd = (playerWon: boolean) => {
      setGamePhase('roundEnd');
      setRoundResult({ won: playerWon });

      if (playerWon) {
        updateCoins(GAME_CONFIG.ROUND_WIN_REWARD);
        incrementWins();
      } else {
        incrementLosses();
      }
    };

    engine.start();
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gamePhase !== 'roundEnd') {
        setGamePhase(prev => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [gamePhase]);

  useEffect(() => {
    if (!engineRef.current) return;

    if (gamePhase === 'playing') {
      engineRef.current.resume();
    } else {
      engineRef.current.pause();
    }
  }, [gamePhase]);

  const handleNextRound = () => {
    engineRef.current?.reset();
    engineRef.current?.start();
    setGamePhase('playing');
    setRoundResult(null);
  };

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="border-2 border-gray-700 shadow-2xl max-w-full h-auto"
          style={{ maxHeight: '90vh' }}
        />

        {gamePhase === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center">
              <h2 className="text-4xl font-bold text-white mb-6">Paused</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setGamePhase('playing')}
                  className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold"
                >
                  Resume
                </button>
                <button
                  onClick={handleMainMenu}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-bold"
                >
                  Main Menu
                </button>
              </div>
              <div className="mt-4 text-gray-400 text-sm">Press ESC to resume</div>
            </div>
          </div>
        )}

        {gamePhase === 'roundEnd' && roundResult && (
          <GameOver
            won={roundResult.won}
            coinsEarned={roundResult.won ? GAME_CONFIG.ROUND_WIN_REWARD : 0}
            onNextRound={handleNextRound}
            onMainMenu={handleMainMenu}
          />
        )}

        {gamePhase === 'playing' && <GameHUD coins={gameData.playerStats.coins} />}
      </div>
    </div>
  );
};
