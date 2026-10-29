import React from 'react';
import { JournalOverlayProps } from '../types';

export const JournalOverlay: React.FC<JournalOverlayProps> = ({
  assetsPath,
  visible,
  state,
  activeBookmark,
  openingVideoRef,
  closingVideoRef,
  onClose,
  disabled = false,
}) => {
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leather Journal View"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f11]/92 backdrop-blur-md transition-opacity duration-300"
    >
      <video
        ref={openingVideoRef}
        playsInline
        muted
        preload="auto"
        src={`${assetsPath}/journal-open-6s.webm`}
        className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
          state === 'journal-closing' ? 'hidden opacity-0' : 'block opacity-100'
        }`}
      />

      <video
        ref={closingVideoRef}
        playsInline
        muted
        preload="auto"
        src={`${assetsPath}/journal-close-6s.webm`}
        className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
          state === 'journal-closing' ? 'block opacity-100' : 'hidden opacity-0'
        }`}
      />

      {/* Return to folder button */}
      <button
        onClick={onClose}
        disabled={disabled || state !== 'journal-open'}
        aria-label="Close journal and return to desk folder"
        className="absolute top-6 right-8 px-6 py-2.5 rounded-full border border-[#d8c39d]/40 bg-[#1e2024]/85 text-[#e6d8ba] text-sm font-serif tracking-wider shadow-lg hover:bg-[#2c2f35] hover:border-[#d8c39d] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition cursor-pointer"
      >
        &#8592; Back to Folder {activeBookmark ? `(Doc ${activeBookmark})` : ''}
      </button>
    </div>
  );
};
