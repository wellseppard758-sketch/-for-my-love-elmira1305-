/**
 * Чистый синтезатор нежного романтического вальса (3/4, G-dur) в стерео PCM WAV.
 * Проигрывается через нативный HTMLAudioElement, поэтому гарантированно громко
 * и чисто звучит на iPhone (даже при включённом беззвучном переключателе) и Android.
 */

export interface WaltzNoteEvent {
  startSec: number;
  freq: number;
  durationSec: number;
  gain: number;
  instrument: 'celesta' | 'harp' | 'strings';
  pan: number; // -1 (лево) .. +1 (право)
}

export const WALTZ_LOOP_DURATION_SEC = 16.0;

/**
 * 8-тактовый нежный вальс в соль мажоре (Gmaj7 -> Bm7 -> Em9 -> Cmaj7 -> Am9 -> D9sus4 -> Gmaj7 -> D13sus4).
 * Темп: 90 BPM (1 такт 3/4 = 2.0 сек, полный бесшовный цикл = 16.0 сек).
 */
export const GENTLE_WALTZ_SCORE: readonly WaltzNoteEvent[] = [
  // Такт 1 (0.0 – 2.0с): Gmaj7
  { startSec: 0.0, freq: 196.0, durationSec: 2.1, gain: 0.24, instrument: 'strings', pan: 0.0 },
  { startSec: 0.0, freq: 293.66, durationSec: 2.1, gain: 0.18, instrument: 'strings', pan: -0.15 },
  { startSec: 0.0, freq: 246.94, durationSec: 1.5, gain: 0.28, instrument: 'harp', pan: -0.3 },
  { startSec: 0.667, freq: 392.0, durationSec: 1.2, gain: 0.23, instrument: 'harp', pan: -0.2 },
  { startSec: 1.333, freq: 493.88, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.15 },
  { startSec: 0.02, freq: 783.99, durationSec: 1.75, gain: 0.34, instrument: 'celesta', pan: 0.22 }, // G5
  { startSec: 1.333, freq: 739.99, durationSec: 0.95, gain: 0.28, instrument: 'celesta', pan: 0.18 }, // F#5

  // Такт 2 (2.0 – 4.0с): Bm7
  { startSec: 2.0, freq: 246.94, durationSec: 2.1, gain: 0.22, instrument: 'strings', pan: 0.0 },
  { startSec: 2.0, freq: 369.99, durationSec: 2.1, gain: 0.17, instrument: 'strings', pan: 0.15 },
  { startSec: 2.0, freq: 246.94, durationSec: 1.5, gain: 0.26, instrument: 'harp', pan: -0.28 },
  { startSec: 2.667, freq: 369.99, durationSec: 1.2, gain: 0.22, instrument: 'harp', pan: -0.18 },
  { startSec: 3.333, freq: 440.0, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.1 },
  { startSec: 2.02, freq: 587.33, durationSec: 1.9, gain: 0.32, instrument: 'celesta', pan: 0.24 }, // D5
  { startSec: 3.333, freq: 659.25, durationSec: 1.0, gain: 0.29, instrument: 'celesta', pan: 0.2 }, // E5

  // Такт 3 (4.0 – 6.0с): Em9
  { startSec: 4.0, freq: 164.81, durationSec: 2.1, gain: 0.24, instrument: 'strings', pan: 0.0 },
  { startSec: 4.0, freq: 329.63, durationSec: 2.1, gain: 0.18, instrument: 'strings', pan: -0.15 },
  { startSec: 4.0, freq: 329.63, durationSec: 1.5, gain: 0.27, instrument: 'harp', pan: -0.3 },
  { startSec: 4.667, freq: 392.0, durationSec: 1.2, gain: 0.22, instrument: 'harp', pan: -0.2 },
  { startSec: 5.333, freq: 493.88, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.15 },
  { startSec: 4.02, freq: 739.99, durationSec: 1.35, gain: 0.33, instrument: 'celesta', pan: 0.25 }, // F#5
  { startSec: 5.0, freq: 783.99, durationSec: 1.2, gain: 0.31, instrument: 'celesta', pan: 0.2 }, // G5

  // Такт 4 (6.0 – 8.0с): Cmaj7
  { startSec: 6.0, freq: 261.63, durationSec: 2.1, gain: 0.22, instrument: 'strings', pan: 0.0 },
  { startSec: 6.0, freq: 329.63, durationSec: 2.1, gain: 0.18, instrument: 'strings', pan: 0.15 },
  { startSec: 6.0, freq: 261.63, durationSec: 1.5, gain: 0.28, instrument: 'harp', pan: -0.28 },
  { startSec: 6.667, freq: 392.0, durationSec: 1.2, gain: 0.22, instrument: 'harp', pan: -0.18 },
  { startSec: 7.333, freq: 493.88, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.12 },
  { startSec: 6.02, freq: 987.77, durationSec: 1.65, gain: 0.3, instrument: 'celesta', pan: 0.26 }, // B5
  { startSec: 7.333, freq: 880.0, durationSec: 1.0, gain: 0.28, instrument: 'celesta', pan: 0.22 }, // A5

  // Такт 5 (8.0 – 10.0с): Am9
  { startSec: 8.0, freq: 220.0, durationSec: 2.1, gain: 0.23, instrument: 'strings', pan: 0.0 },
  { startSec: 8.0, freq: 329.63, durationSec: 2.1, gain: 0.18, instrument: 'strings', pan: -0.15 },
  { startSec: 8.0, freq: 220.0, durationSec: 1.5, gain: 0.27, instrument: 'harp', pan: -0.3 },
  { startSec: 8.667, freq: 329.63, durationSec: 1.2, gain: 0.22, instrument: 'harp', pan: -0.2 },
  { startSec: 9.333, freq: 493.88, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.12 },
  { startSec: 8.02, freq: 783.99, durationSec: 1.35, gain: 0.33, instrument: 'celesta', pan: 0.24 }, // G5
  { startSec: 9.0, freq: 659.25, durationSec: 1.25, gain: 0.3, instrument: 'celesta', pan: 0.2 }, // E5

  // Такт 6 (10.0 – 12.0с): D9sus4 -> D7
  { startSec: 10.0, freq: 293.66, durationSec: 2.1, gain: 0.22, instrument: 'strings', pan: 0.0 },
  { startSec: 10.0, freq: 392.0, durationSec: 1.3, gain: 0.16, instrument: 'strings', pan: 0.15 },
  { startSec: 10.0, freq: 293.66, durationSec: 1.5, gain: 0.27, instrument: 'harp', pan: -0.28 },
  { startSec: 10.667, freq: 440.0, durationSec: 1.2, gain: 0.22, instrument: 'harp', pan: -0.18 },
  { startSec: 11.333, freq: 523.25, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.12 },
  { startSec: 10.02, freq: 587.33, durationSec: 1.4, gain: 0.31, instrument: 'celesta', pan: 0.24 }, // D5
  { startSec: 11.333, freq: 659.25, durationSec: 1.0, gain: 0.29, instrument: 'celesta', pan: 0.2 }, // E5

  // Такт 7 (12.0 – 14.0с): Gmaj7
  { startSec: 12.0, freq: 196.0, durationSec: 2.1, gain: 0.24, instrument: 'strings', pan: 0.0 },
  { startSec: 12.0, freq: 293.66, durationSec: 2.1, gain: 0.18, instrument: 'strings', pan: -0.15 },
  { startSec: 12.0, freq: 246.94, durationSec: 1.5, gain: 0.27, instrument: 'harp', pan: -0.3 },
  { startSec: 12.667, freq: 392.0, durationSec: 1.2, gain: 0.22, instrument: 'harp', pan: -0.2 },
  { startSec: 13.333, freq: 493.88, durationSec: 1.1, gain: 0.21, instrument: 'harp', pan: -0.12 },
  { startSec: 12.02, freq: 739.99, durationSec: 1.35, gain: 0.32, instrument: 'celesta', pan: 0.24 }, // F#5
  { startSec: 13.0, freq: 783.99, durationSec: 1.35, gain: 0.34, instrument: 'celesta', pan: 0.2 }, // G5

  // Такт 8 (14.0 – 16.0с): D13sus4 (мягкий переход обратно к Gmaj7)
  { startSec: 14.0, freq: 220.0, durationSec: 2.0, gain: 0.21, instrument: 'strings', pan: 0.0 },
  { startSec: 14.0, freq: 293.66, durationSec: 2.0, gain: 0.17, instrument: 'strings', pan: 0.15 },
  { startSec: 14.0, freq: 293.66, durationSec: 1.4, gain: 0.26, instrument: 'harp', pan: -0.26 },
  { startSec: 14.667, freq: 392.0, durationSec: 1.1, gain: 0.22, instrument: 'harp', pan: -0.18 },
  { startSec: 15.333, freq: 440.0, durationSec: 0.95, gain: 0.2, instrument: 'harp', pan: -0.12 },
  { startSec: 14.02, freq: 659.25, durationSec: 1.25, gain: 0.3, instrument: 'celesta', pan: 0.22 }, // E5
  { startSec: 15.0, freq: 587.33, durationSec: 1.2, gain: 0.28, instrument: 'celesta', pan: 0.18 }, // D5
];

