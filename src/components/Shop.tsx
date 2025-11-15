import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

const Shop: React.FC = () => {
  const { gameData, purchaseItem, equipItem } = useGame();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'swords' | 'skins'>('swords');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePurchase = async (itemId: string, cost: number) => {
    const success = await purchaseItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin', cost);

    if (success) {
      showMessage('Purchase successful!', 'success');
    } else {
      showMessage('Not enough coins!', 'error');
    }
  };

  const handleEquip = async (itemId: string) => {
    await equipItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin');
    showMessage('Item equipped!', 'success');
  };

  const items = selectedTab === 'swords' ? SWORDS : SKINS;
  const ownedItems = selectedTab === 'swords' ? gameData.inventory.ownedSwords : gameData.inventory.ownedSkins;
  const equippedItem = selectedTab === 'swords' ? gameData.inventory.equippedSword : gameData.inventory.equippedSkin;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Shop</h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 px-6 py-3 rounded-lg">
              <span className="text-yellow-400 font-bold text-xl">{gameData.playerStats.coins}</span>
              <span className="text-gray-400 ml-2">Coins</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white text-center`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('swords')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              selectedTab === 'swords' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Swords
          </button>
          <button
            onClick={() => setSelectedTab('skins')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              selectedTab === 'skins' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Skins
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            const isEquipped = equippedItem === item.id;
            const canAfford = gameData.playerStats.coins >= item.cost;

            return (
              <div
                key={item.id}
                className={`bg-gray-800 rounded-lg p-6 border-2 ${
                  isEquipped ? 'border-green-500' : 'border-transparent'
                } hover:border-gray-600 transition-all`}
              >
                {/* Item Name and Rarity */}
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    color: selectedTab === 'swords' ? (item as any).color : (item as any).colors?.primary || '#fff',
                  }}
                >
                  {item.name}
                </h3>
                <div className={`text-sm mb-3 capitalize ${getRarityColor(item.rarity)}`}>{item.rarity}</div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                {/* Stats */}
                {selectedTab === 'swords' && 'length' in item && (
                  <div className="text-xs text-gray-500 mb-4">
                    <div>Length: {item.length}</div>
                    <div>Damage: {item.damageMultiplier}x</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!isOwned && (
                    <button
                      onClick={() => handlePurchase(item.id, item.cost)}
                      disabled={!canAfford}
                      className={`flex-1 py-2 px-4 rounded font-bold ${
                        canAfford
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Buy ({item.cost})
                    </button>
                  )}
                  {isOwned && !isEquipped && (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-bold"
                    >
                      Equip
                    </button>
                  )}
                  {isEquipped && (
                    <button disabled className="flex-1 bg-green-700 text-white py-2 px-4 rounded font-bold cursor-default">
                      Equipped
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;
