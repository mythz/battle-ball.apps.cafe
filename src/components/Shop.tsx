import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';
import { SwordItem, SkinItem } from '../store/types';
import './Shop.css';

interface ShopProps {
  navigate: (screen: 'menu' | 'game' | 'shop' | 'settings') => void;
}

const Shop: React.FC<ShopProps> = ({ navigate }) => {
  const { gameData, purchaseItem, equipItem } = useGame();
  const [selectedTab, setSelectedTab] = useState<'swords' | 'skins'>('swords');
  const [notification, setNotification] = useState<string>('');

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handlePurchase = async (itemId: string, cost: number) => {
    const success = await purchaseItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin', cost);

    if (success) {
      showNotification('Purchase successful!');
    } else {
      showNotification('Insufficient coins!');
    }
  };

  const handleEquip = async (itemId: string) => {
    await equipItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin');
    showNotification('Item equipped!');
  };

  const items = selectedTab === 'swords' ? SWORDS : SKINS;
  const ownedItems =
    selectedTab === 'swords' ? gameData.inventory.ownedSwords : gameData.inventory.ownedSkins;
  const equippedItem =
    selectedTab === 'swords'
      ? gameData.inventory.equippedSword
      : gameData.inventory.equippedSkin;

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Shop</h1>
        <div className="coins-display">Coins: {gameData.playerStats.coins}</div>
      </div>

      <div className="shop-tabs">
        <button
          className={`tab-button ${selectedTab === 'swords' ? 'active' : ''}`}
          onClick={() => setSelectedTab('swords')}
        >
          Swords
        </button>
        <button
          className={`tab-button ${selectedTab === 'skins' ? 'active' : ''}`}
          onClick={() => setSelectedTab('skins')}
        >
          Skins
        </button>
      </div>

      <div className="shop-grid">
        {items.map(item => {
          const isOwned = ownedItems.includes(item.id);
          const isEquipped = equippedItem === item.id;
          const canAfford = gameData.playerStats.coins >= item.cost;

          return (
            <div key={item.id} className={`shop-item rarity-${item.rarity}`}>
              <div className="item-header">
                <h3>{item.name}</h3>
                <span className={`rarity-badge rarity-${item.rarity}`}>{item.rarity}</span>
              </div>

              <div className="item-preview">
                {selectedTab === 'swords' ? (
                  <div
                    className="sword-preview"
                    style={{ background: (item as SwordItem).color }}
                  ></div>
                ) : (
                  <div
                    className="skin-preview"
                    style={{
                      background: `linear-gradient(135deg, ${
                        (item as SkinItem).colors.primary
                      }, ${(item as SkinItem).colors.secondary})`
                    }}
                  ></div>
                )}
              </div>

              <p className="item-description">{item.description}</p>

              {selectedTab === 'swords' && (
                <div className="item-stats">
                  <div className="stat">
                    Length: {(item as SwordItem).length}
                  </div>
                  <div className="stat">
                    Damage: {(item as SwordItem).damageMultiplier}x
                  </div>
                </div>
              )}

              <div className="item-cost">{item.cost > 0 ? `${item.cost} Coins` : 'FREE'}</div>

              <div className="item-actions">
                {isEquipped ? (
                  <div className="equipped-badge">Equipped</div>
                ) : isOwned ? (
                  <button className="btn btn-primary" onClick={() => handleEquip(item.id)}>
                    Equip
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePurchase(item.id, item.cost)}
                    disabled={!canAfford}
                  >
                    {canAfford ? 'Purchase' : 'Not Enough Coins'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {notification && <div className="notification">{notification}</div>}

      <button onClick={() => navigate('menu')} className="btn btn-secondary back-button">
        Back to Menu
      </button>
    </div>
  );
};

export default Shop;
