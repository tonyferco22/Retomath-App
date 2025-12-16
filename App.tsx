import React, { useState, useEffect } from 'react';
import { GradeLevel, ScreenState, UserProfile, ShopItem, Language } from './types';
import { GradeSelector } from './components/GradeSelector';
import { GameScreen } from './components/GameScreen';
import { ShopScreen } from './components/ShopScreen';
import { SHOP_ITEMS } from './constants';
import { Button } from './components/Button';

// Initial default state
const DEFAULT_USER: UserProfile = {
  name: 'Estudiante',
  coins: 0,
  inventory: ['av_robot_pro'], // Start with the Robot
  selectedAvatar: 'av_robot_pro',
  streak: 0,
  lastPlayedDate: '',
  language: 'es'
};

// URL del logo. Si tienes tu propia imagen, reemplaza esta URL.
// Usamos una imagen genérica de educación/matemáticas como placeholder.
const LOGO_URL = "https://i.ibb.co/F4rVzy0v/Logo-Final-0-1.png";

function App() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('retomath_user_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure the selected avatar exists in the new list, fallback to robot
        const avatarExists = SHOP_ITEMS.some(item => item.id === parsed.selectedAvatar);
        const safeUser = {
           ...DEFAULT_USER, 
           ...parsed,
           selectedAvatar: avatarExists ? parsed.selectedAvatar : 'av_robot_pro'
        };
        setUser(safeUser);
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage whenever user state changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('retomath_user_data', JSON.stringify(user));
    }
  }, [user, isInitialized]);

  // Streak Logic
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastPlayedDate === today) return; // Already played today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    let newStreak = user.streak;
    if (user.lastPlayedDate === yesterdayString) {
      newStreak += 1; // Continuous streak
    } else {
      newStreak = 1; // Reset or start new
    }

    setUser(prev => ({ ...prev, streak: newStreak, lastPlayedDate: today }));
  };

  const handleGradeSelect = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setScreen('PLAYING');
  };

  const handleEarnCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleBuyItem = (item: ShopItem) => {
    if (user.coins >= item.price && !user.inventory.includes(item.id)) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins - item.price,
        inventory: [...prev.inventory, item.id]
      }));
    }
  };

  const handleSelectAvatar = (item: ShopItem) => {
    setUser(prev => ({ ...prev, selectedAvatar: item.id }));
  };

  const toggleLanguage = () => {
    setUser(prev => ({ ...prev, language: prev.language === 'es' ? 'en' : 'es' }));
  };

  const handleExit = () => {
    setScreen('MENU');
    setSelectedGrade(null);
  };

  if (!isInitialized) return null;

  // Find the full ShopItem object for the selected avatar
  const currentAvatarItem = SHOP_ITEMS.find(item => item.id === user.selectedAvatar) || SHOP_ITEMS[0];

  return (
    <div className="min-h-screen w-full font-sans text-gray-800 pb-10 relative">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setScreen('MENU')}>
            <img 
              src={LOGO_URL} 
              alt="RetoMath Logo" 
              className="w-12 h-12 object-contain transform group-hover:rotate-12 transition-transform" 
            />
            <div className="hidden md:block">
              <span className="text-2xl font-extrabold text-brand-dark tracking-tight block leading-none">
                Reto<span className="text-brand-orange">Math</span>
              </span>
              <span className="text-xs text-brand-primary font-bold bg-brand-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                Beta Test
              </span>
            </div>
          </div>

          {/* HUD (Coins, Streak, Shop, Lang) */}
          <div className="flex items-center gap-2 md:gap-3">
            
            <button 
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center hover:bg-brand-dark transition-colors"
              title="Ayuda / Help"
            >
              ?
            </button>

            <button onClick={toggleLanguage} className="hidden md:block bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm font-bold text-gray-600 transition-colors uppercase">
              {user.language}
            </button>

            <div className="flex items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200" title="Streak">
              <span className="text-lg mr-1">🔥</span>
              <span className="font-bold text-brand-orange">{user.streak}</span>
            </div>

            <div className="flex items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200 cursor-pointer hover:bg-yellow-50 transition-colors" onClick={() => setScreen('SHOP')}>
               <span className="text-lg mr-1">💰</span>
               <span className="font-bold text-brand-accent">{user.coins}</span>
            </div>

            {/* Avatar Display in Navbar */}
            <button 
              onClick={() => setScreen('SHOP')}
              className="w-10 h-10 rounded-full bg-brand-light border-2 border-brand-primary flex items-center justify-center shadow-sm hover:scale-105 transition-transform overflow-hidden"
            >
              {currentAvatarItem.imageUrl ? (
                <img src={currentAvatarItem.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{currentAvatarItem.emoji}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-6 md:pt-10">
        {screen === 'MENU' && (
          <GradeSelector 
            lang={user.language} 
            onSelect={handleGradeSelect} 
            avatarItem={currentAvatarItem}
          />
        )}
        
        {screen === 'PLAYING' && selectedGrade && (
          <GameScreen 
            grade={selectedGrade} 
            lang={user.language}
            onExit={handleExit} 
            onEarnCoins={handleEarnCoins}
            onCompleteQuestion={updateStreak}
          />
        )}

        {screen === 'SHOP' && (
          <ShopScreen 
            user={user} 
            lang={user.language}
            onBuy={handleBuyItem}
            onSelectAvatar={handleSelectAvatar}
            onExit={() => setScreen('MENU')}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="text-center text-gray-400 text-sm mt-12 py-6">
        <p>© {new Date().getFullYear()} RetoMath - Versión de Prueba</p>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-brand-light relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-brand-primary mb-4 text-center">
              {user.language === 'es' ? '¿Cómo Jugar?' : 'How to Play?'}
            </h2>
            
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="bg-brand-accent text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">1</span>
                <p>{user.language === 'es' ? 'Elige tu grado escolar.' : 'Choose your grade level.'}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">2</span>
                <p>{user.language === 'es' ? 'Responde preguntas generadas por IA.' : 'Answer AI-generated questions.'}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-brand-orange text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">3</span>
                <p>{user.language === 'es' ? 'Gana monedas y mantén tu racha diaria.' : 'Earn coins and keep your daily streak.'}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-brand-purple text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">4</span>
                <p>{user.language === 'es' ? '¡Visita la tienda para comprar nuevos personajes!' : 'Visit the shop to unlock new characters!'}</p>
              </div>
            </div>

            <div className="mt-8">
              <Button fullWidth onClick={() => setShowHelp(false)}>
                {user.language === 'es' ? '¡Entendido!' : 'Got it!'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;