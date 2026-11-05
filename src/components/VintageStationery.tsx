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
  assetsPath = '/assets',
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
  const sheetOneRef = useRef<HTMLDivElement>(null);
  const sheetTwoRef = useRef<HTMLDivElement>(null);
  const sheetThreeRef = useRef<HTMLDivElement>(null);

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

  const { renderPose, move, animateBookmarks, transitionSection, replay } = useStationeryMotion({
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
    (targetPage: 1 | 2, returnSection: 'home' | 'about' | 'works' = 'home') => {
      if (targetPage === page || journalBusy || isTransitioning) return;
      setJournalBusy(true);
      setIsTransitioning(true);

      if (targetPage === 2) {
        triggerSectionTransition(
          1,
          2,
          () => {
            setShowPageOneHalf(false);
            setShowWorks(false);
            renderPose('hidden', { section: 'home' });
            setPage(2);
          },
          () => {
            setIsTransitioning(false);
            setJournalBusy(false);
          }
        );
        setIsTransitioning(true);
      } else {
        setIsTransitioning(true);
        // Trigger WebGL curtain first so frame 0 covers the screen before Page 2 hides,
        // then immediately stage Page 1 underneath so the upward wave reveals Page 1 smoothly!
        triggerSectionTransition(
          2,
          1,
          () => {
            setShowPageOneHalf(returnSection === 'about');
            setShowWorks(returnSection === 'works');
            setActiveBookmark(returnSection);
            renderPose('hidden', { section: returnSection });
            setPage(1);

            requestAnimationFrame(() => {
              void transitionSection(returnSection);
            });
          },
          () => {
            setIsTransitioning(false);
            setJournalBusy(false);
          }
        );
      }
    },
    [isTransitioning, journalBusy, page, renderPose, replay, setPage, transitionSection]
  );

  const handleReturnHome = useCallback(() => {
    handleSwitchPage(1, 'home');
  }, [handleSwitchPage]);

  const handleReturnSection = useCallback((sec: 'home' | 'about' | 'works') => {
    handleSwitchPage(1, sec);
  }, [handleSwitchPage]);

  const hasPlayedIntroRef = useRef(false);

  // Initial mount & loading screen handoff: trigger intro immediately when autoPlay becomes true
  useEffect(() => {
    if (!autoPlay) {
      renderPose('hidden', { section: 'home' });
      return;
    }
    if (!hasPlayedIntroRef.current) {
      hasPlayedIntroRef.current = true;
      renderPose('hidden', { section: 'home' });
      void replay();
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

  // Synchronized GSAP Timeline section switcher (Home <-> About <-> Works <-> Contacts)
  const handleSelectBookmark = useCallback(
    async (paperId: string) => {
      if (isTransitioning || state === 'journal-open' || state === 'journal-opening') return;
      onBookmarkClick?.(paperId);

      if (paperId === 'contact') {
        setActiveBookmark('contact');
        handleSwitchPage(2);
        return;
      }

      const targetSection =
        paperId === 'works'
          ? 'works'
          : paperId === 'about'
            ? 'about'
            : 'home';

      const currentSection = showWorks ? 'works' : showPageOneHalf ? 'about' : 'home';
      if (targetSection === currentSection && !journalBusy) return;

      setJournalBusy(true);
      try {
        await transitionSection(targetSection, (committedSection) => {
          setActiveBookmark(committedSection);
          setShowPageOneHalf(committedSection === 'about');
          setShowWorks(committedSection === 'works');
        });
      } finally {
        setJournalBusy(false);
      }
    },
    [handleSwitchPage, isTransitioning, journalBusy, onBookmarkClick, showPageOneHalf, showWorks, state, transitionSection]
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

  // Section Navigation Order: 0: 'home', 1: 'about', 2: 'works', 3: 'contact'
  const currentSectionIndex =
    page === 2 ? 3 : showWorks ? 2 : showPageOneHalf ? 1 : 0;

  const navigateNext = useCallback(() => {
        if (isTransitioning || journalBusy || state === 'journal-open' || state === 'journal-opening') return;
    if (page === 2) return;
    if (showWorks) {
      handleSelectBookmark('contact');
    } else if (showPageOneHalf) {
      handleSelectBookmark('works');
    } else {
      handleSelectBookmark('about');
    }
  }, [handleSelectBookmark, isTransitioning, journalBusy, page, showPageOneHalf, showWorks, state]);

  const navigatePrev = useCallback(() => {
    if (isTransitioning || journalBusy || state === 'journal-open' || state === 'journal-opening') return;
    if (page === 2) {
      handleReturnSection('works');
    } else if (showWorks) {
      handleSelectBookmark('about');
    } else if (showPageOneHalf) {
      handleSelectBookmark('home');
    }
  }, [handleReturnSection, handleSelectBookmark, isTransitioning, journalBusy, page, showPageOneHalf, showWorks, state]);

  // Mobile-only touch swipe section navigator (< 768px)
  useEffect(() => {
    const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;
    let startY = 0;
    let startX = 0;
    let startTime = 0;
    let isTracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (!isMobile() || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startTime = Date.now();
      isTracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTracking || !isMobile() || e.changedTouches.length !== 1) return;
      isTracking = false;

      const deltaY = e.changedTouches[0].clientY - startY;
      const deltaX = e.changedTouches[0].clientX - startX;
      const elapsed = Date.now() - startTime;

      // Vertical threshold: swipe >= 32px and more vertical than horizontal
      if (Math.abs(deltaY) < 32 || Math.abs(deltaY) < Math.abs(deltaX) * 1.1) return;
      if (elapsed > 1600) return;

      const el = e.target as HTMLElement | null;
      const scrollable = el?.closest('.overflow-y-auto, .overflow-y-scroll');
      if (scrollable) {
        const canScrollDown = scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 6;
        const canScrollUp = scrollable.scrollTop > 6;
        if (deltaY < 0 && canScrollDown) return;
        if (deltaY > 0 && canScrollUp) return;
      }

      if (deltaY < 0) {
        navigateNext();
      } else {
        navigatePrev();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigateNext, navigatePrev]);

  const isPage1Visible = page === 1;
  const isPage2Visible = page === 2;
  const currentActiveBookmark =
    page === 2
      ? 'contact'
      : showWorks
        ? 'works'
        : showPageOneHalf
          ? 'about'
          : 'home';

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center ${isPage2Visible ? 'bg-black' : 'bg-[#151715]'} overflow-hidden select-none ${className}`}>
      {/* Background vignette & texture (Page 1 only - never shown on Page 2) */}
      {isPage1Visible && (
        <>
          <img
            src={`${assetsPath}/dark-backing.png`}
            alt="Vintage detective desk backing"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(ellipse at 49% 38%, transparent 30%, rgba(25,28,32,0.04) 53%, rgba(10,14,17,0.45) 100%)',
            }}
          />
        </>
      )}

      {/* Page 1 Layer: Kept mounted in DOM to eliminate mount/unmount stalls during WebGL transitions */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20"
        style={{
          opacity: isPage1Visible ? 1 : 0,
          visibility: isPage1Visible ? 'visible' : 'hidden',
          pointerEvents: isPage1Visible && !isTransitioning ? 'auto' : 'none',
        }}
      >
        <div
          ref={sceneRef}
          data-state={state}
          className="scene relative aspect-[1376/768] overflow-visible perspective-[1000px] z-20"
          style={{ width: 'min(100vw, 179.166667vh)' }}
        >
          {/* Unified Page 1 & 1.5 Dossier: Scatters in BG behind folder -> Assembles in center */}
          <PageOneHalf
            assetsPath={assetsPath}
            isAssembled={showPageOneHalf}
            onBack={() => handleSelectBookmark('home')}
            onNext={() => handleSelectBookmark('works')}
          />

          {/* Unified Works Clipboard System: Scatters in BG behind folder -> Assembles in center */}
          <FantasyClipboardWorks
            isAssembled={showWorks}
            onBack={() => handleSelectBookmark('home')}
            onNext={() => handleSelectBookmark('contact')}
          />

          {/* Reused 4 Navigation Bookmark Tabs in Center-Left (Home, About, Works, Contacts) */}
          <BookmarkTabs
            assetsPath={assetsPath}
            tabOneRef={tabOneRef}
            tabTwoRef={tabTwoRef}
            tabThreeRef={tabThreeRef}
            tabFourRef={tabFourRef}
            activeBookmark={currentActiveBookmark}
            isSubpage={showPageOneHalf || showWorks}
            onSelectBookmark={handleSelectBookmark}
            disabled={journalBusy || isTransitioning}
          />

          {/* Stationery Parent Container */}
          <div
            ref={stationeryRef}
            className="absolute inset-0 z-20 will-change-transform pointer-events-none"
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
              onNavigate={handleSelectBookmark}
            />

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
        className="absolute inset-0 w-full h-full z-[50]"
        style={{
          opacity: isPage2Visible ? 1 : 0,
          visibility: isPage2Visible ? 'visible' : 'hidden',
          pointerEvents: isPage2Visible && !isTransitioning ? 'auto' : 'none',
        }}
      >
        <VintageContactDesk
          onBack={handleReturnHome}
          onNavigateSection={handleReturnSection}
          active={isPage2Visible}
          isTransitioning={isTransitioning}
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
