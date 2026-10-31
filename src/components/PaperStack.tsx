import React from 'react';
import { PaperStackProps } from '../types';

export const PaperStack: React.FC<PaperStackProps> = ({
  assetsPath,
  paperBundleRef,
  sheetOneRef,
  sheetTwoRef,
  sheetThreeRef,
  onNavigate,
  children,
}) => {
  return (
    <div
      ref={paperBundleRef}
      className="absolute inset-0 z-[3] will-change-transform pointer-events-none"
    >
      {/* Sheet 3 (Back) - Fanned out to the left */}
      <div className="absolute inset-0 z-[2] pointer-events-none idle-paper-3">
        <div
          ref={sheetThreeRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[calc(89*100%/1376)] top-0 w-[calc(1205*100%/1376)] h-[calc(794*100%/768)] origin-bottom-center will-change-transform select-none"
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
          className="absolute left-[calc(89*100%/1376)] top-0 w-[calc(1205*100%/1376)] h-[calc(794*100%/768)] origin-bottom-center will-change-transform select-none"
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
      <div className="absolute inset-0 z-[6] pointer-events-none idle-paper-1">
        <div
          ref={sheetOneRef as React.RefObject<HTMLDivElement | null>}
          className="absolute left-[calc(89*100%/1376)] top-0 w-[calc(1205*100%/1376)] h-[calc(794*100%/768)] origin-bottom-center will-change-transform select-none"
          style={{ containerType: 'size' }}
        >
          <img
            src={`${assetsPath}/paper-sheet-1.png`}
            alt="Main stationery evidentiary document"
            decoding="async"
            className="w-full h-full block select-none pointer-events-none"
          />

          {/* Inscribed Hero Hook inside the visible upper area of Sheet 1 (above the manila pocket) */}
          <div
            className="absolute flex flex-col items-center justify-between text-center text-[#1e140c] select-none"
            style={{
              left: '14%',
              right: '11.5%',
              top: '9.2%',
              height: '43.5%',
              fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
            }}
          >
            {/* Top Archival Kicker Line (clears top-left red tally mark) */}
            <div className="w-full flex items-center justify-between border-b border-[#2b1d10]/30 pb-[0.9cqh] pl-[13%]">
              <span
                className="uppercase tracking-[0.22em] text-[#4a3320] font-bold"
                style={{ fontSize: 'clamp(8px, 1.35cqh, 12px)' }}
              >
                EDRIAN NIEVES // FULL-STACK DEVELOPER
              </span>
              <span
                className="uppercase tracking-[0.2em] text-[#7a1c1c] font-extrabold"
                style={{ fontSize: 'clamp(8px, 1.3cqh, 11.5px)' }}
              >
                ILOILO, PH
              </span>
            </div>

            {/* Centerpiece Editorial Hook Statement */}
            <div className="flex flex-col items-center justify-center my-auto px-[2cqw]">
              <h1
                className="m-0 font-extrabold uppercase tracking-[0.06em] text-[#140c06] leading-[1.08]"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(20px, 4.9cqh, 44px)',
                  textShadow: '0 1px 1px rgba(20, 12, 6, 0.14)',
                }}
              >
                &ldquo;I don&rsquo;t just write code.
                <br />
                <span className="text-[#6e1b1b]">I build things that work.&rdquo;</span>
              </h1>

              <p
                className="m-0 mt-[1.5cqh] text-[#2b1d11]/90 font-semibold tracking-[0.04em] max-w-[54ch] leading-[1.45]"
                style={{ fontSize: 'clamp(9.5px, 1.72cqh, 15.5px)' }}
              >
                Designing and engineering end-to-end web platforms, mobile apps, and AI tools with clean interfaces and reliable architecture.
              </p>
            </div>

            {/* Subtle Hook Invitation / CTA Strip */}
            <div className="w-full pt-[0.9cqh] border-t border-[#2b1d10]/25 flex items-center justify-center gap-[2.5cqw] pointer-events-auto">
              <button
                type="button"
                onClick={() => onNavigate?.('works')}
                className="bg-transparent border-0 p-0 cursor-pointer uppercase tracking-[0.18em] font-extrabold text-[#6e1b1b] hover:text-[#9e2424] underline decoration-[#6e1b1b]/55 underline-offset-4 transition-colors"
                style={{ fontSize: 'clamp(8.5px, 1.45cqh, 13px)' }}
              >
                Explore Selected Works →
              </button>
              <span aria-hidden="true" className="text-[#5c432b]/70">·</span>
              <button
                type="button"
                onClick={() => onNavigate?.('about')}
                className="bg-transparent border-0 p-0 cursor-pointer uppercase tracking-[0.18em] font-extrabold text-[#23170d] hover:text-[#6e1b1b] underline decoration-[#2b1d10]/45 underline-offset-4 transition-colors"
                style={{ fontSize: 'clamp(8.5px, 1.45cqh, 13px)' }}
              >
                Open Dossier
              </button>
              <span aria-hidden="true" className="text-[#5c432b]/70">·</span>
              <button
                type="button"
                onClick={() => onNavigate?.('contact')}
                className="bg-transparent border-0 p-0 cursor-pointer uppercase tracking-[0.18em] font-extrabold text-[#23170d] hover:text-[#6e1b1b] underline decoration-[#2b1d10]/45 underline-offset-4 transition-colors"
                style={{ fontSize: 'clamp(8.5px, 1.45cqh, 13px)' }}
              >
                Dispatch Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
