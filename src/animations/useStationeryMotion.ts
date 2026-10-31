import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { StationeryState } from '../types';
import { ANIMATION_CONFIG } from './constants';

export type DeskSection = 'home' | 'about' | 'works';

interface UseStationeryMotionParams {
  sceneRef: React.RefObject<HTMLDivElement | null>;
  stationeryRef: React.RefObject<HTMLDivElement | null>;
  paperBundleRef: React.RefObject<HTMLDivElement | null>;
  sheetOneRef?: React.RefObject<HTMLElement | null>;
  sheetTwoRef?: React.RefObject<HTMLElement | null>;
  sheetThreeRef?: React.RefObject<HTMLElement | null>;
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

const DOSSIER_LAYERS = [
  { selector: '.page-half-spread', scattered: { xPercent: -3, yPercent: -41, rotation: 6, scale: 0.76 } },
  { selector: '.page-half-backing', scattered: { xPercent: -56, yPercent: -45, rotation: -35, scale: 0.60 } },
  { selector: '.page-half-black-card', scattered: { xPercent: -210, yPercent: 38, rotation: 34, scale: 0.92 } },
  { selector: '.page-half-large-card', scattered: { xPercent: -2, yPercent: -46, rotation: -20, scale: 0.93 } },
  { selector: '.page-half-paper', scattered: { xPercent: 124, yPercent: -44, rotation: 30, scale: 0.96 } },
  { selector: '.page-half-small-card', scattered: { xPercent: 485, yPercent: -18, rotation: -42, scale: 1.28 } },
] as const;

const CLIPBOARD_LAYERS = [
  { selector: '.clipboard-layer-board', scattered: { xPercent: 21, yPercent: 21, rotation: 15, scale: 0.56 }, assembledRot: 0 },
  { selector: '.clipboard-layer-bottom-paper', scattered: { xPercent: -112, yPercent: -19, rotation: -22, scale: 0.50 }, assembledRot: 1.4 },
  { selector: '.clipboard-layer-middle-paper', scattered: { xPercent: 57, yPercent: -60, rotation: 24, scale: 0.49 }, assembledRot: -1.1 },
  { selector: '.clipboard-layer-front-paper', scattered: { xPercent: -98, yPercent: 32, rotation: -15, scale: 0.49 }, assembledRot: 0 },
  { selector: '.clipboard-layer-photo-frame', scattered: { xPercent: 420, yPercent: 82, rotation: 30, scale: 0.74 }, assembledRot: 0 },
  { selector: '.clipboard-layer-small-note', scattered: { xPercent: 230, yPercent: 25, rotation: -25, scale: 0.60 }, assembledRot: 0 },
  { selector: '.clipboard-layer-clip', scattered: { xPercent: -46, yPercent: -112, rotation: 68, scale: 0.63 }, assembledRot: 0 },
] as const;

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
  // Single GSAP Master Timeline Controller
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const currentSectionRef = useRef<DeskSection>('home');

  const getExitDistance = useCallback(() => {
    if (!sceneRef.current) return 796;
    const bounds = sceneRef.current.getBoundingClientRect();
    return Math.max(796, Math.ceil(window.innerHeight - bounds.top + 64));
  }, [sceneRef]);

  const getTabElements = useCallback(() => {
    return [
      { el: tabOneRef.current, rot: -1.8 },
      { el: tabTwoRef.current, rot: 1.4 },
      { el: tabThreeRef.current, rot: -1.2 },
      { el: tabFourRef?.current ?? null, rot: 1.6 },
    ];
  }, [tabOneRef, tabTwoRef, tabThreeRef, tabFourRef]);

