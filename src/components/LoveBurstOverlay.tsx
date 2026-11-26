import { useEffect, useRef } from 'react';
import type { FloatingHeart, HeartSpawnRequest } from '../types/tribute';
import {
  createFloatingHeart,
  stepFloatingHearts,
} from '../utils/tributeLogic';

interface LoveBurstOverlayProps {
  spawnRequest: HeartSpawnRequest | null;
}

/**
 * Рисует современное, объёмное, мягкое сердечко с центром в (0, 0),
 * нежным линейным градиентом, тёплым свечением и деликатным бликом.
 */
function drawModernHeart(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  highlightColor: string,
): void {
  const s = size / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(181, 101, 101, 0.24)';
  ctx.shadowBlur = size * 0.45;
  ctx.shadowOffsetY = size * 0.14;

  const grad = ctx.createLinearGradient(-s, -s * 0.9, s, s);
  grad.addColorStop(0, highlightColor);
  grad.addColorStop(0.38, color);
  grad.addColorStop(1, '#9E4752');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.34);
  ctx.bezierCurveTo(
    -s * 0.12,
    -s * 0.96,
    -s * 1.04,
    -s * 0.92,
    -s * 1.02,
    -s * 0.16,
  );
  ctx.bezierCurveTo(
    -s * 1.0,
    s * 0.42,
    -s * 0.34,
    s * 0.78,
    0,
    s * 1.02,
  );
  ctx.bezierCurveTo(
    s * 0.34,
    s * 0.78,
    s * 1.0,
    s * 0.42,
    s * 1.02,
    -s * 0.16,
  );
  ctx.bezierCurveTo(
    s * 1.04,
    -s * 0.92,
    s * 0.12,
    -s * 0.96,
    0,
    -s * 0.34,
  );
  ctx.closePath();
  ctx.fill();

  // Тонкий мягкий блик на левом изгибе для современного тактильного объёма
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 250, 248, 0.38)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.44, -s * 0.32, s * 0.18, s * 0.11, -0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function LoveBurstOverlay({ spawnRequest }: LoveBurstOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heartsRef = useRef<FloatingHeart[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);
  const totalSpawnedRef = useRef<number>(0);
  const staggerTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      staggerTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      staggerTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!spawnRequest || spawnRequest.count <= 0) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const startLoopIfNeeded = () => {
      if (rafIdRef.current !== null) {
        return;
      }

      lastFrameTimeRef.current = performance.now();

      const tick = (now: number) => {
        const dt = (now - lastFrameTimeRef.current) / 1000;
        lastFrameTimeRef.current = now;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          rafIdRef.current = null;
          return;
        }

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        heartsRef.current = stepFloatingHearts(heartsRef.current, dt);
        canvas.dataset.activeHearts = String(heartsRef.current.length);

        for (const h of heartsRef.current) {
          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.rotate(h.rotation);
          ctx.scale(h.scale, h.scale);
          ctx.globalAlpha = h.opacity;
          drawModernHeart(ctx, h.size, h.color, h.highlightColor);
          ctx.restore();
        }

        if (heartsRef.current.length > 0) {
          rafIdRef.current = window.requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          canvas.dataset.activeHearts = '0';
          rafIdRef.current = null;
        }
      };

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    const spawnSingleHeart = (x: number, y: number) => {
      const heart = createFloatingHeart(x, y, nextIdRef.current);
      nextIdRef.current += 1;
      totalSpawnedRef.current += 1;
      // Максимум 90 одновременных сердечек — идеально плавно даже при сверхбыстрых нажатиях
      heartsRef.current = [...heartsRef.current, heart].slice(-90);
      canvas.dataset.totalSpawned = String(totalSpawnedRef.current);
      canvas.dataset.activeHearts = String(heartsRef.current.length);
      startLoopIfNeeded();
    };

    const { x, y, count, staggerMs = 95 } = spawnRequest;

    if (count === 1) {
      spawnSingleHeart(x, y);
      return;
    }

    for (let i = 0; i < count; i += 1) {
      const spreadX = x + (Math.random() - 0.5) * 140;
      const timerId = window.setTimeout(() => {
        spawnSingleHeart(spreadX, y);
      }, i * staggerMs);
      staggerTimersRef.current.push(timerId);
    }
  }, [spawnRequest]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="love-burst-canvas"
      data-active-hearts="0"
      data-total-spawned="0"
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
