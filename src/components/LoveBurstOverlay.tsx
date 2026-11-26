import { useEffect, useRef, useState } from 'react';
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
  durationMs: number;
  variant: FloatVariant;
  color: string;
  highlightColor: string;
}

const FLOAT_VARIANTS: readonly FloatVariant[] = ['a', 'b', 'c', 'd'];

/**
 * GPU-ускоренный DOM/SVG-слой всплывающих сердечек.
 * В отличие от fullscreen Canvas и prefers-reduced-motion-блокировок,
 * гарантированно и плавно отображается на всех реальных телефонах (iOS Safari, Android, WebView).
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
      const jitterX = (Math.random() - 0.5) * 26;
      const size = Math.round(24 + Math.random() * 14); // 24..38px — чётко видно на экране телефона
      const durationMs = Math.round(2200 + Math.random() * 750);

      const safeWidth =
        typeof window !== 'undefined' ? window.innerWidth : 400;
      const clampedX = Math.max(24, Math.min(safeWidth - 24, baseX + jitterX));
      const clampedY = Math.max(40, baseY);

      const newHeart: RenderedFloatingHeart = {
        id,
        x: clampedX,
        y: clampedY,
        size,
        durationMs,
        variant,
        color: palette.color,
        highlightColor: palette.highlightColor,
      };

      setTotalSpawned((prev) => prev + 1);
      // Максимум 48 одновременных сердечек — идеально плавно даже при сверхбыстрых нажатиях на телефоне
      setHearts((prev) => [...prev, newHeart].slice(-48));

      const cleanupId = window.setTimeout(() => {
        setHearts((prev) => prev.filter((item) => item.id !== id));
      }, durationMs + 120);
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
      {hearts.map((h) => {
        const gradId = `heart-grad-${h.id}`;
        return (
          <span
            key={h.id}
            data-testid="floating-heart-item"
            className={`floating-heart-node floating-heart-path-${h.variant}`}
            style={{
              left: `${h.x}px`,
              top: `${h.y}px`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              marginLeft: `${-h.size / 2}px`,
              marginTop: `${-h.size / 2}px`,
              animationDuration: `${h.durationMs}ms`,
            }}
          >
            <svg
              viewBox="0 0 36 36"
              width={h.size}
              height={h.size}
              className="block h-full w-full overflow-visible drop-shadow-[0_6px_10px_rgba(181,101,101,0.34)]"
            >
              <defs>
                <linearGradient id={gradId} x1="15%" y1="10%" x2="85%" y2="95%">
                  <stop offset="0%" stopColor={h.highlightColor} />
                  <stop offset="42%" stopColor={h.color} />
                  <stop offset="100%" stopColor="#9B4450" />
                </linearGradient>
              </defs>
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
        );
      })}
    </div>
  );
}