  /**
   * Synchronously sets resting poses via gsap.set so GSAP's internal transform cache
   * stays 100% unified with the DOM without any state teleportation.
   */
  const renderPose = useCallback(
    (
      pose: 'visible' | 'hidden',
      options?: { keepBookmarks?: boolean; skipBookmarks?: boolean; section?: DeskSection }
    ) => {
      timelineRef.current?.kill();
      timelineRef.current = null;

      const exitY = getExitDistance();
      const isVis = pose === 'visible';
      const activeSection = options?.section ?? currentSectionRef.current;
      const isHomeVis = isVis && activeSection === 'home';
      const isAboutVis = isVis && activeSection === 'about';
      const isWorksVis = isVis && activeSection === 'works';
      const isBookmarksVis = isVis || Boolean(options?.keepBookmarks);

      if (stationeryRef.current) {
        gsap.set(stationeryRef.current, { x: 0, y: isHomeVis ? 0 : exitY, force3D: true });
      }
      if (paperBundleRef.current) {
        gsap.set(paperBundleRef.current, { x: 0, y: isHomeVis ? 0 : 240, force3D: true });
      }
      if (sheetOneRef?.current) {
        gsap.set(sheetOneRef.current, {
          x: 0,
          y: isHomeVis ? 0 : 20,
          rotation: 0,
          force3D: true,
        });
      }
      if (sheetTwoRef?.current) {
        gsap.set(sheetTwoRef.current, {
          x: isHomeVis ? 20 : 0,
          y: isHomeVis ? -4 : 45,
          rotation: isHomeVis ? 4.2 : 0,
          force3D: true,
        });
      }
      if (sheetThreeRef?.current) {
        gsap.set(sheetThreeRef.current, {
          x: isHomeVis ? -24 : 0,
          y: isHomeVis ? -6 : 65,
          rotation: isHomeVis ? -4.8 : 0,
          force3D: true,
        });
      }

      if (!options?.skipBookmarks) {
        const hideX = ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X;
        getTabElements().forEach(({ el, rot }) => {
          if (el) {
            gsap.set(el, {
              x: isBookmarksVis ? 0 : hideX,
              y: 0,
              rotation: rot,
              opacity: isBookmarksVis ? 1 : 0,
              force3D: true,
            });
          }
        });
      }

      if (photoBundleRef.current) {
        gsap.set(photoBundleRef.current, {
          xPercent: isHomeVis ? 0 : 48,
          yPercent: isHomeVis ? 0 : 55,
          x: 0,
          y: 0,
          force3D: true,
        });
      }
      if (photoRef.current) {
        gsap.set(photoRef.current, {
          x: isHomeVis ? 0 : 70,
          y: isHomeVis ? 0 : 90,
          rotation: isHomeVis ? 0 : 8,
          scale: isHomeVis ? 1 : 0.92,
          force3D: true,
        });
      }
      if (portraitRef.current) {
        gsap.set(portraitRef.current, {
          x: isHomeVis ? 0 : 38,
          y: isHomeVis ? 0 : 110,
          rotation: isHomeVis ? 0 : -7,
          scale: isHomeVis ? 1 : 0.94,
          force3D: true,
        });
      }
      if (magnifierRef.current) {
        gsap.set(magnifierRef.current, {
          x: isHomeVis ? 0 : 95,
          y: isHomeVis ? 0 : 85,
          rotation: isHomeVis ? 0 : -12,
          scale: isHomeVis ? 1 : 0.95,
          force3D: true,
        });
      }
      if (glassReflectionRef.current) {
        gsap.set(glassReflectionRef.current, {
          x: isHomeVis ? 0 : 95,
          y: isHomeVis ? 0 : 85,
          rotation: isHomeVis ? 0 : -12,
          scale: isHomeVis ? 1 : 0.95,
          force3D: true,
        });
      }

      // Sync PageOneHalf (About Dossier) layers
      const sceneEl = sceneRef.current;
      if (sceneEl) {
        const pageHalfRoot = sceneEl.querySelector<HTMLElement>('.page-half');
        if (pageHalfRoot) {
          gsap.set(pageHalfRoot, { zIndex: isAboutVis ? 35 : 2 });
          pageHalfRoot.setAttribute('data-settled', isAboutVis ? 'true' : 'false');
        }
        DOSSIER_LAYERS.forEach(({ selector, scattered }) => {
          const el = sceneEl.querySelector<HTMLElement>(selector);
          if (el) {
            gsap.set(el, {
              xPercent: isAboutVis ? 0 : scattered.xPercent,
              yPercent: isAboutVis ? 0 : scattered.yPercent,
              rotation: isAboutVis ? 0 : scattered.rotation,
              scale: isAboutVis ? 1 : scattered.scale,
              force3D: true,
            });
          }
        });
        const dossierInscribedEls = sceneEl.querySelectorAll<HTMLElement>('.dossier-inscribed-content');
        if (dossierInscribedEls.length > 0) {
          gsap.set(dossierInscribedEls, { opacity: isAboutVis ? 1 : 0 });
        }

        // Sync FantasyClipboardWorks (Works Clipboard) layers
        const clipboardRoot = sceneEl.querySelector<HTMLElement>('.clipboard-works');
        if (clipboardRoot) {
          gsap.set(clipboardRoot, { zIndex: isWorksVis ? 35 : 3 });
          clipboardRoot.setAttribute('data-settled', isWorksVis ? 'true' : 'false');
        }
        CLIPBOARD_LAYERS.forEach(({ selector, scattered, assembledRot }) => {
          const el = sceneEl.querySelector<HTMLElement>(selector);
          if (el) {
            gsap.set(el, {
              xPercent: isWorksVis ? 0 : scattered.xPercent,
              yPercent: isWorksVis ? 0 : scattered.yPercent,
              rotation: isWorksVis ? assembledRot : scattered.rotation,
              scale: isWorksVis ? 1 : scattered.scale,
              force3D: true,
            });
          }
        });
        const inscribedEls = sceneEl.querySelectorAll<HTMLElement>('.clipboard-inscribed-content');
        if (inscribedEls.length > 0) {
          gsap.set(inscribedEls, { opacity: isWorksVis ? 1 : 0 });
        }
      }
    },
    [
      getExitDistance,
      getTabElements,
      glassReflectionRef,
      magnifierRef,
      paperBundleRef,
      photoBundleRef,
      photoRef,
      portraitRef,
      sceneRef,
      sheetOneRef,
      sheetThreeRef,
      sheetTwoRef,
      stationeryRef,
    ]
  );

