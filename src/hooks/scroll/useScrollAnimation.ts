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
  const rafIdRef = useRef<number>();

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
      bgImages: NodeListOf<HTMLElement>
    ) => {
      const { currentYMoveVh, currentRotation, currentRotationX, currentRotationY, currentScale, currentOpacity } = state;

      sec.style.transformOrigin = 'center center';
      sec.style.transform = `perspective(2000px) translate3d(0vw, ${currentYMoveVh}vh, 0) rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg) rotateZ(${currentRotation}deg) scale(${currentScale})`;
      sec.style.opacity = currentOpacity.toString();

      if (bgImages.length > 0) {
        const safeScale = Math.max(0.001, currentScale);
        const invScale = 1 / safeScale;
        const bgTransform = `scale(${invScale}) rotateZ(${-currentRotation}deg) rotateY(${-currentRotationY}deg) rotateX(${-currentRotationX}deg) translate3d(0vw, ${-currentYMoveVh}vh, 0)`;
        for (let i = 0; i < bgImages.length; i++) {
          bgImages[i].style.transform = bgTransform;
        }
      }
    };

    const handleScroll = () => {
      const currentScroll = lenisRef.current?.scroll ?? (window.pageYOffset || document.documentElement.scrollTop);

      if (Math.abs(currentScroll - lastScrollRef.current) < 0.5) return;
      lastScrollRef.current = currentScroll;

      const ctx = createScrollContext(currentScroll);
      const { transitionLength, pauseLength, sectionUnit } = ctx;
      const isDesktop = window.innerWidth >= 1024;

      // Section detection (avoid getBoundingClientRect reflow on desktop fixed stack)
      let newActiveIndex = currentScroll < sectionUnit * 0.5 ? 0
        : currentScroll < sectionUnit * 1.5 ? 1
        : currentScroll < sectionUnit * 2.5 ? 2 : 3;

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

      // Broadcast scroll range visibility to WebGL background so it pauses when offscreen
      const aboutActiveRange = currentScroll >= pauseLength * 0.25 && currentScroll <= sectionUnit * 1.65;
      window.dispatchEvent(new CustomEvent('about-webgl-visibility', { detail: aboutActiveRange }));

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

        applySectionTransform(secEl, state, cache.bgImages);

        // Sub-elements animation using cache
        const { currentYMoveVh, currentRotation, currentRotationY, currentOpacity, currentScale } = state;
        const safeScale = Math.max(0.001, currentScale);
        const invScale = 1 / safeScale;
        const transformBase = `scale(${invScale}) rotateZ(${-currentRotation}deg) translate3d(0vw, ${-currentYMoveVh}vh, 0)`;

        if (cache.parallaxContent) {
          cache.parallaxContent.style.transform = 'translate3d(0, 0, 0)';
        }

        const lockedList = cache.lockedContent;
        for (let k = 0; k < lockedList.length; k++) {
          const content = lockedList[k];
          if (i === 0 && content.classList.contains('parallax-image')) continue;
          if (i === 2 && currentScroll >= (i * (transitionLength + pauseLength) + pauseLength)) {
            content.style.transform = `scale(${invScale}) rotateY(${-currentRotationY}deg) rotateZ(${-currentRotation}deg) translate3d(0vw, ${-currentYMoveVh}vh, 0)`;
          } else {
            content.style.transform = transformBase;
          }
          content.style.opacity = (i === 2 && currentScroll >= (pauseLength + transitionLength + pauseLength) && currentScroll < (2 * (transitionLength + pauseLength) + pauseLength)) ? '1' : currentOpacity.toString();
        }

        if (i === 2 && isDesktop) {
          const section2ImageEl = cache.section2Image ?? (secEl.querySelector('[data-section2="image"]') as HTMLElement | null);
          const section2DescEl = cache.section2Desc ?? (secEl.querySelector('[data-section2="desc"]') as HTMLElement | null);
          const section2SkillsEl = cache.section2Skills ?? (secEl.querySelector('[data-section2="skills"]') as HTMLElement | null);

          const worksContainer = cache.worksScrollContainer;
          const baseP = (() => {
            if (!worksContainer || !section2ImageEl) return 1;
            const revealStart = section2ImageEl.offsetTop - worksContainer.clientHeight * 0.55;
            const revealRange = Math.max(1, worksContainer.clientHeight * 0.35);
            const raw = (worksContainer.scrollTop - revealStart) / revealRange;
            return Math.max(0, Math.min(1, raw));
          })();

          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

          const applyFade = (el: HTMLElement | null, t: number, baseYPx: number) => {
            if (!el) return;
            const e = easeOut(t);
            el.style.opacity = e.toString();
            el.style.transform = `translate3d(0, ${(1 - e) * baseYPx}px, 0)`;
            if (t >= 1) {
              el.style.transform = 'translate3d(0, 0, 0)';
            }
            if (t <= 0) {
              el.style.opacity = '0';
            }
          };

          const imgT = Math.max(0, Math.min(1, (baseP - 0.00) / 0.75));
          const descT = Math.max(0, Math.min(1, (baseP - 0.18) / 0.75));
          const skillsT = Math.max(0, Math.min(1, (baseP - 0.35) / 0.70));

          applyFade(section2ImageEl, imgT, 120);
          applyFade(section2DescEl, descT, 90);
          applyFade(section2SkillsEl, skillsT, 70);

          if (currentOpacity < 0.99) {
            const safeOpacity = Math.max(0, Math.min(1, currentOpacity));
            if (section2ImageEl) section2ImageEl.style.opacity = safeOpacity.toString();
            if (section2DescEl) section2DescEl.style.opacity = safeOpacity.toString();
            if (section2SkillsEl) section2SkillsEl.style.opacity = safeOpacity.toString();
          }
        }

        if (i === 1) {
          // About (Section 1): directional scroll-driven animations using pre-parsed cache
          const { aboutFadeItems } = cache;
          if (aboutFadeItems && aboutFadeItems.length > 0) {
            const enterEnd = pauseLength + transitionLength;
            const fadeStart = enterEnd - transitionLength * 0.45;
            const fadeRange = transitionLength * 0.45;
            const rawProgress = Math.max(0, Math.min(1, (currentScroll - fadeStart) / fadeRange));
            const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);

            for (let f = 0; f < aboutFadeItems.length; f++) {
              const item = aboutFadeItems[f];
              const { el, order, dir, isImageWrap, children } = item;
              const staggerOffset = order * 0.05;
              const denom = Math.max(0.01, 1 - staggerOffset);
              const elRaw = Math.max(0, Math.min(1, (rawProgress - staggerOffset) / denom));

              const opacityP = Math.pow(elRaw, 1.5);
              const p = easeOut3(elRaw);

              el.style.transition = 'none';

              if (dir === 'pop-children') {
                el.style.opacity = opacityP.toString();
                el.style.transform = '';
                const childCount = children.length;
                for (let c = 0; c < childCount; c++) {
                  const child = children[c];
                  const childDelay = (c / Math.max(1, childCount)) * 0.6;
                  const childRaw = Math.max(0, Math.min(1, (p - childDelay) / Math.max(0.01, 1 - childDelay)));
                  const childP = easeOut3(childRaw);
                  child.style.transition = 'none';
                  child.style.opacity = childP.toString();
                  child.style.transform = `scale(${childP})`;
                }
              } else {
                el.style.opacity = opacityP.toString();
                const baseY = isImageWrap ? -60 : 0;
                switch (dir) {
                  case 'left': {
                    const tx = (1 - p) * -100;
                    const s = 0.85 + p * 0.15;
                    el.style.transform = `translateX(${tx}px) translateY(${baseY}px) scale(${s})`;
                    break;
                  }
                  case 'top': {
                    const ty = (1 - p) * -50;
                    el.style.transform = `translateY(${baseY + ty}px)`;
                    break;
                  }
                  case 'right': {
                    const tx = (1 - p) * 100;
                    el.style.transform = `translateX(${tx}px) translateY(${baseY}px)`;
                    break;
                  }
                  case 'bottom':
                  default: {
                    const ty = (1 - p) * 40;
                    el.style.transform = `translateY(${baseY + ty}px)`;
                    break;
                  }
                }
              }
            }

            if (currentOpacity < 0.99) {
              const safeOpacity = Math.max(0, Math.min(1, currentOpacity));
              for (let f = 0; f < aboutFadeItems.length; f++) {
                const item = aboutFadeItems[f];
                item.el.style.opacity = safeOpacity.toString();
                if (item.dir === 'pop-children') {
                  for (let c = 0; c < item.children.length; c++) {
                    item.children[c].style.opacity = safeOpacity.toString();
                  }
                }
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
          cache.frameOverlay.style.transform = `scale(${invScale}) rotateZ(${-currentRotation}deg) rotateY(${-currentRotationY}deg) rotateX(0deg) translate3d(0vw, ${-currentYMoveVh}vh, 0)`;
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
