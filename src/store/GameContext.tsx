import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameData } from './types';
import { databaseService } from './DatabaseService';

interface GameContextType {
  gameData: GameData;
  updateCoins: (amount: number) => Promise<void>;
  purchaseItem: (itemId: string, type: 'sword' | 'skin', cost: number) => Promise<boolean>;
  equipItem: (itemId: string, type: 'sword' | 'skin') => Promise<void>;
  incrementWins: () => Promise<void>;
  incrementLosses: () => Promise<void>;
  updateSettings: (settings: Partial<GameData['settings']>) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<GameData>({
    playerStats: {
      coins: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    },
    inventory: {
      ownedSwords: ['wooden_sword'],
      ownedSkins: ['default_hero'],
      equippedSword: 'wooden_sword',
      equippedSkin: 'default_hero',
    },
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.5,
      difficulty: 'medium',
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await databaseService.initDatabase();
        const data = await databaseService.getGameData();
        setGameData(data);
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateCoins = async (amount: number) => {
    const newData = await databaseService.updateCoins(gameData, amount);
    setGameData(newData);
  };

  const purchaseItem = async (
    itemId: string,
    type: 'sword' | 'skin',
    cost: number
  ): Promise<boolean> => {
    const result = await databaseService.purchaseItem(gameData, itemId, type, cost);
    if (result.success) {
      setGameData(result.data);
    }
    return result.success;
  };

  const equipItem = async (itemId: string, type: 'sword' | 'skin') => {
    const newData = await databaseService.equipItem(gameData, itemId, type);
    setGameData(newData);
  };

  const incrementWins = async () => {
    const newData = await databaseService.incrementWins(gameData);
    setGameData(newData);
  };

  const incrementLosses = async () => {
    const newData = await databaseService.incrementLosses(gameData);
    setGameData(newData);
  };

  const updateSettings = async (settings: Partial<GameData['settings']>) => {
    const newData = await databaseService.updateSettings(gameData, settings);
    setGameData(newData);
  };

  const resetProgress = async () => {
    const newData = await databaseService.resetProgress();
    setGameData(newData);
  };

  return (
    <GameContext.Provider
      value={{
        gameData,
        updateCoins,
        purchaseItem,
        equipItem,
        incrementWins,
        incrementLosses,
        updateSettings,
        resetProgress,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
