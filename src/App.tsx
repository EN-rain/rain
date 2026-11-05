import React, { useState, useEffect, useCallback } from 'react';
import { VintageStationery } from './components/VintageStationery';
import { LoadingScreen } from './components/LoadingScreen';
import { SectionScrollTransition } from './components/SectionScrollTransition';
import mudNormalUrl from './assets/images/mud_normal.jpg';
import texNoiseUrl from './assets/images/tex_noise.jpg';
import './styles/vintage-stationery.css';

// Critical assets required immediately for Page 1 Initial View & WebGL Reveal
const CRITICAL_PAGE1_ASSETS = [
  mudNormalUrl,
  texNoiseUrl,
  '/assets/white-page-bg.png',
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
  '/assets/edrian-hero.png',
  '/assets/edrian-about.png',
  '/assets/edrian-portrait-new.png',
  '/assets/clipboard/clipboard-board.png',
  '/assets/clipboard/front-paper.png',
  '/assets/clipboard/clipboard-clip.png',
];

// Subsequent assets preloaded asynchronously in background without blocking initial reveal
const DEFERRED_BACKGROUND_ASSETS = [
  '/assets/page-one-half/01-backing.png',
  '/assets/page-one-half/02-spread.png',
  '/assets/page-one-half/03-large-card.png',
  '/assets/page-one-half/04-black-card-square.png',
  '/assets/page-one-half/06-paper.png',
  '/assets/scrapbook/board-standalone.png',
  '/assets/scrapbook/wall-extension.png',
  '/assets/scrapbook/note-illustrated.png',
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
  '/assets/clipboard/bottom-paper.png',
  '/assets/clipboard/middle-paper.png',
  '/assets/clipboard/transparent-photo-frame.png',
  '/assets/clipboard/small-note.png',
];

// Pin decoded images in memory so the browser compositor never evicts bitmaps during transitions
const pinnedDecodedImages: HTMLImageElement[] = [];

const preloadImage = (url: string, timeoutMs = 4000): Promise<void> =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      pinnedDecodedImages.push(img);
      resolve();
    };
    img.onload = () => {
      if (img.decode) {
        img.decode().then(finish).catch(finish);
      } else {
        finish();
      }
    };
    img.onerror = finish;
    img.src = url;
    setTimeout(finish, timeoutMs);
  });

const preloadFonts = (): Promise<void> => {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load('700 48px "Cinzel"'),
    document.fonts.load('600 48px "Sora"'),
    document.fonts.load('500 12px "IBM Plex Mono"'),
    document.fonts.ready,
  ])
    .then(() => undefined)
    .catch(() => undefined);
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('INDEXING EVIDENCE REPOSITORY...');
  const [isLoaded, setIsLoaded] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Preload critical assets ahead of time for fast loading, then preload remaining in background
  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    const total = CRITICAL_PAGE1_ASSETS.length + 1; // critical assets + fonts

    const updateStatus = (currentPct: number, url?: string) => {
      if (cancelled) return;
      if (currentPct < 30) {
        setLoadingStatus('INDEXING DOSSIER EVIDENCE...');
      } else if (currentPct < 70) {
        const name = url ? url.split('/').pop()?.split('?')[0] : '';
        setLoadingStatus(`DECODING ARCHIVES // ${name || 'STATIONERY'}`);
      } else if (currentPct < 100) {
        setLoadingStatus('CALIBRATING SCRAPBOOK CASE BOARD...');
      } else {
        setLoadingStatus('CASE FILE READY // COMMENCING REVEAL');
      }
    };

    const criticalTasks = CRITICAL_PAGE1_ASSETS.map((url) =>
      preloadImage(url, 3000).then(() => {
        if (!cancelled) {
          completed += 1;
          const pct = Math.min(100, Math.round((completed / total) * 100));
          setLoadingProgress(pct);
          updateStatus(pct, url);
        }
      })
    );

    const fontTask = preloadFonts().then(() => {
      if (!cancelled) {
        completed += 1;
        const pct = Math.min(100, Math.round((completed / total) * 100));
        setLoadingProgress(pct);
      }
    });

    Promise.all([...criticalTasks, fontTask]).then(() => {
      if (!cancelled) {
        setLoadingProgress(100);
        setLoadingStatus('CASE FILE READY // COMMENCING REVEAL');
        setIsLoaded(true);

        // Preload deferred assets smoothly in background
        const backgroundLoad = () => {
          let idx = 0;
          const loadNext = () => {
            if (idx >= DEFERRED_BACKGROUND_ASSETS.length) return;
            const url = DEFERRED_BACKGROUND_ASSETS[idx++];
            preloadImage(url, 5000).then(loadNext).catch(loadNext);
          };
          // Run 3 parallel background preload workers
          loadNext();
          loadNext();
          loadNext();
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(backgroundLoad);
        } else {
          setTimeout(backgroundLoad, 800);
        }
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
          statusText={loadingStatus}
          isComplete={isLoaded}
          onRevealStart={handleRevealStart}
          onComplete={handleLoadingComplete}
        />
      )}

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

      {/* GitHub repo WebGL 2 Section-to-Section Transition Overlay (Page 1 <-> Page 2) */}
      <SectionScrollTransition />
    </div>
  );
}

