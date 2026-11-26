import { useEffect, useRef } from 'react';
import type { LoveParticle } from '../types/tribute';
import {
  createLoveBurstParticles,
  stepLoveParticles,
} from '../utils/tributeLogic';

interface LoveBurstOverlayProps {
  burstCounter: number;
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(0, topCurveHeight);
  ctx.bezierCurveTo(
    0,
    0,
    -size / 2,
    0,
    -size / 2,
    topCurveHeight,
  );
  ctx.bezierCurveTo(
    -size / 2,
    (size + topCurveHeight) / 2,
    0,
    (size + topCurveHeight) * 0.78,
    0,
    size,
  );
  ctx.bezierCurveTo(
    0,
    (size + topCurveHeight) * 0.78,
    size / 2,
    (size + topCurveHeight) / 2,
    size / 2,
    topCurveHeight,
  );
  ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
  ctx.closePath();
  ctx.fill();
}

function drawPetal(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.65);
  ctx.bezierCurveTo(
    size * 0.55,
    -size * 0.35,
    size * 0.45,
    size * 0.45,
    0,
    size * 0.65,
  );
  ctx.bezierCurveTo(
    -size * 0.45,
    size * 0.45,
    -size * 0.55,
    -size * 0.35,
    0,
    -size * 0.65,
  );
  ctx.closePath();
  ctx.fill();
}

export function LoveBurstOverlay({ burstCounter }: LoveBurstOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<LoveParticle[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);

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
    };
  }, []);

  useEffect(() => {
    if (burstCounter === 0) {
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

    const newCount = window.innerWidth < 640 ? 28 : 44;
    const spawned = createLoveBurstParticles(
      newCount,
      window.innerWidth,
      window.innerHeight,
      nextIdRef.current,
    );
    nextIdRef.current += newCount;

    // Ограничиваем максимум частиц для стабильной плавности на мобильных устройствах
    particlesRef.current = [...particlesRef.current, ...spawned].slice(-140);

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

      particlesRef.current = stepLoveParticles(
        particlesRef.current,
        dt,
        window.innerHeight,
      );

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.kind === 'heart') {
          drawHeart(ctx, p.size, p.color);
        } else {
          drawPetal(ctx, p.size, p.color);
        }

        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        rafIdRef.current = window.requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
  }, [burstCounter]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="love-burst-canvas"
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}
