import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DatabaseService from './DatabaseService';
import { GameData } from './types';

interface GameContextType {
  gameData: GameData;
  updateCoins: (amount: number) => Promise<void>;
  purchaseItem: (itemId: string, type: 'sword' | 'skin', cost: number) => Promise<boolean>;
  equipItem: (itemId: string, type: 'sword' | 'skin') => Promise<void>;
  incrementWins: () => Promise<void>;
  incrementLosses: () => Promise<void>;
  updateSettings: (settings: Partial<GameData['settings']>) => Promise<void>;
  resetProgress: () => Promise<void>;
  refreshGameData: () => Promise<void>;
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

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      await DatabaseService.initDatabase();
      const data = await DatabaseService.getGameData();
      setGameData(data);
    };

    loadData();
  }, []);

  const refreshGameData = async () => {
    const data = await DatabaseService.getGameData();
    setGameData(data);
  };

  const updateCoins = async (amount: number) => {
    await DatabaseService.updateCoins(amount);
    await refreshGameData();
  };

  const purchaseItem = async (itemId: string, type: 'sword' | 'skin', cost: number): Promise<boolean> => {
    const success = await DatabaseService.purchaseItem(itemId, type, cost);
    if (success) {
      await refreshGameData();
    }
    return success;
  };

  const equipItem = async (itemId: string, type: 'sword' | 'skin') => {
    await DatabaseService.equipItem(itemId, type);
    await refreshGameData();
  };

  const incrementWins = async () => {
    await DatabaseService.incrementWins();
    await refreshGameData();
  };

  const incrementLosses = async () => {
    await DatabaseService.incrementLosses();
    await refreshGameData();
  };

  const updateSettings = async (settings: Partial<GameData['settings']>) => {
    await DatabaseService.updateSettings(settings);
    await refreshGameData();
  };

  const resetProgress = async () => {
    await DatabaseService.resetProgress();
    await refreshGameData();
  };

  const value: GameContextType = {
    gameData,
    updateCoins,
    purchaseItem,
    equipItem,
    incrementWins,
    incrementLosses,
    updateSettings,
    resetProgress,
    refreshGameData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
