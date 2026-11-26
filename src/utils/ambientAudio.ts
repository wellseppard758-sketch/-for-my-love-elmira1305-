import {
  GENTLE_MELODY_MEASURES,
  HEART_CHIME_SCALE,
  type GentleMelodyNote,
} from './tributeLogic';

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Нежный акустический синтезатор на Web Audio API (без внешних файлов):
 * мягкое войлочное пианино (felt piano), деликатная верхняя мелодия,
 * тёплый воздушный подклад и естественная реверберация зала.
 */
export class AmbientChimeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryBus: GainNode | null = null;
  private wetBus: GainNode | null = null;
  private timerId: number | null = null;
  private measureIndex = 0;
  private isPlaying = false;

  /**
   * Генерирует мягкий стерео-импульс тёплой комнаты (~2.4с)
   * для естественного, воздушного послезвучия без резких электронных хвостов.
   */
  private createWarmReverbBuffer(ctx: AudioContext): AudioBuffer {
    const durationSec = 2.4;
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let lpState = 0;
      for (let i = 0; i < length; i += 1) {
        const t = i / length;
        // Плавное затухание + мягкая фильтрация высоких частот (эффект тёплого дерева/войлока)
        const envelope = Math.pow(1 - t, 2.75);
        const white = Math.random() * 2 - 1;
        lpState = lpState * 0.78 + white * 0.22;
        data[i] = lpState * envelope * 0.45;
      }
    }

    return buffer;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext ||
        (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!AudioCtor) {
        return null;
      }

      const ctx = new AudioCtor();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      // Мягкий компрессор/лимитер защищает от перегруза при наложении нот и быстрых кликах
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-16, ctx.currentTime);
      limiter.knee.setValueAtTime(24, ctx.currentTime);
      limiter.ratio.setValueAtTime(3.5, ctx.currentTime);
      limiter.attack.setValueAtTime(0.015, ctx.currentTime);
      limiter.release.setValueAtTime(0.25, ctx.currentTime);

      // Общий тёплый фильтр, убирающий резкий «цифровой» верх
      const warmthFilter = ctx.createBiquadFilter();
      warmthFilter.type = 'lowpass';
      warmthFilter.frequency.setValueAtTime(2800, ctx.currentTime);
      warmthFilter.Q.setValueAtTime(0.5, ctx.currentTime);

      const dryBus = ctx.createGain();
      dryBus.gain.setValueAtTime(0.72, ctx.currentTime);

      const wetBus = ctx.createGain();
      wetBus.gain.setValueAtTime(0.42, ctx.currentTime);

      const convolver = ctx.createConvolver();
      convolver.buffer = this.createWarmReverbBuffer(ctx);

      dryBus.connect(warmthFilter);
      wetBus.connect(convolver);
      convolver.connect(warmthFilter);
      warmthFilter.connect(limiter);
      limiter.connect(masterGain);
      masterGain.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = masterGain;
      this.dryBus = dryBus;
      this.wetBus = wetBus;
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // Игнорируем ограничения автовоспроизведения до следующего клика
      });
    }

    return this.ctx;
  }

  /**
   * Синтез мягкой клавиши «войлочного» пианино (felt piano):
   * мягкая атака, естественный спад обертонов и камерная теплота.
   */
  private playFeltPianoNote(
    freq: number,
    startTime: number,
    duration: number,
    velocity: number,
    isMelody: boolean,
  ): void {
    const ctx = this.ctx;
    const dry = this.dryBus;
    const wet = this.wetBus;
    if (!ctx || !dry || !wet) {
      return;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Тёплый 2-й обертон (октава выше, очень тихо)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    osc2.detune.setValueAtTime(2.5, startTime);

    // Едва заметный 3-й обертон для живого тембра пианино
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(freq * 3, startTime);

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    const g3 = ctx.createGain();

    g1.gain.setValueAtTime(1, startTime);
    g2.gain.setValueAtTime(isMelody ? 0.16 : 0.11, startTime);
    g3.gain.setValueAtTime(isMelody ? 0.035 : 0.02, startTime);

    // Динамический фильтр: плавно приоткрывается на атаке и мягко закрывается при затухании
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const peakCutoff = isMelody ? 2100 : 1250;
    const tailCutoff = isMelody ? 620 : 420;
    filter.frequency.setValueAtTime(peakCutoff, startTime);
    filter.frequency.exponentialRampToValueAtTime(
      tailCutoff,
      startTime + duration * 0.85,
    );
    filter.Q.setValueAtTime(0.65, startTime);

    const env = ctx.createGain();
    const peakGain = (isMelody ? 0.105 : 0.09) * velocity;
    const attack = isMelody ? 0.032 : 0.045;

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    env.gain.exponentialRampToValueAtTime(peakGain * 0.42, startTime + Math.min(0.65, duration * 0.35));
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);
    filter.connect(env);
    env.connect(dry);
    env.connect(wet);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    const stopAt = startTime + duration + 0.1;
    osc1.stop(stopAt);
    osc2.stop(stopAt);
    osc3.stop(stopAt);
  }

  /**
   * Тихий дышащий воздушный подклад (pad) на двух чуть расстроенных синусах.
   */
  private playWarmPadNote(
    freq: number,
    startTime: number,
    duration: number,
    velocity: number,
  ): void {
    const ctx = this.ctx;
    const dry = this.dryBus;
    const wet = this.wetBus;
    if (!ctx || !dry || !wet) {
      return;
    }

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'sine';
    oscA.frequency.setValueAtTime(freq, startTime);
    oscB.frequency.setValueAtTime(freq, startTime);
    oscA.detune.setValueAtTime(-4, startTime);
    oscB.detune.setValueAtTime(4, startTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, startTime);

    const env = ctx.createGain();
    const peak = 0.045 * velocity;
    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(peak, startTime + duration * 0.32);
    env.gain.linearRampToValueAtTime(peak * 0.78, startTime + duration * 0.72);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(env);
    env.connect(dry);
    env.connect(wet);

    oscA.start(startTime);
    oscB.start(startTime);
    oscA.stop(startTime + duration + 0.12);
    oscB.stop(startTime + duration + 0.12);
  }

  private scheduleNote(note: GentleMelodyNote, measureStart: number): void {
    const startTime = measureStart + note.offsetSec;
    if (note.voice === 'pad') {
      this.playWarmPadNote(note.freq, startTime, note.durationSec, note.velocity);
      return;
    }
    this.playFeltPianoNote(
      note.freq,
      startTime,
      note.durationSec,
      note.velocity,
      note.voice === 'melody',
    );
  }

  private triggerNextMeasure(): void {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying) {
      return;
    }

    const measure =
      GENTLE_MELODY_MEASURES[
        this.measureIndex % GENTLE_MELODY_MEASURES.length
      ];
    this.measureIndex =
      (this.measureIndex + 1) % GENTLE_MELODY_MEASURES.length;

    const measureStart = ctx.currentTime + 0.05;
    for (const note of measure.notes) {
      this.scheduleNote(note, measureStart);
    }

    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
    }
    this.timerId = window.setTimeout(() => {
      this.triggerNextMeasure();
    }, measure.durationSec * 1000);
  }

  public start(): boolean {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) {
      return false;
    }

    if (this.isPlaying) {
      return true;
    }

    this.isPlaying = true;
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(
      Math.max(this.masterGain.gain.value, 0.0001),
      now,
    );
    this.masterGain.gain.linearRampToValueAtTime(0.68, now + 0.75);

    this.triggerNextMeasure();
    return true;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(
        Math.max(this.masterGain.gain.value, 0.0001),
        now,
      );
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.65);
    }
  }

  /**
   * Деликатная одиночная нотка в тональности F-dur при нажатии на сердечко
   * (звучит только если включена «Атмосфера»).
   */
  public playHeartChime(step = 0): void {
    if (!this.isPlaying) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }
    const freq = HEART_CHIME_SCALE[Math.abs(step) % HEART_CHIME_SCALE.length];
    this.playFeltPianoNote(freq, ctx.currentTime + 0.015, 1.35, 0.42, true);
  }

  public playSoftSparkle(): void {
    if (!this.isPlaying) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime + 0.02;
    [523.25, 698.46, 880.0, 1046.5].forEach((freq, idx) => {
      this.playFeltPianoNote(freq, now + idx * 0.095, 1.65, 0.36, true);
    });
  }

  public dispose(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.masterGain = null;
    this.dryBus = null;
    this.wetBus = null;
  }
}
