import { useEffect, useRef } from 'react';
import { useLenis } from './useLenis';
import { useDomCache } from './useDomCache';
import { updateBackground } from './backgroundAnimation';
import { animateBackdrop } from './backdropAnimation';
import { animateContact } from './contactAnimation';
import { animateSection0, animateSection1, animateSection2, animateSection3, invalidateEnTargetCache } from './sectionAnimations';
import type { ScrollContext, SectionAnimationState } from './types';

export const useScrollAnimation = (onSectionChange: (index: number) => void) => {
  const lenisRef = useLenis();
  const { domCacheRef, vhRef, cacheDom } = useDomCache();
  const lastScrollRef = useRef(-1);
  const lastActiveSectionRef = useRef(-1);
  const scrollDirectionRef = useRef<1 | -1>(1);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    cacheDom();

    const handleResize = () => {
      vhRef.current = window.innerHeight;
      cacheDom();
      invalidateEnTargetCache();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const createScrollContext = (currentScroll: number): ScrollContext => {
      const vh = vhRef.current;
      const transitionLength = vh;
      const pauseLength = vh;
      return {
        currentScroll,
        vh,
        transitionLength,
        pauseLength,
        sectionUnit: vh + pauseLength,
        gapVh: 25,
        bgTransitionSpeed: transitionLength * 0.65,
      };
    };

    const applySectionTransform = (
      sec: HTMLElement,
      state: SectionAnimationState,
      bgImages: NodeListOf<HTMLElement>,
      index: number,
      activeIndex: number
    ) => {
      const { currentOpacity } = state;
      const isVisible = currentOpacity > 0.01;
      const isActive = index === activeIndex;

      // Full-bleed native 1:1 viewport positioning (no 3D card-stack scale/rotate distortion)
      sec.style.transformOrigin = 'center center';
      sec.style.transform = 'translate3d(0, 0, 0) scale(1)';
      sec.style.opacity = isVisible ? '1' : '0';
      sec.style.visibility = isVisible ? 'visible' : 'hidden';
      sec.style.pointerEvents = isVisible && isActive ? 'auto' : 'none';
      sec.style.zIndex = isActive ? '40' : isVisible ? '20' : '0';

      if (bgImages.length > 0) {
        for (let i = 0; i < bgImages.length; i++) {
          bgImages[i].style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
      }
    };

    const dispatchWebGLSectionTransition = (currentScroll: number, ctx: ScrollContext) => {
      if ((window as any).__isProgrammaticSectionTransition) {
        return;
      }

      if (window.innerWidth <= 768) {
        window.dispatchEvent(
          new CustomEvent('section-scroll-transition', {
            detail: { active: false, fromIndex: 0, toIndex: 1, progress: 0, direction: 1 },
          })
        );
        return;
      }

      const { pauseLength, transitionLength } = ctx;
      // 3 transition zones:
      // Zone 0 (Home -> About): [vh, 2*vh]
      // Zone 1 (About -> Works): [3*vh, 4*vh]
      // Zone 2 (Works -> Contact): [5*vh, 6*vh]
      const z0Start = pauseLength;
      const z0End = z0Start + transitionLength;

      const z1Start = 2 * pauseLength + transitionLength;
      const z1End = z1Start + transitionLength;

      const z2Start = 3 * pauseLength + 2 * transitionLength;
      const z2End = z2Start + transitionLength;

      let active = false;
      let fromIndex = 0;
      let toIndex = 1;
      let progress = 0;

      const isScrollingUp = scrollDirectionRef.current < 0;

      if (currentScroll > z0Start && currentScroll < z0End) {
        active = true;
        const normProgress = (currentScroll - z0Start) / Math.max(1, transitionLength);
        if (isScrollingUp) {
          fromIndex = 1;
          toIndex = 0;
          progress = 1.0 - normProgress;
        } else {
          fromIndex = 0;
          toIndex = 1;
          progress = normProgress;
        }
      } else if (currentScroll > z1Start && currentScroll < z1End) {
        active = true;
        const normProgress = (currentScroll - z1Start) / Math.max(1, transitionLength);
        if (isScrollingUp) {
          fromIndex = 2;
          toIndex = 1;
          progress = 1.0 - normProgress;
        } else {
          fromIndex = 1;
          toIndex = 2;
          progress = normProgress;
        }
      } else if (currentScroll > z2Start && currentScroll < z2End) {
        active = true;
        const normProgress = (currentScroll - z2Start) / Math.max(1, transitionLength);
        if (isScrollingUp) {
          fromIndex = 3;
          toIndex = 2;
          progress = 1.0 - normProgress;
        } else {
          fromIndex = 2;
          toIndex = 3;
          progress = normProgress;
        }
      }

      window.dispatchEvent(
        new CustomEvent('section-scroll-transition', {
          detail: {
            active,
            fromIndex,
            toIndex,
            progress: Math.max(0, Math.min(1, progress)),
            direction: scrollDirectionRef.current,
          },
        })
      );
    };

    const handleScroll = () => {
      const currentScroll = lenisRef.current?.scroll ?? (window.pageYOffset || document.documentElement.scrollTop);

      const delta = currentScroll - lastScrollRef.current;
      if (Math.abs(delta) < 0.5) return;
      if (lastScrollRef.current >= 0) {
        scrollDirectionRef.current = delta >= 0 ? 1 : -1;
      }
      lastScrollRef.current = currentScroll;

      const ctx = createScrollContext(currentScroll);
      const { transitionLength, pauseLength, sectionUnit } = ctx;

      // Section detection (avoid getBoundingClientRect reflow on desktop fixed stack)
      let newActiveIndex = currentScroll < sectionUnit * 0.75 ? 0
        : currentScroll < sectionUnit * 1.75 ? 1
        : currentScroll < sectionUnit * 2.75 ? 2 : 3;

      if (window.innerWidth <= 768 && domCacheRef.current.sections) {
        const sectionsArray = Array.from(domCacheRef.current.sections);
        const probeY = Math.min(window.innerHeight - 1, 72);

        const activeByProbeIndex = sectionsArray.findIndex((sec) => {
          const rect = sec.getBoundingClientRect();
          return rect.top <= probeY && rect.bottom > probeY;
        });

        if (activeByProbeIndex >= 0) {
          newActiveIndex = activeByProbeIndex;
        } else {
          const viewportMiddle = window.innerHeight / 2;
          let minDistance = Infinity;
          sectionsArray.forEach((sec, idx) => {
            const rect = sec.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);
            if (distance < minDistance) {
              minDistance = distance;
              newActiveIndex = idx;
            }
          });
        }
      }

      if (newActiveIndex !== lastActiveSectionRef.current) {
        lastActiveSectionRef.current = newActiveIndex;
        onSectionChange(newActiveIndex);
      }

      // Broadcast scroll range visibility to WebGL backgrounds so they pause when offscreen
      const aboutActiveRange = currentScroll >= pauseLength * 0.25 && currentScroll <= sectionUnit * 1.85;
      window.dispatchEvent(new CustomEvent('about-webgl-visibility', { detail: aboutActiveRange }));

      const worksActiveRange = window.innerWidth <= 768
        ? newActiveIndex === 2
        : currentScroll >= sectionUnit * 1.35 && currentScroll <= sectionUnit * 3.1;
      window.dispatchEvent(new CustomEvent('works-webgl-visibility', { detail: worksActiveRange }));

      // Drive the cloned repo's WebGL 2 section scroll transition shader
      dispatchWebGLSectionTransition(currentScroll, ctx);

      const {
        progressEl, root, globalEnBackdrop: cachedBackdrop, experienceEnSpan, sections, sectionCaches
      } = domCacheRef.current;

      // Update progress bar
      if (progressEl) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        progressEl.style.width = `${(currentScroll / maxScroll) * 100}%`;
      }

      // Update background
      updateBackground(currentScroll, ctx, root);

      // Section animations
      sections?.forEach((sec, i) => {
        const secEl = sec as HTMLElement;
        const cache = sectionCaches[i];
        if (!cache) return;

        let state: SectionAnimationState;

        switch (i) {
          case 0:
            state = animateSection0(secEl, currentScroll, ctx, cachedBackdrop, experienceEnSpan, cache);
            break;
          case 1:
            state = animateSection1(secEl, currentScroll, ctx);
            break;
          case 2:
            state = animateSection2(secEl, currentScroll, ctx, cache);
            break;
          case 3:
            state = animateSection3(secEl, currentScroll, ctx);
            break;
          default:
            state = { currentYMoveVh: 0, currentRotation: 0, currentRotationX: 0, currentRotationY: 0, currentScale: 1, currentOpacity: 1, lockedContentXVw: 0 };
        }

        applySectionTransform(secEl, state, cache.bgImages, i, newActiveIndex);

        if (cache.parallaxContent) {
          cache.parallaxContent.style.transform = 'translate3d(0, 0, 0)';
        }

        const lockedList = cache.lockedContent;
        for (let k = 0; k < lockedList.length; k++) {
          const content = lockedList[k];
          if (i === 0 && content.classList.contains('parallax-image')) continue;
          content.style.transform = 'translate3d(0, 0, 0) scale(1)';
          content.style.opacity = '1';
        }

        if (i === 1) {
          // About (Section 1): solid elements without opacity fade out/in
          const { aboutFadeItems } = cache;
          if (aboutFadeItems && aboutFadeItems.length > 0) {
            for (let f = 0; f < aboutFadeItems.length; f++) {
              const item = aboutFadeItems[f];
              const { el, children } = item;
              el.style.transition = 'none';
              el.style.opacity = '1';
              el.style.transform = 'translate3d(0, 0, 0)';

              const childCount = children.length;
              for (let c = 0; c < childCount; c++) {
                const child = children[c];
                child.style.transition = 'none';
                child.style.opacity = '1';
                child.style.transform = 'translate3d(0, 0, 0)';
              }
            }
          }
        }

        const referenceStart = i === 0 ? 0 : ((i - 1) * (transitionLength + pauseLength)) + pauseLength;
        const textBlockItems = cache.textParallaxBlockItems;
        for (let b = 0; b < textBlockItems.length; b++) {
          const item = textBlockItems[b];
          item.el.style.transform = `translate3d(0, ${(currentScroll - referenceStart) * item.speed * 0.08}px, 0)`;
        }

        if (cache.frameOverlay) {
          cache.frameOverlay.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
      });

      // Backdrop animation
      animateBackdrop(currentScroll, ctx, cachedBackdrop);

      // Contact animations
      const { contactIcon, contactHeading, contactSubtext, contactGrid, contactTexts } = domCacheRef.current;
      animateContact(currentScroll, ctx, contactIcon, contactHeading, contactSubtext, contactGrid, contactTexts);
    };

    const rafScrollHandler = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        handleScroll();
        rafIdRef.current = undefined;
      });
    };

    if (lenisRef.current) {
      lenisRef.current.on('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', rafScrollHandler, { passive: true });
    }

    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', rafScrollHandler);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [onSectionChange, cacheDom, lenisRef]);
};