/**
 * Синтезирует бесшовный стерео-буфер 16-секундного нежного вальса
 * с мягкой пространственной задержкой и нормализацией громкости для мобильных динамиков.
 */
export function renderGentleWaltzSamples(sampleRate = 24000): {
  left: Float32Array;
  right: Float32Array;
} {
  const totalSamples = Math.floor(WALTZ_LOOP_DURATION_SEC * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);
  const twoPi = Math.PI * 2;

  for (const note of GENTLE_WALTZ_SCORE) {
    const startIdx = Math.floor(note.startSec * sampleRate);
    const noteSamples = Math.floor(note.durationSec * sampleRate);
    const panLeft = Math.cos(((note.pan + 1) * Math.PI) / 4);
    const panRight = Math.sin(((note.pan + 1) * Math.PI) / 4);

    for (let i = 0; i < noteSamples; i += 1) {
      const t = i / sampleRate;
      const frac = i / noteSamples;
      let sample = 0;

      if (note.instrument === 'celesta') {
        // Кристальная, тёплая музыкальная шкатулка / челеста — отлично слышна на телефоне
        const attack = Math.min(1, t / 0.014);
        const decay = Math.exp(-t * 2.15) * (1 - Math.pow(frac, 4));
        const bellOver = Math.exp(-t * 5.8);
        sample =
          (Math.sin(twoPi * note.freq * t) * 0.72 +
            Math.sin(twoPi * note.freq * 2 * t) * 0.22 * bellOver +
            Math.sin(twoPi * note.freq * 3 * t) * 0.07 * bellOver) *
          attack *
          decay;
      } else if (note.instrument === 'harp') {
        // Тёплая акустическая арфа с мягким щипком
        const attack = Math.min(1, t / 0.018);
        const decay = Math.exp(-t * 2.6) * (1 - Math.pow(frac, 4));
        const pluck = Math.exp(-t * 7.0);
        sample =
          (Math.sin(twoPi * note.freq * t) * 0.74 +
            Math.sin(twoPi * note.freq * 2 * t) * 0.2 * pluck +
            Math.sin(twoPi * note.freq * 3 * t) * 0.06 * pluck) *
          attack *
          decay;
      } else {
        // Мягкий дышащий струнный подклад с лёгким хорусом
        const env = Math.sin(Math.PI * frac);
        const smoothEnv = env * env;
        const vib = Math.sin(twoPi * 4.2 * t) * 0.0018;
        sample =
          (Math.sin(twoPi * note.freq * (1 + vib) * t) * 0.55 +
            Math.sin(twoPi * note.freq * 1.003 * t) * 0.35 +
            Math.sin(twoPi * note.freq * 2 * t) * 0.1) *
          smoothEnv;
      }

      // Кольцевое наложение (wrap) делает переход с 16-й на 0-ю секунду абсолютно бесшовным
      const idx = (startIdx + i) % totalSamples;
      const val = sample * note.gain;
      left[idx] += val * panLeft;
      right[idx] += val * panRight;
    }
  }

  // Тёплая круговая стерео-реверберация (3 мягких отражения без щелчка на стыке цикла)
  const tapOffsets = [
    Math.floor(0.19 * sampleRate),
    Math.floor(0.37 * sampleRate),
    Math.floor(0.61 * sampleRate),
  ];
  const tapGains = [0.24, 0.14, 0.08];
  const wetLeft = new Float32Array(totalSamples);
  const wetRight = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i += 1) {
    let accL = left[i];
    let accR = right[i];
    for (let k = 0; k < tapOffsets.length; k += 1) {
      const srcIdx = (i - tapOffsets[k] + totalSamples) % totalSamples;
      const g = tapGains[k];
      // Перекрёстное стерео-эхо создаёт объёмный, нежный воздух
      accL += right[srcIdx] * g;
      accR += left[srcIdx] * g;
    }
    wetLeft[i] = accL;
    wetRight[i] = accR;
  }

  // Нормализация к комфортной, хорошо слышимой громкости (пик ~0.82) с мягким аналоговым насыщением
  let maxPeak = 0.0001;
  for (let i = 0; i < totalSamples; i += 1) {
    const a = Math.abs(wetLeft[i]);
    const b = Math.abs(wetRight[i]);
    if (a > maxPeak) maxPeak = a;
    if (b > maxPeak) maxPeak = b;
  }

  const normScale = 0.92 / maxPeak;
  for (let i = 0; i < totalSamples; i += 1) {
    wetLeft[i] = Math.tanh(wetLeft[i] * normScale * 1.05) * 0.86;
    wetRight[i] = Math.tanh(wetRight[i] * normScale * 1.05) * 0.86;
  }

  return { left: wetLeft, right: wetRight };
}

