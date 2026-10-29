import React from 'react';
import { BookmarkTabsProps } from '../types';

interface TabItemConfig {
  id: string;
  label: string;
  paperId: string;
  defaultRot: string;
  zIndex: string;
}

const TABS: TabItemConfig[] = [
  {
    id: 'home',
    label: 'Home',
    paperId: 'home',
    defaultRot: '-rotate-[1.5deg]',
    zIndex: 'z-[34]',
  },
  {
    id: 'works',
    label: 'Works',
    paperId: 'works',
    defaultRot: 'rotate-[1.2deg]',
    zIndex: 'z-[33]',
  },
];

export const BookmarkTabs: React.FC<BookmarkTabsProps> = ({
  assetsPath,
  tabOneRef,
  tabTwoRef,
  tabThreeRef,
  tabFourRef,
  onSelectBookmark,
  disabled = false,
}) => {
  const getRef = (index: number) => {
    switch (index) {
      case 0: return tabOneRef;
      case 1: return tabTwoRef;
      case 2: return tabThreeRef;
      case 3: return tabFourRef;
      default: return tabOneRef;
    }
  };

  return (
    <nav
      aria-label="Portfolio Navigation Bookmarks"
      className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3.5 sm:gap-4.5 pointer-events-auto"
    >
      {TABS.map((tab, idx) => {
        const ref = getRef(idx);
        return (
          <button
            key={tab.id}
            ref={ref}
            type="button"
            onClick={() => onSelectBookmark(tab.paperId)}
            disabled={disabled}
            aria-label={`Navigate to ${tab.label}`}
            className={`group relative -left-6 sm:-left-8 md:-left-10 w-[240px] sm:w-[270px] md:w-[300px] lg:w-[320px] h-[72px] sm:h-[80px] md:h-[88px] ${tab.zIndex} ${tab.defaultRot} border-0 p-0 bg-transparent cursor-pointer will-change-transform select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8cf92] hover:brightness-110 active:scale-95 transition-[filter] duration-200 ease-out`}
          >
            {/* Torn Parchment Tab Texture */}
            <img
              src={`${assetsPath}/label-tab.png`}
              alt=""
              className="w-full h-full object-fill pointer-events-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200"
            />

            {/* Vintage Typewriter / Dossier Stamped Text */}
            <span
              className="absolute inset-0 flex items-center justify-center pl-6 font-bold tracking-[0.24em] text-[#221a12] text-[1.05rem] sm:text-[1.18rem] md:text-[1.3rem] uppercase select-none pointer-events-none transition-all duration-200 group-hover:tracking-[0.28em] group-hover:text-[#0f0b07]"
              style={{
                fontFamily: "'Special Elite', 'Courier Prime', monospace, serif",
                textShadow: '0 0 1px rgba(34, 26, 18, 0.45)',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BookmarkTabs;
