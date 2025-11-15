import { GameData, Settings } from './types';

const DB_NAME = 'SwordBallGame';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';
const LOCALSTORAGE_KEY = 'sword-ball-game-data';

class DatabaseService {
  private db: IDBDatabase | null = null;
  private useLocalStorage = false;

  async initDatabase(): Promise<void> {
    try {
      // Try IndexedDB first
      this.db = await this.openDatabase();
      this.useLocalStorage = false;
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      this.useLocalStorage = true;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async getGameData(): Promise<GameData> {
    const defaultData = this.getDefaultGameData();

    if (this.useLocalStorage) {
      return this.getFromLocalStorage();
    }

    if (!this.db) {
      return defaultData;
    }

    try {
      return await this.getFromIndexedDB();
    } catch (error) {
      console.error('Error reading from IndexedDB:', error);
      return defaultData;
    }
  }

  private getFromIndexedDB(): Promise<GameData> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('gameData');

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(this.getDefaultGameData());
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  private getFromLocalStorage(): GameData {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return this.getDefaultGameData();
  }

  async saveGameData(data: GameData): Promise<void> {
    if (this.useLocalStorage) {
      this.saveToLocalStorage(data);
      return;
    }

    if (!this.db) {
      this.saveToLocalStorage(data);
      return;
    }

    try {
      await this.saveToIndexedDB(data);
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      this.saveToLocalStorage(data);
    }
  }

  private saveToIndexedDB(data: GameData): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: 'gameData', data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private saveToLocalStorage(data: GameData): void {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async updateCoins(amount: number): Promise<void> {
    const data = await this.getGameData();
    data.playerStats.coins = Math.max(0, data.playerStats.coins + amount);
    await this.saveGameData(data);
  }

  async purchaseItem(
    itemId: string,
    itemType: 'sword' | 'skin',
    cost: number
  ): Promise<boolean> {
    const data = await this.getGameData();

    if (data.playerStats.coins < cost) {
      return false;
    }

    const ownedItems =
      itemType === 'sword' ? data.inventory.ownedSwords : data.inventory.ownedSkins;

    if (ownedItems.includes(itemId)) {
      return false;
    }

    data.playerStats.coins -= cost;
    ownedItems.push(itemId);

    await this.saveGameData(data);
    return true;
  }

  async equipItem(itemId: string, itemType: 'sword' | 'skin'): Promise<void> {
    const data = await this.getGameData();

    if (itemType === 'sword') {
      if (data.inventory.ownedSwords.includes(itemId)) {
        data.inventory.equippedSword = itemId;
      }
    } else {
      if (data.inventory.ownedSkins.includes(itemId)) {
        data.inventory.equippedSkin = itemId;
      }
    }

    await this.saveGameData(data);
  }

  async incrementWins(): Promise<void> {
    const data = await this.getGameData();
    data.playerStats.wins++;
    data.playerStats.gamesPlayed++;
    await this.saveGameData(data);
  }

  async incrementLosses(): Promise<void> {
    const data = await this.getGameData();
    data.playerStats.losses++;
    data.playerStats.gamesPlayed++;
    await this.saveGameData(data);
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const data = await this.getGameData();
    data.settings = { ...data.settings, ...settings };
    await this.saveGameData(data);
  }

  async resetProgress(): Promise<void> {
    const data = this.getDefaultGameData();
    await this.saveGameData(data);
  }

  private getDefaultGameData(): GameData {
    return {
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
    };
  }
}

export const databaseService = new DatabaseService();
