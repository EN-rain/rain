import React from 'react';
import { PaperStackProps } from '../types';

export const PaperStack: React.FC<PaperStackProps> = ({
  assetsPath,
  paperBundleRef,
  sheetOneRef,
  sheetTwoRef,
  sheetThreeRef,
  children,
}) => {
  return (
    <div
      ref={paperBundleRef}
      className="absolute inset-0 z-[3] will-change-transform pointer-events-none"
    >
      {/* Sheet 3 (Back) - Fanned out to the left */}
      <img
        ref={sheetThreeRef}
        src={`${assetsPath}/paper-sheet-3.png`}
        alt="Back parchment sheet"
        className="absolute left-[calc(89*100%/1376)] top-0 w-[calc(1205*100%/1376)] h-[calc(794*100%/768)] z-[2] origin-bottom-center will-change-transform select-none"
      />

      {/* Sheet 2 (Middle) - Fanned out to the right */}
      <img
        ref={sheetTwoRef}
        src={`${assetsPath}/paper-sheet-2.png`}
        alt="Middle parchment sheet"
        className="absolute left-[calc(89*100%/1376)] top-0 w-[calc(1205*100%/1376)] h-[calc(794*100%/768)] z-[4] origin-bottom-center will-change-transform select-none"
      />

      {/* Interleaved interactive bookmark tabs */}
      {children}

      {/* Sheet 1 (Front) - Evidentiary document centered */}
      <img
        ref={sheetOneRef}
        src={`${assetsPath}/paper-sheet-1.png`}
        alt="Main stationery evidentiary document"
        className="absolute left-[calc(89*100%/1376)] top-0 w-[calc(1205*100%/1376)] h-[calc(794*100%/768)] z-[6] origin-bottom-center will-change-transform select-none"
      />
    </div>
  );
};
