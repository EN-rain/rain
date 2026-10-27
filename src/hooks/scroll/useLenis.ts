import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import type { LenisInstance } from './types';

export const useLenis = () => {
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Initialize Lenis directly from npm package
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 2,
      lerp: 0.08,
    } as any) as unknown as LenisInstance;

    lenisRef.current = lenis;

    // Optimized RAF loop
    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };
    rafIdRef.current = requestAnimationFrame(raf);

    // Handle custom scroll events from navigation
    const handleLenisScroll = (e: Event) => {
      const detail = (e as CustomEvent<number | string | { target: number | string; immediate?: boolean }>).detail;
      if (typeof detail === 'object' && detail !== null && 'target' in detail) {
        lenis.scrollTo(detail.target as any, { immediate: detail.immediate ?? false });
      } else {
        const target = typeof detail === 'string' ? detail : (detail as number);
        lenis.scrollTo(target as any);
      }
    };
    window.addEventListener('lenis-scroll', handleLenisScroll as EventListener);
    (lenis as any)._customHandler = handleLenisScroll;

    // Pause/resume Lenis (used when project overlay is open)
    const handleStop = () => lenis.stop();
    const handleStart = () => lenis.start();
    window.addEventListener('lenis-stop', handleStop);
    window.addEventListener('lenis-start', handleStart);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('lenis-scroll', handleLenisScroll as EventListener);
      window.removeEventListener('lenis-stop', handleStop);
      window.removeEventListener('lenis-start', handleStart);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
};
