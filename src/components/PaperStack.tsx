import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PaperStackProps } from '../types';

interface LetterSection {
  id: number;
  text: string;
  type: 'header';
  extraClass?: string;
  style?: React.CSSProperties;
}

const LETTER_SECTIONS: LetterSection[] = [
  {
    id: 0,
    text: "“I DON'T JUST WRITE CODE.",
    type: 'header',
    extraClass: 'font-extrabold uppercase tracking-[0.06em] text-[#140c06] leading-[1.08]',
    style: {
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: 'clamp(26px, 6.8cqh, 60px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
    },
  },
  {
    id: 1,
    text: 'I BUILD THINGS THAT WORK.”',
    type: 'header',
    extraClass: 'font-extrabold uppercase tracking-[0.06em] text-[#6e1b1b] leading-[1.08] mt-[1cqh]',
    style: {
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: 'clamp(26px, 6.8cqh, 60px)',
      textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
    },
  },
  {
    id: 2,
    text: '“Anything I have to do twice becomes a workflow. Anything that breaks becomes a lesson, preferably someone else’s”',
    type: 'header',
    extraClass: 'font-normal tracking-[0.03em] text-[#3d2b1f] leading-[1.5] mt-[6.5cqh] max-w-[85%]',
    style: {
      fontFamily: "'Special Elite', 'Courier Prime', monospace",
      fontSize: 'clamp(12px, 2.4cqh, 20px)',
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
  // Typewriter effect bounds computation
  const { cumulativeBounds, totalChars } = useMemo(() => {
    const bounds: { start: number; end: number }[] = [];
    let current = 0;
    LETTER_SECTIONS.forEach((sec) => {
      const len = sec.text.length;
      bounds.push({ start: current, end: current + len });
      current += len;
    });
    return { cumulativeBounds: bounds, totalChars: current };
  }, []);

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

  const isTypingComplete = typedIndex >= totalChars;

  return (
    <div
      ref={paperBundleRef}
      className="absolute inset-0 z-[3] will-change-transform pointer-events-none"
    >
      {/* Sheet 3 (Back) - Fanned out to the left */}
      <div className="absolute inset-0 z-[2] pointer-events-none idle-paper-3">
        <div
          ref={sheetThreeRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[3%] sm:left-[calc(89*100%/1376)] top-[4.5%] sm:top-0 w-[94%] sm:w-[calc(1205*100%/1376)] h-[92%] sm:h-[calc(794*100%/768)] origin-bottom-center will-change-transform select-none"
        >
          <img
            src={`${assetsPath}/paper-sheet-3.png`}
            alt="Back parchment sheet"
            decoding="async"
            className="w-full h-full block select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Sheet 2 (Middle) - Fanned out to the right */}
      <div className="absolute inset-0 z-[4] pointer-events-none idle-paper-2">
        <div
          ref={sheetTwoRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[3%] sm:left-[calc(89*100%/1376)] top-[4.5%] sm:top-0 w-[94%] sm:w-[calc(1205*100%/1376)] h-[92%] sm:h-[calc(794*100%/768)] origin-bottom-center will-change-transform select-none"
        >
          <img
            src={`${assetsPath}/paper-sheet-2.png`}
            alt="Middle parchment sheet"
            decoding="async"
            className="w-full h-full block select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Interleaved interactive bookmark tabs */}
      {children}

      {/* Sheet 1 (Front) - Main Evidentiary Portfolio Dossier */}
      <div
        className={`absolute inset-0 z-[6] pointer-events-none idle-paper-1 transition-opacity duration-200 ${
          hideSheetOne ? '!opacity-0 !invisible pointer-events-none' : ''
        }`}
        style={hideSheetOne ? { opacity: 0, visibility: 'hidden' } : undefined}
      >
        <div
          ref={sheetOneRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[3%] sm:left-[calc(89*100%/1376)] top-[4.5%] sm:top-[2.8%] w-[94%] sm:w-[calc(1205*100%/1376)] h-[92%] sm:h-[calc(794*100%/768)] origin-bottom-center will-change-transform select-none"
          style={{
            containerType: 'size',
            ...(hideSheetOne ? { opacity: 0, visibility: 'hidden' } : {}),
          }}
        >
          <img
            src={`${assetsPath}/paper-sheet-1.png`}
            alt="Main stationery evidentiary document"
            decoding="async"
            className="w-full h-full block select-none pointer-events-none"
          />

          {/* Inscribed Hero Hook inside the visible upper area of Sheet 1 */}
          <div
            onClick={handleSkipTypewriter}
            className="absolute flex flex-col items-center justify-center text-center text-[#1e140c] select-none pointer-events-auto cursor-default"
            style={{
              left: '12%',
              right: '9.5%',
              top: '15%',
              height: '52%',
            }}
          >
            {/* Centerpiece Editorial Hook Statement with Typewriter Effect */}
            <div className="flex flex-col items-center justify-center my-auto px-[2cqw] w-full">
              <h1 className="m-0 text-center w-full flex flex-col items-center">
                {LETTER_SECTIONS.map((sec, idx) => {
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
