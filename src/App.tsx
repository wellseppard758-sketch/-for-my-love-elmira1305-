import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import type { PhotoMemory } from './types/tribute';
import { AmbientChimeEngine } from './utils/ambientAudio';
import {
  getAdjacentPhotoIndex,
  toggleFlippedPhotoId,
} from './utils/tributeLogic';
import { LoveBurstOverlay } from './components/LoveBurstOverlay';
import { PolaroidCard } from './components/PolaroidCard';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { SupportButtonCard } from './components/SupportButtonCard';
import { SecretEnvelopeCard } from './components/SecretEnvelopeCard';
import { AmbientChimeButton } from './components/AmbientChimeButton';

// ============================================================================
// ФОТОГРАФИИ ДЛЯ СЕМЕЙНОГО АЛЬБОМА
// Положите ваши фотографии в папку `public` (например, public/photo1.jpg)
// и замените путь `src` у каждой карточки ниже.
// ============================================================================
export const photosData: PhotoMemory[] = [
  {
    id: 'morning-hug',
    // ЗАМЕНИТЕ НА ПУТЬ К ВАШЕМУ ФОТО, например '/photo1.jpg'
    src: '/src/assets/images/family_morning_hug_1795721530398.jpg',
    alt: 'Мама с улыбкой нежно обнимает нашего маленького сына утром в солнечной комнате',
    title: 'Самое доброе утро',
    date: 'Тёплый выходной',
    location: 'Наш дом',
    memoryNote:
      'Обожаю эти тихие утренние минуты, когда вы обнимаетесь, смеётесь вполголоса, а вся комната будто наполняется солнечным светом.',
    span: 'featured',
    tiltDegrees: -1,
    tapeColor: 'rose',
    tapeCorner: 'top-center',
    parallaxDepth: 30,
    parallaxSpeed: -7,
  },
  {
    id: 'park-walk',
    // ЗАМЕНИТЕ НА ПУТЬ К ВАШЕМУ ФОТО, например '/photo2.jpg'
    src: '/src/assets/images/family_park_walk_1795721530937.jpg',
    alt: 'Мама и сын идут за руку по солнечной парковой тропинке среди зелени',
    title: 'За руку в приключения',
    date: 'Золотой час',
    location: 'Любимый парк',
    memoryNote:
      'Ты показываешь ему этот мир с таким терпением и интересом, что даже обычная прогулка до парка превращается для него в сказку.',
    span: 'wide',
    tiltDegrees: 1,
    tapeColor: 'sage',
    tapeCorner: 'top-right',
    parallaxDepth: 22,
    parallaxSpeed: 6,
  },
  {
    id: 'reading-stories',
    // ЗАМЕНИТЕ НА ПУТЬ К ВАШЕМУ ФОТО, например '/photo3.jpg'
    src: '/src/assets/images/family_reading_portrait_1795721532349.jpg',
    alt: 'Мама читает иллюстрированную книгу вместе с сыном в уютном кресле у окна',
    title: 'Сказки у окна',
    date: 'Тихий вечер',
    location: 'Уютное кресло',
    memoryNote:
      'Твой спокойный голос, когда ты читаешь ему сказки — это звук абсолютного счастья и безопасности. Даже я всегда заслушиваюсь.',
    span: 'tall',
    tiltDegrees: -1,
    tapeColor: 'cream',
    tapeCorner: 'top-left',
    parallaxDepth: 34,
    parallaxSpeed: -8,
  },
  {
    id: 'sunday-breakfast',
    // ЗАМЕНИТЕ НА ПУТЬ К ВАШЕМУ ФОТО, например '/photo4.jpg'
    src: '/src/assets/images/family_baking_kitchen_1795721533000.jpg',
    alt: 'Мама и сын весело готовят воскресные оладушки на кухне, перепачкавшись в муке',
    title: 'Воскресные оладушки',
    date: 'Семейная традиция',
    location: 'Наша кухня',
    memoryNote:
      'Мука на носу, искренний смех на всю квартиру и самые вкусные завтраки на свете. Спасибо за уют, который ты создаёшь каждый день.',
    span: 'wide',
    tiltDegrees: 1,
    tapeColor: 'rose',
    tapeCorner: 'top-left',
    parallaxDepth: 24,
    parallaxSpeed: 5,
  },
  {
    id: 'meadow-picnic',
    // ЗАМЕНИТЕ НА ПУТЬ К ВАШЕМУ ФОТО, например '/photo5.jpg'
    src: '/src/assets/images/family_meadow_picnic_1795721534009.jpg',
    alt: 'Мама смеётся и подбрасывает сына на руках на закатном лугу среди полевых цветов',
    title: 'Выше облаков',
    date: 'Тёплый закат',
    location: 'Поляна цветов',
    memoryNote:
      'В этом кадре — всё, за что я так сильно тебя люблю: твоя лёгкость, живой смех и то, как наш малыш светится в твоих объятиях.',
    span: 'wide',
    tiltDegrees: -1,
    tapeColor: 'sage',
    tapeCorner: 'top-center',
    parallaxDepth: 26,
    parallaxSpeed: -6,
  },
  {
    id: 'tiny-hands',
    // ЗАМЕНИТЕ НА ПУТЬ К ВАШЕМУ ФОТО, например '/photo6.jpg'
    src: '/src/assets/images/family_tiny_hands_1795721535994.jpg',
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
    parallaxDepth: 20,
    parallaxSpeed: 7,
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
  const [burstCounter, setBurstCounter] = useState(0);
  const [flippedPhotoId, setFlippedPhotoId] = useState<string | null>(null);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  const audioEngineRef = useRef<AmbientChimeEngine | null>(null);

  useEffect(() => {
    const engine = new AmbientChimeEngine();
    audioEngineRef.current = engine;
    return () => {
      engine.dispose();
      audioEngineRef.current = null;
    };
  }, []);

  const triggerLoveBurst = useCallback(() => {
    setBurstCounter((prev) => prev + 1);
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

      {/* Праздничная анимация парящих сердечек и лепестков */}
      <LoveBurstOverlay burstCounter={burstCounter} />

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
              onClick={triggerLoveBurst}
              className="group inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-3 rounded-full bg-[#B56565] px-8 py-3.5 text-sm sm:text-base font-medium text-[#FDFBF7] shadow-[0_14px_30px_-10px_rgba(181,101,101,0.55)] transition-all duration-200 hover:bg-[#A15454] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2623]"
            >
              <Heart
                className="h-5 w-5 shrink-0 fill-[#FDFBF7]/90 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
              <span>Нажми для порции любви</span>
            </button>

            <p
              aria-live="polite"
              data-testid="love-burst-status"
              className="min-h-[24px] font-handwriting text-xl sm:text-2xl text-[#B56565] transition-opacity duration-300"
            >
              {burstCounter > 0
                ? `Отправлено порций любви: ${burstCounter} — и это только начало`
                : 'Нажми на кнопку или переверни любую фотографию ниже'}
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7">
            {/* Первые 4 Полароида: верхние 2 ряда Bento-сетки */}
            {topRowPhotos.map((photo) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                isFlipped={flippedPhotoId === photo.id}
                onToggleFlip={handleToggleFlip}
                onOpenLightbox={handleOpenLightbox}
                className={getBentoSpanClasses(photo)}
              />
            ))}

            {/* 3-й ряд: Виджет «Кнопка поддержки» + 2 Полароида */}
            <SupportButtonCard
              className="sm:col-span-2 lg:col-span-5 lg:min-h-[340px]"
              onComplimentClick={() => audioEngineRef.current?.playSoftSparkle()}
            />

            {bottomRowPhotos.map((photo) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                isFlipped={flippedPhotoId === photo.id}
                onToggleFlip={handleToggleFlip}
                onOpenLightbox={handleOpenLightbox}
                className={
                  photo.id === 'meadow-picnic'
                    ? 'sm:col-span-1 lg:col-span-4 min-h-[320px] lg:min-h-[340px]'
                    : 'sm:col-span-1 lg:col-span-3 min-h-[320px] lg:min-h-[340px]'
                }
              />
            ))}

            {/* Нижний акцент Bento-сетки: Секретный конверт */}
            <SecretEnvelopeCard
              className="sm:col-span-2 lg:col-span-12 mt-2"
              onEnvelopeOpen={triggerLoveBurst}
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
