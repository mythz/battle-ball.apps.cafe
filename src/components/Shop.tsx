import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

export const Shop: React.FC = () => {
  const { gameData, purchaseItem, equipItem } = useGame();
  const [selectedTab, setSelectedTab] = useState<'swords' | 'skins'>('swords');
  const navigate = useNavigate();

  const handlePurchase = async (itemId: string, cost: number) => {
    const success = await purchaseItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin', cost);

    if (success) {
      alert('Purchase successful!');
    } else {
      alert('Not enough coins!');
    }
  };

  const handleEquip = async (itemId: string) => {
    await equipItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin');
  };

  const items = selectedTab === 'swords' ? SWORDS : SKINS;
  const ownedItems =
    selectedTab === 'swords'
      ? gameData.inventory.ownedSwords
      : gameData.inventory.ownedSkins;
  const equippedItem =
    selectedTab === 'swords'
      ? gameData.inventory.equippedSword
      : gameData.inventory.equippedSkin;

  return (
    <div className="shop-container">
      <header className="shop-header">
        <h1>Shop</h1>
        <div className="coins-display">
          <span className="coin-icon">🪙</span>
          <span>{gameData.playerStats.coins}</span>
        </div>
      </header>

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
        {items.map((item) => {
          const isOwned = ownedItems.includes(item.id);
          const isEquipped = equippedItem === item.id;
          const canAfford = gameData.playerStats.coins >= item.cost;

          return (
            <div key={item.id} className={`shop-item ${item.rarity}`}>
              <div className="item-header">
                <h3>{item.name}</h3>
                <span className={`rarity-badge ${item.rarity}`}>{item.rarity}</span>
              </div>

              <div className="item-visual" style={{ backgroundColor: 'color' in item ? item.color : item.colors.primary }}>
                {selectedTab === 'swords' ? '⚔️' : '👤'}
              </div>

              <p className="item-description">{item.description}</p>

              {selectedTab === 'swords' && 'length' in item && (
                <div className="item-stats">
                  <div>Length: {item.length}</div>
                  <div>Power: {item.damageMultiplier}x</div>
                </div>
              )}

              <div className="item-footer">
                {!isOwned ? (
                  <>
                    <div className="item-cost">
                      <span className="coin-icon">🪙</span>
                      <span>{item.cost}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(item.id, item.cost)}
                      className={`purchase-btn ${canAfford ? '' : 'disabled'}`}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Purchase' : 'Too Expensive'}
                    </button>
                  </>
                ) : isEquipped ? (
                  <button className="equipped-btn" disabled>
                    Equipped
                  </button>
                ) : (
                  <button onClick={() => handleEquip(item.id)} className="equip-btn">
                    Equip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => navigate('/')} className="back-button">
        Back to Menu
      </button>
    </div>
  );
};
