import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { Heart, Sparkles } from 'lucide-react';
import type {
  ConfettiBurstRequest,
  HeartSpawnRequest,
  PhotoMemory,
} from './types/tribute';
import { AmbientChimeEngine } from './utils/ambientAudio';
import {
  calculateParallaxOffsets,
  createInitialThrottleState,
  evaluateScrollBurst,
  formatRussianHeartsCount,
  getAdjacentPhotoIndex,
  shouldRunParallaxFrame,
  toggleFlippedPhotoId,
} from './utils/tributeLogic';
import { LoveBurstOverlay } from './components/LoveBurstOverlay';
import { ConfettiSaluteOverlay } from './components/ConfettiSaluteOverlay';
import {
  PolaroidCard,
  type ParallaxCardHandle,
} from './components/PolaroidCard';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { SupportButtonCard } from './components/SupportButtonCard';
import {
  SecretEnvelopeCard,
  type EnvelopeOpenOrigin,
} from './components/SecretEnvelopeCard';
import { AmbientChimeButton } from './components/AmbientChimeButton';

// ============================================================================
// ФОТОГРАФИИ ДЛЯ СЕМЕЙНОГО АЛЬБОМА
// Все снимки лежат в папке `public/photos/` под простыми именами без пробелов:
// photo1.jpg, photo2.jpg, photo3.jpg, photo4.jpg, photo5.jpg, photo6.jpg.
// Чтобы загрузить свои фото, просто замените файлы в `public/photos/` с теми же
// именами (код менять не нужно). Если у вашего фото расширение .png или .webp —
// просто обновите расширение в строке `src` ниже.
// ============================================================================
export const photosData: PhotoMemory[] = [
  {
    id: 'expecting-miracle',
    // Фото 1 (большая главная карточка) -> public/photos/photo1.jpg
    src: '/photos/photo1.jpg',
    alt: 'Мама в воздушном белом платье сияет улыбкой, бережно обнимая животик в ожидании малыша',
    title: 'В ожидании чуда',
    date: 'Нежное время',
    location: 'На пороге счастья',
    memoryNote:
      'Смотрю на этот кадр — и до сих пор замирает сердце. В этом воздушном белом платье ты светилась таким тихим счастьем, будто уже тогда знала, какую огромную любовь подаришь нашему малышу.',
    span: 'featured',
    tiltDegrees: -1,
    tapeColor: 'rose',
    tapeCorner: 'top-center',
    objectPosition: '50% 68%',
    parallaxDepth: 40,
    parallaxSpeed: -9,
  },
  {
    id: 'curious-eyes',
    // Фото 2 (горизонтальная карточка) -> public/photos/photo2.jpg
    src: '/photos/photo2.jpg',
    alt: 'Мама с мягкой улыбкой держит на руках малыша в жёлтом леопардовом комбинезоне, который с удивлением смотрит в камеру',
    title: 'Наш маленький львёнок',
    date: 'Уютный день',
    location: 'Дома вместе',
    memoryNote:
      'Эти распахнутые глазки, сложенные крошечные ручки и твоя спокойная, тёплая улыбка рядом. В твоих объятиях нашему маленькому львёнку всегда спокойно, интересно и так хорошо.',
    span: 'wide',
    tiltDegrees: 1,
    tapeColor: 'sage',
    tapeCorner: 'top-right',
    objectPosition: '50% 24%',
    parallaxDepth: 34,
    parallaxSpeed: 8,
  },
  {
    id: 'first-new-year',
    // Фото 3 (высокая вертикальная карточка) -> public/photos/photo3.jpg
    src: '/photos/photo3.jpg',
    alt: 'Мама в белой пижаме с красными сердечками обнимает малыша в клетчатом комбинезоне на фоне наряженной ёлки',
    title: 'Тёплый Новый год',
    date: 'Зимняя сказка',
    location: 'У ёлки',
    memoryNote:
      'Пижама в сердечках, огоньки на ёлке и наш сынок, который так уютно прижался к тебе. Ты умеешь превращать обычные праздники в настоящее семейное волшебство, которое хочется помнить всю жизнь.',
    span: 'tall',
    tiltDegrees: -1,
    tapeColor: 'cream',
    tapeCorner: 'top-left',
    objectPosition: '28% 40%',
    parallaxDepth: 42,
    parallaxSpeed: -9,
  },
  {
    id: 'tender-kiss',
    // Фото 4 (горизонтальная карточка) -> public/photos/photo4.jpg
    src: '/photos/photo4.jpg',
    alt: 'Мама с закрытыми глазами нежно целует в щёчку малыша в кремовом колпачке-гномике и кофточке с коалой',
    title: 'Самый нежный поцелуй',
    date: 'Минута нежности',
    location: 'Щёчка к щёчке',
    memoryNote:
      'Крошечный колпачок-гномик, эта смешная поднятая ладошка и твой тихий поцелуй в щёчку. В одном этом мгновении столько маминой нежности, что хватает согреть всю нашу семью.',
    span: 'wide',
    tiltDegrees: 1,
    tapeColor: 'rose',
    tapeCorner: 'top-left',
    objectPosition: '50% 48%',
    parallaxDepth: 34,
    parallaxSpeed: 7,
  },
  {
    id: 'sunny-stroll',
    // Фото 5 (горизонтальная карточка внизу) -> public/photos/photo5.jpg
    src: '/photos/photo5.jpg',
    alt: 'Улыбающаяся мама в ярко-синей куртке и светлой шапочке стоит с коляской у солнечных колонн на прогулке',
    title: 'Солнечная прогулка',
    date: 'Ясный день',
    location: 'Наш маршрут',
    memoryNote:
      'Сколько тёплых километров ты прошла с этой коляской, ловя каждый лучик солнца для нашего малыша. Даже на обычной прогулке твоя улыбка ярче любого ясного дня.',
    span: 'wide',
    tiltDegrees: -1,
    tapeColor: 'sage',
    tapeCorner: 'top-center',
    objectPosition: '50% 52%',
    parallaxDepth: 36,
    parallaxSpeed: -8,
  },
  {
    id: 'tiny-hands',
    // Фото 6 (квадратная карточка внизу) -> public/photos/photo6.jpg
    src: '/photos/photo6.jpg',
    alt: 'Нежные руки мамы бережно держат маленькую ладошку сына рядом с букетом розовых пионов',
    title: 'Маленькая ладошка',
    date: 'В самом сердце',
    location: 'Всегда рядом',
    memoryNote:
      'Время летит так быстро, и скоро эта ладошка станет большой. Но твоя нежность навсегда останется его главной опорой в жизни.',
    span: 'square',
    tiltDegrees: 1,
    tapeColor: 'cream',
    tapeCorner: 'top-right',
    parallaxDepth: 32,
    parallaxSpeed: 9,
  },
];

