import { AMBIENT_CHORD_PROGRESSION } from './tributeLogic';

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Мягкий синтезатор тёплых аккордов на Web Audio API (без внешних аудиофайлов).
 * Воспроизводит нежное арпеджио в стиле музыкальной шкатулки и тёплого электропиано.
 */
export class AmbientChimeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private chordIndex = 0;
  private isPlaying = false;

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
      this.ctx = new AudioCtor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // Игнорируем ограничения автовоспроизведения до следующего клика
      });
    }

    return this.ctx;
  }

  private playNote(
    freq: number,
    startTime: number,
    duration: number,
    peakVolume: number,
  ): void {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master) {
      return;
    }

    const oscPrimary = ctx.createOscillator();
    const oscWarmth = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();

    oscPrimary.type = 'sine';
    oscPrimary.frequency.setValueAtTime(freq, startTime);

    oscWarmth.type = 'triangle';
    oscWarmth.frequency.setValueAtTime(freq * 1.002, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1450, startTime);
    filter.Q.setValueAtTime(0.7, startTime);

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(peakVolume, startTime + 0.14);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscPrimary.connect(filter);
    oscWarmth.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(master);

    oscPrimary.start(startTime);
    oscWarmth.start(startTime);
    oscPrimary.stop(startTime + duration + 0.08);
    oscWarmth.stop(startTime + duration + 0.08);
  }

  private triggerNextChord(): void {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying) {
      return;
    }

    const chord =
      AMBIENT_CHORD_PROGRESSION[
        this.chordIndex % AMBIENT_CHORD_PROGRESSION.length
      ];
    this.chordIndex =
      (this.chordIndex + 1) % AMBIENT_CHORD_PROGRESSION.length;

    const now = ctx.currentTime + 0.04;
    chord.frequencies.forEach((freq, idx) => {
      const stagger = idx * 0.16;
      const volume = idx === 0 ? 0.11 : 0.075;
      this.playNote(freq, now + stagger, 4.4, volume);
    });
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
    this.masterGain.gain.linearRampToValueAtTime(0.55, now + 0.4);

    this.triggerNextChord();
    this.timerId = window.setInterval(() => {
      this.triggerNextChord();
    }, 4400);

    return true;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(
        Math.max(this.masterGain.gain.value, 0.0001),
        now,
      );
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.45);
    }
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
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      this.playNote(freq, now + idx * 0.075, 1.4, 0.055);
    });
  }

  public dispose(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.masterGain = null;
  }
}
