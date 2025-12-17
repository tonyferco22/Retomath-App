export enum GradeLevel {
  Grade1 = '1° Primaria',
  Grade2 = '2° Primaria',
  Grade3 = '3° Primaria',
  Grade4 = '4° Primaria',
  Grade5 = '5° Primaria',
}

export type Language = 'es' | 'en';

export interface MathQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type ScreenState = 'MENU' | 'PLAYING' | 'SHOP';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'avatar' | 'sticker';
  emoji?: string;    // Optional emoji
  imageUrl?: string; // Optional image URL
}

export interface UserProfile {
  name: string;
  coins: number;
  inventory: string[]; // List of ShopItem IDs
  selectedAvatar: string; // ShopItem ID or default
  streak: number;
  lastPlayedDate: string; // ISO String YYYY-MM-DD
  language: Language;
}

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}