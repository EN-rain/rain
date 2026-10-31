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
    id: 'about',
    label: 'About',
    paperId: 'about',
    defaultRot: 'rotate-[1.2deg]',
    zIndex: 'z-[33]',
  },
  {
    id: 'works',
    label: 'Works',
    paperId: 'works',
    defaultRot: '-rotate-[1.1deg]',
    zIndex: 'z-[32]',
  },
  {
    id: 'contact',
    label: 'Contacts',
    paperId: 'contact',
    defaultRot: 'rotate-[1.6deg]',
    zIndex: 'z-[31]',
  },
];

export const BookmarkTabs: React.FC<BookmarkTabsProps> = ({
  assetsPath,
  tabOneRef,
  tabTwoRef,
  tabThreeRef,
  tabFourRef,
  activeBookmark = 'home',
  isSubpage = false,
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
      className="absolute left-0 top-[48%] -translate-y-1/2 z-[25] sm:z-[15] flex flex-col gap-2 sm:gap-2.5 md:gap-3 pointer-events-auto"
    >
      {TABS.map((tab, idx) => {
        const ref = getRef(idx);
        const isActive = activeBookmark === tab.paperId;

        return (
          <button
            key={tab.id}
            ref={ref}
            type="button"
            onClick={() => onSelectBookmark(tab.paperId)}
            disabled={disabled}
            aria-label={`Navigate to ${tab.label}`}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative -left-14 sm:-left-16 md:-left-20 w-[220px] sm:w-[250px] md:w-[280px] lg:w-[300px] h-[58px] sm:h-[66px] md:h-[74px] lg:h-[80px] ${
              isActive ? 'z-[40]' : tab.zIndex
            } border-0 p-0 bg-transparent cursor-pointer will-change-transform select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8cf92]`}
          >
            {/* Inner visual wrapper pulls out to the LEFT when active or hovered while the right end stays tucked behind the papers/clipboard */}
            <div
              className={`relative w-full h-full transition-transform duration-200 ease-out will-change-transform ${
                isActive
                  ? '-translate-x-3.5 sm:-translate-x-4 scale-[1.03]'
                  : 'translate-x-1.5 opacity-92 hover:opacity-100 hover:-translate-x-2 active:scale-95'
              }`}
            >
              {/* Torn Parchment Tab Texture */}
              <img
                src={`${assetsPath}/label-tab.png`}
                alt=""
                decoding="async"
                className={`w-full h-full object-fill pointer-events-none ${
                  isActive
                    ? 'brightness-110 contrast-105 saturate-110 drop-shadow-[-5px_7px_12px_rgba(0,0,0,0.58)]'
                    : 'brightness-[0.86] saturate-[0.82] drop-shadow-[-3px_4px_9px_rgba(0,0,0,0.42)] group-hover:brightness-105 group-hover:saturate-100'
                }`}
              />

              {/* Vintage Typewriter / Dossier Stamped Text + Active Indicator positioned in the protruding left 64% of the tab */}
              <span
                className={`absolute inset-y-0 left-0 w-[64%] flex items-center justify-center pl-4 pr-1 gap-2 font-bold uppercase select-none pointer-events-none transition-all duration-300 text-[0.9rem] sm:text-[1.02rem] md:text-[1.12rem] ${
                  isActive
                    ? 'tracking-[0.22em] text-[#110a05]'
                    : 'tracking-[0.18em] text-[#2b2118] group-hover:tracking-[0.22em] group-hover:text-[#0f0b07]'
                }`}
                style={{
                  fontFamily: "'Special Elite', 'Courier Prime', monospace, serif",
                  textShadow: isActive
                    ? '0 0 1px rgba(17, 10, 5, 0.65)'
                    : '0 0 1px rgba(34, 26, 18, 0.35)',
                }}
              >
                {/* Crimson / Brass Active Pin Indicator */}
                <span
                  aria-hidden="true"
                  className={`inline-block shrink-0 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-2.5 bg-[#9e2222] border border-[#f2d694] shadow-[0_0_8px_rgba(175,34,34,0.9)] scale-100 opacity-100'
                      : 'w-1.5 h-1.5 bg-[#4a3728]/40 scale-75 opacity-0 group-hover:opacity-60'
                  }`}
                />

                <span className="relative">
                  {tab.label}
                  {/* Stamped Ink Underline on Active Bookmark */}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-[#8c1d1d] rounded-full transition-all duration-300 origin-left ${
                      isActive ? 'scale-x-100 opacity-95' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default BookmarkTabs;
