import { GameData } from './types';

const DB_NAME = 'SwordBallGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';
const LOCALSTORAGE_KEY = 'sword-ball-game-data';

class DatabaseService {
  private db: IDBDatabase | null = null;
  private useLocalStorage = false;

  async initDatabase(): Promise<void> {
    try {
      return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.warn('IndexedDB failed, falling back to localStorage');
          this.useLocalStorage = true;
          resolve();
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage');
      this.useLocalStorage = true;
    }
  }

  private getDefaultGameData(): GameData {
    return {
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
    };
  }

  async getGameData(): Promise<GameData> {
    if (this.useLocalStorage) {
      return this.getFromLocalStorage();
    }

    try {
      return new Promise((resolve) => {
        if (!this.db) {
          resolve(this.getDefaultGameData());
          return;
        }

        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('gameData');

        request.onsuccess = () => {
          resolve(request.result || this.getDefaultGameData());
        };

        request.onerror = () => {
          console.error('Error loading game data');
          resolve(this.getDefaultGameData());
        };
      });
    } catch (error) {
      return this.getFromLocalStorage();
    }
  }

  async saveGameData(data: GameData): Promise<void> {
    if (this.useLocalStorage) {
      this.saveToLocalStorage(data);
      return;
    }

    try {
      return new Promise((resolve) => {
        if (!this.db) {
          this.saveToLocalStorage(data);
          resolve();
          return;
        }

        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data, 'gameData');

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error saving game data');
          this.saveToLocalStorage(data);
          resolve();
        };
      });
    } catch (error) {
      this.saveToLocalStorage(data);
    }
  }

  async updateCoins(currentData: GameData, amount: number): Promise<GameData> {
    const newData = { ...currentData };
    newData.playerStats.coins = Math.max(0, newData.playerStats.coins + amount);
    await this.saveGameData(newData);
    return newData;
  }

  async purchaseItem(
    currentData: GameData,
    itemId: string,
    itemType: 'sword' | 'skin',
    cost: number
  ): Promise<{ success: boolean; data: GameData }> {
    if (currentData.playerStats.coins < cost) {
      return { success: false, data: currentData };
    }

    const newData = { ...currentData };
    newData.playerStats.coins -= cost;

    if (itemType === 'sword') {
      if (!newData.inventory.ownedSwords.includes(itemId)) {
        newData.inventory.ownedSwords.push(itemId);
      }
    } else {
      if (!newData.inventory.ownedSkins.includes(itemId)) {
        newData.inventory.ownedSkins.push(itemId);
      }
    }

    await this.saveGameData(newData);
    return { success: true, data: newData };
  }

  async equipItem(
    currentData: GameData,
    itemId: string,
    itemType: 'sword' | 'skin'
  ): Promise<GameData> {
    const newData = { ...currentData };

    if (itemType === 'sword') {
      newData.inventory.equippedSword = itemId;
    } else {
      newData.inventory.equippedSkin = itemId;
    }

    await this.saveGameData(newData);
    return newData;
  }

  async incrementWins(currentData: GameData): Promise<GameData> {
    const newData = { ...currentData };
    newData.playerStats.wins += 1;
    newData.playerStats.gamesPlayed += 1;
    await this.saveGameData(newData);
    return newData;
  }

  async incrementLosses(currentData: GameData): Promise<GameData> {
    const newData = { ...currentData };
    newData.playerStats.losses += 1;
    newData.playerStats.gamesPlayed += 1;
    await this.saveGameData(newData);
    return newData;
  }

  async updateSettings(
    currentData: GameData,
    settings: Partial<GameData['settings']>
  ): Promise<GameData> {
    const newData = { ...currentData };
    newData.settings = { ...newData.settings, ...settings };
    await this.saveGameData(newData);
    return newData;
  }

  async resetProgress(): Promise<GameData> {
    const defaultData = this.getDefaultGameData();
    await this.saveGameData(defaultData);
    return defaultData;
  }

  // LocalStorage fallback methods
  private getFromLocalStorage(): GameData {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultGameData();
    } catch (error) {
      return this.getDefaultGameData();
    }
  }

  private saveToLocalStorage(data: GameData): void {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }
}

export const databaseService = new DatabaseService();
