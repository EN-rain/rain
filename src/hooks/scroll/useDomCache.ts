import { useCallback, useRef } from 'react';
import type { DomCache, SectionCache } from './types';

export const useDomCache = () => {
  const domCacheRef = useRef<DomCache>({} as DomCache);
  const vhRef = useRef(window.innerHeight);

  const cacheDom = useCallback(() => {
    const sections = document.querySelectorAll('.stack-section');
    const sectionCaches: SectionCache[] = Array.from(sections).map(sec => {
      const textParallaxBlocks = sec.querySelectorAll('.scroll-parallax-text') as NodeListOf<HTMLElement>;
      const edPrimaryElements = sec.querySelectorAll('.home-section__image-bg-text') as NodeListOf<HTMLElement>;
      const parallaxLayers = sec.querySelectorAll('.parallax-layer') as NodeListOf<HTMLElement>;
      const textElements = sec.querySelectorAll('.parallax-text') as NodeListOf<HTMLElement>;
      const floatElements = sec.querySelectorAll('.parallax-float') as NodeListOf<HTMLElement>;
      const imageWrap = sec.querySelector('.parallax-image') as HTMLElement | null;
      const imageShadow = sec.querySelector('.parallax-shadow') as HTMLElement | null;
      const parallaxImg = sec.querySelector('.parallax-img') as HTMLElement | null;
      const aboutFadeTargets = sec.querySelectorAll('[data-about-fade]') as NodeListOf<HTMLElement>;

      return {
        parallaxContent: sec.querySelector('.parallax-content') as HTMLElement | null,
        lockedContent: sec.querySelectorAll('.locked-content') as NodeListOf<HTMLElement>,
        textParallaxBlocks,
        textParallaxBlockItems: Array.from(textParallaxBlocks).map(block => ({
          el: block,
          speed: parseFloat(block.getAttribute('data-speed') || '0.04'),
        })),
        frameOverlay: sec.querySelector('.section-frame-overlay') as HTMLElement | null,
        clipInner: sec.querySelector('.clip-gap-inner') as HTMLElement | null,
        clipOuter: sec.querySelector('.clip-gap-outer') as HTMLElement | null,
        bgImages: sec.querySelectorAll('.bg-image') as NodeListOf<HTMLElement>,
        edPrimaryElements,
        edPrimaryItems: Array.from(edPrimaryElements).map(el => ({
          el,
          homeLetterE: el.querySelector('.home-letter-e') as HTMLElement | null,
          homeLetterN: el.querySelector('.home-letter-n') as HTMLElement | null,
        })),
        heroPortrait: sec.querySelector('.home-section__intro-image') as HTMLElement | null,
        parallaxLayers,
        parallaxLayerItems: Array.from(parallaxLayers).map(layer => ({
          el: layer,
          speedY: parseFloat(layer.getAttribute('data-speed') || '0'),
          speedX: parseFloat(layer.getAttribute('data-speed-x') || '0'),
          isCrosshair: layer.classList.contains('home-section__crosshair'),
        })),
        textElements,
        textElementItems: Array.from(textElements).map(el => ({
          el,
          speed: parseFloat(el.getAttribute('data-text-speed') || '0.2'),
          isSubtext: el.classList.contains('home-section__subtext'),
          mobileSpeed: parseFloat(el.getAttribute('data-speed-mobile') || '0.08'),
        })),
        codeLines: sec.querySelectorAll('.home-section__code-line') as NodeListOf<HTMLElement>,
        floatElements,
        floatElementItems: Array.from(floatElements).map(el => {
          const speed = parseFloat(el.getAttribute('data-float-speed') || '0.1');
          let xDirection = 0;
          let yDirection = 0;
          const cl = el.classList;
          if (cl.contains('home-section__code--left')) { xDirection = -0.7; yDirection = 0.2; }
          else if (cl.contains('home-section__code--right')) { xDirection = 0.7; yDirection = -0.2; }
          else if (cl.contains('home-section__glyph--en-1')) { xDirection = -1.25; yDirection = 0.1; }
          else if (cl.contains('home-section__glyph--en-2')) { xDirection = 1.25; yDirection = 0.15; }
          else if (cl.contains('home-section__glyph--en-3')) { xDirection = 0; yDirection = -1.2; }
          else if (cl.contains('home-section__glyph--en-4')) { xDirection = -0.9; yDirection = -0.8; }
          else if (cl.contains('home-section__glyph--en-5')) { xDirection = 0.95; yDirection = -0.85; }
          else if (cl.contains('home-section__glyph--en-6')) { xDirection = -0.85; yDirection = 1.05; }
          else if (cl.contains('home-section__glyph--en-7')) { xDirection = 0.9; yDirection = 1.1; }
          return { el, speed, xDirection, yDirection };
        }),
        imageWrap,
        imageWrapSpeed: imageWrap ? parseFloat(imageWrap.getAttribute('data-img-speed') || '0.02') : 0.02,
        imageWrapMobileSpeed: imageWrap ? parseFloat(imageWrap.getAttribute('data-speed-mobile') || '0.15') : 0.15,
        imageShadow,
        imageShadowSpeed: imageShadow ? parseFloat(imageShadow.getAttribute('data-shadow-speed') || '0.06') : 0.06,
        worksScrollContainer: sec.querySelector('.works-scroll-container') as HTMLElement | null,
        parallaxImg,
        parallaxImgSpeed: parallaxImg ? parseFloat(parallaxImg.getAttribute('data-img-scroll') || '0.04') : 0.04,
        parallaxImgMobileSpeed: parallaxImg ? parseFloat(parallaxImg.getAttribute('data-img-scroll-mobile') || '0.25') : 0.25,
        section2Desc: sec.querySelector('[data-section2="desc"]') as HTMLElement | null,
        section2Image: sec.querySelector('[data-section2="image"]') as HTMLElement | null,
        section2Skills: sec.querySelector('[data-section2="skills"]') as HTMLElement | null,
        aboutFadeTargets,
        aboutFadeItems: Array.from(aboutFadeTargets).map(el => ({
          el,
          order: parseFloat(el.getAttribute('data-about-fade-order') || '0'),
          dir: el.getAttribute('data-about-fade-dir') || 'bottom',
          isImageWrap: el.classList.contains('about-image-wrap'),
          children: Array.from(el.children) as HTMLElement[],
        })),
      };
    });

    const globalEnBackdrop = document.querySelector('.global-en-backdrop') as HTMLElement | null;

    domCacheRef.current = {
      sections,
      sectionCaches,
      globalEnBackdrop,
      backdropLetterE: globalEnBackdrop?.querySelector('.letter-e') as HTMLElement | null,
      backdropLetterN: globalEnBackdrop?.querySelector('.letter-n') as HTMLElement | null,
      aboutNameE: document.querySelector('.about-name-e') as HTMLElement | null,
      aboutNameN: document.querySelector('.about-name-n') as HTMLElement | null,
      experienceEnSpan: document.querySelector('[data-en-target="experience-en"]') as HTMLElement | null,
      progressEl: document.getElementById('section-progress'),
      root: document.getElementById('root'),
      contactIcon: document.getElementById('contact-icon') as HTMLElement | null,
      contactHeading: document.querySelector('.contact-copy h2') as HTMLElement | null,
      contactSubtext: document.querySelector('.contact-copy p') as HTMLElement | null,
      contactGrid: document.querySelector('.contact-grid') as HTMLElement | null,
      contactTexts: document.querySelectorAll('.contact-text') as NodeListOf<HTMLElement>,
    };
  }, []);

  return { domCacheRef, vhRef, cacheDom };
};