  /**
   * Dedicated GSAP bookmark slide-in (outro) or pop-out (intro) helper
   */
  const animateBookmarks = useCallback(
    (kind: 'intro' | 'outro', baseDelayMs = 0): Promise<void> => {
      return new Promise((resolve) => {
        const hideX = ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X;
        const tabs = getTabElements();
        const delaySec = baseDelayMs / 1000;
        const tl = gsap.timeline({
          onComplete: () => resolve(),
        });

        tabs.forEach(({ el, rot }, idx) => {
          if (!el) return;
          if (kind === 'intro') {
            tl.to(
              el,
              {
                x: 0,
                opacity: 1,
                rotation: rot,
                duration: 0.44,
                ease: 'back.out(1.65)',
                overwrite: 'auto',
              },
              delaySec + idx * 0.038
            );
          } else {
            tl.to(
              el,
              {
                x: hideX,
                opacity: 0,
                rotation: rot,
                duration: 0.22,
                ease: 'power2.in',
                overwrite: 'auto',
              },
              delaySec + idx * 0.018
            );
          }
        });
      });
    },
    [getTabElements]
  );

  /**
   * Master GSAP Timeline Controller for switching between Home, About (Dossier), and Works (Clipboard).
   * Synchronizes bookmark retraction, outgoing view exit/scatter, midpoint route state update,
   * incoming view assembly, and bookmark pop-out on a single timeline with zero state teleportation.
   */
  const transitionSection = useCallback(
    (
      targetSection: DeskSection,
      onRouteCommit?: (section: DeskSection) => void
    ): Promise<void> => {
      // Kill any in-flight timeline; GSAP preserves exact current sub-pixel transforms on every element
      timelineRef.current?.kill();

      const exitY = getExitDistance();
      const hideX = ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X;
      const tabs = getTabElements();
      const sceneEl = sceneRef.current;

      currentSectionRef.current = targetSection;

      return new Promise((resolve) => {
        const tl = gsap.timeline({
          defaults: { force3D: true, overwrite: 'auto' },
          onComplete: () => {
            if (timelineRef.current === tl) {
              timelineRef.current = null;
            }
            if (targetSection === 'home') {
              setState('visible');
              onStateChange?.('visible');
            } else {
              setState('hidden');
              onStateChange?.('hidden');
            }
            if (sceneEl) {
              const pageHalfRoot = sceneEl.querySelector<HTMLElement>('.page-half');
              const clipboardRoot = sceneEl.querySelector<HTMLElement>('.clipboard-works');
              if (pageHalfRoot) {
                pageHalfRoot.setAttribute('data-settled', targetSection === 'about' ? 'true' : 'false');
              }
              if (clipboardRoot) {
                clipboardRoot.setAttribute('data-settled', targetSection === 'works' ? 'true' : 'false');
              }
            }
            resolve();
          },
        });

        timelineRef.current = tl;

        // Pause idle CSS animations during motion
        const transitionState: StationeryState = targetSection === 'home' ? 'entering' : 'leaving';
        setState(transitionState);
        onStateChange?.(transitionState);

        if (sceneEl) {
          const pageHalfRoot = sceneEl.querySelector<HTMLElement>('.page-half');
          const clipboardRoot = sceneEl.querySelector<HTMLElement>('.clipboard-works');
          pageHalfRoot?.setAttribute('data-settled', 'false');
          clipboardRoot?.setAttribute('data-settled', 'false');
        }

        // ====================================================================
        // 1. BOOKMARKS RETRACT BEHIND ACTIVE FOREGROUND (t = 0.00s -> 0.24s)
        // ====================================================================
        tabs.forEach(({ el, rot }, idx) => {
          if (!el) return;
          tl.to(
            el,
            {
              x: hideX,
              opacity: 0,
              rotation: rot,
              duration: 0.21,
              ease: 'power2.in',
            },
            idx * 0.016
          );
        });

        // ====================================================================
        // 2. OUTGOING SECTIONS SCATTER / EXIT IMMEDIATELY AT t = 0.00s
        // ====================================================================
        if (targetSection !== 'home') {
          if (sheetThreeRef?.current) {
            tl.to(
              sheetThreeRef.current,
              { x: 0, y: 65, rotation: 0, duration: 0.32, ease: 'power2.inOut' },
              0
            );
          }
          if (sheetTwoRef?.current) {
            tl.to(
              sheetTwoRef.current,
              { x: 0, y: 45, rotation: 0, duration: 0.32, ease: 'power2.inOut' },
              0.015
            );
          }
          if (sheetOneRef?.current) {
            tl.to(
              sheetOneRef.current,
              { x: 0, y: 20, rotation: 0, duration: 0.32, ease: 'power2.inOut' },
              0.03
            );
          }
          if (paperBundleRef.current) {
            tl.to(
              paperBundleRef.current,
              { x: 0, y: ANIMATION_CONFIG.PAPERS_OUTRO.tuckDepthY, duration: 0.36, ease: 'power2.in' },
              0.02
            );
          }
          [magnifierRef, glassReflectionRef].forEach((ref, idx) => {
            if (ref?.current) {
              tl.to(
                ref.current,
                { x: 60, y: 50, rotation: -8, scale: 0.95, duration: 0.34, ease: 'power2.in' },
                idx * 0.01
              );
            }
          });
          if (portraitRef?.current) {
            tl.to(
              portraitRef.current,
              { x: 45, y: 65, rotation: 5, scale: 0.94, duration: 0.35, ease: 'power2.in' },
              0.01
            );
          }
          if (photoRef?.current) {
            tl.to(
              photoRef.current,
              { x: 60, y: 50, rotation: -4, scale: 0.92, duration: 0.36, ease: 'power2.in' },
              0.015
            );
          }
          if (photoBundleRef?.current) {
            tl.to(
              photoBundleRef.current,
              { xPercent: 48, yPercent: 55, duration: 0.38, ease: 'power2.in' },
              0.02
            );
          }
          if (stationeryRef?.current) {
            tl.to(
              stationeryRef.current,
              { x: 0, y: exitY, duration: 0.42, ease: 'power3.in' },
              0.10
            );
          }
        }

        if (targetSection !== 'about' && sceneEl) {
          const pageHalfRoot = sceneEl.querySelector<HTMLElement>('.page-half');
          const dossierInscribedEls = sceneEl.querySelectorAll<HTMLElement>('.dossier-inscribed-content');
          if (dossierInscribedEls.length > 0) {
            tl.to(dossierInscribedEls, { opacity: 0, duration: 0.14, ease: 'power1.out' }, 0);
          }
          DOSSIER_LAYERS.forEach(({ selector, scattered }, idx) => {
            const el = sceneEl.querySelector<HTMLElement>(selector);
            if (el) {
              tl.to(
                el,
                {
                  xPercent: scattered.xPercent,
                  yPercent: scattered.yPercent,
                  rotation: scattered.rotation,
                  scale: scattered.scale,
                  duration: 0.48,
                  ease: 'power3.inOut',
                },
                idx * 0.012
              );
            }
          });
          // Drop z-index only after bookmarks have tucked behind the foreground
          if (pageHalfRoot) {
            tl.set(pageHalfRoot, { zIndex: 2 }, 0.22);
          }
        }

        if (targetSection !== 'works' && sceneEl) {
          const clipboardRoot = sceneEl.querySelector<HTMLElement>('.clipboard-works');
          const inscribedEls = sceneEl.querySelectorAll<HTMLElement>('.clipboard-inscribed-content');
          if (inscribedEls.length > 0) {
            tl.to(inscribedEls, { opacity: 0, duration: 0.14, ease: 'power1.out' }, 0);
          }
          CLIPBOARD_LAYERS.forEach(({ selector, scattered }, idx) => {
            const el = sceneEl.querySelector<HTMLElement>(selector);
            if (el) {
              tl.to(
                el,
                {
                  xPercent: scattered.xPercent,
                  yPercent: scattered.yPercent,
                  rotation: scattered.rotation,
                  scale: scattered.scale,
                  duration: 0.48,
                  ease: 'power3.inOut',
                },
                idx * 0.012
              );
            }
          });
          // Drop z-index only after bookmarks have tucked behind the foreground
          if (clipboardRoot) {
            tl.set(clipboardRoot, { zIndex: 3 }, 0.22);
          }
        }

        // ====================================================================
        // 3. MIDPOINT ROUTE SYNC (t = 0.20s while bookmarks are hidden)
        // ====================================================================
        tl.call(
          () => {
            onRouteCommit?.(targetSection);
          },
          [],
          0.20
        );

        // ====================================================================
        // 4. INCOMING SECTION ASSEMBLY (Overlaps seamlessly at t = 0.15s)
        // ====================================================================
        if (targetSection === 'home') {
          if (stationeryRef.current) {
            tl.to(
              stationeryRef.current,
              { x: 0, y: 0, duration: 0.56, ease: 'back.out(1.12)' },
              0.14
            );
          }
          if (paperBundleRef.current) {
            tl.to(
              paperBundleRef.current,
              { x: 0, y: 0, duration: 0.52, ease: 'back.out(1.22)' },
              0.20
            );
          }
          if (sheetOneRef?.current) {
            tl.to(
              sheetOneRef.current,
              { x: 0, y: 0, rotation: 0, duration: 0.52, ease: 'back.out(1.3)' },
              0.22
            );
          }
          if (sheetTwoRef?.current) {
            tl.to(
              sheetTwoRef.current,
              { x: 20, y: -4, rotation: 4.2, duration: 0.54, ease: 'back.out(1.35)' },
              0.25
            );
          }
          if (sheetThreeRef?.current) {
            tl.to(
              sheetThreeRef.current,
              { x: -24, y: -6, rotation: -4.8, duration: 0.56, ease: 'back.out(1.35)' },
              0.28
            );
          }
          if (photoBundleRef.current) {
            tl.to(
              photoBundleRef.current,
              { xPercent: 0, yPercent: 0, duration: 0.54, ease: 'power3.out' },
              0.18
            );
          }
          if (photoRef.current) {
            tl.to(
              photoRef.current,
              { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.52, ease: 'back.out(1.2)' },
              0.22
            );
          }
          if (portraitRef.current) {
            tl.to(
              portraitRef.current,
              { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.54, ease: 'back.out(1.2)' },
              0.25
            );
          }
          [magnifierRef, glassReflectionRef].forEach((ref) => {
            if (ref.current) {
              tl.to(
                ref.current,
                { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.56, ease: 'back.out(1.25)' },
                0.28
              );
            }
          });
        } else if (targetSection === 'about' && sceneEl) {
          const pageHalfRoot = sceneEl.querySelector<HTMLElement>('.page-half');
          if (pageHalfRoot) {
            tl.set(pageHalfRoot, { zIndex: 35 }, 0.15);
          }
          DOSSIER_LAYERS.forEach(({ selector }, idx) => {
            const el = sceneEl.querySelector<HTMLElement>(selector);
            if (el) {
              tl.to(
                el,
                {
                  xPercent: 0,
                  yPercent: 0,
                  rotation: 0,
                  scale: 1,
                  duration: 0.56,
                  ease: 'expo.out',
                },
                0.15 + idx * 0.026
              );
            }
          });
          const dossierInscribedEls = sceneEl.querySelectorAll<HTMLElement>('.dossier-inscribed-content');
          if (dossierInscribedEls.length > 0) {
            tl.to(dossierInscribedEls, { opacity: 1, duration: 0.24, ease: 'power2.out' }, 0.34);
          }
        } else if (targetSection === 'works' && sceneEl) {
          const clipboardRoot = sceneEl.querySelector<HTMLElement>('.clipboard-works');
          if (clipboardRoot) {
            tl.set(clipboardRoot, { zIndex: 35 }, 0.15);
          }
          CLIPBOARD_LAYERS.forEach(({ selector, assembledRot }, idx) => {
            const el = sceneEl.querySelector<HTMLElement>(selector);
            if (el) {
              tl.to(
                el,
                {
                  xPercent: 0,
                  yPercent: 0,
                  rotation: assembledRot,
                  scale: 1,
                  duration: 0.56,
                  ease: 'expo.out',
                },
                0.15 + idx * 0.024
              );
            }
          });
          const inscribedEls = sceneEl.querySelectorAll<HTMLElement>('.clipboard-inscribed-content');
          if (inscribedEls.length > 0) {
            tl.to(inscribedEls, { opacity: 1, duration: 0.24, ease: 'power2.out' }, 0.34);
          }
        }

        // ====================================================================
        // 5. BOOKMARKS POP OUT BEHIND INCOMING FOREGROUND (t = 0.38s)
        // ====================================================================
        tabs.forEach(({ el, rot }, idx) => {
          if (!el) return;
          tl.to(
            el,
            {
              x: 0,
              opacity: 1,
              rotation: rot,
              duration: 0.44,
              ease: 'back.out(1.65)',
            },
            0.38 + idx * 0.034
          );
        });
      });
    },
    [
      getExitDistance,
      getTabElements,
      glassReflectionRef,
      magnifierRef,
      onStateChange,
      paperBundleRef,
      photoBundleRef,
      photoRef,
      portraitRef,
      sceneRef,
      setState,
      sheetOneRef,
      sheetThreeRef,
      sheetTwoRef,
      stationeryRef,
    ]
  );

