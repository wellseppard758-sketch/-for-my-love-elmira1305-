import { memo, useEffect, useRef, useState } from 'react';
import type { HeartSpawnRequest } from '../types/tribute';
import { FLOATING_HEART_STYLES } from '../utils/tributeLogic';

interface LoveBurstOverlayProps {
  spawnRequest: HeartSpawnRequest | null;
}

type FloatVariant = 'a' | 'b' | 'c' | 'd';

interface RenderedFloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  riseDurationMs: number;
  swayDurationMs: number;
  swayDelayMs: number;
  isTall: boolean;
  variant: FloatVariant;
  color: string;
  highlightColor: string;
}

const FLOAT_VARIANTS: readonly FloatVariant[] = ['a', 'b', 'c', 'd'];

const FloatingHeartItem = memo(function FloatingHeartItem({
  heart,
}: {
  heart: RenderedFloatingHeart;
}) {
  const gradId = `heart-grad-${heart.id}`;
  return (
    <span
      data-testid="floating-heart-item"
      className={`floating-heart-rise ${
        heart.isTall ? 'floating-heart-rise-tall' : ''
      }`}
      style={{
        left: `${heart.x}px`,
        top: `${heart.y}px`,
        width: `${heart.size}px`,
        height: `${heart.size}px`,
        marginLeft: `${-heart.size / 2}px`,
        marginTop: `${-heart.size / 2}px`,
        animationDuration: `${heart.riseDurationMs}ms, ${heart.riseDurationMs}ms`,
      }}
    >
      <span
        className={`floating-heart-sway floating-heart-sway-${heart.variant}`}
        style={{
          animationDuration: `${heart.swayDurationMs}ms`,
          animationDelay: `${heart.swayDelayMs}ms`,
        }}
      >
        <span className="floating-heart-pop">
          <svg
            viewBox="0 0 36 36"
            width={heart.size}
            height={heart.size}
            className="block h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id={gradId} x1="15%" y1="10%" x2="85%" y2="95%">
                <stop offset="0%" stopColor={heart.highlightColor} />
                <stop offset="44%" stopColor={heart.color} />
                <stop offset="100%" stopColor="#9B4450" />
              </linearGradient>
            </defs>
            {/* Мягкая встроенная векторная подложка вместо тяжёлого CSS filter: drop-shadow */}
            <path
              d="M18 32.8C18 32.8 4.8 24.4 4.8 14.7C4.8 9.8 8.4 6.4 12.8 6.4C15.5 6.4 17.2 7.9 18 9.6C18.8 7.9 20.5 6.4 23.2 6.4C27.6 6.4 31.2 9.8 31.2 14.7C31.2 24.4 18 32.8 18 32.8Z"
              fill="rgba(165, 82, 90, 0.16)"
            />
            <path
              d="M18 31.2C18 31.2 4.5 22.8 4.5 13.1C4.5 8.2 8.2 4.8 12.6 4.8C15.3 4.8 17.1 6.3 18 8C18.9 6.3 20.7 4.8 23.4 4.8C27.8 4.8 31.5 8.2 31.5 13.1C31.5 22.8 18 31.2 18 31.2Z"
              fill={`url(#${gradId})`}
            />
            <ellipse
              cx="12.2"
              cy="11.8"
              rx="2.7"
              ry="1.6"
              transform="rotate(-32 12.2 11.8)"
              fill="rgba(255, 250, 248, 0.42)"
            />
          </svg>
        </span>
      </span>
    </span>
  );
});

/**
 * Мемоизированный GPU-ускоренный SVG-слой всплывающих сердечек.
 * Раздельные слои подъёма (одна непрерывная кривая), гармонического покачивания
 * и появления без тяжёлых CSS-фильтров обеспечивают плавные 60/120fps на телефоне.
 */
export function LoveBurstOverlay({ spawnRequest }: LoveBurstOverlayProps) {
  const [hearts, setHearts] = useState<RenderedFloatingHeart[]>([]);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const nextIdRef = useRef(1);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!spawnRequest || spawnRequest.count <= 0) {
      return;
    }

    const spawnOne = (baseX: number, baseY: number) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      const palette =
        FLOATING_HEART_STYLES[(id - 1) % FLOATING_HEART_STYLES.length];
      const variant = FLOAT_VARIANTS[(id - 1) % FLOAT_VARIANTS.length];
      const jitterX = (Math.random() - 0.5) * 24;
      const size = Math.round(24 + Math.random() * 14);
      const riseDurationMs = Math.round(2400 + Math.random() * 800);
      const swayDurationMs = Math.round(1350 + Math.random() * 450);
      // Начинаем покачивание с нейтрального центра (около -50% фазы), чтобы старт был без рывка в сторону
      const swayDelayMs = -Math.round(swayDurationMs * 0.5);

      const safeWidth =
        typeof window !== 'undefined' ? window.innerWidth : 400;
      const clampedX = Math.max(28, Math.min(safeWidth - 28, baseX + jitterX));
      const clampedY = Math.max(40, baseY);

      const newHeart: RenderedFloatingHeart = {
        id,
        x: clampedX,
        y: clampedY,
        size,
        riseDurationMs,
        swayDurationMs,
        swayDelayMs,
        isTall: id % 2 === 0,
        variant,
        color: palette.color,
        highlightColor: palette.highlightColor,
      };

      setTotalSpawned((prev) => prev + 1);
      setHearts((prev) => [...prev, newHeart].slice(-48));

      const cleanupId = window.setTimeout(() => {
        setHearts((prev) => prev.filter((item) => item.id !== id));
      }, riseDurationMs + 140);
      timersRef.current.push(cleanupId);
    };

    const { x, y, count, staggerMs = 95 } = spawnRequest;

    if (count === 1) {
      spawnOne(x, y);
      return;
    }

    for (let i = 0; i < count; i += 1) {
      const spreadX = x + (Math.random() - 0.5) * 120;
      const timerId = window.setTimeout(() => {
        spawnOne(spreadX, y);
      }, i * staggerMs);
      timersRef.current.push(timerId);
    }
  }, [spawnRequest]);

  return (
    <div
      data-testid="love-burst-canvas"
      data-active-hearts={hearts.length}
      data-total-spawned={totalSpawned}
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      {hearts.map((heart) => (
        <FloatingHeartItem key={heart.id} heart={heart} />
      ))}
    </div>
  );
}
