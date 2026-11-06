import React, { useState, useEffect } from 'react';

interface FolderEnvelopeProps {
  assetsPath: string;
  isFront?: boolean;
}

// Separate Desktop and Mobile envelope positioning (zero distortion: aspect 1133/1388)
const DESKTOP_ENVELOPE_CONFIG = {
  frontTop: '18%',
  backTop: '2%',
};

const MOBILE_ENVELOPE_CONFIG = {
  frontTop: '17%',
  backTop: '2%',
};

export const FolderEnvelope: React.FC<FolderEnvelopeProps> = ({ assetsPath, isFront = false }) => {
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

  const config = isMobile ? MOBILE_ENVELOPE_CONFIG : DESKTOP_ENVELOPE_CONFIG;

  if (isFront) {
    return (
      <img
        src={`${assetsPath}/folder-front.png`}
        alt="Manila folder front pocket"
        className="absolute left-[calc(4*100%/1376)] w-[calc(1370*100%/1376)] h-auto aspect-[1133/1388] object-contain z-[5] pointer-events-none select-none"
        style={{ top: config.frontTop }}
      />
    );
  }

  return (
    <img
      src={`${assetsPath}/folder-back.png`}
      alt="Manila folder back flap"
      className="absolute left-[calc(4*100%/1376)] w-[calc(1370*100%/1376)] h-auto aspect-[1133/1388] object-contain z-[1] pointer-events-none select-none"
      style={{ top: config.backTop }}
    />
  );
};
