import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  createIntroRevealRenderer,
  type IntroRevealRenderer,
} from '../scene/IntroRevealRenderer';

type LoadingScreenProps = {
  progress: number;
  isComplete: boolean;
  onComplete: () => void;
};

export const LoadingScreen = ({ progress, isComplete, onComplete }: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<IntroRevealRenderer | null>(null);
  const rendererPromiseRef = useRef<Promise<IntroRevealRenderer | null> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    const initPromise = createIntroRevealRenderer(canvas)
      .then((renderer) => {
        if (disposed) {
          renderer.dispose();
          return null;
        }
        rendererRef.current = renderer;
        renderer.draw(0, 0);
        return renderer;
      })
      .catch(() => null);

    rendererPromiseRef.current = initPromise;

    const handleResize = () => {
      rendererRef.current?.resize();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isComplete) return;

    let cancelled = false;
    let rafId: number | null = null;
    let tween: gsap.core.Timeline | null = null;

    const startReveal = async () => {
      const renderer =
        rendererRef.current ?? (await rendererPromiseRef.current) ?? null;
      if (cancelled) return;

      const container = containerRef.current;
      const ui = uiRef.current;
      const homeEl = document.querySelector<HTMLElement>('#home .home-section');

      // Fallback if WebGL2 is unavailable
      if (!renderer) {
        tween = gsap.timeline({
          onComplete: () => {
            if (!cancelled) onComplete();
          },
        });
        if (ui) {
          tween.to(ui, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0);
        }
        if (container) {
          tween.to(container, { opacity: 0, duration: 0.75, ease: 'power2.inOut' }, 0.15);
        }
        return;
      }

      const state = { progress: 0 };
      let shaderTime = 0;

      const tick = () => {
        if (cancelled) return;
        shaderTime += 0.01;
        renderer.draw(state.progress, shaderTime);
        if (state.progress < 1) {
          rafId = window.requestAnimationFrame(tick);
        }
      };

      // Switch container background to transparent so the premultiplied-alpha
      // WebGL canvas controls the reveal from white (#ffffff) over the live HomeSection
      if (container) {
        container.style.background = 'transparent';
        container.style.pointerEvents = 'none';
      }

      if (homeEl) {
        gsap.set(homeEl, { scale: 1.12, transformOrigin: 'center center' });
      }

      rafId = window.requestAnimationFrame(tick);

      tween = gsap.timeline({
        onComplete: () => {
          if (rafId !== null) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
          if (homeEl) {
            gsap.set(homeEl, { clearProps: 'scale,transformOrigin' });
          }
          if (!cancelled) {
            onComplete();
          }
        },
      });

      if (ui) {
        tween.to(
          ui,
          {
            opacity: 0,
            scale: 0.96,
            duration: 0.24,
            ease: 'power2.out',
          },
          0
        );
      }

      tween.to(
        state,
        {
          progress: 1,
          duration: 1.65,
          ease: 'none',
        },
        0.06
      );

      if (homeEl) {
        tween.to(
          homeEl,
          {
            scale: 1,
            duration: 1.65,
            ease: 'power2.out',
          },
          0.06
        );
      }
    };

    const timer = window.setTimeout(() => {
      void startReveal();
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      tween?.kill();
    };
  }, [isComplete, onComplete]);

  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      ref={containerRef}
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: '#ffffff',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      <div
        ref={uiRef}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          padding: '0 20px',
        }}
      >
        <h1
          className="heading-font"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            letterSpacing: '0.3em',
            marginBottom: '2rem',
            color: '#0a0a0a',
          }}
        >
          LOADING
        </h1>

        <div
          style={{
            width: '100%',
            height: '2px',
            background: 'rgba(0, 0, 0, 0.12)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: `${safeProgress}%`,
              height: '100%',
              background: '#0a0a0a',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.18)',
            }}
          />
        </div>

        <div
          className="tech-font"
          style={{
            fontSize: '12px',
            letterSpacing: '0.2em',
            color: '#0a0a0a',
            opacity: 0.65,
          }}
        >
          {Math.floor(safeProgress)}%
        </div>
      </div>
    </div>
  );
};
