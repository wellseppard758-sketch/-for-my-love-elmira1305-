import {
  encodeStereoWav,
  renderGentleWaltzSamples,
  renderHeartChimeWav,
} from './waltzSynth';

/** Пентатоника G-dur в тон новому вальсу для нежного отклика при нажатии на сердечко */
const WALTZ_CHIME_NOTES = [
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0,  // A5
  987.77, // B5
  1174.66, // D6
] as const;

/**
 * Аудиодвижок нежной фоновой мелодии на базе нативного HTMLAudioElement + WAV Blob.
 * Работает надёжно на iPhone (включая режим беззвучного переключателя), Android и ПК,
 * без внешних файлов и с ощутимой, тёплой громкостью на мобильных динамиках.
 */
export class AmbientChimeEngine {
  private audioEl: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;
  private chimeUrls: string[] = [];
  private fadeTimerId: number | null = null;
  private isPlaying = false;
  private readonly targetVolume = 0.88;

  private ensureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      return null;
    }

    if (!this.audioEl) {
      const { left, right } = renderGentleWaltzSamples(24000);
      const wavBytes = encodeStereoWav(left, right, 24000);
      const blob = new Blob([wavBytes.buffer as ArrayBuffer], {
        type: 'audio/wav',
      });
      this.audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.audioUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.targetVolume;
      // Атрибут playsinline для корректного воспроизведения в iOS Safari
      audio.setAttribute('playsinline', '');
      this.audioEl = audio;
    }

    return this.audioEl;
  }

  private ensureChimes(): string[] {
    if (this.chimeUrls.length > 0 || typeof window === 'undefined') {
      return this.chimeUrls;
    }
    this.chimeUrls = WALTZ_CHIME_NOTES.map((freq) => {
      const wavBytes = renderHeartChimeWav(freq, 24000);
      const blob = new Blob([wavBytes.buffer as ArrayBuffer], {
        type: 'audio/wav',
      });
      return URL.createObjectURL(blob);
    });
    return this.chimeUrls;
  }

  private clearFade(): void {
    if (this.fadeTimerId !== null) {
      window.clearInterval(this.fadeTimerId);
      this.fadeTimerId = null;
    }
  }

  public start(): boolean {
    const audio = this.ensureAudio();
    if (!audio) {
      return false;
    }

    if (this.isPlaying) {
      return true;
    }

    this.clearFade();
    this.isPlaying = true;
    // Стартуем сразу с ощутимой громкости (iOS игнорирует программное изменение volume,
    // но на Android/ПК сделаем плавный мягкий вход с 0.35 до 0.88)
    try {
      audio.volume = 0.35;
    } catch {
      // На iOS свойство volume может быть только для чтения
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      void playPromise.catch(() => {
        // Игнорируем ошибку, если браузер заблокировал воспроизведение
      });
    }

    let step = 0;
    const totalSteps = 10;
    this.fadeTimerId = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / totalSteps);
      try {
        audio.volume = 0.35 + (this.targetVolume - 0.35) * ratio;
      } catch {
        // Игнорируем ограничения iOS
      }
      if (ratio >= 1) {
        this.clearFade();
      }
    }, 40);

    return true;
  }

  public stop(): void {
    this.isPlaying = false;
    this.clearFade();

    const audio = this.audioEl;
    if (!audio) {
      return;
    }

    let step = 0;
    const totalSteps = 8;
    const startVol = audio.volume || this.targetVolume;
    this.fadeTimerId = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / totalSteps);
      try {
        audio.volume = Math.max(0, startVol * (1 - ratio));
      } catch {
        // Игнорируем ограничения iOS
      }
      if (ratio >= 1) {
        this.clearFade();
        audio.pause();
        try {
          audio.volume = this.targetVolume;
        } catch {
          // Игнорируем ограничения iOS
        }
      }
    }, 35);
  }

  /**
   * Деликатная кристальная нотка при нажатии на сердечко (если включена «Атмосфера»).
   */
  public playHeartChime(step = 0): void {
    if (!this.isPlaying || typeof Audio === 'undefined') {
      return;
    }
    const urls = this.ensureChimes();
    if (urls.length === 0) {
      return;
    }
    const url = urls[Math.abs(step) % urls.length];
    const chime = new Audio(url);
    chime.setAttribute('playsinline', '');
    try {
      chime.volume = 0.55;
    } catch {
      // Игнорируем ограничения iOS
    }
    const p = chime.play();
    if (p && typeof p.catch === 'function') {
      void p.catch(() => {});
    }
  }

  public playSoftSparkle(): void {
    if (!this.isPlaying) {
      return;
    }
    this.playHeartChime(2);
    window.setTimeout(() => this.playHeartChime(4), 120);
  }

  public dispose(): void {
    this.isPlaying = false;
    this.clearFade();
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
      this.audioEl = null;
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
    for (const url of this.chimeUrls) {
      URL.revokeObjectURL(url);
    }
    this.chimeUrls = [];
  }
}
