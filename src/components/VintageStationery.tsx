import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VintageStationeryProps, StationeryState } from '../types';
import { useStationeryMotion } from '../animations/useStationeryMotion';
import { FolderEnvelope } from './FolderEnvelope';
import { PaperStack } from './PaperStack';
import { BookmarkTabs } from './BookmarkTabs';
import { DeskAccents } from './DeskAccents';
import { JournalOverlay } from './JournalOverlay';
import { PageOneHalf } from './PageOneHalf';
import { FantasyClipboardWorks } from './FantasyClipboardWorks';
import { VintageContactDesk } from './VintageContactDesk';
import { triggerSectionTransition } from './SectionScrollTransition';

export const VintageStationery: React.FC<VintageStationeryProps> = ({
  autoPlay = true,
  onBookmarkClick,
  onStateChange,
  assetsPath = './assets',
  className = '',
  initialPage = 1,
  page: propPage,
  onPageChange,
}) => {
  const [internalPage, setInternalPage] = useState<1 | 2>(initialPage);
  const page = propPage ?? internalPage;

  const setPage = useCallback((newPage: 1 | 2) => {
    setInternalPage(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  const sceneRef = useRef<HTMLDivElement>(null);
  const stationeryRef = useRef<HTMLDivElement>(null);
  const paperBundleRef = useRef<HTMLDivElement>(null);
  const sheetOneRef = useRef<HTMLImageElement>(null);
  const sheetTwoRef = useRef<HTMLImageElement>(null);
  const sheetThreeRef = useRef<HTMLImageElement>(null);

  // Bookmarks
  const tabOneRef = useRef<HTMLButtonElement>(null);
  const tabTwoRef = useRef<HTMLButtonElement>(null);
  const tabThreeRef = useRef<HTMLButtonElement>(null);
  const tabFourRef = useRef<HTMLButtonElement>(null);

  // Photos & Magnifier
  const photoBundleRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const magnifierRef = useRef<HTMLImageElement>(null);
  const glassReflectionRef = useRef<HTMLDivElement>(null);

  // Journal stage
  const openingVideoRef = useRef<HTMLVideoElement>(null);
  const closingVideoRef = useRef<HTMLVideoElement>(null);

  const [state, setState] = useState<StationeryState>('hidden');
  const [activeBookmark, setActiveBookmark] = useState<string | null>(null);
  const [journalVisible, setJournalVisible] = useState(false);
  const [journalBusy, setJournalBusy] = useState(false);
  const [showPageOneHalf, setShowPageOneHalf] = useState(false);
  const [showWorks, setShowWorks] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { renderPose, move, replay } = useStationeryMotion({
    sceneRef,
    stationeryRef,
    paperBundleRef,
    sheetOneRef,
    sheetTwoRef,
    sheetThreeRef,
    tabOneRef,
    tabTwoRef,
    tabThreeRef,
    tabFourRef,
    photoBundleRef,
    photoRef,
    portraitRef,
    magnifierRef,
    glassReflectionRef,
    setState,
    onStateChange,
  });

  // Unified Page 1 <-> Page 2 transition handler (drives GitHub repo WebGL section-to-section shader)
  const handleSwitchPage = useCallback(
    (targetPage: 1 | 2) => {
      if (targetPage === page || journalBusy || isTransitioning) return;
      setJournalBusy(true);
      setIsTransitioning(true);

      if (targetPage === 2) {
        if (page === 1 && !showPageOneHalf && !showWorks) {
          void move('outro');
        }
        triggerSectionTransition(
          1,
          2,
          () => {
            setShowPageOneHalf(false);
            setShowWorks(false);
            setPage(2);
          },
          () => {
            setIsTransitioning(false);
            setJournalBusy(false);
          }
        );
      } else {
        renderPose('hidden');
        triggerSectionTransition(
          2,
          1,
          () => {
            setShowPageOneHalf(false);
            setShowWorks(false);
            setPage(1);
            replay();
          },
          () => {
            setIsTransitioning(false);
            setJournalBusy(false);
          }
        );
      }
    },
    [isTransitioning, journalBusy, move, page, renderPose, replay, setPage, showPageOneHalf, showWorks]
  );

  const hasPlayedIntroRef = useRef(false);

  // Initial mount & loading screen handoff: trigger intro immediately when autoPlay becomes true
  useEffect(() => {
    if (!autoPlay) {
      renderPose('hidden');
      return;
    }
    if (!hasPlayedIntroRef.current) {
      hasPlayedIntroRef.current = true;
      renderPose('hidden');
      replay();
    }
  }, [autoPlay, replay, renderPose]);

  // Video playback helper
  const playJournalClip = useCallback(async (video: HTMLVideoElement) => {
    video.currentTime = 0;
    await new Promise<void>((resolve, reject) => {
      const ended = () => { cleanup(); resolve(); };
      const error = () => { cleanup(); reject(new Error('Journal clip playback failed.')); };
      const cleanup = () => {
        video.removeEventListener('ended', ended);
        video.removeEventListener('error', error);
      };
      video.addEventListener('ended', ended, { once: true });
      video.addEventListener('error', error, { once: true });
      video.play().catch(e => { cleanup(); reject(e); });
    });
  }, []);

  // Show Dossier (Page 1.5), Works (Clipboard), or Contact (Page 2) handler
  const handleSelectBookmark = useCallback(
    async (paperId: string) => {
      if (journalBusy || isTransitioning || state === 'journal-open' || state === 'journal-opening') return;
      setActiveBookmark(paperId);
      onBookmarkClick?.(paperId);

      if (paperId === 'home') {
        const wasOnSubpage = showWorks || showPageOneHalf;
        setShowWorks(false);
        setShowPageOneHalf(false);
        if (wasOnSubpage) {
          replay();
        }
        return;
      }

      if (paperId === 'works') {
        const wasOnHome = !showPageOneHalf && !showWorks;
        setShowPageOneHalf(false);
        if (wasOnHome) {
          setJournalBusy(true);
          try {
            setShowWorks(true);
            await move('outro');
          } catch {
            setShowWorks(true);
          } finally {
            setJournalBusy(false);
          }
        } else {
          // Coming from About: "the about has intro only no outro outro"
          setShowWorks(true);
        }
        return;
      }

      if (paperId === 'contact') {
        setShowWorks(false);
        setShowPageOneHalf(false);
        handleSwitchPage(2);
        return;
      }

      if (paperId === 'about') {
        const wasOnHome = !showPageOneHalf && !showWorks;
        setShowWorks(false);
        if (wasOnHome) {
          setJournalBusy(true);
          try {
            setShowPageOneHalf(true);
            await move('outro');
          } catch {
            setShowPageOneHalf(true);
          } finally {
            setJournalBusy(false);
          }
        } else {
          // Coming from Works (folder already tucked away):
          setShowPageOneHalf(true);
        }
        return;
      }

      // Default fallback for any other bookmark ID
      setJournalBusy(true);
      try {
        setShowPageOneHalf(true);
        await move('outro');
      } catch {
        await move('intro');
      } finally {
        setJournalBusy(false);
      }
    },
    [handleSwitchPage, isTransitioning, journalBusy, move, onBookmarkClick, replay, showPageOneHalf, showWorks, state]
  );

  // Close Journal handler
  const handleCloseJournal = useCallback(async () => {
    if (journalBusy || !journalVisible) return;
    setJournalBusy(true);

    try {
      setState('journal-closing');
      onStateChange?.('journal-closing');

      if (closingVideoRef.current) {
        await playJournalClip(closingVideoRef.current);
      }
    } catch {
      // ignore
    } finally {
      setJournalVisible(false);
      await move('intro');
      setJournalBusy(false);
    }
  }, [journalBusy, journalVisible, move, onStateChange, playJournalClip]);

  const isPage1Visible = page === 1;
  const isPage2Visible = page === 2;

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center bg-[#151715] overflow-hidden select-none ${className}`}>
      {/* Background vignette & texture */}
      <img
        src={`${assetsPath}/dark-backing.png?v=3`}
        alt="Vintage detective desk backing"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at 49% 38%, transparent 30%, rgba(25,28,32,0.04) 53%, rgba(10,14,17,0.45) 100%)',
        }}
      />

      {/* Page 1 Layer: Kept mounted in DOM to eliminate mount/unmount stalls during WebGL transitions */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20"
        style={{
          opacity: isPage1Visible ? 1 : 0,
          visibility: isPage1Visible || isTransitioning ? 'visible' : 'hidden',
          pointerEvents: isPage1Visible && !isTransitioning ? 'auto' : 'none',
          transition: 'opacity 180ms ease-out',
        }}
      >
        <div
          ref={sceneRef}
          data-state={state}
          className="relative aspect-[1376/768] overflow-visible perspective-[1000px] z-20"
          style={{ width: 'min(100vw, 179.166667vh)' }}
        >
          {/* Unified Page 1 & 1.5 Dossier: Scatters in BG behind folder -> Assembles in center */}
          <PageOneHalf
            assetsPath={assetsPath}
            isAssembled={showPageOneHalf}
            onBack={() => {
              setShowPageOneHalf(false);
              replay();
            }}
            onNext={() => {
              setShowPageOneHalf(false);
              setShowWorks(true);
            }}
          />

          {/* Unified Works Clipboard System: Scatters in BG behind folder -> Assembles in center */}
          <FantasyClipboardWorks
            isAssembled={showWorks}
            onBack={() => {
              setShowWorks(false);
              replay();
            }}
            onNext={() => {
              setShowWorks(false);
              handleSwitchPage(2);
            }}
          />

            {/* Stationery Parent Container */}
            <div
              ref={stationeryRef}
              className="absolute inset-0 z-20 will-change-transform"
            >
              {/* Folder Back Base */}
              <FolderEnvelope assetsPath={assetsPath} isFront={false} />

              {/* 3 Distinct Parchment Document Stack */}
              <PaperStack
                assetsPath={assetsPath}
                paperBundleRef={paperBundleRef}
                sheetOneRef={sheetOneRef}
                sheetTwoRef={sheetTwoRef}
                sheetThreeRef={sheetThreeRef}
              >
                {/* 4 Navigation Bookmark Tabs in Center-Left (Home, About, Works, Contacts) */}
                <BookmarkTabs
                  assetsPath={assetsPath}
                  tabOneRef={tabOneRef}
                  tabTwoRef={tabTwoRef}
                  tabThreeRef={tabThreeRef}
                  tabFourRef={tabFourRef}
                  onSelectBookmark={handleSelectBookmark}
                  disabled={journalBusy || isTransitioning}
                />
              </PaperStack>

              {/* Folder Front Pocket Flap */}
              <FolderEnvelope assetsPath={assetsPath} isFront={true} />
            </div>

            {/* Desk Accents: Photographs & Magnifying Glass */}
            <DeskAccents
              assetsPath={assetsPath}
              photoBundleRef={photoBundleRef}
              photoRef={photoRef}
              portraitRef={portraitRef}
              magnifierRef={magnifierRef}
              glassReflectionRef={glassReflectionRef}
            />
          </div>
        </div>

      {/* Page 2 Layer: Vintage Typewriter Contact Desk */}
      <div
        className="absolute inset-0 w-full h-full z-30"
        style={{
          opacity: isPage2Visible ? 1 : 0,
          visibility: isPage2Visible || isTransitioning ? 'visible' : 'hidden',
          pointerEvents: isPage2Visible && !isTransitioning ? 'auto' : 'none',
          transition: 'opacity 180ms ease-out',
        }}
      >
        <VintageContactDesk
          onBack={() => handleSwitchPage(1)}
          active={isPage2Visible && !isTransitioning}
        />
      </div>

      {/* Interactive Journal Video Stage Overlay */}
      <JournalOverlay
        assetsPath={assetsPath}
        visible={journalVisible}
        state={state}
        activeBookmark={activeBookmark}
        openingVideoRef={openingVideoRef}
        closingVideoRef={closingVideoRef}
        onClose={handleCloseJournal}
        disabled={journalBusy}
      />
    </div>
  );
};

export default VintageStationery;
