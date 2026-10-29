import { useCallback, useRef } from 'react';
import { StationeryState } from '../types';
import { ANIMATION_CONFIG } from './constants';

interface UseStationeryMotionParams {
  sceneRef: React.RefObject<HTMLDivElement | null>;
  stationeryRef: React.RefObject<HTMLDivElement | null>;
  paperBundleRef: React.RefObject<HTMLDivElement | null>;
  sheetOneRef?: React.RefObject<HTMLImageElement | null>;
  sheetTwoRef?: React.RefObject<HTMLImageElement | null>;
  sheetThreeRef?: React.RefObject<HTMLImageElement | null>;
  tabOneRef: React.RefObject<HTMLButtonElement | null>;
  tabTwoRef: React.RefObject<HTMLButtonElement | null>;
  tabThreeRef: React.RefObject<HTMLButtonElement | null>;
  tabFourRef?: React.RefObject<HTMLButtonElement | null>;
  photoBundleRef: React.RefObject<HTMLDivElement | null>;
  photoRef: React.RefObject<HTMLImageElement | null>;
  portraitRef: React.RefObject<HTMLImageElement | null>;
  magnifierRef: React.RefObject<HTMLImageElement | null>;
  glassReflectionRef: React.RefObject<HTMLDivElement | null>;
  butterflyRef?: React.RefObject<HTMLImageElement | null>;
  setState: (state: StationeryState) => void;
  onStateChange?: (state: StationeryState) => void;
}

