import React, { useState, useEffect, useCallback } from 'react';
import { VintageStationery } from './components/VintageStationery';
import { LoadingScreen } from './components/LoadingScreen';
import { SectionScrollTransition } from './components/SectionScrollTransition';
import mudNormalUrl from './assets/images/mud_normal.jpg';
import texNoiseUrl from './assets/images/tex_noise.jpg';
import './styles/vintage-stationery.css';

// Complete ahead-of-time manifest of all high-res assets across Page 1, Page 1.5, Page 2 Scrapbook & Projects
const ALL_AHEAD_OF_TIME_ASSETS = [
  // Page 1: Vintage Stationery Desk & Envelope
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

  // Page 1.5: Assembled Dossier Spread & Forensic Cards
  '/assets/page-one-half/01-backing.png',
  '/assets/page-one-half/02-spread.png',
  '/assets/page-one-half/03-large-card.png',
  '/assets/page-one-half/04-black-card-square.png',
  '/assets/page-one-half/05-small-card.png',
  '/assets/page-one-half/06-paper.png',

  // Page 2: Detective Scrapbook Board, Props & Hardware
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

  // Projects & Case Archive Evidence
  '/assets/projects/studentflow.png',
  '/assets/projects/studentflow-logo.png',
  '/assets/projects/pockettrade.png',
  '/assets/projects/chemquest.png',
  '/assets/projects/typeduel-bg.png',
  '/assets/projects/typeduel-logo.png',
  '/assets/projects/tsukiai.png',
  '/assets/projects/auvrynt.png',

  // Fantasy Clipboard Assets
  '/assets/clipboard/clipboard-board.png',
  '/assets/clipboard/bottom-paper.png',
  '/assets/clipboard/middle-paper.png',
  '/assets/clipboard/front-paper.png',
  '/assets/clipboard/transparent-photo-frame.png',
  '/assets/clipboard/small-note.png',
  '/assets/clipboard/clipboard-clip.png',

  // WebGL 2 Shaders & Noise Textures
  mudNormalUrl,
  texNoiseUrl,
];

// Pin decoded images in memory so the browser compositor never evicts bitmaps during transitions
const pinnedDecodedImages: HTMLImageElement[] = [];

const preloadImage = (url: string): Promise<void> =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    const onDone = () => {
      pinnedDecodedImages.push(img);
      if (img.decode) {
        img.decode().then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };
    img.onload = onDone;
    img.onerror = () => resolve();
    img.src = url;
    setTimeout(resolve, 8000);
  });

const preloadFonts = (): Promise<void> => {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load('600 48px "Sora"'),
    document.fonts.load('500 12px "IBM Plex Mono"'),
    document.fonts.load('400 16px "Space Grotesk"'),
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

  // Preload and pre-decode all assets ahead of time
  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    const total = ALL_AHEAD_OF_TIME_ASSETS.length + 1; // assets + fonts

    const updateStatus = (currentPct: number, url?: string) => {
      if (cancelled) return;
      if (currentPct < 25) {
        setLoadingStatus('INDEXING DOSSIER EVIDENCE...');
      } else if (currentPct < 55) {
        const name = url ? url.split('/').pop()?.split('?')[0] : '';
        setLoadingStatus(`DECODING ARCHIVES // ${name || 'STATIONERY'}`);
      } else if (currentPct < 85) {
        setLoadingStatus('CALIBRATING SCRAPBOOK CASE BOARD...');
      } else if (currentPct < 100) {
        setLoadingStatus('SYNCHRONIZING SYSTEM FONTS & SHADERS...');
      } else {
        setLoadingStatus('CASE FILE READY // COMMENCING REVEAL');
      }
    };

    const assetTasks = ALL_AHEAD_OF_TIME_ASSETS.map((url) =>
      preloadImage(url).then(() => {
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

    Promise.all([...assetTasks, fontTask]).then(() => {
      if (!cancelled) {
        setLoadingProgress(100);
        setLoadingStatus('CASE FILE READY // COMMENCING REVEAL');
        setIsLoaded(true);
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
