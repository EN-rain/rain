import React, { useEffect } from 'react';

interface VintageContactDeskProps {
  onBack?: () => void;
  onNavigateSection?: (section: 'home' | 'about' | 'works') => void;
  className?: string;
  active?: boolean;
}

export const VintageContactDesk: React.FC<VintageContactDeskProps> = ({
  onBack,
  className = '',
  active = true,
}) => {
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onBack]);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden select-none bg-[#1c100a] ${className}`}
      style={{
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {/* Fullscreen Detective Desk Scene */}
      <img
        src="/assets/detective-desk/detective-desk-scene-1672.png"
        alt="Vintage detective desk"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Subtle Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Return to previous section"
          className="absolute top-6 left-6 z-20 px-3.5 py-1.5 bg-[#1e1008]/85 hover:bg-[#341b0d] text-[#f4dfba] border border-[#f4dfba]/30 rounded text-[11px] font-extrabold tracking-[0.16em] uppercase cursor-pointer backdrop-blur-xs transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center gap-2"
        >
          <span>←</span>
          <span>Return</span>
        </button>
      )}
    </div>
  );
};
