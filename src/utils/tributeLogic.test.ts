import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AMBIENT_CHORD_PROGRESSION,
  createLoveBurstParticles,
  createSeededRandom,
  formatComplimentCounter,
  getAdjacentPhotoIndex,
  getNextComplimentIndex,
  resolveAssetPath,
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
