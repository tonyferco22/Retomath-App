import React, { useState, useEffect } from 'react';
import { GradeLevel, MathQuestion, Language } from '../types';
import { fetchQuestions } from '../services/geminiService';
import { Button } from './Button';
import confetti from 'canvas-confetti';

interface GameScreenProps {
  grade: GradeLevel;
  lang: Language;
  onExit: () => void;
  onEarnCoins: (amount: number) => void;
  onCompleteQuestion: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ grade, lang, onExit, onEarnCoins, onCompleteQuestion }) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [sessionScore, setSessionScore] = useState(0);

  // Translations
  const t = {
    loadingTitle: lang === 'es' ? 'Preparando tu desafío... 🧠' : 'Preparing your challenge... 🧠',
    loadingDesc: lang === 'es' ? `La IA está pensando preguntas para ${grade}` : `AI is thinking of questions for ${grade}`,
    exit: lang === 'es' ? 'Salir' : 'Exit',
    correctTitle: lang === 'es' ? '¡Excelente trabajo! 🎉' : 'Great Job! 🎉',
    incorrectTitle: lang === 'es' ? '¡Casi! Inténtalo de nuevo.' : 'Almost! Try again.',
    continue: lang === 'es' ? 'Continuar ➔' : 'Continue ➔',
    coinsEarned: lang === 'es' ? '¡Ganaste +10 monedas!' : 'You earned +10 coins!',
  };

  useEffect(() => {
    loadQuestions();
  }, [grade, lang]);

  const loadQuestions = async () => {
    setLoading(true);
    const newQuestions = await fetchQuestions(grade, lang, 3);
    setQuestions(prev => [...prev, ...newQuestions]);
    setLoading(false);
  };

  const handleAnswer = (index: number) => {
    if (isChecking) return;
    setSelectedAnswer(index);
    setIsChecking(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = index === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setFeedback('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onEarnCoins(10); // Reward
      onCompleteQuestion(); // Streak logic
      setSessionScore(prev => prev + 10);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setIsChecking(false);

    if (currentIndex + 1 >= questions.length) {
      loadQuestions();
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mb-4"></div>
        <h2 className="text-2xl font-bold animate-pulse">{t.loadingTitle}</h2>
        <p className="text-gray-500 mt-2">{t.loadingDesc}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto w-full p-4 animate-fade-in">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border-b-4 border-gray-100">
        <button onClick={onExit} className="text-gray-400 hover:text-brand-primary font-bold">
          ✕ {t.exit}
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-brand-accent font-bold text-xl">
             💰 {sessionScore}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
        <div 
          className="bg-brand-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex % 5) * 20 + 20}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-b-8 border-gray-200 relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-snug relative z-10">
          {currentQuestion.questionText}
        </h2>

        <div className="grid gap-4 relative z-10">
          {currentQuestion.options.map((option, idx) => {
            let variant: 'secondary' | 'success' | 'danger' = 'secondary';
            if (isChecking) {
              if (idx === currentQuestion.correctAnswerIndex) variant = 'success';
              else if (idx === selectedAnswer) variant = 'danger';
            }

            return (
              <Button
                key={idx}
                variant={variant}
                fullWidth
                size="lg"
                onClick={() => handleAnswer(idx)}
                disabled={isChecking}
                className="text-left justify-start"
              >
                <div className="flex items-center w-full">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold border-2
                    ${variant === 'secondary' ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-white bg-opacity-20 border-white text-white'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className={`mt-6 p-6 rounded-2xl animate-bounce-short border-l-8 shadow-lg ${feedback === 'correct' ? 'bg-green-50 border-brand-green' : 'bg-red-50 border-brand-red'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-bold mb-2 ${feedback === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                {t[feedback === 'correct' ? 'correctTitle' : 'incorrectTitle']}
              </h3>
              <p className="text-gray-700 mb-2">
                {currentQuestion.explanation}
              </p>
               {feedback === 'correct' && (
                 <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                   {t.coinsEarned}
                 </span>
               )}
            </div>
            <Button onClick={handleNext} variant="primary" size="lg" className="min-w-[150px]">
              {t.continue}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};