  /**
   * Initial intro / full-page outro movement on the single GSAP timeline controller
   */
  const move = useCallback(
    (
      kind: 'intro' | 'outro',
      options?: { keepBookmarks?: boolean; skipBookmarks?: boolean }
    ): Promise<void> => {
      if (kind === 'intro' && !options?.skipBookmarks) {
        return transitionSection('home');
      }

      timelineRef.current?.kill();
      const exitY = getExitDistance();
      const hideX = ANIMATION_CONFIG.BOOKMARK_HIDDEN_OFFSET_X;
      const tabs = getTabElements();
      const intro = kind === 'intro';

      const nextState: StationeryState = intro ? 'entering' : 'leaving';
      setState(nextState);
      onStateChange?.(nextState);

      return new Promise((resolve) => {
        const tl = gsap.timeline({
          defaults: { force3D: true, overwrite: 'auto' },
          onComplete: () => {
            if (timelineRef.current === tl) {
              timelineRef.current = null;
            }
            const finalState: StationeryState = intro ? 'visible' : 'hidden';
            setState(finalState);
            onStateChange?.(finalState);
            resolve();
          },
        });

        timelineRef.current = tl;

        if (!options?.skipBookmarks && !options?.keepBookmarks) {
          tabs.forEach(({ el, rot }, idx) => {
            if (!el) return;
            tl.to(
              el,
              {
                x: intro ? 0 : hideX,
                opacity: intro ? 1 : 0,
                rotation: rot,
                duration: intro ? 0.44 : 0.22,
                ease: intro ? 'back.out(1.65)' : 'power2.in',
              },
              intro ? 0.34 + idx * 0.036 : idx * 0.018
            );
          });
        }

        if (intro) {
          if (stationeryRef.current) {
            tl.to(stationeryRef.current, { x: 0, y: 0, duration: 0.62, ease: 'back.out(1.12)' }, 0);
          }
          if (paperBundleRef.current) {
            tl.to(paperBundleRef.current, { x: 0, y: 0, duration: 0.56, ease: 'back.out(1.22)' }, 0.06);
          }
          if (sheetOneRef?.current) {
            tl.to(sheetOneRef.current, { x: 0, y: 0, rotation: 0, duration: 0.54, ease: 'back.out(1.3)' }, 0.08);
          }
          if (sheetTwoRef?.current) {
            tl.to(sheetTwoRef.current, { x: 20, y: -4, rotation: 4.2, duration: 0.56, ease: 'back.out(1.35)' }, 0.12);
          }
          if (sheetThreeRef?.current) {
            tl.to(sheetThreeRef.current, { x: -24, y: -6, rotation: -4.8, duration: 0.58, ease: 'back.out(1.35)' }, 0.16);
          }
          if (photoBundleRef.current) {
            tl.to(photoBundleRef.current, { xPercent: 0, yPercent: 0, duration: 0.56, ease: 'power3.out' }, 0.04);
          }
          if (photoRef.current) {
            tl.to(photoRef.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.54, ease: 'back.out(1.2)' }, 0.08);
          }
          if (portraitRef.current) {
            tl.to(portraitRef.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.56, ease: 'back.out(1.2)' }, 0.12);
          }
          [magnifierRef, glassReflectionRef].forEach((ref) => {
            if (ref.current) {
              tl.to(ref.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.58, ease: 'back.out(1.25)' }, 0.16);
            }
          });
        } else {
          if (sheetThreeRef?.current) {
            tl.to(sheetThreeRef.current, { x: 0, y: 65, rotation: 0, duration: 0.32, ease: 'power2.inOut' }, 0);
          }
          if (sheetTwoRef?.current) {
            tl.to(sheetTwoRef.current, { x: 0, y: 45, rotation: 0, duration: 0.32, ease: 'power2.inOut' }, 0.015);
          }
          if (sheetOneRef?.current) {
            tl.to(sheetOneRef.current, { x: 0, y: 20, rotation: 0, duration: 0.32, ease: 'power2.inOut' }, 0.03);
          }
          if (paperBundleRef.current) {
            tl.to(paperBundleRef.current, { x: 0, y: ANIMATION_CONFIG.PAPERS_OUTRO.tuckDepthY, duration: 0.36, ease: 'power2.in' }, 0.02);
          }
          [magnifierRef, glassReflectionRef].forEach((ref, idx) => {
            if (ref?.current) {
              tl.to(ref.current, { x: 60, y: 50, rotation: -8, scale: 0.95, duration: 0.34, ease: 'power2.in' }, idx * 0.01);
            }
          });
          if (portraitRef?.current) {
            tl.to(portraitRef.current, { x: 45, y: 65, rotation: 5, scale: 0.94, duration: 0.35, ease: 'power2.in' }, 0.01);
          }
          if (photoRef?.current) {
            tl.to(photoRef.current, { x: 60, y: 50, rotation: -4, scale: 0.92, duration: 0.36, ease: 'power2.in' }, 0.015);
          }
          if (photoBundleRef?.current) {
            tl.to(photoBundleRef.current, { xPercent: 48, yPercent: 55, duration: 0.38, ease: 'power2.in' }, 0.02);
          }
          if (stationeryRef?.current) {
            tl.to(stationeryRef.current, { x: 0, y: exitY, duration: 0.42, ease: 'power3.in' }, 0.10);
          }
        }
      });
    },
    [
      getExitDistance,
      getTabElements,
      glassReflectionRef,
      magnifierRef,
      onStateChange,
      paperBundleRef,
      photoBundleRef,
      photoRef,
      portraitRef,
      setState,
      sheetOneRef,
      sheetThreeRef,
      sheetTwoRef,
      stationeryRef,
      transitionSection,
    ]
  );

  const replay = useCallback(() => {
    currentSectionRef.current = 'home';
    return transitionSection('home');
  }, [transitionSection]);

  return {
    renderPose,
    move,
    animateBookmarks,
    transitionSection,
    replay,
  };
}
