import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { GameEngine } from '../game/GameEngine';
import { GAME_CONFIG } from '../data/constants';
import GameOver from './GameOver';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameData, updateCoins, incrementWins, incrementLosses } = useGame();
  const navigate = useNavigate();

  const [gamePhase, setGamePhase] = useState<'playing' | 'paused' | 'roundEnd'>('playing');
  const [roundResult, setRoundResult] = useState<{ won: boolean } | null>(null);

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engine.setDifficulty(gameData.settings.difficulty);
    engine.setEquippedItems(gameData.inventory.equippedSword, gameData.inventory.equippedSkin);

    // Setup round end callback
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

  // Handle escape key for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gamePhase !== 'roundEnd') {
        setGamePhase((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase]);

  // Handle pause/resume
  useEffect(() => {
    if (!engineRef.current) return;

    if (gamePhase === 'playing') {
      engineRef.current.resume();
    } else if (gamePhase === 'paused') {
      engineRef.current.pause();
    }
  }, [gamePhase]);

  const handleNextRound = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      engineRef.current.start();
      setGamePhase('playing');
      setRoundResult(null);
    }
  };

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Pause Overlay */}
        {gamePhase === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-8">Paused</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setGamePhase('playing')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
                >
                  Resume
                </button>
                <button
                  onClick={handleMainMenu}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
                >
                  Main Menu
                </button>
              </div>
              <p className="mt-4 text-gray-400 text-sm">Press ESC to resume</p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gamePhase === 'roundEnd' && roundResult && (
          <GameOver
            won={roundResult.won}
            coinsEarned={roundResult.won ? GAME_CONFIG.ROUND_WIN_REWARD : 0}
            onNextRound={handleNextRound}
            onMainMenu={handleMainMenu}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
