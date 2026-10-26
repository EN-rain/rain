import { useEffect } from 'react';
import gsap from 'gsap';

type LoadingScreenProps = {
  progress: number;
  isComplete: boolean;
  onComplete: () => void;
};

export const LoadingScreen = ({ progress, isComplete, onComplete }: LoadingScreenProps) => {
  useEffect(() => {
    if (!isComplete) return;

    const fadeTimer = window.setTimeout(() => {
      gsap.to('.loading-screen', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete
      });
    }, 300);

    return () => window.clearTimeout(fadeTimer);
  }, [isComplete, onComplete]);

  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: '#000',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 20px' }}>
        <h1
          className="heading-font"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            letterSpacing: '0.3em',
            marginBottom: '2rem',
            color: '#fff'
          }}
        >
          LOADING
        </h1>

        <div
          style={{
            width: '100%',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              width: `${safeProgress}%`,
              height: '100%',
              background: '#fff',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
            }}
          />
        </div>

        <div
          className="tech-font"
          style={{
            fontSize: '12px',
            letterSpacing: '0.2em',
            opacity: 0.6
          }}
        >
          {Math.floor(safeProgress)}%
        </div>
      </div>
    </div>
  );
};
