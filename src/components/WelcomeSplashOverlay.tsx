import { useEffect, useState } from 'react';
import { Heart, Music2, VolumeX } from 'lucide-react';

interface WelcomeSplashOverlayProps {
  isVisible: boolean;
  onOpenGift: (withMusic: boolean) => void;
}

/**
 * Приветственная открытка-заставка при первом открытии страницы.
 * Нажатие на «Открыть подарок» запускает музыку прямо в пользовательском жесте,
 * что позволяет обойти ограничение автозапуска звука на iOS и Android.
 */
export function WelcomeSplashOverlay({
  isVisible,
  onOpenGift,
}: WelcomeSplashOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const handleOpen = (withMusic: boolean) => {
    if (isExiting) {
      return;
    }
    setIsExiting(true);
    // Вызываем обработчик синхронно в том же клике, чтобы браузер телефона разрешил звук
    onOpenGift(withMusic);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-splash-heading"
      data-testid="welcome-splash"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]/96 px-5 py-8 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isExiting ? 'pointer-events-none opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
    >
      <div className="paper-grain-overlay" aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-md rounded-3xl bg-[#FFFDF9] px-7 py-9 sm:px-10 sm:py-11 text-center scrapbook-shadow border border-[#2C2623]/[0.08] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isExiting ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Полоска декоративного скотча сверху, как на карточках альбома */}
        <div
          aria-hidden="true"
          className="washi-tape pointer-events-none absolute -top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 -rotate-1 rounded-[2px] bg-[#E9BDB2]/75"
        />

        {/* Сургучная печать с сердечком */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B56565] text-[#FDFBF7] shadow-[0_12px_24px_-8px_rgba(181,101,101,0.6)] ring-4 ring-[#F4DCD6]/80">
          <Heart className="h-6 w-6 fill-[#FDFBF7]/90" aria-hidden="true" />
        </div>

        <p className="mt-6 text-xs font-medium tracking-wide text-[#6A5D57]">
          С Днём матери · Личный подарок
        </p>

        <h2
          id="welcome-splash-heading"
          className="mt-3 font-serif text-[2rem] sm:text-[2.35rem] font-semibold leading-[1.12] text-[#2C2623] text-balance"
        >
          Любимая, у нас для тебя небольшой сюрприз
        </h2>

        <p className="mt-4 font-handwriting text-[1.55rem] sm:text-[1.75rem] leading-[1.28] text-[#B56565]">
          Тёплые воспоминания, слова любви и нежная мелодия внутри
        </p>

        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpen(true)}
            className="group inline-flex min-h-[52px] w-full cursor-pointer select-none touch-manipulation items-center justify-center gap-2.5 rounded-full bg-[#B56565] px-7 py-3.5 text-sm sm:text-base font-medium text-[#FDFBF7] shadow-[0_14px_30px_-10px_rgba(181,101,101,0.55)] transition-all duration-200 hover:bg-[#A15454] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2623]"
          >
            <Music2
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            <span>Открыть подарок</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpen(false)}
            className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#6A5D57] transition-colors hover:text-[#2C2623] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
          >
            <VolumeX className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Открыть без звука</span>
          </button>
        </div>
      </div>
    </div>
  );
}