/**
 * Кодирует стерео Float32Array (-1..1) в стандартный 16-битный PCM WAV (Uint8Array).
 */
export function encodeStereoWav(
  left: Float32Array,
  right: Float32Array,
  sampleRate = 24000,
): Uint8Array {
  const numFrames = Math.min(left.length, right.length);
  const numChannels = 2;
  const bytesPerSample = 2;
  const dataByteLength = numFrames * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i += 1) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, l < 0 ? Math.round(l * 0x8000) : Math.round(l * 0x7fff), true);
    offset += 2;
    view.setInt16(offset, r < 0 ? Math.round(r * 0x8000) : Math.round(r * 0x7fff), true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

/**
 * Короткий нежный колокольчик (WAV) при нажатии на сердечко — работает и на iPhone в беззвучном режиме.
 */
export function renderHeartChimeWav(freq: number, sampleRate = 24000): Uint8Array {
  const durationSec = 0.65;
  const totalSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);
  const twoPi = Math.PI * 2;

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.008);
    const env = Math.exp(-t * 5.2) * (1 - Math.pow(i / totalSamples, 3));
    const over = Math.exp(-t * 9.5);
    const val =
      (Math.sin(twoPi * freq * t) * 0.72 +
        Math.sin(twoPi * freq * 2 * t) * 0.22 * over +
        Math.sin(twoPi * freq * 3 * t) * 0.06 * over) *
      attack *
      env *
      0.58;
    left[i] = val;
    right[i] = val;
  }

  return encodeStereoWav(left, right, sampleRate);
}