function getBentoSpanClasses(photo: PhotoMemory): string {
  switch (photo.span) {
    case 'featured':
      return 'sm:col-span-2 lg:col-span-5 lg:row-span-2 min-h-[380px] sm:min-h-[430px] lg:min-h-[608px]';
    case 'tall':
      return 'sm:col-span-1 lg:col-span-3 lg:row-span-2 min-h-[400px] sm:min-h-[430px] lg:min-h-[608px]';
    case 'wide':
      return 'sm:col-span-1 lg:col-span-4 lg:row-span-1 min-h-[320px] sm:min-h-[310px] lg:min-h-[290px]';
    case 'square':
      return 'sm:col-span-1 lg:col-span-3 lg:row-span-1 min-h-[320px] sm:min-h-[310px] lg:min-h-[340px]';
  }
}

export default function App() {
  const [heartsSentCount, setHeartsSentCount] = useState(0);
  const [heartSpawnRequest, setHeartSpawnRequest] =
    useState<HeartSpawnRequest | null>(null);
  const [confettiBurstRequest, setConfettiBurstRequest] =
    useState<ConfettiBurstRequest | null>(null);
  const [flippedPhotoId, setFlippedPhotoId] = useState<string | null>(null);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  const audioEngineRef = useRef<AmbientChimeEngine | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const heartIconRef = useRef<SVGSVGElement | null>(null);
  const spawnSeqRef = useRef(0);
  const parallaxRegistryRef = useRef<Map<string, ParallaxCardHandle>>(
    new Map(),
  );
  const flippedPhotoIdRef = useRef<string | null>(null);

  useEffect(() => {
    flippedPhotoIdRef.current = flippedPhotoId;
  }, [flippedPhotoId]);

  useEffect(() => {
    const engine = new AmbientChimeEngine();
    audioEngineRef.current = engine;
    return () => {
      engine.dispose();
      audioEngineRef.current = null;
    };
  }, []);

  const registerParallaxCard = useCallback(
    (id: string, handle: ParallaxCardHandle | null) => {
      if (handle) {
        parallaxRegistryRef.current.set(id, handle);
      } else {
        parallaxRegistryRef.current.delete(id);
      }
    },
    [],
  );

  // Единый passive-контроллер скролл-параллакса в App.tsx:
  // без touchmove-перехватчиков (не мешает мобильным жестам),
  // с пакетным чтением/записью (только CSS transform) и адаптивным fallback при частых scroll-событиях.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const applyModeClasses = (mode: 'smooth' | 'throttled' | 'static') => {
      const galleryEl = galleryRef.current;
      if (!galleryEl) {
        return;
      }
      galleryEl.dataset.parallaxMode = mode;
      galleryEl.classList.toggle(
        'parallax-fallback-throttled',
        mode === 'throttled',
      );
      galleryEl.classList.toggle(
        'parallax-fallback-static',
        mode === 'static',
      );
    };

    if (prefersReducedMotion) {
      applyModeClasses('static');
      return;
    }

    let throttleState = createInitialThrottleState();
    let rafId: number | null = null;
    let trailingTimerId: number | null = null;
    let prevFrameStartMs = 0;

    const runBatchUpdate = (nowMs: number, force = false) => {
      if (!force && !shouldRunParallaxFrame(throttleState.lastRunMs, nowMs, throttleState.mode)) {
        return;
      }

      const workStart = performance.now();
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const flippedId = flippedPhotoIdRef.current;

      // Фаза 1: пакетное чтение геометрии (исключает layout thrashing)
      const measurements: Array<{
        handle: ParallaxCardHandle;
        cardTop: number;
        frameHeight: number;
      }> = [];

      parallaxRegistryRef.current.forEach((handle) => {
        const cardRect = handle.cardEl.getBoundingClientRect();
        const frameHeight = handle.frameEl
          ? handle.frameEl.getBoundingClientRect().height
          : cardRect.height;
        measurements.push({ handle, cardTop: cardRect.top, frameHeight });
      });

      // Фаза 2: пакетная запись строго через GPU CSS transform: translate3d
      for (const { handle, cardTop, frameHeight } of measurements) {
        if (handle.id === flippedId || throttleState.mode === 'static') {
          if (handle.cardLayerEl) {
            handle.cardLayerEl.style.transform = 'translate3d(0, 0px, 0)';
          }
          if (handle.imgLayerEl) {
            handle.imgLayerEl.style.transform =
              throttleState.mode === 'static'
                ? 'translate3d(0, 0px, 0) scale(1)'
                : 'translate3d(0, 0px, 0) scale(1.22)';
          }
          handle.cardEl.dataset.parallaxImgY = '0';
          handle.cardEl.dataset.parallaxCardY = '0';
          continue;
        }

        const { innerImageY, cardFloatY } = calculateParallaxOffsets({
          rectTop: cardTop,
          rectHeight: frameHeight,
          viewportHeight,
          innerIntensity: handle.innerIntensity,
          cardSpeed: handle.cardSpeed,
        });

        if (handle.cardLayerEl) {
          handle.cardLayerEl.style.transform = `translate3d(0, ${cardFloatY}px, 0)`;
        }
        if (handle.imgLayerEl) {
          handle.imgLayerEl.style.transform = `translate3d(0, ${innerImageY}px, 0) scale(1.22)`;
        }
        handle.cardEl.dataset.parallaxImgY = String(innerImageY);
        handle.cardEl.dataset.parallaxCardY = String(cardFloatY);
      }

      const workCost = performance.now() - workStart;
      const rawDelta =
        !force && prevFrameStartMs > 0 ? nowMs - prevFrameStartMs : 0;
      prevFrameStartMs = force ? 0 : nowMs;

      // Учитываем только непрерывные просадки между соседними кадрами (<140ms),
      // чтобы обычные паузы между жестами прокрутки не считались лагом
      const continuousFrameLag =
        rawDelta > 34 && rawDelta < 140 ? rawDelta - 16 : 0;
      const effectiveCost = Math.max(workCost, continuousFrameLag);
      throttleState = {
        ...evaluateScrollBurst(throttleState, nowMs, effectiveCost, false),
        lastRunMs: nowMs,
      };
      applyModeClasses(throttleState.mode);
    };

    const scheduleFrame = (force = false) => {
      const nowMs = performance.now();
      throttleState = evaluateScrollBurst(throttleState, nowMs);
      applyModeClasses(throttleState.mode);

      if (throttleState.mode === 'static') {
        return;
      }

      if (rafId === null) {
        rafId = window.requestAnimationFrame((frameTime) => {
          rafId = null;
          runBatchUpdate(frameTime, force);
        });
      }

      // Финальный доводящий кадр после остановки скролла (гарантирует точное положение в throttled-режиме)
      if (trailingTimerId !== null) {
        window.clearTimeout(trailingTimerId);
      }
      trailingTimerId = window.setTimeout(() => {
        trailingTimerId = null;
        prevFrameStartMs = 0;
        if (throttleState.mode !== 'static') {
          runBatchUpdate(performance.now(), true);
        }
      }, 120);
    };

    const onScroll = () => scheduleFrame(false);
    const onResize = () => scheduleFrame(true);

    applyModeClasses('smooth');
    runBatchUpdate(performance.now(), true);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (trailingTimerId !== null) {
        window.clearTimeout(trailingTimerId);
      }
    };
  }, []);

  // Мгновенно выравниваем перевёрнутую карточку при клике
  useEffect(() => {
    const handle = flippedPhotoId
      ? parallaxRegistryRef.current.get(flippedPhotoId)
      : null;
    if (handle?.cardLayerEl) {
      handle.cardLayerEl.style.transform = 'translate3d(0, 0px, 0)';
      handle.cardEl.dataset.parallaxCardY = '0';
    }
  }, [flippedPhotoId]);

  const handleHeartButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      spawnSeqRef.current += 1;
      const nextSeq = spawnSeqRef.current;

      const btnRect = event.currentTarget.getBoundingClientRect();
      const iconRect = heartIconRef.current?.getBoundingClientRect();

      const pointerInsideButton =
        event.clientX >= btnRect.left &&
        event.clientX <= btnRect.right &&
        event.clientY >= btnRect.top &&
        event.clientY <= btnRect.bottom;

      const originX = pointerInsideButton
        ? event.clientX
        : iconRect
          ? iconRect.left + iconRect.width / 2
          : btnRect.left + btnRect.width / 2;
      const originY = btnRect.top + 6;

      setHeartsSentCount((prev) => prev + 1);
      setHeartSpawnRequest({
        id: nextSeq,
        x: originX,
        y: originY,
        count: 1,
      });
      audioEngineRef.current?.playHeartChime(nextSeq - 1);
    },
    [],
  );

  const triggerEnvelopeCelebration = useCallback((origin?: EnvelopeOpenOrigin) => {
    spawnSeqRef.current += 1;
    const seq = spawnSeqRef.current;
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    const height = typeof window !== 'undefined' ? window.innerHeight : 700;
    const x = origin ? origin.x : width / 2;
    const y = origin ? origin.y : height * 0.65;

    setHeartSpawnRequest({
      id: seq,
      x,
      y,
      count: 7,
      staggerMs: 110,
    });
    setConfettiBurstRequest({
      id: seq,
      x,
      y,
    });
    audioEngineRef.current?.playSoftSparkle();
  }, []);

  const handleToggleFlip = useCallback((id: string) => {
    setFlippedPhotoId((prev) => toggleFlippedPhotoId(prev, id));
  }, []);

  const handleOpenLightbox = useCallback((photo: PhotoMemory) => {
    setLightboxPhotoId(photo.id);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxPhotoId(null);
  }, []);

  const lightboxIndex = useMemo(
    () => photosData.findIndex((p) => p.id === lightboxPhotoId),
    [lightboxPhotoId],
  );

  const activeLightboxPhoto =
    lightboxIndex >= 0 ? photosData[lightboxIndex] : null;

  const handleNavigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (lightboxIndex < 0) {
        return;
      }
      const nextIndex = getAdjacentPhotoIndex(
        lightboxIndex,
        direction,
        photosData.length,
      );
      setLightboxPhotoId(photosData[nextIndex].id);
    },
    [lightboxIndex],
  );

  const handleToggleAmbient = useCallback(() => {
    const engine = audioEngineRef.current;
    if (!engine) {
      return;
    }

    if (isAmbientPlaying) {
      engine.stop();
      setIsAmbientPlaying(false);
    } else {
      const started = engine.start();
      setIsAmbientPlaying(started);
    }
  }, [isAmbientPlaying]);

  const topRowPhotos = photosData.slice(0, 4);
  const bottomRowPhotos = photosData.slice(4, 6);

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#2C2623] overflow-x-clip">
      {/* Тонкая бумажная текстура поверх всего экрана */}
      <div className="paper-grain-overlay" aria-hidden="true" />

      {/* Плавная современная анимация всплывающих сердечек */}
      <LoveBurstOverlay spawnRequest={heartSpawnRequest} />

      {/* Праздничный салют из конфетти при открытии секретного конверта */}
      <ConfettiSaluteOverlay burstRequest={confettiBurstRequest} />

      {/* Верхняя навигация в 3 чистые зоны */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-8 px-5 py-6 sm:px-8 border-b border-[#2C2623]/[0.07]">
        <a
          href="#top"
          className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#2C2623] whitespace-nowrap shrink-0"
        >
          С Днём матери
        </a>

        <nav
          aria-label="Разделы открытки"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6A5D57]"
        >
          <a
            href="#gallery"
            className="hover:text-[#2C2623] transition-colors whitespace-nowrap shrink-0"
          >
            Фотоальбом
          </a>
          <a
            href="#support"
            className="hover:text-[#2C2623] transition-colors whitespace-nowrap shrink-0"
          >
            Кнопка поддержки
          </a>
          <a
            href="#secret-letter"
            className="hover:text-[#2C2623] transition-colors whitespace-nowrap shrink-0"
          >
            Секретный конверт
          </a>
        </nav>

        <a
          href="#secret-letter"
          className="inline-flex min-h-[40px] items-center rounded-full border border-[#2C2623]/15 bg-[#FAF0ED]/70 px-4 py-2 text-xs sm:text-sm font-medium text-[#2C2623] hover:bg-[#F4DCD6] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
        >
          Прочитать письмо
        </a>
      </header>

      <main id="top" className="relative z-10 mx-auto max-w-6xl px-5 pb-28 sm:px-8">
        {/* HERO-СЕКЦИЯ */}
        <section
          aria-labelledby="hero-headline"
          className="mx-auto max-w-3xl pt-9 pb-10 sm:pt-12 sm:pb-12 text-center"
        >
          <p className="text-xs sm:text-sm font-medium text-[#6A5D57]">
            Наш семейный альбом · Для самой родной
          </p>

          <h1
            id="hero-headline"
            className="mt-4 font-serif text-[2.45rem] sm:text-[3.5rem] lg:text-[4.1rem] font-semibold leading-[1.08] tracking-tight text-[#2C2623] text-balance"
          >
            С Днём матери, любимая!
          </h1>

          <p className="mt-5 mx-auto max-w-xl text-base sm:text-lg leading-relaxed text-[#6A5D57] text-balance">
            Самой лучшей, нежной и заботливой маме наших детей
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleHeartButtonClick}
              className="group inline-flex min-h-[52px] cursor-pointer select-none touch-manipulation items-center justify-center gap-3 rounded-full bg-[#B56565] px-8 py-3.5 text-sm sm:text-base font-medium text-[#FDFBF7] shadow-[0_14px_30px_-10px_rgba(181,101,101,0.55)] transition-all duration-200 hover:bg-[#A15454] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2623]"
            >
              <Heart
                ref={heartIconRef}
                key={heartsSentCount}
                className={`h-5 w-5 shrink-0 fill-[#FDFBF7]/90 transition-transform duration-200 group-hover:scale-110 ${
                  heartsSentCount > 0 ? 'animate-heart-pop' : ''
                }`}
                aria-hidden="true"
              />
              <span>Нажми для порции любви</span>
            </button>

            <p
              aria-live="polite"
              data-testid="love-burst-status"
              className="min-h-[24px] font-handwriting text-xl sm:text-2xl text-[#B56565] transition-opacity duration-300"
            >
              {heartsSentCount > 0
                ? `Улетело ${formatRussianHeartsCount(heartsSentCount)} — нажимай ещё!`
                : 'Нажми один раз — улетит сердечко, много раз — целый поток любви'}
            </p>
          </div>
        </section>

        {/* ИНТЕРАКТИВНАЯ BENTO-ГАЛЕРЕЯ И ВИДЖЕТЫ */}
        <section
          id="gallery"
          aria-labelledby="gallery-heading"
          className="pt-2"
        >
          <div className="mb-7 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="gallery-heading"
                className="font-serif text-2xl sm:text-3xl font-semibold text-[#2C2623]"
              >
                Наши тёплые мгновения
              </h2>
              <p className="mt-1 text-sm text-[#6A5D57]">
                Нажми на любой снимок, чтобы перевернуть карточку и прочитать записку на обороте
              </p>
            </div>
            <p className="text-xs text-[#6A5D57] tabular-nums">
              {photosData.length} карточек · 12 слов поддержки · 1 письмо
            </p>
          </div>

          <div
            ref={galleryRef}
            data-testid="bento-parallax-gallery"
            data-parallax-mode="smooth"
            className="parallax-gallery grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7"
          >
            {/* Первые 4 Полароида: верхние 2 ряда Bento-сетки */}
            {topRowPhotos.map((photo) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                isFlipped={flippedPhotoId === photo.id}
                onToggleFlip={handleToggleFlip}
                onOpenLightbox={handleOpenLightbox}
                onRegisterParallax={registerParallaxCard}
                className={getBentoSpanClasses(photo)}
              />
            ))}

            {/* 3-й ряд: Виджет «Кнопка поддержки» + 2 Полароида */}
            <SupportButtonCard
              className="sm:col-span-2 lg:col-span-5 lg:min-h-[340px]"
              onComplimentClick={() => audioEngineRef.current?.playSoftSparkle()}
            />

            {bottomRowPhotos.map((photo, index) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                isFlipped={flippedPhotoId === photo.id}
                onToggleFlip={handleToggleFlip}
                onOpenLightbox={handleOpenLightbox}
                onRegisterParallax={registerParallaxCard}
                className={
                  index === 0
                    ? 'sm:col-span-1 lg:col-span-4 min-h-[320px] lg:min-h-[340px]'
                    : 'sm:col-span-1 lg:col-span-3 min-h-[320px] lg:min-h-[340px]'
                }
              />
            ))}

            {/* Нижний акцент Bento-сетки: Секретный конверт */}
            <SecretEnvelopeCard
              className="sm:col-span-2 lg:col-span-12 mt-2"
              onEnvelopeOpen={triggerEnvelopeCelebration}
            />
          </div>
        </section>

        {/* Тихий душевный футер */}
        <footer className="mt-16 border-t border-[#2C2623]/[0.08] pt-8 text-center">
          <p className="inline-flex items-center gap-2 font-handwriting text-2xl sm:text-3xl text-[#2C2623]">
            <Sparkles
              className="h-4 w-4 text-[#B56565]"
              aria-hidden="true"
            />
            <span>Сделано с теплом для самой любимой мамы</span>
          </p>
          <p className="mt-2 text-xs text-[#6A5D57]">
            День матери · Наша маленькая семья
          </p>
        </footer>
      </main>

      {/* Окно крупного просмотра фотографии с рукописной историей */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        currentIndex={lightboxIndex}
        totalCount={photosData.length}
        onClose={handleCloseLightbox}
        onNavigate={handleNavigateLightbox}
      />

      {/* Плавающая кнопка «Атмосфера» в правом нижнем углу */}
      <AmbientChimeButton
        isPlaying={isAmbientPlaying}
        onToggle={handleToggleAmbient}
      />
    </div>
  );
}
