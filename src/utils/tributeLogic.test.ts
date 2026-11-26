import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AMBIENT_CHORD_PROGRESSION,
  GENTLE_MELODY_MEASURES,
  calculateParallaxOffsets,
  createFloatingHeart,
  createInitialThrottleState,
  createLoveBurstParticles,
  createSeededRandom,
  evaluateScrollBurst,
  formatComplimentCounter,
  formatRussianHeartsCount,
  getAdjacentPhotoIndex,
  getAmbientTiltConfig,
  getNextComplimentIndex,
  resolveAssetPath,
  shouldRunParallaxFrame,
  stepFloatingHearts,
  stepLoveParticles,
  toggleFlippedPhotoId,
} from './tributeLogic';

test('getNextComplimentIndex cycles sequentially through 12 compliments and wraps cleanly', () => {
  assert.equal(getNextComplimentIndex(0, 12), 1);
  assert.equal(getNextComplimentIndex(10, 12), 11);
  assert.equal(getNextComplimentIndex(11, 12), 0);
  assert.equal(getNextComplimentIndex(-1, 12), 0);
  assert.equal(getNextComplimentIndex(0, 0), 0);
});

test('formatComplimentCounter outputs 1-based counter string', () => {
  assert.equal(formatComplimentCounter(0, 12), '1 / 12');
  assert.equal(formatComplimentCounter(11, 12), '12 / 12');
  assert.equal(formatComplimentCounter(0, 0), '0 / 0');
});

test('toggleFlippedPhotoId flips target card and un-flips when clicked again', () => {
  assert.equal(toggleFlippedPhotoId(null, 'photo-1'), 'photo-1');
  assert.equal(toggleFlippedPhotoId('photo-1', 'photo-1'), null);
  assert.equal(toggleFlippedPhotoId('photo-1', 'photo-2'), 'photo-2');
});

test('getAdjacentPhotoIndex wraps around gallery bounds in both directions', () => {
  assert.equal(getAdjacentPhotoIndex(0, 'prev', 6), 5);
  assert.equal(getAdjacentPhotoIndex(5, 'next', 6), 0);
  assert.equal(getAdjacentPhotoIndex(2, 'next', 6), 3);
  assert.equal(getAdjacentPhotoIndex(2, 'prev', 6), 1);
});

test('createLoveBurstParticles generates bounded hearts and petals with deterministic RNG', () => {
  const rng = createSeededRandom(42);
  const particles = createLoveBurstParticles(40, 1440, 900, 1, rng);

  assert.equal(particles.length, 40);
  const kinds = new Set(particles.map((p) => p.kind));
  assert.equal(kinds.has('heart'), true);
  assert.equal(kinds.has('petal'), true);

  for (const p of particles) {
    assert.ok(p.x >= 0 && p.x <= 1440, 'x within horizontal viewport');
    assert.ok(p.size >= 11 && p.size <= 26, 'size within readable bounds');
    assert.ok(p.opacity > 0.7 && p.opacity <= 1, 'initial opacity visible');
  }
});

test('stepLoveParticles advances positions and removes off-screen particles', () => {
  const rng = createSeededRandom(7);
  const initial = createLoveBurstParticles(20, 1000, 800, 1, rng);
  const afterStep = stepLoveParticles(initial, 0.03, 800);

  assert.equal(afterStep.length, initial.length);
  assert.notEqual(afterStep[0].y, initial[0].y);

  // Симулируем длительное время полёта: все частицы должны плавно исчезнуть
  let current = initial;
  for (let i = 0; i < 400; i += 1) {
    current = stepLoveParticles(current, 0.04, 800);
  }
  assert.equal(current.length, 0);
});

test('ambient chord progression and gentle lullaby measures contain valid audible frequencies', () => {
  assert.equal(AMBIENT_CHORD_PROGRESSION.length, 4);
  for (const chord of AMBIENT_CHORD_PROGRESSION) {
    assert.ok(chord.frequencies.length >= 4);
    for (const freq of chord.frequencies) {
      assert.ok(freq >= 100 && freq <= 1000);
    }
  }
  assert.ok(GENTLE_MELODY_MEASURES.length >= 6);
  for (const measure of GENTLE_MELODY_MEASURES) {
    assert.ok(measure.durationSec >= 3.5);
    assert.ok(measure.notes.length >= 6);
    for (const note of measure.notes) {
      assert.ok(note.freq >= 100 && note.freq <= 1200);
      assert.ok(note.velocity > 0 && note.velocity <= 1);
    }
  }
});

