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
  const [gamePhase, setGamePhase] = useState<'playing' | 'paused' | 'roundEnd'>('playing');
  const [roundResult, setRoundResult] = useState<{ won: boolean } | null>(null);
  const navigate = useNavigate();

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
      if (e.key === 'Escape' && gamePhase === 'playing') {
        setGamePhase('paused');
        engineRef.current?.pause();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [gamePhase]);

  const handleResume = () => {
    setGamePhase('playing');
    engineRef.current?.resume();
  };

  const handleNextRound = () => {
    if (engineRef.current) {
      engineRef.current.reset(
        gameData.inventory.equippedSword,
        gameData.inventory.equippedSkin
      );
      engineRef.current.start();
    }
    setGamePhase('playing');
    setRoundResult(null);
  };

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        className="game-canvas"
      />

      <GameHUD coins={gameData.playerStats.coins} />

      {gamePhase === 'paused' && (
        <div className="pause-overlay">
          <div className="pause-modal">
            <h1>Paused</h1>
            <div className="pause-buttons">
              <button onClick={handleResume} className="resume-btn">
                Resume
              </button>
              <button onClick={handleMainMenu} className="main-menu-btn">
                Main Menu
              </button>
            </div>
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
    </div>
  );
};
