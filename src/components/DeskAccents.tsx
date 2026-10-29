import React from 'react';
import { DeskAccentsProps } from '../types';

export const DeskAccents: React.FC<DeskAccentsProps> = ({
  assetsPath,
  photoBundleRef,
  photoRef,
  portraitRef,
  magnifierRef,
  glassReflectionRef,
}) => {
  return (
    <div
      ref={photoBundleRef}
      className="absolute inset-0 z-[25] will-change-transform pointer-events-none"
    >
      {/* Evidence photograph (Note 1 - larger size, visible under magnifying glass) */}
      <img
        ref={photoRef}
        src={`${assetsPath}/building-photo.png`}
        alt="Detective evidence photograph"
        className="absolute left-[calc(970*100%/1376)] top-[calc(480*100%/768)] w-[calc(410*100%/1376)] h-[calc(342*100%/768)] z-[7] object-contain saturate-[0.55] contrast-[0.65] brightness-[1.18] will-change-transform select-none"
      />

      {/* Suspect / subject portrait card (Note 2 - larger size, shifted to the right) */}
      <img
        ref={portraitRef}
        src={`${assetsPath}/portrait-card.png`}
        alt="Detective case portrait card"
        className="absolute left-[calc(1085*100%/1376)] top-[calc(415*100%/768)] w-[calc(330*100%/1376)] h-[calc(393*100%/768)] z-[8] object-contain saturate-[0.8] contrast-[0.66] brightness-[1.04] will-change-transform select-none"
      />

      {/* Lens reflection layer kept invisible to prevent ghost bubble displacement */}
      <div
        ref={glassReflectionRef}
        className="hidden pointer-events-none"
        aria-hidden="true"
      />

      {/* Magnifying glass (exact 1.5 aspect ratio, no scale distortion) */}
      <img
        ref={magnifierRef}
        src={`${assetsPath}/magnifying-glass.png`}
        alt="Detective brass magnifying glass"
        className="absolute left-[calc(946*100%/1376)] top-[calc(530*100%/768)] w-[calc(570*100%/1376)] h-[calc(380*100%/768)] z-[10] object-contain contrast-[1.05] brightness-[1.05] will-change-transform select-none"
      />
    </div>
  );
};
