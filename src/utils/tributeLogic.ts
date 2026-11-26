import type { LoveParticle, ParticleKind } from '../types/tribute';

export const LOVE_BURST_PALETTE = [
  '#D98686',
  '#E8A8A0',
  '#F2C5BC',
  '#C27474',
  '#BCCBB5',
  '#E4B3A9',
] as const;

export interface AmbientChord {
  name: string;
  frequencies: readonly number[];
}

/**
 * Тёплая последовательность аккордов (Cmaj9 -> Fmaj7 -> Am9 -> G6)
 * для мягкого синтезатора «Атмосфера».
 */
export const AMBIENT_CHORD_PROGRESSION: readonly AmbientChord[] = [
  { name: 'Cmaj9', frequencies: [261.63, 329.63, 392.0, 493.88, 587.33] },
  { name: 'Fmaj7', frequencies: [220.0, 261.63, 329.63, 349.23, 523.25] },
  { name: 'Am9', frequencies: [220.0, 261.63, 329.63, 392.0, 493.88] },
  { name: 'G6', frequencies: [196.0, 246.94, 293.66, 329.63, 440.0] },
];

/**
 * Переход к следующему комплименту по кругу без пропусков.
 */
export function getNextComplimentIndex(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  const normalized = ((currentIndex % total) + total) % total;
  return (normalized + 1) % total;
}

/**
 * Форматирует счётчик комплиментов (например, "3 / 12").
 */
export function formatComplimentCounter(index: number, total: number): string {
  if (total <= 0) {
    return '0 / 0';
  }
  const safeIndex = ((index % total) + total) % total;
  return `${safeIndex + 1} / ${total}`;
}

/**
 * Переключает перевёрнутую карточку Полароида.
 */
export function toggleFlippedPhotoId(
  currentFlippedId: string | null,
  targetId: string,
): string | null {
  return currentFlippedId === targetId ? null : targetId;
}

/**
 * Возвращает индекс следующего/предыдущего фото для просмотра в окне крупного плана.
 */
export function getAdjacentPhotoIndex(
  currentIndex: number,
  direction: 'prev' | 'next',
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }
  const delta = direction === 'next' ? 1 : -1;
  return (currentIndex + delta + total) % total;
}

/**
 * Детерминированный генератор псевдослучайных чисел (Mulberry32) для предсказуемых тестов и плавного салюта.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Создаёт порцию парящих сердечек и цветочных лепестков по всему экрану.
 */
export function createLoveBurstParticles(
  count: number,
  viewportWidth: number,
  viewportHeight: number,
  startId = 1,
  rng: () => number = Math.random,
): LoveParticle[] {
  const safeWidth = Math.max(viewportWidth, 320);
  const safeHeight = Math.max(viewportHeight, 480);
  const particles: LoveParticle[] = [];

  for (let i = 0; i < count; i += 1) {
    const kind: ParticleKind = rng() < 0.52 ? 'heart' : 'petal';
    const spawnFromBottom = rng() < 0.65;
    const x = safeWidth * (0.06 + rng() * 0.88);
    const y = spawnFromBottom
      ? safeHeight + 12 + rng() * 140
      : -16 - rng() * 140;

    // Сердечки плавно взмывают снизу, лепестки могут и взмывать, и кружиться сверху
    const vy = spawnFromBottom
      ? -(95 + rng() * 135)
      : 65 + rng() * 95;

    const color =
      LOVE_BURST_PALETTE[Math.floor(rng() * LOVE_BURST_PALETTE.length)];

    particles.push({
      id: startId + i,
      kind,
      x,
      y,
      vx: (rng() - 0.5) * 42,
      vy,
      size: kind === 'heart' ? 12 + rng() * 14 : 11 + rng() * 13,
      rotation: rng() * Math.PI * 2,
      rotationSpeed: (rng() - 0.5) * 2.2,
      swayPhase: rng() * Math.PI * 2,
      swayAmplitude: 18 + rng() * 34,
      opacity: 0.72 + rng() * 0.28,
      color,
    });
  }

  return particles;
}

/**
 * Обновляет физику частиц на шаге анимации и убирает ушедшие за пределы экрана.
 */
export function stepLoveParticles(
  particles: readonly LoveParticle[],
  dtSeconds: number,
  viewportHeight: number,
): LoveParticle[] {
  const clampedDt = Math.min(Math.max(dtSeconds, 0), 0.05);
  const next: LoveParticle[] = [];

  for (const p of particles) {
    const swayPhase = p.swayPhase + clampedDt * 2.1;
    const x = p.x + (p.vx + Math.sin(swayPhase) * p.swayAmplitude) * clampedDt;
    const y = p.y + p.vy * clampedDt;
    const rotation = p.rotation + p.rotationSpeed * clampedDt;

    // Плавное затухание ближе к краю экрана
    let opacity = p.opacity;
    if (p.vy < 0 && y < viewportHeight * 0.18) {
      opacity = Math.max(0, p.opacity - clampedDt * 0.9);
    } else if (p.vy > 0 && y > viewportHeight * 0.82) {
      opacity = Math.max(0, p.opacity - clampedDt * 0.9);
    }

    const isVisibleVertically =
      p.vy < 0 ? y > -60 : y < viewportHeight + 60;

    if (isVisibleVertically && opacity > 0.02) {
      next.push({
        ...p,
        x,
        y,
        rotation,
        swayPhase,
        opacity,
      });
    }
  }

  return next;
}
