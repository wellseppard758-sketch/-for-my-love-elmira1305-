export type BentoSpanVariant = 'featured' | 'wide' | 'tall' | 'square';

export type WashiTapeColor = 'rose' | 'sage' | 'cream';

export interface PhotoMemory {
  id: string;
  src: string;
  alt: string;
  title: string;
  date: string;
  location: string;
  memoryNote: string;
  span: BentoSpanVariant;
  tiltDegrees: number;
  tapeColor: WashiTapeColor;
  tapeCorner: 'top-left' | 'top-right' | 'top-center';
  objectPosition?: string;
  parallaxDepth?: number;
  parallaxSpeed?: number;
}

export interface ComplimentItem {
  id: number;
  text: string;
  from: string;
}

export type ParticleKind = 'heart' | 'petal';

export interface LoveParticle {
  id: number;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
  swayAmplitude: number;
  opacity: number;
  color: string;
}

export interface FloatingHeart {
  id: number;
  originX: number;
  x: number;
  y: number;
  driftX: number;
  vy: number;
  size: number;
  scale: number;
  rotation: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmplitude: number;
  age: number;
  maxAge: number;
  opacity: number;
  color: string;
  highlightColor: string;
}

export interface HeartSpawnRequest {
  id: number;
  x: number;
  y: number;
  count: number;
  staggerMs?: number;
}

export type ConfettiShape = 'ribbon' | 'circle' | 'diamond';

export type ConfettiArcVariant = 'high' | 'mid' | 'wide' | 'soft';

export interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  xLane: number; // 0..9 равномерный веер влево-вправо
  arcVariant: ConfettiArcVariant;
  spinVariant: 'a' | 'b' | 'c';
  shape: ConfettiShape;
  color: string;
  width: number;
  height: number;
  durationMs: number;
  spinDurationMs: number;
  delayMs: number;
}

export interface ConfettiBurstRequest {
  id: number;
  x: number;
  y: number;
}
