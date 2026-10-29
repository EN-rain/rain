import React from 'react';

interface FolderEnvelopeProps {
  assetsPath: string;
  isFront?: boolean;
}

export const FolderEnvelope: React.FC<FolderEnvelopeProps> = ({ assetsPath, isFront = false }) => {
  if (isFront) {
    return (
      <img
        src={`${assetsPath}/folder-front.png?v=3`}
        alt="Manila folder front pocket"
        className="absolute left-[calc(4*100%/1376)] top-[calc(395*100%/768)] w-[calc(1370*100%/1376)] h-[calc(867*100%/768)] z-[5] pointer-events-none select-none"
      />
    );
  }

  return (
    <img
      src={`${assetsPath}/folder-back.png?v=3`}
      alt="Manila folder back flap"
      className="absolute left-[calc(4*100%/1376)] top-[calc(327*100%/768)] w-[calc(1370*100%/1376)] h-[calc(867*100%/768)] z-[1] pointer-events-none select-none"
    />
  );
};
