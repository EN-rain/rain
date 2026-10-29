import React, { useState, useEffect, useCallback } from 'react';
import { VintageStationery } from './components/VintageStationery';
import { LoadingScreen } from './components/LoadingScreen';
import { SectionScrollTransition } from './components/SectionScrollTransition';
import './styles/vintage-stationery.css';

// Tier 1: Critical assets needed immediately for Page 1 & Page 1.5
const CRITICAL_PRELOAD_ASSETS = [
  '/assets/folder-back.png',
  '/assets/folder-front.png',
  '/assets/paper-sheet-1.png',
  '/assets/paper-sheet-2.png',
  '/assets/paper-sheet-3.png',
  '/assets/label-tab.png',
  '/assets/magnifying-glass.png',
  '/assets/building-photo.png',
  '/assets/portrait-card.png',
  '/assets/dark-backing.png',
  '/assets/page-one-half/01-backing.png',
  '/assets/page-one-half/02-spread.png',
  '/assets/page-one-half/03-large-card.png',
  '/assets/page-one-half/04-black-card-square.png',
  '/assets/page-one-half/05-small-card.png',
  '/assets/page-one-half/06-paper.png',
];

// Tier 2: Deferred assets preloaded in background for Page 2 Scrapbook
const DEFERRED_PRELOAD_ASSETS = [
  '/assets/scrapbook/board-standalone.png',
  '/assets/scrapbook/wall-extension.png',
  '/assets/scrapbook/note-illustrated.png?v=7',
  '/assets/scrapbook/photo-card-illustrated.png',
  '/assets/scrapbook/dossier-card-clean.png',
  '/assets/scrapbook/case-folder-open.png',
  '/assets/scrapbook/pin-red-3d.png',
  '/assets/scrapbook/tape-1.png',
  '/assets/scrapbook/tape-2.png',
  '/assets/scrapbook/tape-3.png',
  '/assets/scrapbook/wall-lamp-on.png',
  '/assets/scrapbook/wall-lamp-off.png',
  '/assets/scrapbook/wall-clock.png',
  '/assets/scrapbook/wall-keys.png',
  '/assets/projects/studentflow.png',
  '/assets/projects/studentflow-logo.png',
  '/assets/projects/pockettrade.png',
  '/assets/projects/chemquest.png',
  '/assets/projects/typeduel-bg.png',
  '/assets/projects/typeduel-logo.png',
  '/assets/projects/tsukiai.png',
  '/assets/projects/auvrynt.png',
];

// Pin decoded images in memory so the browser compositor never evicts bitmaps during transitions
const pinnedDecodedImages: HTMLImageElement[] = [];

const preloadImage = (url: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      pinnedDecodedImages.push(img);
      if (img.decode) {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = url;
    setTimeout(resolve, 3000);
  });

export default function App() {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Preload Tier 1 Critical Assets to unblock LoadingScreen fast
  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    const total = CRITICAL_PRELOAD_ASSETS.length;

    const tasks = CRITICAL_PRELOAD_ASSETS.map((url) =>
      preloadImage(url).then(() => {
        if (!cancelled) {
          completed += 1;
          setLoadingProgress(Math.round((completed / total) * 100));
        }
      })
    );

    Promise.all(tasks).then(() => {
      if (!cancelled) {
        setLoadingProgress(100);
        setIsLoaded(true);

        // Pre-decode Tier 2 Scrapbook assets into memory during idle
        const idleCallback = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));
        idleCallback(() => {
          DEFERRED_PRELOAD_ASSETS.forEach(preloadImage);
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRevealStart = useCallback(() => {
    setRevealStarted(true);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#151715] flex items-center justify-center select-none">
      {/* Retained stylized Canvas/GSAP Loading Screen */}
      {showLoading && (
        <LoadingScreen
          progress={loadingProgress}
          isComplete={isLoaded}
          onRevealStart={handleRevealStart}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* GitHub repo WebGL 2 Section-to-Section Transition Overlay (Page 1 <-> Page 2) */}
      <SectionScrollTransition />

      {/* Primary Scene: Home (Page 1 folder + scattered papers / assembled Page 1.5) & Works (Page 2 ScrapbookBoard) */}
      <div id="home" className="w-full h-full">
        <div className="home-section w-full h-full flex items-center justify-center">
          <VintageStationery
            assetsPath="/assets"
            autoPlay={revealStarted || !showLoading}
            page={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
