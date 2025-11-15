import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameData, Settings } from './types';
import { databaseService } from './DatabaseService';

interface GameContextType {
  gameData: GameData;
  loading: boolean;
  updateCoins: (amount: number) => Promise<void>;
  purchaseItem: (itemId: string, type: 'sword' | 'skin', cost: number) => Promise<boolean>;
  equipItem: (itemId: string, type: 'sword' | 'skin') => Promise<void>;
  incrementWins: () => Promise<void>;
  incrementLosses: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  resetProgress: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<GameData>({
    playerStats: {
      coins: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0
    },
    inventory: {
      ownedSwords: ['wooden_sword'],
      ownedSkins: ['default_hero'],
      equippedSword: 'wooden_sword',
      equippedSkin: 'default_hero'
    },
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      difficulty: 'medium'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        await databaseService.initDatabase();
        const data = await databaseService.getGameData();
        setGameData(data);
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const refreshData = async () => {
    const data = await databaseService.getGameData();
    setGameData(data);
  };

  const updateCoins = async (amount: number) => {
    await databaseService.updateCoins(amount);
    await refreshData();
  };

  const purchaseItem = async (
    itemId: string,
    type: 'sword' | 'skin',
    cost: number
  ): Promise<boolean> => {
    const success = await databaseService.purchaseItem(itemId, type, cost);
    if (success) {
      await refreshData();
    }
    return success;
  };

  const equipItem = async (itemId: string, type: 'sword' | 'skin') => {
    await databaseService.equipItem(itemId, type);
    await refreshData();
  };

  const incrementWins = async () => {
    await databaseService.incrementWins();
    await refreshData();
  };

  const incrementLosses = async () => {
    await databaseService.incrementLosses();
    await refreshData();
  };

  const updateSettings = async (settings: Partial<Settings>) => {
    await databaseService.updateSettings(settings);
    await refreshData();
  };

  const resetProgress = async () => {
    await databaseService.resetProgress();
    await refreshData();
  };

  const contextValue: GameContextType = {
    gameData,
    loading,
    updateCoins,
    purchaseItem,
    equipItem,
    incrementWins,
    incrementLosses,
    updateSettings,
    resetProgress,
    refreshData
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
