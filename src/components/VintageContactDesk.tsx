import React from 'react';

interface VintageContactDeskProps {
  onBack?: () => void;
  className?: string;
  active?: boolean;
}

export const VintageContactDesk: React.FC<VintageContactDeskProps> = ({
  onBack,
  className = '',
  active = true,
}) => {
  return (
    <div
      onClick={onBack}
      className={`fixed inset-0 w-full h-full bg-white text-black flex flex-col items-center justify-center select-none cursor-pointer ${className}`}
      style={{
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <span
        className="text-2xl sm:text-3xl md:text-4xl font-mono font-normal tracking-wide text-black"
        style={{ fontFamily: "'IBM Plex Mono', monospace, sans-serif" }}
      >
        1 contacts
      </span>
      <span
        className="absolute bottom-6 text-xs text-neutral-400 font-mono tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
        style={{ fontFamily: "'Space Grotesk', 'IBM Plex Mono', monospace" }}
      >
        ← return to home
      </span>
    </div>
  );
};

export default VintageContactDesk;
