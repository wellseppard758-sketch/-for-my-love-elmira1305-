import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import type { PhotoMemory } from '../types/tribute';
import { resolveAssetPath } from '../utils/tributeLogic';

interface PhotoLightboxModalProps {
  photo: PhotoMemory | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function PhotoLightboxModal({
  photo,
  currentIndex,
  totalCount,
  onClose,
  onNavigate,
}: PhotoLightboxModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photo?.id]);

  useEffect(() => {
    if (!photo) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        onNavigate('next');
      } else if (event.key === 'ArrowLeft') {
        onNavigate('prev');
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, onClose, onNavigate]);

  if (!photo) {
    return null;
  }

  const resolvedSrc = resolveAssetPath(photo.src, import.meta.env.BASE_URL);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-photo-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2623]/65 p-4 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-[#FDFBF7] scrapbook-shadow border border-[#2C2623]/10 md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть просмотр фотографии"
          className="absolute top-3.5 right-3.5 z-20 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FDFBF7]/95 text-[#2C2623] shadow-sm border border-[#2C2623]/10 hover:bg-[#F4DCD6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Фотография в уютной рамке */}
        <div className="relative flex w-full items-center justify-center bg-[#FAF0ED] p-4 sm:p-6 md:w-[58%]">
          <div className="relative w-full overflow-hidden rounded-2xl bg-[#FFFDF9] p-2.5 scrapbook-shadow">
            {!imageError ? (
              <img
                src={resolvedSrc}
                alt={photo.alt}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="max-h-[46vh] w-full rounded-xl object-cover md:max-h-[68vh]"
              />
            ) : (
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#FAF0ED] via-[#F4DCD6] to-[#DCE2D8]">
                <Heart className="h-8 w-8 text-[#B56565]" aria-hidden="true" />
                <p className="font-serif text-lg text-[#2C2623]">{photo.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* Рукописная заметка и навигация */}
        <div className="flex w-full flex-col justify-between overflow-y-auto p-6 sm:p-8 md:w-[42%]">
          <div className="pr-8">
            <p className="text-xs font-medium text-[#6A5D57] tabular-nums">
              <span>{photo.date}</span>
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              <span>{photo.location}</span>
            </p>

            <h2
              id="lightbox-photo-title"
              className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#2C2623] leading-tight"
            >
              {photo.title}
            </h2>

            <p className="mt-5 font-handwriting text-[1.65rem] sm:text-[1.85rem] leading-[1.32] text-[#2C2623]">
              «{photo.memoryNote}»
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[#2C2623]/10 pt-4">
            <span className="text-xs font-medium text-[#6A5D57] tabular-nums">
              Кадр {currentIndex + 1} из {totalCount}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('prev')}
                aria-label="Предыдущее воспоминание"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#2C2623]/15 bg-[#FDFBF7] text-[#2C2623] hover:bg-[#FAF0ED] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('next')}
                aria-label="Следующее воспоминание"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#2C2623]/15 bg-[#FDFBF7] text-[#2C2623] hover:bg-[#FAF0ED] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
