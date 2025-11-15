import { GameData } from './types';

const DB_NAME = 'sword-ball-game';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';
const LOCALSTORAGE_KEY = 'sword-ball-game-data';

class DatabaseService {
  private db: IDBDatabase | null = null;
  private useLocalStorage = false;

  // Default game data
  private getDefaultData(): GameData {
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
      console.warn('IndexedDB initialization failed:', error);
      this.useLocalStorage = true;
    }
  }

  async getGameData(): Promise<GameData> {
    if (this.useLocalStorage) {
      return this.getFromLocalStorage();
    }

    try {
      return new Promise((resolve) => {
        if (!this.db) {
          resolve(this.getDefaultData());
          return;
        }

        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('gameData');

        request.onsuccess = () => {
          resolve(request.result || this.getDefaultData());
        };

        request.onerror = () => {
          console.warn('Failed to read from IndexedDB, using default data');
          resolve(this.getDefaultData());
        };
      });
    } catch (error) {
      console.warn('Error reading game data:', error);
      return this.getDefaultData();
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
          console.warn('Failed to save to IndexedDB, using localStorage');
          this.saveToLocalStorage(data);
          resolve();
        };
      });
    } catch (error) {
      console.warn('Error saving game data:', error);
      this.saveToLocalStorage(data);
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

    const inventoryKey = itemType === 'sword' ? 'ownedSwords' : 'ownedSkins';

    if (data.inventory[inventoryKey].includes(itemId)) {
      return false; // Already owned
    }

    data.playerStats.coins -= cost;
    data.inventory[inventoryKey].push(itemId);

    await this.saveGameData(data);
    return true;
  }

  async equipItem(itemId: string, itemType: 'sword' | 'skin'): Promise<void> {
    const data = await this.getGameData();
    const inventoryKey = itemType === 'sword' ? 'ownedSwords' : 'ownedSkins';

    if (!data.inventory[inventoryKey].includes(itemId)) {
      return; // Can't equip if not owned
    }

    if (itemType === 'sword') {
      data.inventory.equippedSword = itemId;
    } else {
      data.inventory.equippedSkin = itemId;
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

  async updateSettings(settings: Partial<GameData['settings']>): Promise<void> {
    const data = await this.getGameData();
    data.settings = { ...data.settings, ...settings };
    await this.saveGameData(data);
  }

  async resetProgress(): Promise<void> {
    await this.saveGameData(this.getDefaultData());
  }

  // LocalStorage fallback methods
  private getFromLocalStorage(): GameData {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch (error) {
      console.warn('Failed to parse localStorage data:', error);
      return this.getDefaultData();
    }
  }

  private saveToLocalStorage(data: GameData): void {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
}

export default new DatabaseService();
