import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AMBIENT_CHORD_PROGRESSION,
  calculateParallaxOffsets,
  createInitialThrottleState,
  createLoveBurstParticles,
  createSeededRandom,
  evaluateScrollBurst,
  formatComplimentCounter,
  getAdjacentPhotoIndex,
  getAmbientTiltConfig,
  getNextComplimentIndex,
  resolveAssetPath,
  shouldRunParallaxFrame,
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

test('ambient chord progression contains valid audible frequencies', () => {
  assert.equal(AMBIENT_CHORD_PROGRESSION.length, 4);
  for (const chord of AMBIENT_CHORD_PROGRESSION) {
    assert.ok(chord.frequencies.length >= 4);
    for (const freq of chord.frequencies) {
      assert.ok(freq >= 150 && freq <= 1000);
    }
  }
});

test('resolveAssetPath prefixes local and public paths with GitHub Pages base URL without double-prefixing', () => {
  const base = '/-for-my-love-elmira1305-/';
  assert.equal(
    resolveAssetPath('/photo1.jpg', base),
    '/-for-my-love-elmira1305-/photo1.jpg',
  );
  assert.equal(
    resolveAssetPath('/src/assets/images/test.jpg', base),
    '/-for-my-love-elmira1305-/src/assets/images/test.jpg',
  );
  assert.equal(
    resolveAssetPath('/-for-my-love-elmira1305-/photo1.jpg', base),
    '/-for-my-love-elmira1305-/photo1.jpg',
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
