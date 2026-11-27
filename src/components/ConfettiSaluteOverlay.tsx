import { memo, useEffect, useRef, useState } from 'react';
import type { ConfettiBurstRequest, ConfettiPiece } from '../types/tribute';
import { createConfettiSalutePieces } from '../utils/tributeLogic';

interface ConfettiSaluteOverlayProps {
  burstRequest: ConfettiBurstRequest | null;
}

const ConfettiPieceItem = memo(function ConfettiPieceItem({
  piece,
}: {
  piece: ConfettiPiece;
}) {
  const shapeClass =
    piece.shape === 'circle'
      ? 'rounded-full'
      : piece.shape === 'diamond'
        ? 'rounded-[2px] rotate-45'
        : 'rounded-[2px]';

  return (
    <span
      data-testid="confetti-salute-piece"
      className={`confetti-salute-x confetti-lane-${piece.xLane}`}
      style={{
        left: `${piece.x}px`,
        top: `${piece.y}px`,
        animationDuration: `${piece.durationMs}ms, ${piece.durationMs}ms`,
        animationDelay: `${piece.delayMs}ms, ${piece.delayMs}ms`,
      }}
    >
      <span
        className={`confetti-salute-y confetti-arc-${piece.arcVariant}`}
        style={{
          animationDuration: `${piece.durationMs}ms`,
          animationDelay: `${piece.delayMs}ms`,
        }}
      >
        <span
          className={`confetti-salute-spin confetti-spin-${piece.spinVariant} block ${shapeClass}`}
          style={{
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            backgroundColor: piece.color,
            animationDuration: `${piece.spinDurationMs}ms`,
            animationDelay: `${piece.delayMs}ms`,
          }}
        />
      </span>
    </span>
  );
});

/**
 * Праздничный салют из конфетти при открытии секретного конверта.
 * Использует три разделённых GPU-слоя (веер X, баллистическая парабола Y, 3D-вращение)
 * без тяжёлых CSS-фильтров — работает на 60/120fps на всех телефонах и ПК.
 */
export function ConfettiSaluteOverlay({
  burstRequest,
}: ConfettiSaluteOverlayProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [burstCount, setBurstCount] = useState(0);
  const nextIdRef = useRef(1);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!burstRequest) {
      return;
    }

    const viewportWidth =
      typeof window !== 'undefined' ? window.innerWidth : 1024;
    const isCompact = viewportWidth < 640;
    const count = isCompact ? 38 : 54;

    const spawned = createConfettiSalutePieces(
      burstRequest.x,
      burstRequest.y,
      count,
      nextIdRef.current,
      isCompact,
    );
    nextIdRef.current += spawned.length;

    const spawnedIds = new Set(spawned.map((p) => p.id));
    setBurstCount((prev) => prev + 1);
    setPieces((prev) => [...prev, ...spawned].slice(-120));

    const maxLifespan = spawned.reduce(
      (max, p) => Math.max(max, p.durationMs + p.delayMs),
      2600,
    );

    const cleanupTimer = window.setTimeout(() => {
      setPieces((prev) => prev.filter((item) => !spawnedIds.has(item.id)));
    }, maxLifespan + 180);
    timersRef.current.push(cleanupTimer);
  }, [burstRequest]);

  return (
    <div
      data-testid="confetti-salute-overlay"
      data-active-confetti={pieces.length}
      data-total-bursts={burstCount}
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      {pieces.map((piece) => (
        <ConfettiPieceItem key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
