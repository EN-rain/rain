import React, { useState, useEffect, useCallback } from 'react';
import { VintageStationery } from './components/VintageStationery';
import { LoadingScreen } from './components/LoadingScreen';
import { SectionScrollTransition } from './components/SectionScrollTransition';
import mudNormalUrl from './assets/images/mud_normal.jpg';
import texNoiseUrl from './assets/images/tex_noise.jpg';
import './styles/vintage-stationery.css';

// Complete manifest of all high-resolution portfolio assets
const ALL_PORTFOLIO_ASSETS = [
  // WebGL 2 Shaders & Noise Textures for intro reveal
  mudNormalUrl,
  texNoiseUrl,

  // Page 1: Vintage Stationery Desk & Envelope
  '/assets/white-page-bg.png',
  '/assets/dark-backing.png',
  '/assets/folder-back.png',
  '/assets/folder-front.png',
  '/assets/paper-sheet-1.png',
  '/assets/paper-sheet-2.png',
  '/assets/paper-sheet-3.png',
  '/assets/label-tab.png',
  '/assets/magnifying-glass.png',
  '/assets/building-photo.png',
  '/assets/portrait-card.png',
  '/assets/edrian-hero.png',
  '/assets/edrian-about.png',
  '/assets/edrian-portrait-new.png',

  // Page 1.5: Assembled Dossier Spread & Forensic Cards
  '/assets/page-one-half/01-backing.png',
  '/assets/page-one-half/02-spread.png',
  '/assets/page-one-half/03-large-card.png',
  '/assets/page-one-half/04-black-card-square.png',
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

  // Fantasy Clipboard Assets
  '/assets/clipboard/clipboard-board.png',
  '/assets/clipboard/bottom-paper.png',
  '/assets/clipboard/middle-paper.png',
  '/assets/clipboard/front-paper.png',
  '/assets/clipboard/transparent-photo-frame.png',
  '/assets/clipboard/small-note.png',
  '/assets/clipboard/clipboard-clip.png',

  // Projects & Case Archive Evidence
  '/assets/projects/studentflow.png',
  '/assets/projects/studentflow-icon.png',
  '/assets/projects/studentflow-logo.png',
  '/assets/projects/pockettrade.png',
  '/assets/projects/pockettrade-icon.png',
  '/assets/projects/chemquest.png',
  '/assets/projects/chemquest-icon.png',
  '/assets/projects/typeduel-bg.png',
  '/assets/projects/typeduel-icon.png',
  '/assets/projects/typeduel-logo.png',
  '/assets/projects/tsukiai.png',
  '/assets/projects/tsukiai-icon.jpg',
  '/assets/projects/auvrynt.png',
  '/assets/projects/auvrynt/00_app_icon.png',

  // Project Interactive Carousel Galleries
  '/assets/projects/chemquest/01_main_menu.png',
  '/assets/projects/chemquest/02_spawned_hometown.png',
  '/assets/projects/chemquest/03_puzzle_precision_accuracy.png',
  '/assets/projects/chemquest/04_puzzle_separation_methods.png',
  '/assets/projects/chemquest/05_puzzle_matter_maze.png',
  '/assets/projects/chemquest/06_periodic_table_glossary.png',
  '/assets/projects/auvrynt/01_analytics_overview.png',
  '/assets/projects/auvrynt/02_connectivity_mcp.png',
  '/assets/projects/auvrynt/03_observability_logs.png',
  '/assets/projects/auvrynt/04_command_reference.png',
  '/assets/projects/auvrynt/05_secrets_failover.png',
  '/assets/projects/typeduel/01_scenes_ui_menus_main_menu.png',
  '/assets/projects/typeduel/07_scenes_ui_lobby_custom_room.png',
];

// Pin decoded images in memory so the browser compositor never evicts bitmaps during transitions
const pinnedDecodedImages: HTMLImageElement[] = [];

const preloadImage = (url: string): Promise<void> =>
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
    setTimeout(finish, 12000);
  });

const preloadFonts = (): Promise<void> => {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load('700 48px "Cinzel"'),
    document.fonts.load('400 24px "Special Elite"'),
    document.fonts.load('600 32px "Playfair Display"'),
    document.fonts.load('500 16px "Courier Prime"'),
    document.fonts.load('500 12px "IBM Plex Mono"'),
    document.fonts.load('600 48px "Sora"'),
    document.fonts.ready,
  ])
    .then(() => undefined)
    .catch(() => undefined);
};

export default function App() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Preload and pre-decode all assets ahead of time
  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    const total = ALL_PORTFOLIO_ASSETS.length + 1; // all assets + fonts
    let nextIndex = 0;


    // Run 6 concurrent workers to download and decode images in rapid order
    const CONCURRENCY = 6;
    const runWorker = async () => {
      while (nextIndex < ALL_PORTFOLIO_ASSETS.length) {
        if (cancelled) return;
        const currentUrl = ALL_PORTFOLIO_ASSETS[nextIndex++];
        await preloadImage(currentUrl);
        if (cancelled) return;
        completed += 1;
        const pct = Math.min(100, Math.round((completed / total) * 100));
        setLoadingProgress(pct);
      }
    };

    const workers = Array.from({ length: CONCURRENCY }, () => runWorker());

    const fontTask = preloadFonts().then(() => {
      if (!cancelled) {
        completed += 1;
        const pct = Math.min(100, Math.round((completed / total) * 100));
        setLoadingProgress(pct);
      }
    });

    Promise.all([...workers, fontTask]).then(() => {
      if (!cancelled) {
        setLoadingProgress(100);
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  const handleRevealStart = useCallback(() => {
    setRevealStarted(true);
  }, []);

  return (
    <main className="w-screen h-screen h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#020202] text-[#f5f5f7] select-none relative font-sans">
      {/* Retained stylized Canvas/GSAP Loading Screen */}
      {showLoading && (
        <LoadingScreen
          progress={loadingProgress}
          isComplete={isLoaded}
          onRevealStart={handleRevealStart}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* Primary Scene: Home (Page 1 folder + scattered papers / assembled dossier spread) */}
      <div id="home" className="w-full h-full">
        <div className="home-section w-full h-full flex items-center justify-center p-2 sm:p-4">
          <VintageStationery
            className="w-full h-full max-w-[1376px] max-h-[768px]"
            autoPlay={revealStarted || !showLoading}
          />
        </div>
      </div>

      {/* Section Scroll Transitions (Page 1 <-> Page 2 Detective Scrapbook Board) */}
      <SectionScrollTransition />
    </main>
  );
}
