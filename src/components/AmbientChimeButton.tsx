import { Music2, VolumeX } from 'lucide-react';

interface AmbientChimeButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function AmbientChimeButton({
  isPlaying,
  onToggle,
}: AmbientChimeButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isPlaying}
        aria-label={
          isPlaying
            ? 'Выключить фоновую мелодию «Атмосфера»'
            : 'Включить нежную мелодию «Атмосфера»'
        }
        className={`relative inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56565] ${
          isPlaying
            ? 'bg-[#2C2623] text-[#FDFBF7] shadow-[0_12px_28px_-8px_rgba(44,38,35,0.45)]'
            : 'bg-[#FDFBF7]/95 text-[#2C2623] border border-[#2C2623]/12 scrapbook-shadow hover:bg-[#FAF0ED]'
        }`}
      >
        {isPlaying && (
          <span
            aria-hidden="true"
            className="animate-gentle-pulse pointer-events-none absolute inset-0 rounded-full border-2 border-[#B56565]/60"
          />
        )}

        {isPlaying ? (
          <Music2 className="h-4 w-4 shrink-0 text-[#F4DCD6]" aria-hidden="true" />
        ) : (
          <VolumeX className="h-4 w-4 shrink-0 text-[#6A5D57]" aria-hidden="true" />
        )}

        <span>Атмосфера</span>
        <span className="text-[11px] opacity-75">
          {isPlaying ? '· вкл' : '· тихо'}
        </span>
      </button>
    </div>
  );
}
