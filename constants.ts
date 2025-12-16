import { ShopItem } from './types';

// Usamos DiceBear v9 (PNG) para los personajes especiales.
// Para los animales específicos solicitados, usamos Emojis para asegurar
// que se vean exactamente como el usuario quiere (Tarántula, Avispa, etc.) sin errores de carga.

export const SHOP_ITEMS: ShopItem[] = [
  // --- Personajes Especiales (Con Imágenes) ---
  { 
    id: 'av_pop_star', 
    name: 'Estrella Pop', 
    price: 250, // Subido a 250 como pediste
    type: 'avatar', 
    emoji: '🎤', 
    imageUrl: 'https://api.dicebear.com/9.x/lorelei/png?seed=PopStar&hair=long&hairColor=ffadad&backgroundColor=b6e3f4' 
  },
  { 
    id: 'av_warrior', 
    name: 'Guerrero', 
    price: 300, // Se mantiene en 300
    type: 'avatar', 
    emoji: '⚔️', 
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/png?seed=Warrior1&hair=short&skinColor=ecad80&backgroundColor=ffdfbf' 
  },
  { 
    id: 'av_robot_pro', 
    name: 'Super Robot', 
    price: 150, 
    type: 'avatar', 
    emoji: '🤖', 
    imageUrl: 'https://api.dicebear.com/9.x/bottts-neutral/png?seed=SuperRobot&backgroundColor=3b82f6' 
  },

  // --- Animales (Precios ajustados entre 100 y 200) ---
  { id: 'av_wolf', name: 'Lobo', emoji: '🐺', price: 140, type: 'avatar' },
  { id: 'av_lion', name: 'León', emoji: '🦁', price: 180, type: 'avatar' },
  { id: 'av_tiger', name: 'Tigre', emoji: '🐯', price: 180, type: 'avatar' },
  { id: 'av_bear', name: 'Oso', emoji: '🐻', price: 160, type: 'avatar' },
  { id: 'av_rhino', name: 'Rinoceronte', emoji: '🦏', price: 150, type: 'avatar' },
  { id: 'av_raccoon', name: 'Mapache', emoji: '🦝', price: 120, type: 'avatar' },
  { id: 'av_snake', name: 'Serpiente', emoji: '🐍', price: 130, type: 'avatar' },
  { id: 'av_tarantula', name: 'Tarántula', emoji: '🕷️', price: 200, type: 'avatar' },
  { id: 'av_wasp', name: 'Avispa', emoji: '🐝', price: 100, type: 'avatar' },

  // --- Stickers ---
  { id: 'st_star_eyes', name: 'Genial', emoji: '🤩', price: 20, type: 'sticker' },
  { id: 'st_controller', name: 'Gamer', emoji: '🎮', price: 40, type: 'sticker' },
  { id: 'st_skateboard', name: 'Skater', emoji: '🛹', price: 40, type: 'sticker' },
  { id: 'st_guitar', name: 'Rock', emoji: '🎸', price: 50, type: 'sticker' },
  { id: 'st_unicorn', name: 'Unicornio', emoji: '🦄', price: 60, type: 'sticker' },
  { id: 'st_rocket', name: 'Cohete', emoji: '🚀', price: 45, type: 'sticker' },
  { id: 'st_planet', name: 'Planeta', emoji: '🪐', price: 45, type: 'sticker' },
  { id: 'st_cat_love', name: 'Amor Gatuno', emoji: '😻', price: 35, type: 'sticker' },
  { id: 'st_icecream', name: 'Helado', emoji: '🍦', price: 25, type: 'sticker' },
  { id: 'st_donut', name: 'Dona', emoji: '🍩', price: 30, type: 'sticker' },
  { id: 'st_pizza', name: 'Pizza', emoji: '🍕', price: 30, type: 'sticker' },
  { id: 'st_dragon', name: 'Dragón', emoji: '🐉', price: 100, type: 'sticker' },
  { id: 'st_crystal', name: 'Magia', emoji: '🔮', price: 80, type: 'sticker' },
  { id: 'st_crown', name: 'Reina', emoji: '👑', price: 60, type: 'sticker' },
  { id: 'st_diamond', name: 'Diamante', emoji: '💎', price: 100, type: 'sticker' },
];