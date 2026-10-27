import { useEffect, useRef, memo } from 'react';
import {
  createSectionScrollRenderer,
  type SectionScrollRenderer,
} from '../scene/SectionScrollRenderer';

export interface SectionTransitionEventDetail {
  active: boolean;
  fromIndex: number;
  toIndex: number;
  progress: number;
  direction: 1 | -1;
}

const SECTION_META = [
  { number: '01', name: 'HOME' },
  { number: '02', name: 'ABOUT' },
  { number: '03', name: 'WORKS' },
  { number: '04', name: 'CONTACT' },
] as const;

export const SectionScrollTransition = memo(() => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    let disposed = false;
    let renderer: SectionScrollRenderer | null = null;
    let rafId: number | null = null;
    const startTime = performance.now();

    let state: SectionTransitionEventDetail = {
      active: false,
      fromIndex: 0,
      toIndex: 1,
      progress: 0,
      direction: 1,
    };

    createSectionScrollRenderer(canvas)
      .then((instance) => {
        if (disposed) {
          instance.dispose();
          return;
        }
        renderer = instance;
        if (state.active) {
          scheduleFrame();
        }
      })
      .catch(() => {
        // Fallback if WebGL 2 is unavailable
      });

    const renderFrame = (now: number) => {
      rafId = null;
      if (disposed || !overlay) return;

      if (!state.active || state.progress <= 0.002 || state.progress >= 0.998) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        if (titleRef.current) {
          titleRef.current.style.opacity = '0';
        }
        return;
      }

      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';

      const elapsed = (now - startTime) * 0.0015;
      renderer?.draw(
        state.fromIndex,
        state.toIndex,
        state.progress,
        state.direction,
        elapsed
      );

      // Update Route Title HUD lift matching destination section
      if (titleRef.current && numberRef.current && nameRef.current) {
        const targetIndex = state.toIndex;
        const meta = SECTION_META[targetIndex] ?? SECTION_META[0];
        numberRef.current.textContent = `// ${meta.number}`;
        nameRef.current.textContent = meta.name;

        const titleBell = Math.sin(Math.max(0, Math.min(1, state.progress)) * Math.PI);
        const titleOpacity = Math.pow(titleBell, 1.35);
        const liftY = (1 - titleBell) * 28 * state.direction;
        titleRef.current.style.opacity = `${titleOpacity.toFixed(3)}`;
        titleRef.current.style.transform = `translate3d(0, ${liftY.toFixed(1)}px, 0)`;
      }

      // Keep animating time uniform while the transition wavefront is paused mid-scroll
      if (state.active && state.progress > 0.01 && state.progress < 0.99) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const scheduleFrame = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handleTransitionEvent = (event: Event) => {
      const detail = (event as CustomEvent<SectionTransitionEventDetail>).detail;
      if (!detail) return;
      state = detail;
      scheduleFrame();
    };

    const handleResize = () => {
      renderer?.resize();
      if (state.active) {
        scheduleFrame();
      }
    };

    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      window.removeEventListener('section-scroll-transition', handleTransitionEvent);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('portfolio-navigate', handleNavigation);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
    };

    const handleNavigation = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
      if (detail?.path && detail.path.startsWith('/projects')) {
        cleanup();
      }
    };

    window.addEventListener('section-scroll-transition', handleTransitionEvent);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('portfolio-navigate', handleNavigation);

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="section-scroll-transition mobile-hide"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 160,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0,
        visibility: 'hidden',
        willChange: 'opacity',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      <div
        ref={titleRef}
        style={{
          position: 'absolute',
          top: 'clamp(32px, 5.5vh, 68px)',
          left: 'clamp(28px, 5vw, 72px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          opacity: 0,
          transform: 'translate3d(0, -24px, 0)',
          willChange: 'transform, opacity',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            position: 'relative',
            width: 'max-content',
          }}
        >
          <span
            ref={numberRef}
            className="tech-font"
            style={{
              fontSize: 'clamp(12px, 1.05vw, 15px)',
              letterSpacing: '0.28em',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          />
          {/* Subtle horizontal baseline rule in pure white/monochrome */}
          <div
            style={{
              position: 'absolute',
              left: '100%',
              marginLeft: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 'min(420px, 45vw)',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.12) 60%, transparent)',
              pointerEvents: 'none',
            }}
          />
        </div>

        <span
          ref={nameRef}
          className="heading-font"
          style={{
            fontSize: 'clamp(2.5rem, 4.6vw, 4.25rem)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            lineHeight: 0.95,
            color: '#ffffff',
            textShadow: '0 4px 32px rgba(0, 0, 0, 0.75)',
            textTransform: 'uppercase',
          }}
        />
      </div>
    </div>
  );
});
