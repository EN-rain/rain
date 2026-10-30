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
  { number: '02', name: 'CONTACTS' },
] as const;

type DirectTransitionHandler = (detail: SectionTransitionEventDetail, now: number) => void;
let directHandler: DirectTransitionHandler | null = null;
let activeRafId: number | null = null;

/**
 * Drives the GitHub repo WebGL 2 section-to-section transition shader and HUD title
 * between Page 1 (01 // HOME) and Page 2 (02 // WORKS) in a single unified RAF loop.
 */
export function triggerSectionTransition(
  fromPage: 1 | 2,
  toPage: 1 | 2,
  onMidpointSwap: () => void,
  onFinish?: () => void
) {
  if (fromPage === toPage) {
    onMidpointSwap();
    onFinish?.();
    return;
  }

  if (activeRafId !== null) {
    window.cancelAnimationFrame(activeRafId);
    activeRafId = null;
  }

  const fromIndex = fromPage === 1 ? 0 : 1;
  const toIndex = toPage === 1 ? 0 : 1;
  const direction: 1 | -1 = toIndex > fromIndex ? 1 : -1;
  const duration = 760;
  const startTime = performance.now();
  let swapped = false;

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);

    if (progress >= 0.48 && !swapped) {
      swapped = true;
      onMidpointSwap();
    }

    const detail: SectionTransitionEventDetail = {
      active: progress < 1,
      fromIndex,
      toIndex,
      progress,
      direction,
    };

    if (directHandler) {
      directHandler(detail, now);
    } else {
      window.dispatchEvent(new CustomEvent('section-scroll-transition', { detail }));
    }

    if (progress < 1) {
      activeRafId = window.requestAnimationFrame(step);
    } else {
      activeRafId = null;
      const doneDetail: SectionTransitionEventDetail = {
        active: false,
        fromIndex,
        toIndex,
        progress: 1,
        direction,
      };
      if (directHandler) {
        directHandler(doneDetail, now);
      } else {
        window.dispatchEvent(new CustomEvent('section-scroll-transition', { detail: doneDetail }));
      }
      onFinish?.();
    }
  };

  activeRafId = window.requestAnimationFrame(step);
}

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
    const startTime = performance.now();
    let lastToIndex = -1;

    createSectionScrollRenderer(canvas)
      .then((instance) => {
        if (disposed) {
          instance.dispose();
          return;
        }
        renderer = instance;
      })
      .catch(() => {
        // Fallback if WebGL 2 is unavailable
      });

    const renderTransitionFrame = (state: SectionTransitionEventDetail, now: number) => {
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

      if (titleRef.current && numberRef.current && nameRef.current) {
        const targetIndex = state.toIndex;
        if (targetIndex !== lastToIndex) {
          lastToIndex = targetIndex;
          const meta = SECTION_META[targetIndex] ?? SECTION_META[0];
          numberRef.current.textContent = `// ${meta.number}`;
          nameRef.current.textContent = meta.name;
        }

        const titleBell = Math.sin(Math.max(0, Math.min(1, state.progress)) * Math.PI);
        const titleOpacity = Math.pow(titleBell, 1.35);
        const liftY = (1 - titleBell) * 28 * state.direction;
        titleRef.current.style.opacity = `${titleOpacity.toFixed(3)}`;
        titleRef.current.style.transform = `translate3d(0, ${liftY.toFixed(1)}px, 0)`;
      }
    };

    directHandler = renderTransitionFrame;

    const handleTransitionEvent = (event: Event) => {
      const detail = (event as CustomEvent<SectionTransitionEventDetail>).detail;
      if (!detail) return;
      renderTransitionFrame(detail, performance.now());
    };

    const handleResize = () => {
      renderer?.resize();
    };

    window.addEventListener('section-scroll-transition', handleTransitionEvent);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      disposed = true;
      if (directHandler === renderTransitionFrame) {
        directHandler = null;
      }
      window.removeEventListener('section-scroll-transition', handleTransitionEvent);
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="section-scroll-transition"
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
