import React, { useState } from 'react';
import { GradeLevel, Language, ShopItem } from '../types';
import { Button } from './Button';

interface GradeSelectorProps {
  lang: Language;
  onSelect: (grade: GradeLevel) => void;
  avatarItem?: ShopItem;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ lang, onSelect, avatarItem }) => {
  const [imgError, setImgError] = useState(false);
  const grades = Object.values(GradeLevel);

  const t = {
    greeting: lang === 'es' ? '¡Hola RetoMath!' : 'Hello RetoMath!',
    subtitle: lang === 'es' ? 'Elige tu nivel para empezar:' : 'Choose your level to start:',
  };

  const showImage = avatarItem?.imageUrl && !imgError;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full text-center border-b-8 border-gray-200">
        <div className="w-28 h-28 rounded-full mx-auto mb-6 bg-brand-light flex items-center justify-center shadow-inner border-4 border-brand-accent overflow-hidden">
          {showImage ? (
            <img 
              src={avatarItem.imageUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-6xl">{avatarItem?.emoji || '🦊'}</span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
          {t.greeting} 👋
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          {t.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map((grade, index) => (
            <Button
              key={grade}
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => onSelect(grade)}
              className="border-b-4 border-brand-light hover:border-brand-primary group"
            >
              <span className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                 🎓 {grade}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};