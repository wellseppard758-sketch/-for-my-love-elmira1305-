import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import type { PhotoMemory } from '../types/tribute';
import {
  evaluateSwipeNavigation,
  resolveAssetPath,
} from '../utils/tributeLogic';

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
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  useEffect(() => {
    setImageError(false);
    setDragOffsetX(0);
    setIsDragging(false);
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

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
    };
    setIsDragging(true);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    if (!start || event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    // Показываем мягкий отклик только при явном горизонтальном жесте
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      const clamped = Math.max(-72, Math.min(72, deltaX * 0.55));
      setDragOffsetX(clamped);
    } else {
      setDragOffsetX(0);
    }
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffsetX(0);

    if (!start || event.changedTouches.length === 0) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const elapsedMs = performance.now() - start.time;
    const direction = evaluateSwipeNavigation(deltaX, deltaY, elapsedMs);
    if (direction) {
      onNavigate(direction);
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffsetX(0);
  };

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

        {/* Фотография в уютной рамке с поддержкой свайпа влево/вправо на телефоне */}
        <div
          data-testid="lightbox-swipe-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="relative flex w-full flex-col items-center justify-center bg-[#FAF0ED] p-4 sm:p-6 md:w-[58%] touch-pan-y select-none"
        >
          <div
            style={{
              transform: `translate3d(${dragOffsetX}px, 0, 0)`,
              transition: isDragging
                ? 'none'
                : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDF9] p-2.5 scrapbook-shadow will-change-transform"
          >
            {!imageError ? (
              <img
                src={resolvedSrc}
                alt={photo.alt}
                referrerPolicy="no-referrer"
                draggable={false}
                onError={() => setImageError(true)}
                className="mx-auto max-h-[46vh] w-auto max-w-full rounded-xl object-contain md:max-h-[68vh]"
              />
            ) : (
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#FAF0ED] via-[#F4DCD6] to-[#DCE2D8]">
                <Heart className="h-8 w-8 text-[#B56565]" aria-hidden="true" />
                <p className="font-serif text-lg text-[#2C2623]">{photo.title}</p>
              </div>
            )}
          </div>
          <p className="mt-2.5 text-[11px] font-medium text-[#6A5D57]/80 md:hidden">
            Свайпни фото влево или вправо, чтобы листать
          </p>
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
