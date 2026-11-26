import { useState } from 'react';
import { Expand, Heart, RotateCcw } from 'lucide-react';
import type { PhotoMemory } from '../types/tribute';
import { resolveAssetPath } from '../utils/tributeLogic';

interface PolaroidCardProps {
  photo: PhotoMemory;
  isFlipped: boolean;
  onToggleFlip: (id: string) => void;
  onOpenLightbox: (photo: PhotoMemory) => void;
  className?: string;
}

const TAPE_COLOR_CLASS: Record<PhotoMemory['tapeColor'], string> = {
  rose: 'bg-[#E9BDB2]/70',
  sage: 'bg-[#C4D1BC]/70',
  cream: 'bg-[#E8DEC8]/75',
};

const TAPE_POSITION_CLASS: Record<PhotoMemory['tapeCorner'], string> = {
  'top-left': '-top-2 left-6 -rotate-8 w-16 sm:w-20',
  'top-right': '-top-2 right-6 rotate-8 w-16 sm:w-20',
  'top-center': '-top-2 left-1/2 -translate-x-1/2 -rotate-1 w-20 sm:w-24',
};

export function PolaroidCard({
  photo,
  isFlipped,
  onToggleFlip,
  onOpenLightbox,
  className = '',
}: PolaroidCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = resolveAssetPath(photo.src, import.meta.env.BASE_URL);

  const hoverTiltClass =
    photo.tiltDegrees >= 0
      ? 'hover:rotate-[0.9deg] hover:-translate-y-1'
      : 'hover:-rotate-[0.9deg] hover:-translate-y-1';

  return (
    <article
      className={`perspective-1200 relative group ${className}`}
      data-testid={`polaroid-card-${photo.id}`}
      data-flipped={isFlipped ? 'true' : 'false'}
    >
      <div
        className={`preserve-3d relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFlipped ? 'rotate-y-180' : hoverTiltClass
        }`}
      >
        {/* Лицевая сторона Полароида */}
        <div
          className={`backface-hidden relative flex h-full w-full flex-col rounded-3xl bg-[#FFFDF9] p-3.5 pb-4 sm:p-4 sm:pb-5 scrapbook-shadow transition-shadow duration-300 group-hover:scrapbook-shadow-hover border border-[#2C2623]/[0.06] ${
            isFlipped ? 'pointer-events-none' : ''
          }`}
        >
          {/* Полупрозрачная полоска декоративного скотча, приклеенная прямо к рамке */}
          <div
            aria-hidden="true"
            className={`washi-tape pointer-events-none absolute z-20 h-5 rounded-[2px] opacity-90 ${TAPE_COLOR_CLASS[photo.tapeColor]} ${TAPE_POSITION_CLASS[photo.tapeCorner]}`}
          />

          <button
            type="button"
            onClick={() => onToggleFlip(photo.id)}
            aria-label={`Перевернуть фото «${photo.title}» и прочитать воспоминание`}
            aria-expanded={isFlipped}
            className="flex h-full w-full cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B56565] rounded-2xl"
          >
            <div className="relative flex-1 min-h-[200px] w-full overflow-hidden rounded-2xl bg-[#FAF0ED]">
              {!imageFailed ? (
                <img
                  src={resolvedSrc}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FAF0ED] via-[#F4DCD6] to-[#DCE2D8]/70 p-6 text-center">
                  <Heart className="h-7 w-7 text-[#B56565]" aria-hidden="true" />
                  <p className="font-serif text-base font-medium text-[#2C2623]">
                    {photo.title}
                  </p>
                  <p className="text-xs text-[#6A5D57]">
                    Здесь будет наше любимое фото
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3.5 px-1">
              <h3 className="font-handwriting text-[1.6rem] leading-[1.08] font-semibold text-[#2C2623]">
                {photo.title}
              </h3>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                <p className="min-w-0 truncate text-[#6A5D57]">
                  <span>{photo.date}</span>
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  <span>{photo.location}</span>
                </p>
                <span className="shrink-0 font-medium text-[#B56565] whitespace-nowrap transition-transform duration-200 group-hover:translate-x-0.5">
                  Читать
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Обратная сторона Полароида в стиле почтовой открытки с рукописным воспоминанием */}
        <div
          className={`backface-hidden rotate-y-180 absolute inset-0 flex h-full w-full flex-col justify-between overflow-y-auto rounded-3xl bg-[#FAF0ED] p-5 sm:p-6 scrapbook-shadow border border-[#2C2623]/[0.07] ${
            !isFlipped ? 'pointer-events-none' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2 text-xs text-[#6A5D57]">
            <span className="truncate">
              {photo.date}
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              {photo.location}
            </span>
            <Heart
              className="h-4 w-4 shrink-0 text-[#B56565] fill-[#B56565]/20"
              aria-hidden="true"
            />
          </div>

          <div className="my-auto py-4">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2C2623] leading-snug">
              {photo.title}
            </h3>

            <p className="mt-3.5 font-handwriting text-[1.5rem] sm:text-[1.72rem] leading-[1.3] text-[#2C2623]/95">
              «{photo.memoryNote}»
            </p>

            <p className="mt-4 text-xs text-[#6A5D57]">
              Записано на память · С любовью
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#2C2623]/10 pt-3.5">
            <button
              type="button"
              onClick={() => onToggleFlip(photo.id)}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-[#2C2623] bg-[#FDFBF7]/90 hover:bg-[#FDFBF7] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>К фото</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLightbox(photo)}
              aria-label={`Открыть крупнее фото «${photo.title}»`}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-[#FDFBF7] bg-[#2C2623] hover:bg-[#433935] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
            >
              <Expand className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Крупнее</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
