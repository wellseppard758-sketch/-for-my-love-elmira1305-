import type {
  FloatingHeart,
  LoveParticle,
  ParticleKind,
} from '../types/tribute';

export const LOVE_BURST_PALETTE = [
  '#D98686',
  '#E8A8A0',
  '#F2C5BC',
  '#C27474',
  '#BCCBB5',
  '#E4B3A9',
] as const;

export const FLOATING_HEART_STYLES = [
  { color: '#C65B64', highlightColor: '#F5B8BE' },
  { color: '#D67079', highlightColor: '#FAD0D4' },
  { color: '#B5555E', highlightColor: '#EEB0B6' },
  { color: '#E0888E', highlightColor: '#FDE0E2' },
  { color: '#CC6672', highlightColor: '#F7C2C8' },
] as const;

export interface AmbientChord {
  name: string;
  frequencies: readonly number[];
}

export interface GentleMelodyNote {
  /** Время внутри такта в секундах */
  offsetSec: number;
  /** Частота ноты в Гц */
  freq: number;
  /** Длительность звучания в секундах */
  durationSec: number;
  /** Относительная мягкая громкость (0..1) */
  velocity: number;
  /** Голос: тёплый аккомпанемент или нежная верхняя мелодия */
  voice: 'felt' | 'melody' | 'pad';
}

export interface GentleMelodyMeasure {
  name: string;
  durationSec: number;
  notes: readonly GentleMelodyNote[];
}

/**
 * Тёплая гармоническая основа в F-dur (Fmaj7 -> C/E -> Dm9 -> Bbmaj7 -> Gm9 -> C9sus4)
 * — мягкая, колыбельная и нежная интонация без резких скачков.
 */
export const AMBIENT_CHORD_PROGRESSION: readonly AmbientChord[] = [
  { name: 'Fmaj7', frequencies: [174.61, 220.0, 261.63, 329.63, 349.23] },
  { name: 'Cadd9/E', frequencies: [164.81, 261.63, 293.66, 329.63, 392.0] },
  { name: 'Dm9', frequencies: [146.83, 220.0, 261.63, 329.63, 349.23] },
  { name: 'Bbmaj7', frequencies: [116.54, 220.0, 293.66, 349.23, 440.0] },
];

/**
 * 8-тактовая лирическая композиция для тёплого войлочного пианино (felt piano)
 * и воздушного подклада — звучит мягко, спокойно и кинематографично.
 */
