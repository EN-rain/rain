import { useEffect, useRef } from 'react';

interface GlitchTextProps {
  children: string;
  className?: string;
}

export const GlitchText = ({ children, className = '' }: GlitchTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        textRef.current?.classList.add('glitch-active');
        setTimeout(() => {
          textRef.current?.classList.remove('glitch-active');
        }, 100);
      }
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div ref={textRef} className={`glitch-text ${className}`} data-text={children}>
      {children}
      <style>{`
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        
        .glitch-text.glitch-active::before,
        .glitch-text.glitch-active::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text.glitch-active::before {
          left: 2px;
          text-shadow: -2px 0 #ff00de;
          clip: rect(24px, 550px, 90px, 0);
          animation: glitch-anim-2 0.3s infinite linear alternate-reverse;
        }
        
        .glitch-text.glitch-active::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9;
          clip: rect(85px, 550px, 140px, 0);
          animation: glitch-anim 0.3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim {
          0% { clip: rect(61px, 9999px, 90px, 0); }
          20% { clip: rect(35px, 9999px, 71px, 0); }
          40% { clip: rect(23px, 9999px, 29px, 0); }
          60% { clip: rect(95px, 9999px, 53px, 0); }
          80% { clip: rect(17px, 9999px, 99px, 0); }
          100% { clip: rect(72px, 9999px, 14px, 0); }
        }
        
        @keyframes glitch-anim-2 {
          0% { clip: rect(86px, 9999px, 28px, 0); }
          20% { clip: rect(44px, 9999px, 81px, 0); }
          40% { clip: rect(12px, 9999px, 67px, 0); }
          60% { clip: rect(91px, 9999px, 39px, 0); }
          80% { clip: rect(58px, 9999px, 73px, 0); }
          100% { clip: rect(21px, 9999px, 95px, 0); }
        }
      `}</style>
    </div>
  );
};
