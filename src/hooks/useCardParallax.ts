import { useEffect } from 'react';
import type { RefObject } from 'react';
import { calculateParallaxOffsets } from '../utils/tributeLogic';

interface UseCardParallaxOptions {
  cardRef: RefObject<HTMLElement | null>;
  frameRef: RefObject<HTMLElement | null>;
  innerIntensity?: number;
  cardSpeed?: number;
  disabled?: boolean;
}

/**
 * Управляет плавным скролл-параллаксом через CSS-переменные и requestAnimationFrame
 * без лишних перерисовок React. Учитывает prefers-reduced-motion.
 */
export function useCardParallax({
  cardRef,
  frameRef,
  innerIntensity = 24,
  cardSpeed = 0,
  disabled = false,
}: UseCardParallaxOptions): void {
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (disabled || prefersReducedMotion) {
      cardEl.style.setProperty('--parallax-img-y', '0px');
      cardEl.style.setProperty('--parallax-card-y', '0px');
      return;
    }

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const currentCard = cardRef.current;
      if (!currentCard) {
        return;
      }

      const cardRect = currentCard.getBoundingClientRect();
      const frameHeight = frameRef.current
        ? frameRef.current.getBoundingClientRect().height
        : cardRect.height;
      const isDesktop = window.innerWidth >= 1024;

      const { innerImageY, cardFloatY } = calculateParallaxOffsets({
        rectTop: cardRect.top,
        rectHeight: frameHeight,
        viewportHeight: window.innerHeight,
        innerIntensity,
        // На мобильном оставляем мягкий параллакс внутри фото, а сдвиг самой карточки держим компактнее
        cardSpeed: isDesktop ? cardSpeed : cardSpeed * 0.45,
      });

      currentCard.style.setProperty('--parallax-img-y', `${innerImageY}px`);
      currentCard.style.setProperty('--parallax-card-y', `${cardFloatY}px`);
    };

    const scheduleUpdate = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [cardRef, frameRef, innerIntensity, cardSpeed, disabled]);
}