export const GENTLE_MELODY_MEASURES: readonly GentleMelodyMeasure[] = [
  {
    name: 'Fmaj7',
    durationSec: 4.2,
    notes: [
      { offsetSec: 0.0, freq: 174.61, durationSec: 4.0, velocity: 0.48, voice: 'pad' },
      { offsetSec: 0.02, freq: 261.63, durationSec: 3.9, velocity: 0.34, voice: 'pad' },
      { offsetSec: 0.0, freq: 174.61, durationSec: 3.4, velocity: 0.65, voice: 'felt' },
      { offsetSec: 0.52, freq: 261.63, durationSec: 2.9, velocity: 0.5, voice: 'felt' },
      { offsetSec: 1.05, freq: 329.63, durationSec: 2.6, velocity: 0.46, voice: 'felt' },
      { offsetSec: 1.58, freq: 349.23, durationSec: 2.3, velocity: 0.44, voice: 'felt' },
      { offsetSec: 0.25, freq: 440.0, durationSec: 2.8, velocity: 0.55, voice: 'melody' },
      { offsetSec: 2.1, freq: 523.25, durationSec: 2.2, velocity: 0.52, voice: 'melody' },
      { offsetSec: 3.15, freq: 440.0, durationSec: 1.6, velocity: 0.44, voice: 'melody' },
    ],
  },
  {
    name: 'Cadd9/E',
    durationSec: 4.2,
    notes: [
      { offsetSec: 0.0, freq: 164.81, durationSec: 4.0, velocity: 0.45, voice: 'pad' },
      { offsetSec: 0.02, freq: 261.63, durationSec: 3.9, velocity: 0.32, voice: 'pad' },
      { offsetSec: 0.0, freq: 164.81, durationSec: 3.3, velocity: 0.62, voice: 'felt' },
      { offsetSec: 0.52, freq: 261.63, durationSec: 2.8, velocity: 0.48, voice: 'felt' },
      { offsetSec: 1.05, freq: 293.66, durationSec: 2.6, velocity: 0.46, voice: 'felt' },
      { offsetSec: 1.58, freq: 329.63, durationSec: 2.3, velocity: 0.44, voice: 'felt' },
      { offsetSec: 0.25, freq: 392.0, durationSec: 3.0, velocity: 0.52, voice: 'melody' },
      { offsetSec: 2.2, freq: 440.0, durationSec: 1.9, velocity: 0.46, voice: 'melody' },
      { offsetSec: 3.2, freq: 392.0, durationSec: 1.6, velocity: 0.42, voice: 'melody' },
    ],
  },
  {
    name: 'Dm9',
    durationSec: 4.2,
    notes: [
      { offsetSec: 0.0, freq: 146.83, durationSec: 4.0, velocity: 0.46, voice: 'pad' },
      { offsetSec: 0.02, freq: 220.0, durationSec: 3.9, velocity: 0.32, voice: 'pad' },
      { offsetSec: 0.0, freq: 146.83, durationSec: 3.5, velocity: 0.64, voice: 'felt' },
      { offsetSec: 0.52, freq: 220.0, durationSec: 2.9, velocity: 0.48, voice: 'felt' },
      { offsetSec: 1.05, freq: 261.63, durationSec: 2.6, velocity: 0.45, voice: 'felt' },
      { offsetSec: 1.58, freq: 329.63, durationSec: 2.4, velocity: 0.44, voice: 'felt' },
      { offsetSec: 0.25, freq: 349.23, durationSec: 2.7, velocity: 0.54, voice: 'melody' },
      { offsetSec: 2.1, freq: 440.0, durationSec: 2.2, velocity: 0.5, voice: 'melody' },
      { offsetSec: 3.15, freq: 523.25, durationSec: 1.8, velocity: 0.46, voice: 'melody' },
    ],
  },
  {
    name: 'Bbmaj7',
    durationSec: 4.2,
    notes: [
      { offsetSec: 0.0, freq: 116.54, durationSec: 4.0, velocity: 0.42, voice: 'pad' },
      { offsetSec: 0.02, freq: 220.0, durationSec: 3.9, velocity: 0.3, voice: 'pad' },
      { offsetSec: 0.0, freq: 233.08, durationSec: 3.4, velocity: 0.6, voice: 'felt' },
      { offsetSec: 0.52, freq: 293.66, durationSec: 2.8, velocity: 0.48, voice: 'felt' },
      { offsetSec: 1.05, freq: 349.23, durationSec: 2.6, velocity: 0.46, voice: 'felt' },
      { offsetSec: 1.58, freq: 440.0, durationSec: 2.3, velocity: 0.42, voice: 'felt' },
      { offsetSec: 0.3, freq: 587.33, durationSec: 2.5, velocity: 0.5, voice: 'melody' },
      { offsetSec: 2.15, freq: 523.25, durationSec: 2.1, velocity: 0.48, voice: 'melody' },
      { offsetSec: 3.2, freq: 440.0, durationSec: 1.7, velocity: 0.42, voice: 'melody' },
    ],
  },
  {
    name: 'Gm9',
    durationSec: 4.2,
    notes: [
      { offsetSec: 0.0, freq: 196.0, durationSec: 4.0, velocity: 0.44, voice: 'pad' },
      { offsetSec: 0.02, freq: 293.66, durationSec: 3.9, velocity: 0.3, voice: 'pad' },
      { offsetSec: 0.0, freq: 196.0, durationSec: 3.3, velocity: 0.6, voice: 'felt' },
      { offsetSec: 0.52, freq: 233.08, durationSec: 2.8, velocity: 0.48, voice: 'felt' },
      { offsetSec: 1.05, freq: 293.66, durationSec: 2.6, velocity: 0.45, voice: 'felt' },
      { offsetSec: 1.58, freq: 349.23, durationSec: 2.3, velocity: 0.42, voice: 'felt' },
      { offsetSec: 0.25, freq: 440.0, durationSec: 2.6, velocity: 0.5, voice: 'melody' },
      { offsetSec: 2.1, freq: 392.0, durationSec: 2.2, velocity: 0.48, voice: 'melody' },
      { offsetSec: 3.15, freq: 349.23, durationSec: 1.8, velocity: 0.44, voice: 'melody' },
    ],
  },
  {
    name: 'C9sus4',
    durationSec: 4.2,
    notes: [
      { offsetSec: 0.0, freq: 130.81, durationSec: 4.0, velocity: 0.42, voice: 'pad' },
      { offsetSec: 0.02, freq: 261.63, durationSec: 3.9, velocity: 0.32, voice: 'pad' },
      { offsetSec: 0.0, freq: 261.63, durationSec: 3.4, velocity: 0.6, voice: 'felt' },
      { offsetSec: 0.52, freq: 293.66, durationSec: 2.8, velocity: 0.46, voice: 'felt' },
      { offsetSec: 1.05, freq: 349.23, durationSec: 2.6, velocity: 0.44, voice: 'felt' },
      { offsetSec: 1.65, freq: 329.63, durationSec: 2.4, velocity: 0.45, voice: 'felt' },
      { offsetSec: 0.3, freq: 392.0, durationSec: 2.6, velocity: 0.48, voice: 'melody' },
      { offsetSec: 2.25, freq: 440.0, durationSec: 2.1, velocity: 0.46, voice: 'melody' },
      { offsetSec: 3.3, freq: 392.0, durationSec: 1.5, velocity: 0.4, voice: 'melody' },
    ],
  },
];

