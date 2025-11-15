import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameData } from './types';
import DatabaseService from './DatabaseService';

interface GameContextType {
  gameData: GameData;
  updateCoins: (amount: number) => Promise<void>;
  purchaseItem: (itemId: string, type: 'sword' | 'skin', cost: number) => Promise<boolean>;
  equipItem: (itemId: string, type: 'sword' | 'skin') => Promise<void>;
  incrementWins: () => Promise<void>;
  incrementLosses: () => Promise<void>;
  updateSettings: (settings: Partial<GameData['settings']>) => Promise<void>;
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

  const refreshData = async () => {
    const data = await DatabaseService.getGameData();
    setGameData(data);
  };

  useEffect(() => {
    DatabaseService.initDatabase().then(() => {
      refreshData();
    });
  }, []);

  const updateCoins = async (amount: number) => {
    await DatabaseService.updateCoins(amount);
    await refreshData();
  };

  const purchaseItem = async (itemId: string, type: 'sword' | 'skin', cost: number) => {
    const success = await DatabaseService.purchaseItem(itemId, type, cost);
    if (success) {
      await refreshData();
    }
    return success;
  };

  const equipItem = async (itemId: string, type: 'sword' | 'skin') => {
    await DatabaseService.equipItem(itemId, type);
    await refreshData();
  };

  const incrementWins = async () => {
    await DatabaseService.incrementWins();
    await refreshData();
  };

  const incrementLosses = async () => {
    await DatabaseService.incrementLosses();
    await refreshData();
  };

  const updateSettings = async (settings: Partial<GameData['settings']>) => {
    await DatabaseService.updateSettings(settings);
    await refreshData();
  };

  const resetProgress = async () => {
    await DatabaseService.resetProgress();
    await refreshData();
  };

  const contextValue: GameContextType = {
    gameData,
    updateCoins,
    purchaseItem,
    equipItem,
    incrementWins,
    incrementLosses,
    updateSettings,
    resetProgress,
    refreshData,
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
