import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PaperStackProps } from '../types';

interface LetterSection {
  id: number;
  text: string;
  type: 'header';
  extraClass?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// DESKTOP ONLY CONFIGURATION (>= 768px) — Completely isolated from Mobile
// ============================================================================
const DESKTOP_PAPER_CONFIG = {
  // Ordered progression: 1 -> -2 -> --3 (compensating for PNG top transparent padding)
  sheet1Top: '2%',
  sheet2Top: '-1.4%',
  sheet3Top: '-1.6%',
  textContainerStyle: {
    left: '12%',
    right: '9.5%',
    top: '14%',
    height: 'auto',
  } as React.CSSProperties,
};

const DESKTOP_LETTER_SECTIONS: LetterSection[] = [
  {
    id: 0,
    text: "“I DON'T JUST WRITE CODE.",
    type: 'header',
    extraClass: 'font-extrabold uppercase tracking-[0.06em] text-[#140c06] leading-[1.08]',
    style: {
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: 'clamp(28px, 4.4cqw, 50px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
    },
  },
  {
    id: 1,
    text: 'I BUILD THINGS THAT WORK.”',
    type: 'header',
    extraClass: 'font-extrabold uppercase tracking-[0.06em] text-[#6e1b1b] leading-[1.08] mt-[0.8cqh]',
    style: {
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: 'clamp(28px, 4.4cqw, 50px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
    },
  },
  {
    id: 2,
    text: '“Anything I have to do twice becomes a workflow. Anything that breaks becomes a lesson, preferably someone else’s”',
    type: 'header',
    extraClass: 'font-normal tracking-[0.03em] text-[#3d2b1f] leading-[1.45] mt-[2.2cqh] max-w-[84%]',
    style: {
      fontFamily: "'Special Elite', 'Courier Prime', monospace",
      fontSize: 'clamp(13px, 1.65cqw, 19px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.08)',
    },
  },
];

// ============================================================================
// MOBILE ONLY CONFIGURATION (< 768px) — Completely isolated from Desktop
// ============================================================================
const MOBILE_PAPER_CONFIG = {
  // Ordered progression: 1 -> -2 -> --3 (compensating for PNG top transparent padding)
  sheet1Top: '-18%',
  sheet2Top: '-21.4%',
  sheet3Top: '-21.6%',
  textContainerStyle: {
    left: '12%',
    right: '9.5%',
    top: '9.5%',
    height: 'auto',
  } as React.CSSProperties,
};

const MOBILE_LETTER_SECTIONS: LetterSection[] = [
  {
    id: 0,
    text: "“I DON'T JUST WRITE CODE.",
    type: 'header',
    extraClass: 'font-extrabold uppercase tracking-[0.06em] text-[#140c06] leading-[1.08]',
    style: {
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: 'clamp(16px, 4.8cqw, 24px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
    },
  },
  {
    id: 1,
    text: 'I BUILD THINGS THAT WORK.”',
    type: 'header',
    extraClass: 'font-extrabold uppercase tracking-[0.06em] text-[#6e1b1b] leading-[1.08] mt-[0.6cqh]',
    style: {
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: 'clamp(16px, 4.8cqw, 24px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
    },
  },
  {
    id: 2,
    text: '“Anything I have to do twice becomes a workflow. Anything that breaks becomes a lesson, preferably someone else’s”',
    type: 'header',
    extraClass: 'font-normal tracking-[0.03em] text-[#3d2b1f] leading-[1.4] mt-[1.6cqh] max-w-[84%]',
    style: {
      fontFamily: "'Special Elite', 'Courier Prime', monospace",
      fontSize: 'clamp(10px, 2.5cqw, 14px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.08)',
    },
  },
];

export const PaperStack: React.FC<PaperStackProps> = ({
  assetsPath,
  paperBundleRef,
  sheetOneRef,
  sheetTwoRef,
  sheetThreeRef,
  onNavigate,
  hideSheetOne = false,
  children,
}) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeConfig = isMobile ? MOBILE_PAPER_CONFIG : DESKTOP_PAPER_CONFIG;
  const activeSections = isMobile ? MOBILE_LETTER_SECTIONS : DESKTOP_LETTER_SECTIONS;