test('formatRussianHeartsCount pluralizes Russian heart counts grammatically', () => {
  assert.equal(formatRussianHeartsCount(1), '1 сердечко');
  assert.equal(formatRussianHeartsCount(2), '2 сердечка');
  assert.equal(formatRussianHeartsCount(4), '4 сердечка');
  assert.equal(formatRussianHeartsCount(5), '5 сердечек');
  assert.equal(formatRussianHeartsCount(11), '11 сердечек');
  assert.equal(formatRussianHeartsCount(21), '21 сердечко');
  assert.equal(formatRussianHeartsCount(23), '23 сердечка');
});

test('createFloatingHeart and stepFloatingHearts smoothly rise, pop in, sway, and fade out', () => {
  const rng = createSeededRandom(99);
  const heart = createFloatingHeart(420, 380, 1, rng);
  assert.equal(heart.id, 1);
  assert.ok(heart.vy < -100, 'heart floats upward');
  assert.ok(heart.size >= 20 && heart.size <= 34);

  let list = [heart];
  // Регрессия: даже при сверхкоротком первом кадре (1ms) сердечко не должно исчезать
  list = stepFloatingHearts(list, 0.001);
  assert.equal(list.length, 1, 'heart survives sub-2ms first animation frame');

  // После ~0.18с сердечко должно подняться, проявиться и раскрыться в масштабе
  for (let i = 0; i < 6; i += 1) {
    list = stepFloatingHearts(list, 0.03);
  }
  assert.equal(list.length, 1);
  assert.ok(list[0].y < heart.y, 'heart moved upward');
  assert.ok(list[0].opacity > 0.9, 'heart faded in');
  assert.ok(list[0].scale > 0.9, 'heart popped in');

  // После окончания времени жизни сердечко полностью растворяется и удаляется
  for (let i = 0; i < 160; i += 1) {
    list = stepFloatingHearts(list, 0.03);
  }
  assert.equal(list.length, 0);
});

test('resolveAssetPath prefixes local and public paths with GitHub Pages base URL without double-prefixing', () => {
  const base = '/-for-my-love-elmira1305-/';
  assert.equal(
    resolveAssetPath('/photos/photo1.jpg', base),
    '/-for-my-love-elmira1305-/photos/photo1.jpg',
  );
  assert.equal(
    resolveAssetPath('/photo1.jpg', base),
    '/-for-my-love-elmira1305-/photo1.jpg',
  );
  assert.equal(
    resolveAssetPath('/-for-my-love-elmira1305-/photos/photo1.jpg', base),
    '/-for-my-love-elmira1305-/photos/photo1.jpg',
  );
  assert.equal(
    resolveAssetPath('https://example.com/photo.jpg', base),
    'https://example.com/photo.jpg',
  );
});

test('calculateParallaxOffsets centers at 0 and stays within safe image bleed and card bounds', () => {
  const centered = calculateParallaxOffsets({
    rectTop: 250,
    rectHeight: 400,
    viewportHeight: 900,
    innerIntensity: 26,
    cardSpeed: 8,
  });
  assert.equal(centered.progress, 0);
  assert.equal(centered.innerImageY, 0);
  assert.equal(centered.cardFloatY, 0);

  // Карточка внизу экрана смещает фото и карточку в противоположных направлениях
  const nearBottom = calculateParallaxOffsets({
    rectTop: 800,
    rectHeight: 400,
    viewportHeight: 900,
    innerIntensity: 26,
    cardSpeed: 8,
  });
  assert.ok(nearBottom.progress > 0);
  assert.ok(nearBottom.innerImageY < 0);
  assert.ok(nearBottom.cardFloatY > 0);

  // Компактная карточка (200px) никогда не превышает 9.5% запаса обрезки (19px)
  const compactExtreme = calculateParallaxOffsets({
    rectTop: 1500,
    rectHeight: 200,
    viewportHeight: 900,
    innerIntensity: 45,
    cardSpeed: 20,
  });
  assert.ok(Math.abs(compactExtreme.innerImageY) <= 19);
  assert.ok(Math.abs(compactExtreme.cardFloatY) <= 10);
});

