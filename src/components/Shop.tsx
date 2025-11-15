import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { SWORDS } from '../data/swords';
import { SKINS } from '../data/skins';

export const Shop: React.FC = () => {
  const { gameData, purchaseItem, equipItem } = useGame();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'swords' | 'skins'>('swords');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePurchase = async (itemId: string, cost: number) => {
    const success = await purchaseItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin', cost);

    if (success) {
      setMessage({ text: 'Purchase successful!', type: 'success' });
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ text: 'Not enough coins!', type: 'error' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleEquip = async (itemId: string) => {
    await equipItem(itemId, selectedTab === 'swords' ? 'sword' : 'skin');
    setMessage({ text: 'Equipped!', type: 'success' });
    setTimeout(() => setMessage(null), 2000);
  };

  const items = selectedTab === 'swords' ? SWORDS : SKINS;
  const ownedItems =
    selectedTab === 'swords' ? gameData.inventory.ownedSwords : gameData.inventory.ownedSkins;
  const equippedItem =
    selectedTab === 'swords' ? gameData.inventory.equippedSword : gameData.inventory.equippedSkin;

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

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-600';
      case 'rare':
        return 'border-blue-600';
      case 'epic':
        return 'border-purple-600';
      case 'legendary':
        return 'border-yellow-600';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Shop</h1>
          <div className="bg-gray-800 px-6 py-3 rounded-lg">
            <span className="text-yellow-400 font-bold text-2xl">
              {gameData.playerStats.coins} Coins
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-bold ${
              message.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedTab('swords')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
              selectedTab === 'swords'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Swords
          </button>
          <button
            onClick={() => setSelectedTab('skins')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
              selectedTab === 'skins'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Skins
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {items.map(item => {
            const isOwned = ownedItems.includes(item.id);
            const isEquipped = equippedItem === item.id;
            const canAfford = gameData.playerStats.coins >= item.cost;

            return (
              <div
                key={item.id}
                className={`bg-gray-800 p-6 rounded-lg border-2 ${getRarityBorder(
                  item.rarity
                )} hover:scale-105 transition`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <span className={`text-sm font-bold uppercase ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                {selectedTab === 'swords' && 'length' in item && (
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Length:</span>
                      <span className="text-white ml-2">{item.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Width:</span>
                      <span className="text-white ml-2">{item.width}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Damage:</span>
                      <span className="text-white ml-2">{item.damageMultiplier}x</span>
                    </div>
                  </div>
                )}

                {selectedTab === 'skins' && 'colors' in item && (
                  <div className="flex gap-2 mb-4">
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: item.colors.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: item.colors.secondary }}
                    />
                    <div
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: item.colors.accent }}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {!isOwned ? (
                    <button
                      onClick={() => handlePurchase(item.id, item.cost)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        canAfford
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Buy - {item.cost} Coins
                    </button>
                  ) : isEquipped ? (
                    <div className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-white text-center">
                      Equipped
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold"
                    >
                      Equip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
