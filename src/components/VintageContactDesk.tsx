import React, { useEffect } from 'react';
import { FieldMailTerminal } from './FieldMailTerminal';

interface VintageContactDeskProps {
  onBack?: () => void;
  onNavigateSection?: (section: 'home' | 'about' | 'works') => void;
  className?: string;
  active?: boolean;
  assetsPath?: string;
  isTransitioning?: boolean;
}

export const VintageContactDesk: React.FC<VintageContactDeskProps> = ({
  onBack,
  className = '',
  active = true,
  assetsPath = '/assets',
  isTransitioning = false,
}) => {
  const [hasMountedTerminal, setHasMountedTerminal] = React.useState(false);

  useEffect(() => {
    if (active) {
      setHasMountedTerminal(true);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowLeft' ||
        e.key === 'PageUp'
      ) {
        e.preventDefault();
        onBack?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onBack]);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden select-none bg-[#0b0a08] ${className}`}
      style={{
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <style>{`
        @keyframes bookmarkSlideInPopup {
          0% {
            transform: translate3d(-110%, 0, 0) scale(0.92);
            opacity: 0;
          }
          62% {
            transform: translate3d(14px, 0, 0) scale(1.05);
            opacity: 1;
          }
          82% {
            transform: translate3d(-3px, 0, 0) scale(0.99);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
          }
        }
        .bookmark-slide-popup {
          animation: bookmarkSlideInPopup 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {/* Return Bookmark Tab in Top Left - clipped at screen edge with slide-in popup animation */}
      <nav
        aria-label="Return Navigation Bookmark"
        className={`fixed top-6 sm:top-8 md:top-10 left-0 z-50 pointer-events-auto ${
          active ? 'bookmark-slide-popup' : 'opacity-0 -translate-x-full pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={!active}
          aria-label="Return to portfolio"
          className="group relative -left-8 sm:-left-10 md:-left-12 w-[210px] sm:w-[240px] md:w-[270px] h-[52px] sm:h-[60px] md:h-[66px] border-0 p-0 bg-transparent cursor-pointer will-change-transform select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8cf92]"
        >
          {/* Inner tab with interactive hover popup slide */}
          <div className="relative w-full h-full transition-all duration-200 ease-out will-change-transform group-hover:translate-x-3.5 group-hover:scale-[1.03] active:scale-95 active:translate-x-1">
            {/* Torn Parchment Tab Texture */}
            <img
              src={`${assetsPath}/label-tab.png`}
              alt=""
              decoding="async"
              className="w-full h-full object-fill pointer-events-none brightness-[0.92] contrast-[1.05] drop-shadow-[3px_6px_14px_rgba(0,0,0,0.7)] group-hover:brightness-105 group-hover:drop-shadow-[5px_8px_18px_rgba(0,0,0,0.9)]"
            />

            {/* Typewriter Stamped Text positioned on the visible protruding section */}
            <span
              className="absolute inset-y-0 right-0 w-[78%] flex items-center justify-center pr-3 sm:pr-4 gap-2 font-bold uppercase select-none pointer-events-none transition-all duration-200 text-[0.88rem] sm:text-[1rem] md:text-[1.08rem] tracking-[0.2em] text-[#241a12] group-hover:tracking-[0.24em] group-hover:text-[#0b0704]"
              style={{
                fontFamily: "'Special Elite', 'Courier Prime', monospace, serif",
                textShadow: '0 0 1px rgba(34, 26, 18, 0.4)',
              }}
            >
              <span className="text-[#3a2012] font-black text-sm sm:text-base transition-transform duration-200 group-hover:-translate-x-1">←</span>
              <span>Return</span>
            </span>
          </div>
        </button>
      </nav>

      {/* Interactive 3D Field Mail CRT Terminal Desk (Native React Component, kept warm once mounted) */}
      {(active || hasMountedTerminal) && (
        <FieldMailTerminal onBack={onBack} active={active} isTransitioning={isTransitioning} />
      )}
    </div>
  );
};