export function useStationeryMotion({
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
}: UseStationeryMotionParams) {
  const activeAnimationsRef = useRef<Animation[]>([]);
  const ticketRef = useRef(0);

  const getExitDistance = useCallback(() => {
    if (!sceneRef.current) return 796;
    const bounds = sceneRef.current.getBoundingClientRect();
    return Math.max(796, Math.ceil(window.innerHeight - bounds.top + 64));
  }, [sceneRef]);

  const renderPose = useCallback((pose: 'visible' | 'hidden') => {
    const exitY = getExitDistance();
    const isVis = pose === 'visible';

    if (stationeryRef.current) {
      stationeryRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : `translate3d(0, ${exitY}px, 0)`;
    }

    if (paperBundleRef.current) {
      paperBundleRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : 'translate3d(0, 240px, 0)';
    }

    // 3 Individual document sheets (Sheet 1: Center, Sheet 2: Right fan, Sheet 3: Left fan)
    if (sheetOneRef?.current) {
      sheetOneRef.current.style.transform = isVis ? 'translate3d(0, 0, 0) rotate(0deg)' : 'translate3d(0, 20px, 0) rotate(0deg)';
    }
    if (sheetTwoRef?.current) {
      sheetTwoRef.current.style.transform = isVis ? 'translate3d(20px, -4px, 0) rotate(4.2deg)' : 'translate3d(0, 45px, 0) rotate(0deg)';
    }
    if (sheetThreeRef?.current) {
      sheetThreeRef.current.style.transform = isVis ? 'translate3d(-24px, -6px, 0) rotate(-4.8deg)' : 'translate3d(0, 65px, 0) rotate(0deg)';
    }

    // 4 Bookmarks: start tucked behind paper stack
    const tabRefs = [
      { ref: tabOneRef, rot: '-1.8deg' },
      { ref: tabTwoRef, rot: '1.4deg' },
      { ref: tabThreeRef, rot: '-1.2deg' },
      { ref: tabFourRef, rot: '1.6deg' },
    ];
    tabRefs.forEach(({ ref, rot }) => {
      if (ref?.current) {
        ref.current.style.transform = isVis ? `translate3d(0, 0, 0) rotate(${rot})` : `translate3d(${ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X}px, 0, 0) rotate(${rot})`;
        ref.current.style.opacity = isVis ? '1' : '0';
      }
    });

    if (photoBundleRef.current) {
      photoBundleRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : 'translate3d(48%, 55%, 0)';
    }
    if (photoRef.current) {
      photoRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : 'translate3d(70px, 90px, 0) rotate(8deg) scale(0.92)';
    }
    if (portraitRef.current) {
      portraitRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : 'translate3d(38px, 110px, 0) rotate(-7deg) scale(0.94)';
    }
    if (magnifierRef.current) {
      magnifierRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : 'translate3d(95px, 85px, 0) rotate(-12deg) scale(0.95)';
    }
    if (glassReflectionRef.current) {
      glassReflectionRef.current.style.transform = isVis ? 'translate3d(0, 0, 0)' : 'translate3d(95px, 85px, 0) rotate(-12deg) scale(0.95)';
    }
  }, [getExitDistance, stationeryRef, paperBundleRef, sheetOneRef, sheetTwoRef, sheetThreeRef, tabOneRef, tabTwoRef, tabThreeRef, tabFourRef, photoBundleRef, photoRef, portraitRef, magnifierRef, glassReflectionRef]);

  const move = useCallback(async (kind: 'intro' | 'outro') => {
    const exitY = getExitDistance();
    const id = ++ticketRef.current;

    const isRestingOrNone = (val?: string) => {
      if (!val || val === 'none') return true;
      if (val === 'matrix(1, 0, 0, 1, 0, 0)') return true;
      if (val === 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)') return true;
      return false;
    };

    const wasRunning = activeAnimationsRef.current.length > 0;

    // Capture current computed transforms before cancelling animations so interrupted motions reverse smoothly
    const curStationery = stationeryRef.current ? window.getComputedStyle(stationeryRef.current).transform : 'none';
    const curPaper = paperBundleRef.current ? window.getComputedStyle(paperBundleRef.current).transform : 'none';
    const curSheetOne = sheetOneRef?.current ? window.getComputedStyle(sheetOneRef.current).transform : 'none';
    const curSheetTwo = sheetTwoRef?.current ? window.getComputedStyle(sheetTwoRef.current).transform : 'none';
    const curSheetThree = sheetThreeRef?.current ? window.getComputedStyle(sheetThreeRef.current).transform : 'none';
    const curPhotoBundle = photoBundleRef.current ? window.getComputedStyle(photoBundleRef.current).transform : 'none';

    activeAnimationsRef.current.forEach(a => {
      try { a.cancel(); } catch (e) {}
    });
    activeAnimationsRef.current = [];

    const intro = kind === 'intro';
    const nextState = intro ? 'entering' : 'leaving';
    setState(nextState);
    onStateChange?.(nextState);

    const anims: Animation[] = [];

    if (intro) {
      // 1. Folder Base
      if (stationeryRef.current) {
        const startStationery = (wasRunning && !isRestingOrNone(curStationery))
          ? curStationery
          : `translate3d(0, ${exitY}px, 0)`;

        anims.push(stationeryRef.current.animate([
          { transform: startStationery },
          { transform: `translate3d(0, ${ANIMATION_CONFIG.FOLDER_INTRO.overshootY}px, 0)`, offset: 0.78 },
          { transform: 'translate3d(0, 0, 0)' }
        ], {
          duration: ANIMATION_CONFIG.FOLDER_INTRO.duration,
          easing: ANIMATION_CONFIG.FOLDER_INTRO.easing,
          fill: 'both'
        }));
      }

      // 2. Parchment Bundle Carrier: smooth vertical emergence from pocket
      if (paperBundleRef.current) {
        const startPaper = (wasRunning && !isRestingOrNone(curPaper))
          ? curPaper
          : 'translate3d(0, 240px, 0)';

        anims.push(paperBundleRef.current.animate([
          { transform: startPaper },
          { transform: 'translate3d(0, -6px, 0)', offset: 0.74 },
          { transform: 'translate3d(0, 0, 0)' }
        ], {
          delay: ANIMATION_CONFIG.PAPERS_INTRO.delay,
          duration: ANIMATION_CONFIG.PAPERS_INTRO.duration,
          easing: ANIMATION_CONFIG.PAPERS_INTRO.easing,
          fill: 'both'
        }));
      }

      // 3. Individual Document Sheets: Distinct, staggered, organic motions fanning out
      // Sheet 1 (Front / Centered Dossier): Emerges first, rises straight up with a gentle floating crest
      if (sheetOneRef?.current) {
        const startSheet1 = (wasRunning && !isRestingOrNone(curSheetOne))
          ? curSheetOne
          : 'translate3d(0, 20px, 0) rotate(0deg)';

        anims.push(sheetOneRef.current.animate([
          { transform: startSheet1 },
          { transform: 'translate3d(0, 6px, 0) rotate(0.1deg)', offset: 0.45 },
          { transform: 'translate3d(0, -8px, 0) rotate(-0.15deg)', offset: 0.72 },
          { transform: 'translate3d(0, 2px, 0) rotate(0.05deg)', offset: 0.88 },
          { transform: 'translate3d(0, 0, 0) rotate(0deg)' }
        ], {
          delay: ANIMATION_CONFIG.SHEET_ONE_INTRO.delay,
          duration: ANIMATION_CONFIG.SHEET_ONE_INTRO.duration,
          easing: ANIMATION_CONFIG.SHEET_ONE_INTRO.easing,
          fill: 'both'
        }));
      }

      // Sheet 2 (Middle Dossier): Emerges second, sweeps clockwise outward to the right
      if (sheetTwoRef?.current) {
        const startSheet2 = (wasRunning && !isRestingOrNone(curSheetTwo))
          ? curSheetTwo
          : 'translate3d(0, 45px, 0) rotate(0deg)';

        anims.push(sheetTwoRef.current.animate([
          { transform: startSheet2 },
          { transform: 'translate3d(5px, 22px, 0) rotate(1.0deg)', offset: 0.35 },
          { transform: 'translate3d(16px, 3px, 0) rotate(3.2deg)', offset: 0.65 },
          { transform: 'translate3d(25px, -9px, 0) rotate(5.1deg)', offset: 0.78 },
          { transform: 'translate3d(19px, -2px, 0) rotate(4.0deg)', offset: 0.90 },
          { transform: 'translate3d(20px, -4px, 0) rotate(4.2deg)' }
        ], {
          delay: ANIMATION_CONFIG.SHEET_TWO_INTRO.delay,
          duration: ANIMATION_CONFIG.SHEET_TWO_INTRO.duration,
          easing: ANIMATION_CONFIG.SHEET_TWO_INTRO.easing,
          fill: 'both'
        }));
      }

      // Sheet 3 (Back Dossier): Emerges third, sweeps counter-clockwise outward to the left
      if (sheetThreeRef?.current) {
        const startSheet3 = (wasRunning && !isRestingOrNone(curSheetThree))
          ? curSheetThree
          : 'translate3d(0, 65px, 0) rotate(0deg)';

        anims.push(sheetThreeRef.current.animate([
          { transform: startSheet3 },
          { transform: 'translate3d(-6px, 30px, 0) rotate(-1.1deg)', offset: 0.35 },
          { transform: 'translate3d(-19px, 6px, 0) rotate(-3.7deg)', offset: 0.65 },
          { transform: 'translate3d(-31px, -12px, 0) rotate(-5.9deg)', offset: 0.78 },
          { transform: 'translate3d(-23px, -4px, 0) rotate(-4.5deg)', offset: 0.90 },
          { transform: 'translate3d(-24px, -6px, 0) rotate(-4.8deg)' }
        ], {
          delay: ANIMATION_CONFIG.SHEET_THREE_INTRO.delay,
          duration: ANIMATION_CONFIG.SHEET_THREE_INTRO.duration,
          easing: ANIMATION_CONFIG.SHEET_THREE_INTRO.easing,
          fill: 'both'
        }));
      }

      // 4. Bookmarks: Horizontal popup from behind paper stack
      const tabConfigs = [
        { ref: tabOneRef, rot: '-1.8deg', delay: 480, overshoot: -18 },
        { ref: tabTwoRef, rot: '1.4deg', delay: 580, overshoot: -20 },
        { ref: tabThreeRef, rot: '-1.2deg', delay: 680, overshoot: -18 },
        { ref: tabFourRef, rot: '1.6deg', delay: 780, overshoot: -20 },
      ];

      tabConfigs.forEach(({ ref, rot, delay, overshoot }) => {
        if (ref?.current) {
          anims.push(ref.current.animate([
            { transform: `translate3d(${ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X}px, 0, 0) rotate(${rot})`, opacity: 0 },
            { transform: `translate3d(${overshoot}px, 0, 0) rotate(${rot})`, opacity: 1, offset: 0.68 },
            { transform: `translate3d(2px, 0, 0) rotate(${rot})`, offset: 0.88 },
            { transform: `translate3d(0, 0, 0) rotate(${rot})`, opacity: 1 }
          ], {
            delay,
            duration: ANIMATION_CONFIG.BOOKMARK_INTRO_DURATION,
            easing: ANIMATION_CONFIG.BOOKMARK_INTRO_EASING,
            fill: 'both'
          }));
        }
      });

      // 5. Photos & Magnifier
      if (photoBundleRef.current) {
        anims.push(photoBundleRef.current.animate([
          { transform: 'translate3d(48%, 55%, 0)' },
          { transform: 'translate3d(-4px, -4px, 0)', offset: 0.82 },
          { transform: 'translate3d(0, 0, 0)' }
        ], {
          duration: ANIMATION_CONFIG.PHOTO_BUNDLE_INTRO.duration,
          easing: ANIMATION_CONFIG.PHOTO_BUNDLE_INTRO.easing,
          fill: 'both'
        }));
      }

      if (photoRef.current) {
        anims.push(photoRef.current.animate([
          { transform: 'translate3d(70px, 90px, 0) rotate(8deg) scale(0.92)' },
          { transform: 'translate3d(-5px, -3px, 0) rotate(-1deg) scale(1.01)', offset: 0.76 },
          { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' }
        ], {
          delay: ANIMATION_CONFIG.PHOTO_INTRO.delay,
          duration: ANIMATION_CONFIG.PHOTO_INTRO.duration,
          easing: ANIMATION_CONFIG.PHOTO_INTRO.easing,
          fill: 'both'
        }));
      }

      if (portraitRef.current) {
        anims.push(portraitRef.current.animate([
          { transform: 'translate3d(38px, 110px, 0) rotate(-7deg) scale(0.94)' },
          { transform: 'translate3d(-3px, -4px, 0) rotate(1.4deg) scale(1.01)', offset: 0.80 },
          { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' }
        ], {
          delay: ANIMATION_CONFIG.PORTRAIT_INTRO.delay,
          duration: ANIMATION_CONFIG.PORTRAIT_INTRO.duration,
          easing: ANIMATION_CONFIG.PORTRAIT_INTRO.easing,
          fill: 'both'
        }));
      }

      [magnifierRef, glassReflectionRef].forEach(ref => {
        if (ref.current) {
          anims.push(ref.current.animate([
            { transform: 'translate3d(95px, 85px, 0) rotate(-12deg) scale(0.95)' },
            { transform: 'translate3d(-4px, -2px, 0) rotate(1.2deg) scale(1.01)', offset: 0.82 },
            { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' }
          ], {
            delay: ANIMATION_CONFIG.MAGNIFIER_INTRO.delay,
            duration: ANIMATION_CONFIG.MAGNIFIER_INTRO.duration,
            easing: ANIMATION_CONFIG.MAGNIFIER_INTRO.easing,
            fill: 'both'
          }));
        }
      });
    } else {
      // OUTRO: Papers slide DOWN into the envelope pocket FIRST, and BEFORE the envelope moves down
      // 1. Bookmarks smoothly slide horizontally into the paper sheets
      const bookmarkConfigs = [
        { ref: tabFourRef, rot: '1.6deg', delay: 0 },
        { ref: tabThreeRef, rot: '-1.2deg', delay: 40 },
        { ref: tabTwoRef, rot: '1.4deg', delay: 80 },
        { ref: tabOneRef, rot: '-1.8deg', delay: 120 }
      ];

      bookmarkConfigs.forEach(({ ref, rot, delay }) => {
        if (ref?.current) {
          anims.push(ref.current.animate([
            { transform: `translate3d(0, 0, 0) rotate(${rot})`, opacity: 1 },
            { transform: `translate3d(85px, 0, 0) rotate(${rot})`, opacity: 1, offset: 0.7 },
            { transform: `translate3d(${ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X}px, 0, 0) rotate(${rot})`, opacity: 0 }
          ], {
            delay,
            duration: ANIMATION_CONFIG.BOOKMARK_OUTRO_DURATION,
            easing: ANIMATION_CONFIG.BOOKMARK_OUTRO_EASING,
            fill: 'both'
          }));
        }
      });

      // 2. Individual Paper Sheets collapse inward from fan
      if (sheetThreeRef?.current) {
        const startSheet3 = (wasRunning && !isRestingOrNone(curSheetThree))
          ? curSheetThree
          : 'translate3d(-24px, -6px, 0) rotate(-4.8deg)';
        anims.push(sheetThreeRef.current.animate([
          { transform: startSheet3 },
          { transform: 'translate3d(-6px, 20px, 0) rotate(-1.2deg)', offset: 0.55 },
          { transform: 'translate3d(0, 65px, 0) rotate(0deg)' }
        ], {
          delay: ANIMATION_CONFIG.SHEET_THREE_OUTRO.delay,
          duration: ANIMATION_CONFIG.SHEET_THREE_OUTRO.duration,
          easing: ANIMATION_CONFIG.SHEET_THREE_OUTRO.easing,
          fill: 'both'
        }));
      }

      if (sheetTwoRef?.current) {
        const startSheet2 = (wasRunning && !isRestingOrNone(curSheetTwo))
          ? curSheetTwo
          : 'translate3d(20px, -4px, 0) rotate(4.2deg)';
        anims.push(sheetTwoRef.current.animate([
          { transform: startSheet2 },
          { transform: 'translate3d(6px, 16px, 0) rotate(1.1deg)', offset: 0.55 },
          { transform: 'translate3d(0, 45px, 0) rotate(0deg)' }
        ], {
          delay: ANIMATION_CONFIG.SHEET_TWO_OUTRO.delay,
          duration: ANIMATION_CONFIG.SHEET_TWO_OUTRO.duration,
          easing: ANIMATION_CONFIG.SHEET_TWO_OUTRO.easing,
          fill: 'both'
        }));
      }

      if (sheetOneRef?.current) {
        const startSheet1 = (wasRunning && !isRestingOrNone(curSheetOne))
          ? curSheetOne
          : 'translate3d(0, 0, 0) rotate(0deg)';
        anims.push(sheetOneRef.current.animate([
          { transform: startSheet1 },
          { transform: 'translate3d(0, 20px, 0) rotate(0deg)' }
        ], {
          delay: ANIMATION_CONFIG.SHEET_ONE_OUTRO.delay,
          duration: ANIMATION_CONFIG.SHEET_ONE_OUTRO.duration,
          easing: ANIMATION_CONFIG.SHEET_ONE_OUTRO.easing,
          fill: 'both'
        }));
      }

      // 3. Papers bundle descends into the envelope pocket behind folder-front
      if (paperBundleRef.current) {
        const startP = (wasRunning && !isRestingOrNone(curPaper))
          ? curPaper
          : 'translate3d(0, 0, 0)';
        anims.push(paperBundleRef.current.animate([
          { transform: startP },
          { transform: `translate3d(0, ${ANIMATION_CONFIG.PAPERS_OUTRO.tuckDepthY}px, 0)` }
        ], {
          delay: ANIMATION_CONFIG.PAPERS_OUTRO.delay,
          duration: ANIMATION_CONFIG.PAPERS_OUTRO.duration,
          easing: ANIMATION_CONFIG.PAPERS_OUTRO.easing,
          fill: 'both'
        }));
      }

      // 4. Desk photos and magnifier slide off to lower right
      [magnifierRef, glassReflectionRef].forEach((ref, idx) => {
        if (ref?.current) {
          const curEl = window.getComputedStyle(ref.current).transform;
          anims.push(ref.current.animate([
            { transform: curEl !== 'none' ? curEl : 'translate3d(0, 0, 0)' },
            { transform: 'translate3d(60px, 50px, 0) rotate(-8deg) scale(0.95)' }
          ], {
            delay: idx * 20,
            duration: 400,
            easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
            fill: 'both'
          }));
        }
      });

      if (portraitRef?.current) {
        const curPortrait = window.getComputedStyle(portraitRef.current).transform;
        anims.push(portraitRef.current.animate([
          { transform: curPortrait !== 'none' ? curPortrait : 'translate3d(0, 0, 0)' },
          { transform: 'translate3d(45px, 65px, 0) rotate(5deg)' }
        ], {
          delay: ANIMATION_CONFIG.PORTRAIT_OUTRO.delay,
          duration: ANIMATION_CONFIG.PORTRAIT_OUTRO.duration,
          easing: ANIMATION_CONFIG.PORTRAIT_OUTRO.easing,
          fill: 'both'
        }));
      }

      if (photoRef?.current) {
        const curPh = window.getComputedStyle(photoRef.current).transform;
        anims.push(photoRef.current.animate([
          { transform: curPh !== 'none' ? curPh : 'translate3d(0, 0, 0)' },
          { transform: 'translate3d(60px, 50px, 0) rotate(-4deg)' }
        ], {
          delay: ANIMATION_CONFIG.PHOTO_OUTRO.delay,
          duration: ANIMATION_CONFIG.PHOTO_OUTRO.duration,
          easing: ANIMATION_CONFIG.PHOTO_OUTRO.easing,
          fill: 'both'
        }));
      }

      if (photoBundleRef?.current) {
        const startPb = curPhotoBundle !== 'none' ? curPhotoBundle : 'translate3d(0, 0, 0)';
        anims.push(photoBundleRef.current.animate([
          { transform: startPb },
          { transform: 'translate3d(48%, 55%, 0)' }
        ], {
          delay: ANIMATION_CONFIG.PHOTO_BUNDLE_OUTRO.delay,
          duration: ANIMATION_CONFIG.PHOTO_BUNDLE_OUTRO.duration,
          easing: ANIMATION_CONFIG.PHOTO_BUNDLE_OUTRO.easing,
          fill: 'both'
        }));
      }

      // 5. AFTER the papers are safely tucked inside the pocket (at ~560ms), the ENVELOPE descends offscreen
      if (stationeryRef?.current) {
        const startEnv = (wasRunning && !isRestingOrNone(curStationery))
          ? curStationery
          : 'translate3d(0, 0, 0)';
        anims.push(stationeryRef.current.animate([
          { transform: startEnv },
          { transform: `translate3d(0, ${exitY}px, 0)` }
        ], {
          delay: ANIMATION_CONFIG.FOLDER_OUTRO.delay,
          duration: ANIMATION_CONFIG.FOLDER_OUTRO.duration,
          easing: ANIMATION_CONFIG.FOLDER_OUTRO.easing,
          fill: 'both'
        }));
      }
    }

    activeAnimationsRef.current = anims;
    await Promise.all(anims.map(a => a.finished.catch(() => null)));

    if (id !== ticketRef.current) return;

    // Commit final resting styles before cancelling animation objects
    renderPose(intro ? 'visible' : 'hidden');
    activeAnimationsRef.current.forEach(a => {
      try { a.cancel(); } catch (e) {}
    });
    activeAnimationsRef.current = [];

    const finalState = intro ? 'visible' : 'hidden';
    setState(finalState);
    onStateChange?.(finalState);
  }, [getExitDistance, onStateChange, renderPose, setState, stationeryRef, paperBundleRef, sheetOneRef, sheetTwoRef, sheetThreeRef, tabOneRef, tabTwoRef, tabThreeRef, tabFourRef, photoBundleRef, photoRef, portraitRef, magnifierRef, glassReflectionRef]);

  const replay = useCallback(() => {
    ticketRef.current++;
    activeAnimationsRef.current.forEach(a => {
      try { a.cancel(); } catch (e) {}
    });
    activeAnimationsRef.current = [];
    renderPose('hidden');
    if (sceneRef.current) void sceneRef.current.offsetWidth;
    return move('intro');
  }, [move, renderPose, sceneRef]);

  return {
    renderPose,
    move,
    replay,
  };
}
