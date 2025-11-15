import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { useGame } from '../store/GameContext';
import { GAME_CONFIG } from '../data/constants';
import GameOver from './GameOver';
import './Game.css';

interface GameProps {
  navigate: (screen: 'menu' | 'game' | 'shop' | 'settings') => void;
}

const Game: React.FC<GameProps> = ({ navigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameData, updateCoins, incrementWins, incrementLosses } = useGame();
  const [gamePhase, setGamePhase] = useState<'playing' | 'paused' | 'roundEnd'>('playing');
  const [roundResult, setRoundResult] = useState<{ won: boolean } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GameEngine(
      canvas,
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
    if (engineRef.current) {
      engineRef.current.reset();
      engineRef.current.start();
      setGamePhase('playing');
      setRoundResult(null);
    }
  };

  const handleMainMenu = () => {
    navigate('menu');
  };

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        className="game-canvas"
      />

      {gamePhase === 'paused' && (
        <div className="overlay">
          <div className="pause-menu">
            <h2>Paused</h2>
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => setGamePhase('playing')}>
                Resume
              </button>
              <button className="btn btn-secondary" onClick={handleMainMenu}>
                Main Menu
              </button>
            </div>
            <p className="hint">Press ESC to resume</p>
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

      <div className="game-hud">
        <div className="hud-item">
          <span>Coins: {gameData.playerStats.coins}</span>
        </div>
        <div className="hud-item">
          <span>ESC - Pause</span>
        </div>
      </div>
    </div>
  );
};

export default Game;
