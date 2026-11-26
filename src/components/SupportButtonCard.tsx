import { useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { COMPLIMENTS_DATA } from '../data/complimentsData';
import {
  formatComplimentCounter,
  getNextComplimentIndex,
} from '../utils/tributeLogic';

interface SupportButtonCardProps {
  className?: string;
  onComplimentClick?: () => void;
}

export function SupportButtonCard({
  className = '',
  onComplimentClick,
}: SupportButtonCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clickPulse, setClickPulse] = useState(0);

  const currentCompliment = COMPLIMENTS_DATA[currentIndex];
  const counterLabel = formatComplimentCounter(
    currentIndex,
    COMPLIMENTS_DATA.length,
  );

  const handleNextCompliment = () => {
    setCurrentIndex((prev) =>
      getNextComplimentIndex(prev, COMPLIMENTS_DATA.length),
    );
    setClickPulse((prev) => prev + 1);
    onComplimentClick?.();
  };

  return (
    <section
      id="support"
      aria-labelledby="support-card-heading"
      className={`relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF0ED] via-[#F4DCD6]/85 to-[#F4DCD6] p-6 sm:p-8 scrapbook-shadow border border-[#2C2623]/[0.07] ${className}`}
    >
      {/* Тёплая декоративная полоска скотча в углу карточки */}
      <div
        aria-hidden="true"
        className="washi-tape pointer-events-none absolute -top-2 right-7 h-5 w-20 rotate-6 bg-[#DCE2D8]/85"
      />

      <div>
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#6A5D57]">
          <span>Кнопка поддержки</span>
          <span
            data-testid="compliment-counter"
            className="tabular-nums text-[#2C2623]/75"
          >
            {counterLabel}
          </span>
        </div>

        <h2
          id="support-card-heading"
          className="mt-2 font-serif text-2xl sm:text-[1.7rem] font-semibold text-[#2C2623] leading-snug"
        >
          Когда день выдался непростым
        </h2>

        <div className="mt-5 min-h-[126px] sm:min-h-[118px] flex items-center">
          <div key={currentCompliment.id} className="w-full animate-fade-rise">
            <blockquote
              data-testid="compliment-text"
              className="font-handwriting text-[1.65rem] sm:text-[1.85rem] leading-[1.28] text-[#2C2623]"
            >
              «{currentCompliment.text}»
            </blockquote>
            <p className="mt-2.5 text-xs font-medium text-[#6A5D57]">
              — {currentCompliment.from}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#2C2623]/10 pt-5">
        <button
          type="button"
          onClick={handleNextCompliment}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#2C2623] px-6 py-2.5 text-sm font-medium text-[#FDFBF7] shadow-sm transition-all duration-200 hover:bg-[#423834] active:scale-[0.98] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
        >
          <Heart
            key={clickPulse}
            className="h-4 w-4 shrink-0 text-[#F4DCD6] fill-[#F4DCD6]"
            aria-hidden="true"
          />
          <span>Нажми, если устала</span>
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs text-[#6A5D57]">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>12 тёплых напоминаний</span>
        </span>
      </div>
    </section>
  );
}
