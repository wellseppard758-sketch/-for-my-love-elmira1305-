import { useState } from 'react';
import { Heart, Mail, MailOpen } from 'lucide-react';
import { SECRET_LETTER } from '../data/complimentsData';

interface SecretEnvelopeCardProps {
  className?: string;
  onEnvelopeOpen?: () => void;
}

export function SecretEnvelopeCard({
  className = '',
  onEnvelopeOpen,
}: SecretEnvelopeCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        onEnvelopeOpen?.();
      }
      return next;
    });
  };

  return (
    <section
      id="secret-letter"
      aria-labelledby="envelope-heading"
      className={`relative overflow-hidden rounded-3xl bg-[#DCE2D8]/55 p-6 sm:p-10 lg:p-12 scrapbook-shadow border border-[#2C2623]/[0.07] ${className}`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-medium text-[#586B58]">
            Секретный конверт · Личное послание
          </p>
          <h2
            id="envelope-heading"
            className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2C2623] text-balance"
          >
            Письмо, которое хочется перечитывать
          </h2>
          <p className="mt-2.5 mx-auto max-w-lg text-sm sm:text-[15px] text-[#6A5D57] leading-relaxed">
            {isOpen
              ? 'Спасибо за каждый тёплый день, который ты даришь нашей семье.'
              : 'Нажми на сургучную печать или кнопку ниже, чтобы аккуратно открыть конверт.'}
          </p>
        </div>

        {/* Интерактивный иллюстрированный бумажный конверт */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center">
          <div
            data-testid="secret-envelope"
            data-open={isOpen ? 'true' : 'false'}
            className="relative w-full max-w-2xl"
          >
            {/* Выдвигающийся лист письма */}
            {isOpen && (
              <div className="animate-fade-rise relative z-20 mx-auto mb-6 w-full rounded-2xl lined-letter-paper p-6 sm:p-9 lg:p-10 scrapbook-shadow border border-[#2C2623]/10">
                <div
                  aria-hidden="true"
                  className="washi-tape pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-24 -rotate-1 bg-[#F4DCD6]/85"
                />

                <p className="font-handwriting text-3xl sm:text-[2.15rem] font-semibold text-[#B56565]">
                  {SECRET_LETTER.greeting}
                </p>

                <div className="mt-4 space-y-4 font-serif text-[15px] sm:text-[17px] leading-[1.8] text-[#2C2623]">
                  {SECRET_LETTER.paragraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-7 border-t border-[#2C2623]/10 pt-5">
                  <p
                    data-testid="letter-signature"
                    className="font-handwriting text-2xl sm:text-3xl font-semibold text-[#2C2623]"
                  >
                    {SECRET_LETTER.signature}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm italic text-[#6A5D57]">
                    {SECRET_LETTER.postscript}
                  </p>
                </div>
              </div>
            )}

            {/* Корпус бумажного конверта */}
            <div className="relative mx-auto w-full max-w-[440px] pt-2">
              <div
                className="perspective-1200 relative mx-auto h-52 sm:h-60 w-full rounded-2xl bg-[#F4E9DF] shadow-[0_18px_40px_-14px_rgba(44,38,35,0.18)] border border-[#2C2623]/10"
                aria-hidden="true"
              >
                {/* Внутренний карман конверта (обрезает только внутренний лист) */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {/* Внутренняя подкладка конверта с нежным оттенком */}
                  <div className="absolute inset-x-3 top-2 bottom-3 rounded-xl bg-[#FAF0ED] border border-[#B56565]/15" />

                  {/* Краешек сложенного письма внутри конверта */}
                  <div
                    className={`absolute inset-x-7 top-6 h-32 rounded-t-xl bg-[#FFFDF9] border border-[#2C2623]/10 shadow-sm px-5 pt-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? '-translate-y-7 opacity-95' : 'translate-y-1 opacity-100'
                    }`}
                  >
                    <div className="h-2 w-24 rounded-full bg-[#F4DCD6]" />
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#2C2623]/10" />
                    <div className="mt-2 h-1.5 w-4/5 rounded-full bg-[#2C2623]/10" />
                  </div>

                  {/* Боковые и нижний сгибы конверта */}
                  <svg
                    viewBox="0 0 440 240"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                  >
                    <polygon
                      points="0,0 220,132 0,240"
                      fill="#F2E4D9"
                      stroke="rgba(44,38,35,0.08)"
                      strokeWidth="1"
                    />
                    <polygon
                      points="440,0 220,132 440,240"
                      fill="#EFE0D4"
                      stroke="rgba(44,38,35,0.08)"
                      strokeWidth="1"
                    />
                    <polygon
                      points="0,240 220,114 440,240"
                      fill="#F8EFE7"
                      stroke="rgba(44,38,35,0.09)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                {/* Верхний клапан конверта, свободно откидывающийся вверх */}
                <div
                  style={{
                    transformOrigin: 'top center',
                    transform: isOpen ? 'rotateX(176deg)' : 'rotateX(0deg)',
                  }}
                  className={`pointer-events-none absolute inset-x-0 top-0 h-[134px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? 'z-0' : 'z-20'
                  }`}
                >
                  <svg
                    viewBox="0 0 440 134"
                    preserveAspectRatio="none"
                    className="h-full w-full drop-shadow-[0_4px_6px_rgba(44,38,35,0.08)]"
                  >
                    <polygon
                      points="0,0 440,0 220,128"
                      fill={isOpen ? '#EAD7C9' : '#FAF3EC'}
                      stroke="rgba(44,38,35,0.1)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>

              {/* Интерактивная сургучная печать в центре конверта */}
              <button
                type="button"
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-label={
                  isOpen
                    ? 'Сложить письмо обратно в конверт'
                    : 'Открыть секретный конверт и прочитать письмо'
                }
                className={`group absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#B56565] text-[#FDFBF7] shadow-[0_8px_20px_-4px_rgba(181,101,101,0.65)] ring-4 ring-[#F4DCD6]/80 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C2623] ${
                  isOpen ? 'top-[136px] sm:top-[152px] opacity-85 scale-90' : 'top-[118px] sm:top-[134px]'
                }`}
              >
                <Heart
                  className={`h-6 w-6 transition-transform duration-300 ${
                    isOpen
                      ? 'scale-90 fill-[#FDFBF7]/30'
                      : 'fill-[#FDFBF7] group-hover:scale-110'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Чёткая доступная кнопка под конвертом */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleToggle}
                aria-expanded={isOpen}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full bg-[#2C2623] px-7 py-2.5 text-sm font-medium text-[#FDFBF7] shadow-sm transition-colors hover:bg-[#433935] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565]"
              >
                {isOpen ? (
                  <>
                    <MailOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Сложить письмо обратно</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Открыть конверт</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