test('getAmbientTiltConfig produces concrete Safari-safe variant and staggered organic timing per card', () => {
  const a = getAmbientTiltConfig('morning-hug', -1);
  const b = getAmbientTiltConfig('park-walk', 1);

  assert.ok(['a', 'b', 'c'].includes(a.variant));
  assert.ok(Math.abs(a.minDeg) <= 2.25 && Math.abs(a.maxDeg) <= 2.25);
  assert.ok(a.durationSec >= 6.0 && a.durationSec <= 8.8);
  assert.ok(a.delaySec <= 0);
  assert.notEqual(
    `${a.variant}:${a.durationSec}:${a.delaySec}`,
    `${b.variant}:${b.durationSec}:${b.delaySec}`,
  );
});

test('evaluateScrollBurst switches to throttled on high scroll frequency and static on critical jank', () => {
  let state = createInitialThrottleState();
  assert.equal(state.mode, 'smooth');
  assert.equal(shouldRunParallaxFrame(0, 16, state.mode), true);

  // Высокая частота scroll-событий (25 событий за 200ms) -> переход в throttled fallback
  for (let i = 0; i < 25; i += 1) {
    state = evaluateScrollBurst(state, 100 + i * 8, 8);
  }
  assert.equal(state.mode, 'throttled');
  assert.equal(shouldRunParallaxFrame(100, 120, state.mode), false);
  assert.equal(shouldRunParallaxFrame(100, 170, state.mode), true);

  // После паузы и спокойного кадра throttled плавно возвращается в smooth
  state = evaluateScrollBurst(state, 500, 6, false);
  assert.equal(state.mode, 'smooth');

  // Критические задержки кадров (>55ms подряд 3 раза) с промежуточными scroll-событиями -> static fallback
  state = evaluateScrollBurst(state, 600, 62, false);
  state = evaluateScrollBurst(state, 610);
  state = evaluateScrollBurst(state, 670, 68, false);
  state = evaluateScrollBurst(state, 680);
  state = evaluateScrollBurst(state, 740, 70, false);
  assert.equal(state.mode, 'static');
  assert.equal(shouldRunParallaxFrame(0, 1000, state.mode), false);
});

test('waltzSynth generates a valid, clearly audible stereo PCM WAV for mobile speakers without clipping', async () => {
  const {
    GENTLE_WALTZ_SCORE,
    WALTZ_LOOP_DURATION_SEC,
    encodeStereoWav,
    renderGentleWaltzSamples,
    renderHeartChimeWav,
  } = await import('./waltzSynth');

  assert.ok(GENTLE_WALTZ_SCORE.length >= 40);
  const sampleRate = 8000; // Быстрый прогон для юнит-теста
  const { left, right } = renderGentleWaltzSamples(sampleRate);
  assert.equal(left.length, WALTZ_LOOP_DURATION_SEC * sampleRate);
  assert.equal(right.length, left.length);

  let peak = 0;
  let sumSq = 0;
  for (let i = 0; i < left.length; i += 1) {
    assert.ok(Number.isFinite(left[i]) && Number.isFinite(right[i]));
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
    sumSq += left[i] * left[i] + right[i] * right[i];
  }
  const rms = Math.sqrt(sumSq / (left.length * 2));
  assert.ok(peak >= 0.5 && peak <= 0.92, `peak=${peak} should be clearly audible and non-clipping`);
  assert.ok(rms >= 0.08, `rms=${rms} should be loud enough for phone speakers`);

  const wav = encodeStereoWav(left, right, sampleRate);
  assert.equal(String.fromCharCode(wav[0], wav[1], wav[2], wav[3]), 'RIFF');
  assert.equal(String.fromCharCode(wav[8], wav[9], wav[10], wav[11]), 'WAVE');
  assert.equal(wav.byteLength, 44 + left.length * 4);

  const chimeWav = renderHeartChimeWav(783.99, 8000);
  assert.equal(String.fromCharCode(chimeWav[0], chimeWav[1], chimeWav[2], chimeWav[3]), 'RIFF');
  assert.ok(chimeWav.byteLength > 1000);
});
