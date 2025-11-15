import { GameData } from './types';

const DB_NAME = 'SwordBallGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';
const STORAGE_KEY = 'sword-ball-game-data';

class DatabaseService {
  private db: IDBDatabase | null = null;
  private useLocalStorage = false;

  async initDatabase(): Promise<void> {
    try {
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, using localStorage');
        this.useLocalStorage = true;
        return;
      }

      return new Promise((resolve, reject) => {
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
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB initialization failed, using localStorage', error);
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
      if (!this.db) await this.initDatabase();
      if (!this.db) return this.getFromLocalStorage();

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('gameData');

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            const defaultData = this.getDefaultGameData();
            this.saveGameData(defaultData);
            resolve(defaultData);
          }
        };

        request.onerror = () => {
          resolve(this.getFromLocalStorage());
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
      if (!this.db) await this.initDatabase();
      if (!this.db) {
        this.saveToLocalStorage(data);
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: 'gameData', data });

        request.onsuccess = () => resolve();
        request.onerror = () => {
          this.saveToLocalStorage(data);
          reject();
        };
      });
    } catch (error) {
      this.saveToLocalStorage(data);
    }
  }

  async updateCoins(amount: number): Promise<void> {
    const data = await this.getGameData();
    data.playerStats.coins += amount;
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

    data.playerStats.coins -= cost;

    if (itemType === 'sword') {
      if (!data.inventory.ownedSwords.includes(itemId)) {
        data.inventory.ownedSwords.push(itemId);
      }
    } else {
      if (!data.inventory.ownedSkins.includes(itemId)) {
        data.inventory.ownedSkins.push(itemId);
      }
    }

    await this.saveGameData(data);
    return true;
  }

  async equipItem(itemId: string, itemType: 'sword' | 'skin'): Promise<void> {
    const data = await this.getGameData();

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
    const defaultData = this.getDefaultGameData();
    await this.saveGameData(defaultData);
  }

  private getFromLocalStorage(): GameData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get data from localStorage', error);
    }
    return this.getDefaultGameData();
  }

  private saveToLocalStorage(data: GameData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }
}

export default new DatabaseService();