/** Нежная пентатоника F-dur для отклика при каждом нажатии на сердечко */
export const HEART_CHIME_SCALE = [
  523.25, // C5
  587.33, // D5
  698.46, // F5
  783.99, // G5
  880.0,  // A5
  1046.5, // C6
] as const;

/**
 * Склонение слова «сердечко» в русском языке (1 сердечко, 2 сердечка, 5 сердечек).
 */
export function formatRussianHeartsCount(count: number): string {
  const abs = Math.abs(Math.trunc(count));
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  if (mod100 >= 11 && mod100 <= 14) {
    return `${abs} сердечек`;
  }
  if (mod10 === 1) {
    return `${abs} сердечко`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${abs} сердечка`;
  }
  return `${abs} сердечек`;
}

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
 * Преобразует путь к фото с учётом Vite BASE_URL (например, для GitHub Pages),
 * оставляя внешние URL и data-URI без изменений.
 */
export function resolveAssetPath(src: string, baseUrl = '/'): string {
  const trimmed = src.trim();
  if (
    !trimmed ||
    /^(?:https?:|data:|blob:|\/\/)/i.test(trimmed)
  ) {
    return trimmed;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (normalizedBase !== '/' && trimmed.startsWith(normalizedBase)) {
    return trimmed;
  }

  const cleanedSrc = trimmed.replace(/^\/+/, '');
  return `${normalizedBase}${cleanedSrc}`;
}

export interface ParallaxInput {
  rectTop: number;
  rectHeight: number;
  viewportHeight: number;
  innerIntensity?: number;
  cardSpeed?: number;
}

export interface ParallaxOffsets {
  progress: number;
  innerImageY: number;
  cardFloatY: number;
}

/**
 * Рассчитывает плавное смещение параллакса для фотографии внутри рамки
 * и лёгкий сдвиг самой карточки, гарантируя отсутствие пустых краёв и перекрытий.
 */
export function calculateParallaxOffsets({
  rectTop,
  rectHeight,
  viewportHeight,
  innerIntensity = 24,
  cardSpeed = 0,
}: ParallaxInput): ParallaxOffsets {
  if (viewportHeight <= 0 || rectHeight <= 0) {
    return { progress: 0, innerImageY: 0, cardFloatY: 0 };
  }

  const cardCenter = rectTop + rectHeight / 2;
  const viewportCenter = viewportHeight / 2;
  const travelSpan = (viewportHeight + rectHeight) / 2;

  const rawProgress = (cardCenter - viewportCenter) / travelSpan;
  const progress = Math.max(-1, Math.min(1, rawProgress));

  // При scale(1.22) у изображения есть запас ~11% сверху и снизу; ограничиваем 9.5%
  const maxSafeImageShift = Math.min(Math.abs(innerIntensity), rectHeight * 0.095);
  const innerImageY = Number((-progress * maxSafeImageShift).toFixed(2));

  // Лёгкое смещение самой карточки ограничено ±10px, чтобы карточки не касались друг друга
  const clampedCardSpeed = Math.max(-10, Math.min(10, cardSpeed));
  const cardFloatY = Number((progress * clampedCardSpeed).toFixed(2));

  return {
    progress: Number(progress.toFixed(4)),
    innerImageY,
    cardFloatY,
  };
}

export type ParallaxPerformanceMode = 'smooth' | 'throttled' | 'static';

export interface ScrollThrottleState {
  mode: ParallaxPerformanceMode;
  recentScrollTimestamps: number[];
  slowFrameStreak: number;
  criticalFrameStreak: number;
  lastRunMs: number;
}

export function createInitialThrottleState(): ScrollThrottleState {
  return {
    mode: 'smooth',
    recentScrollTimestamps: [],
    slowFrameStreak: 0,
    criticalFrameStreak: 0,
    lastRunMs: -Infinity,
  };
}

/**
 * Оценивает частоту scroll-событий и длительность кадра, переключая параллакс
 * в щадящий throttled-режим или статический fallback при перегрузке перерисовкой.
 */
export function evaluateScrollBurst(
  state: ScrollThrottleState,
  nowMs: number,
  frameCostMs?: number,
  recordScrollEvent = true,
): ScrollThrottleState {
  const windowStart = nowMs - 250;
  const filtered = state.recentScrollTimestamps.filter((ts) => ts >= windowStart);
  const recentScrollTimestamps = recordScrollEvent
    ? [...filtered, nowMs]
    : filtered;

  let slowFrameStreak = state.slowFrameStreak;
  let criticalFrameStreak = state.criticalFrameStreak;
  if (typeof frameCostMs === 'number') {
    criticalFrameStreak = frameCostMs > 55 ? state.criticalFrameStreak + 1 : 0;
    slowFrameStreak = frameCostMs > 24 ? state.slowFrameStreak + 1 : 0;
  }

  let mode: ParallaxPerformanceMode = state.mode;
  if (criticalFrameStreak >= 3) {
    mode = 'static';
  } else if (
    mode !== 'static' &&
    (recentScrollTimestamps.length >= 24 || slowFrameStreak >= 2)
  ) {
    mode = 'throttled';
  } else if (
    mode === 'throttled' &&
    recentScrollTimestamps.length <= 6 &&
    slowFrameStreak === 0 &&
    (typeof frameCostMs !== 'number' || frameCostMs <= 16)
  ) {
    mode = 'smooth';
  }

  return {
    ...state,
    mode,
    recentScrollTimestamps,
    slowFrameStreak,
    criticalFrameStreak,
  };
}

/**
 * Возвращает true, если с учётом текущего режима и времени последнего кадра
 * допустимо выполнить обновление CSS-трансформаций параллакса.
 */
export function shouldRunParallaxFrame(
  lastRunMs: number,
  nowMs: number,
  mode: ParallaxPerformanceMode,
): boolean {
  if (mode === 'static') {
    return false;
  }
  const minIntervalMs = mode === 'throttled' ? 64 : 14;
  return nowMs - lastRunMs >= minIntervalMs;
}

export type AmbientTiltVariant = 'a' | 'b' | 'c';

export interface AmbientTiltConfig {
  variant: AmbientTiltVariant;
  minDeg: number;
  maxDeg: number;
  durationSec: number;
  delaySec: number;
}

const TILT_VARIANTS: readonly {
  variant: AmbientTiltVariant;
  minDeg: number;
  maxDeg: number;
}[] = [
  { variant: 'a', minDeg: -1.8, maxDeg: 1.8 },
  { variant: 'b', minDeg: 1.9, maxDeg: -1.5 },
  { variant: 'c', minDeg: -1.5, maxDeg: 2.0 },
];

/**
 * Генерирует детерминированные параметры медленного «живого» покачивания
 * (tilt) с фиксированными ключевыми кадрами для 100% совместимости с iOS Safari и Android.
 */
export function getAmbientTiltConfig(
  id: string,
  baseTiltDegrees = 0,
): AmbientTiltConfig {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  const offset = baseTiltDegrees < 0 ? 0 : 1;
  const chosen = TILT_VARIANTS[(hash + offset) % TILT_VARIANTS.length];

  // Спокойный, но хорошо заметный на телефоне цикл 6.0s..8.4s и разброс фаз
  const durationSec = Number((6.0 + ((hash >> 4) % 7) * 0.4).toFixed(2));
  const delaySec = Number((-(((hash >> 8) % 9) * 0.7)).toFixed(2));

  return {
    variant: chosen.variant,
    minDeg: chosen.minDeg,
    maxDeg: chosen.maxDeg,
    durationSec,
    delaySec,
  };
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

/**
 * Создаёт одно плавно всплывающее современное сердечко из точки клика.
 * 1 клик = 1 сердечко; при серии нажатий каждое получает свой мягкий оттенок,
 * амплитуду S-кривой и скорость для живого, шелковистого потока.
 */
export function createFloatingHeart(
  originX: number,
  originY: number,
  id: number,
  rng: () => number = Math.random,
): FloatingHeart {
  const palette =
    FLOATING_HEART_STYLES[Math.floor(rng() * FLOATING_HEART_STYLES.length)];
  const jitterX = (rng() - 0.5) * 20;
  const startX = originX + jitterX;
  const startY = originY + (rng() - 0.5) * 6;
  const size = 20 + rng() * 14; // 20..34px — чёткий, современный силуэт

  return {
    id,
    originX: startX,
    x: startX,
    y: startY,
    driftX: (rng() - 0.5) * 28,
    vy: -(108 + rng() * 58),
    size,
    scale: 0.25,
    rotation: (rng() - 0.5) * 0.16,
    swayPhase: rng() * Math.PI * 2,
    swaySpeed: 1.9 + rng() * 1.1,
    swayAmplitude: 18 + rng() * 24,
    age: 0,
    maxAge: 2.65 + rng() * 0.95,
    opacity: 0,
    color: palette.color,
    highlightColor: palette.highlightColor,
  };
}

/**
 * Обновляет физику всплывающих сердечек: упругое появление (pop-in),
 * плавная S-траектория, естественный наклон по движению и мягкое растворение.
 */
export function stepFloatingHearts(
  hearts: readonly FloatingHeart[],
  dtSeconds: number,
): FloatingHeart[] {
  const clampedDt = Math.min(Math.max(dtSeconds, 0), 0.05);
  const next: FloatingHeart[] = [];

  for (const h of hearts) {
    const age = h.age + clampedDt;
    if (age >= h.maxAge) {
      continue;
    }

    const progress = age / h.maxAge;
    // Мягкое замедление к концу полёта, чтобы сердечко невесомо «зависало» и таяло
    const speedFactor = 1 - progress * 0.28;
    const y = h.y + h.vy * speedFactor * clampedDt;

    const swayAngle = h.swayPhase + age * h.swaySpeed;
    // Плавно раскрываем амплитуду покачивания после вылета из кнопки
    const swayEnvelope = Math.min(1, age / 0.45);
    const swayOffset = Math.sin(swayAngle) * h.swayAmplitude * swayEnvelope;
    const x = h.originX + h.driftX * age + swayOffset;

    // Производная горизонтального движения задаёт естественный наклон сердечка
    const horizontalVelocity =
      h.driftX + Math.cos(swayAngle) * h.swayAmplitude * h.swaySpeed * swayEnvelope;
    const rotation = Math.max(-0.34, Math.min(0.34, horizontalVelocity * 0.0028));

    // Упругое современное появление (0.25 -> 1.12 -> 1.0) и лёгкое таяние в конце
    let scale = 1;
    if (age < 0.24) {
      const t = age / 0.24;
      // Плавный overshoot (back-out easing)
      const inv = t - 1;
      scale = 0.25 + 0.75 * (1 + 2.4 * inv * inv * inv + 1.4 * inv * inv);
    } else if (progress > 0.72) {
      const tail = (progress - 0.72) / 0.28;
      scale = 1 - tail * 0.16;
    }

    // Мягкое появление и шелковистое растворение в последней трети полёта
    let opacity = 1;
    const isFadingOut = progress > 0.62;
    if (age < 0.14) {
      opacity = Math.max(0.05, age / 0.14);
    } else if (isFadingOut) {
      const fade = (progress - 0.62) / 0.38;
      opacity = Math.max(0, 1 - fade * fade);
    }

    if (y > -80 && (!isFadingOut || opacity > 0.015)) {
      next.push({
        ...h,
        x,
        y,
        scale,
        rotation,
        age,
        opacity,
      });
    }
  }

  return next;
}

