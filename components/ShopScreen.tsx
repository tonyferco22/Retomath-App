import React, { useState } from 'react';
import { ShopItem, UserProfile, Language } from '../types';
import { Button } from './Button';
import { SHOP_ITEMS } from '../constants';
import confetti from 'canvas-confetti';

interface ShopScreenProps {
  user: UserProfile;
  lang: Language;
  onBuy: (item: ShopItem) => void;
  onSelectAvatar: (item: ShopItem) => void;
  onExit: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, lang, onBuy, onSelectAvatar, onExit }) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const handleBuy = (item: ShopItem) => {
    if (user.coins >= item.price) {
      onBuy(item);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFC107', '#FF7043', '#9C27B0']
      });
    }
  };

  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const isOwned = (itemId: string) => user.inventory.includes(itemId);

  const t = {
    title: lang === 'es' ? 'Tienda RetoMath' : 'RetoMath Shop',
    coins: lang === 'es' ? 'Tus Monedas:' : 'Your Coins:',
    avatars: lang === 'es' ? 'Avatares & Personajes' : 'Avatars & Characters',
    stickers: lang === 'es' ? 'Stickers Divertidos' : 'Fun Stickers',
    buy: lang === 'es' ? 'Comprar' : 'Buy',
    owned: lang === 'es' ? 'Comprado' : 'Owned',
    use: lang === 'es' ? 'Usar' : 'Equip',
    back: lang === 'es' ? 'Volver' : 'Back',
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={onExit} size="sm">
          ⬅ {t.back}
        </Button>
        <div className="bg-brand-accent text-brand-dark px-6 py-2 rounded-full font-bold text-xl shadow-md border-2 border-yellow-400">
          💰 {user.coins}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-gray-200 text-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-purple via-brand-primary to-brand-accent"></div>
        <h2 className="text-3xl font-extrabold text-brand-primary mb-2 mt-2">{t.title}</h2>
        <p className="text-gray-400">
          {lang === 'es' ? '¡Consigue Avatars y stickers geniales!' : 'Get Avatars and cool stickers!'}
        </p>
      </div>

      {/* Avatars Section */}
      <h3 className="text-2xl font-bold text-gray-700 mb-4 ml-2 border-l-4 border-brand-purple pl-3">{t.avatars}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {SHOP_ITEMS.filter(i => i.type === 'avatar').map(item => {
          const owned = isOwned(item.id);
          const equipped = user.selectedAvatar === item.id;
          const showImage = item.imageUrl && !imgErrors[item.id];
          
          return (
            <div key={item.id} className={`bg-white rounded-2xl p-4 flex flex-col items-center shadow-md border-2 transition-transform hover:-translate-y-1 ${equipped ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-100'}`}>
              <div className="mb-4 h-24 w-24 flex items-center justify-center">
                {showImage ? (
                   <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-full w-full rounded-full bg-gray-50 object-cover" 
                    onError={() => handleImgError(item.id)}
                   />
                ) : (
                   <span className="text-6xl">{item.emoji || '❓'}</span>
                )}
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{item.name}</h4>
              
              {owned ? (
                <Button 
                  variant={equipped ? 'success' : 'outline'} 
                  size="sm" 
                  fullWidth 
                  onClick={() => onSelectAvatar(item)}
                  disabled={equipped}
                >
                  {equipped ? '✓' : t.use}
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth 
                  onClick={() => handleBuy(item)}
                  disabled={user.coins < item.price}
                  className={user.coins < item.price ? 'opacity-50' : ''}
                >
                  💰 {item.price}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stickers Section */}
      <h3 className="text-2xl font-bold text-gray-700 mb-4 ml-2 border-l-4 border-brand-orange pl-3">{t.stickers}</h3>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {SHOP_ITEMS.filter(i => i.type === 'sticker').map(item => {
          const owned = isOwned(item.id);
          
          return (
            <div key={item.id} className="bg-white rounded-2xl p-3 flex flex-col items-center shadow-sm border-2 border-gray-100 hover:border-brand-orange">
              <div className="text-5xl mb-2">{item.emoji}</div>
              {owned ? (
                <span className="text-green-500 font-bold text-xs">✓ {t.owned}</span>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  fullWidth 
                  onClick={() => handleBuy(item)}
                  disabled={user.coins < item.price}
                  className={`text-xs px-2 ${user.coins < item.price ? 'opacity-50' : ''}`}
                >
                   💰 {item.price}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};