  // Typewriter effect bounds computation
  const { cumulativeBounds, totalChars } = useMemo(() => {
    const bounds: { start: number; end: number }[] = [];
    let current = 0;
    activeSections.forEach((sec) => {
      const len = sec.text.length;
      bounds.push({ start: current, end: current + len });
      current += len;
    });
    return { cumulativeBounds: bounds, totalChars: current };
  }, [activeSections]);

  const [typedIndex, setTypedIndex] = useState(0);

  useEffect(() => {
    if (hideSheetOne) {
      setTypedIndex(0);
      return;
    }

    setTypedIndex(0);
    const speed = 20; // ms per character
    const interval = setInterval(() => {
      setTypedIndex((prev) => {
        if (prev >= totalChars) {
          clearInterval(interval);
          return totalChars;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [hideSheetOne, totalChars]);

  const handleSkipTypewriter = useCallback(() => {
    setTypedIndex(totalChars);
  }, [totalChars]);

  return (
    <div
      ref={paperBundleRef}
      className="absolute inset-0 z-[3] will-change-transform pointer-events-none"
    >
      {/* Sheet 3 (--3: Back sheet) */}
      <div className="absolute inset-0 z-[2] pointer-events-none idle-paper-3">
        <div
          ref={sheetThreeRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[calc(89*100%/1376)] w-[calc(1205*100%/1376)] h-auto aspect-[1086/1448] origin-bottom-center will-change-transform select-none"
          style={{ top: activeConfig.sheet3Top }}
        >
          <img
            src={`${assetsPath}/paper-sheet-3.png`}
            alt="Back parchment sheet"
            decoding="async"
            className="w-full h-full object-contain block select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Sheet 2 (-2: Middle sheet) */}
      <div className="absolute inset-0 z-[4] pointer-events-none idle-paper-2">
        <div
          ref={sheetTwoRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[calc(89*100%/1376)] w-[calc(1205*100%/1376)] h-auto aspect-[1086/1448] origin-bottom-center will-change-transform select-none"
          style={{ top: activeConfig.sheet2Top }}
        >
          <img
            src={`${assetsPath}/paper-sheet-2.png`}
            alt="Middle parchment sheet"
            decoding="async"
            className="w-full h-full object-contain block select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Interleaved interactive bookmark tabs */}
      {children}

      {/* Sheet 1 (1: Front sheet - Main Evidentiary Portfolio Dossier) */}
      <div
        className={`absolute inset-0 z-[6] pointer-events-none idle-paper-1 transition-opacity duration-200 ${
          hideSheetOne ? '!opacity-0 !invisible pointer-events-none' : ''
        }`}
        style={hideSheetOne ? { opacity: 0, visibility: 'hidden' } : undefined}
      >
        <div
          ref={sheetOneRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[calc(89*100%/1376)] w-[calc(1205*100%/1376)] h-auto aspect-[1086/1448] origin-bottom-center will-change-transform select-none"
          style={{
            top: activeConfig.sheet1Top,
            containerType: 'size',
            ...(hideSheetOne ? { opacity: 0, visibility: 'hidden' } : {}),
          }}
        >
          <img
            src={`${assetsPath}/paper-sheet-1.png`}
            alt="Main stationery evidentiary document"
            decoding="async"
            className="w-full h-full object-contain block select-none pointer-events-none"
          />

          {/* Inscribed Hero Hook inside the visible upper area of Sheet 1 */}
          <div
            onClick={handleSkipTypewriter}
            className="absolute flex flex-col items-center justify-center text-center text-[#1e140c] select-none pointer-events-auto cursor-default"
            style={activeConfig.textContainerStyle}
          >
            {/* Centerpiece Editorial Hook Statement with Typewriter Effect */}
            <div className="flex flex-col items-center justify-center my-auto px-[2cqw] w-full">
              <h1 className="m-0 text-center w-full flex flex-col items-center">
                {activeSections.map((sec, idx) => {
                  const { start, end } = cumulativeBounds[idx];

                  if (typedIndex < start) {
                    return null;
                  }

                  const visibleSlice =
                    typedIndex >= end
                      ? sec.text
                      : sec.text.slice(0, typedIndex - start);

                  return (
                    <div
                      key={sec.id}
                      className={`block ${sec.extraClass || ''}`}
                      style={sec.style}
                    >
                      {visibleSlice}
                    </div>
                  );
                })}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperStack;
