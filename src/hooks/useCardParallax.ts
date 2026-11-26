import { useEffect } from 'react';
import type { RefObject } from 'react';
import { calculateParallaxOffsets } from '../utils/tributeLogic';

interface UseCardParallaxOptions {
  cardRef: RefObject<HTMLElement | null>;
  cardLayerRef: RefObject<HTMLElement | null>;
  frameRef: RefObject<HTMLElement | null>;
  imgLayerRef: RefObject<HTMLElement | null>;
  innerIntensity?: number;
  cardSpeed?: number;
  disabled?: boolean;
}

/**
 * Применяет плавный скролл-параллакс напрямую к transform-слоям DOM через rAF
 * (без наследования CSS-переменных, которое тормозит/не перерисовывается в iOS Safari),
 * с поддержкой touchmove и visualViewport для мобильных браузеров.
 */
export function useCardParallax({
  cardRef,
  cardLayerRef,
  frameRef,
  imgLayerRef,
  innerIntensity = 34,
  cardSpeed = 0,
  disabled = false,
}: UseCardParallaxOptions): void {
  useEffect(() => {
    const cardEl = cardRef.current;
    const cardLayerEl = cardLayerRef.current;
    const imgLayerEl = imgLayerRef.current;

    if (!cardEl) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (disabled || prefersReducedMotion) {
      if (cardLayerEl) {
        cardLayerEl.style.transform = 'translate3d(0, 0px, 0)';
      }
      if (imgLayerEl) {
        imgLayerEl.style.transform = prefersReducedMotion
          ? 'none'
          : 'translate3d(0, 0px, 0) scale(1.22)';
      }
      cardEl.dataset.parallaxImgY = '0';
      cardEl.dataset.parallaxCardY = '0';
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
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;

      const { innerImageY, cardFloatY } = calculateParallaxOffsets({
        rectTop: cardRect.top,
        rectHeight: frameHeight,
        viewportHeight,
        innerIntensity,
        cardSpeed,
      });

      if (cardLayerRef.current) {
        cardLayerRef.current.style.transform = `translate3d(0, ${cardFloatY}px, 0)`;
      }
      if (imgLayerRef.current) {
        imgLayerRef.current.style.transform = `translate3d(0, ${innerImageY}px, 0) scale(1.22)`;
      }

      currentCard.dataset.parallaxImgY = String(innerImageY);
      currentCard.dataset.parallaxCardY = String(cardFloatY);
    };

    const scheduleUpdate = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('touchmove', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('scroll', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('touchmove', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('scroll', scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [cardRef, cardLayerRef, frameRef, imgLayerRef, innerIntensity, cardSpeed, disabled]);
}
