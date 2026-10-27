import { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // in ms
  isDegraded: boolean;
  qualityScale: number; // 0.25 to 1.0
  particleMultiplier: number; // 0.35 to 1.0 (scales down when FPS < 60)
  blurMultiplier: number; // 1.0 to 1.4 (slight increase when FPS < 60 to maintain smooth scrolling)
  blurIntensity: number; // Alias for blurMultiplier
  particleCount: number; // Standard particle count baseline (e.g. 100% = 1.0)
  dprScale: number; // 0.75 to 1.0
  tier: 'high' | 'medium' | 'low';
  isScrolling: boolean;
}

export type WebGLPerformanceMetrics = PerformanceMetrics;

const DEFAULT_METRICS: PerformanceMetrics = {
  fps: 60,
  frameTime: 16.67,
  isDegraded: false,
  qualityScale: 1.0,
  particleMultiplier: 1.0,
  blurMultiplier: 1.0,
  blurIntensity: 1.0,
  particleCount: 1.0,
  dprScale: 1.0,
  tier: 'high',
  isScrolling: false,
};

/**
 * Singleton WebGL Performance Tracker that monitors the render loop frame rate.
 * If the FPS drops below 60 during scroll, it implements a dynamic reduction in
 * particle count (scaling down towards 0.35) and a slight increase in post-processing
 * blur intensity (scaling up to ~1.35) to soften visual fidelity and maintain smooth 60fps scrolling.
 */
class PerformanceMonitor {
  private lastTime = performance.now();
  private frameTimes: number[] = [];
  private maxSamples = 24;
  private isScrolling = false;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentMetrics: PerformanceMetrics = { ...DEFAULT_METRICS };
  private listeners = new Set<(metrics: PerformanceMetrics) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      const onScroll = () => {
        this.isScrolling = true;
        this.currentMetrics.isScrolling = true;
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.isScrolling = false;
          this.currentMetrics.isScrolling = false;
        }, 300);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', onScroll, { passive: true });
      window.addEventListener('touchmove', onScroll, { passive: true });
      window.addEventListener('works-timeline-scroll', onScroll as EventListener);
    }
  }

  public recordFrame(now = performance.now()): PerformanceMetrics {
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Filter anomalous frame times (e.g. tab switches, debugger pauses)
    if (delta > 0 && delta < 250) {
      this.frameTimes.push(delta);
      if (this.frameTimes.length > this.maxSamples) {
        this.frameTimes.shift();
      }
    }

    if (this.frameTimes.length >= 8) {
      const avgFrameTime =
        this.frameTimes.reduce((acc, val) => acc + val, 0) / this.frameTimes.length;
      const rawFps = 1000 / Math.max(1, avgFrameTime);
      const fps = Math.min(60, Math.round(rawFps));

      // Degraded state activates when frame rate falls below 60 during scroll
      // (threshold at 57.5fps to prevent rapid flapping)
      const isDegraded = this.isScrolling && fps < 57.5;

      let targetQuality = 1.0;
      let tier: 'high' | 'medium' | 'low' = 'high';

      if (fps >= 58) {
        targetQuality = 1.0;
        tier = 'high';
      } else if (fps >= 45) {
        targetQuality = 0.65;
        tier = 'medium';
      } else {
        targetQuality = 0.35;
        tier = 'low';
      }

      // Smooth adaptation to avoid visual jarring
      const lerpSpeed = isDegraded ? 0.15 : 0.05;
      const currentQ = this.currentMetrics.qualityScale;
      const newQ = currentQ + (targetQuality - currentQ) * lerpSpeed;

      // Dynamic reduction in particle count when FPS drops below 60
      const particleMultiplier = Math.max(0.35, Math.min(1.0, 0.3 + 0.7 * newQ));

      // Slight increase in post-processing blur intensity when FPS drops below 60
      // (e.g. 1.0 at 60fps -> up to 1.35 at degraded fps to mask lower geometric detail)
      const blurMultiplier = Math.max(1.0, Math.min(1.4, 1.0 + (1.0 - newQ) * 0.38));
      const blurIntensity = blurMultiplier;
      const dprScale = tier === 'low' ? 0.75 : tier === 'medium' ? 0.9 : 1.0;

      this.currentMetrics = {
        fps,
        frameTime: avgFrameTime,
        isDegraded,
        qualityScale: newQ,
        particleMultiplier,
        blurMultiplier,
        blurIntensity,
        particleCount: particleMultiplier,
        dprScale,
        tier,
        isScrolling: this.isScrolling,
      };

      // Broadcast event for decoupled WebGL canvases
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('webgl-performance-adapt', { detail: this.currentMetrics })
        );
      }

      this.listeners.forEach((cb) => cb(this.currentMetrics));
    }

    return this.currentMetrics;
  }

  public getMetrics(): PerformanceMetrics {
    return this.currentMetrics;
  }

  public subscribe(cb: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export const performanceMonitor = new PerformanceMonitor();
export const webglPerformanceTracker = performanceMonitor;

/**
 * Dedicated React hook that tracks the frame rate of the WebGL rendering loop.
 * If the FPS drops below 60 during scroll, it exposes reduced particle count
 * and slightly increased post-processing blur intensity.
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => performanceMonitor.getMetrics());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((latest) => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          setMetrics({ ...latest });
          rafRef.current = null;
        });
      }
    });

    return () => {
      unsubscribe();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const recordFrame = useCallback((now?: number) => {
    return performanceMonitor.recordFrame(now);
  }, []);

  return {
    ...metrics,
    recordFrame,
  };
};

export const useWebGLPerformanceMonitor = usePerformanceMonitor;
