import { clamp, easeInOut } from '../utils';
import type { ScrollContext, SectionAnimationState, SectionCache } from '../types';

// Kept for backwards compatibility with resize handling in useScrollAnimation
export const invalidateEnTargetCache = (): void => {};

export const animateSection0 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext,
  _cachedBackdrop: HTMLElement | null,
  _experienceEnSpan: HTMLElement | null,
  cache: SectionCache
): SectionAnimationState => {
  const { transitionLength, pauseLength } = ctx;

  // Solid opacity without fade out/in: visible (1) up to 2*vh, strictly hidden (0) past 2*vh
  const isVisible = currentScroll < pauseLength + transitionLength;

  if (isVisible) {
    animateSection0Parallax(currentScroll, ctx, cache);
  }

  return {
    currentYMoveVh: 0,
    currentRotation: 0,
    currentRotationX: 0,
    currentRotationY: 0,
    currentScale: 1,
    currentOpacity: isVisible ? 1 : 0,
    lockedContentXVw: 0,
  };
};

const animateSection0Parallax = (
  currentScroll: number,
  ctx: ScrollContext,
  cache: SectionCache
): void => {
  const { transitionLength, pauseLength } = ctx;
  const edTransitionStart = pauseLength + transitionLength * 0.2;
  const edTransitionEnd = pauseLength + transitionLength;

  let edScale = 1;

  if (currentScroll > edTransitionStart) {
    const progress = easeInOut(
      clamp((currentScroll - edTransitionStart) / Math.max(1, edTransitionEnd - edTransitionStart))
    );
    edScale = 1 - progress * 0.83;
  }

  const { heroPortrait } = cache;
  if (heroPortrait) {
    heroPortrait.style.transform = `scale(${edScale})`;
    heroPortrait.style.opacity = '1';
  }

  // Parallax layers
  const { parallaxLayerItems } = cache;
  const parallaxIntensity = 0.5;
  for (let i = 0; i < parallaxLayerItems.length; i++) {
    const layer = parallaxLayerItems[i];
    if (layer.isCrosshair) continue;
    layer.el.style.transform = `translate3d(${currentScroll * layer.speedX * parallaxIntensity}px, ${currentScroll * layer.speedY * parallaxIntensity}px, 0)`;
  }

  // Text parallax
  const { textElementItems } = cache;
  for (let i = 0; i < textElementItems.length; i++) {
    const item = textElementItems[i];
    item.el.style.transform = `translate3d(0, ${currentScroll * item.speed}px, 0)`;
  }

  // Code lines parallax
  const { codeLines } = cache;
  const codeYOffset = currentScroll * 0.12;
  for (let i = 0; i < codeLines.length; i++) {
    codeLines[i].style.transform = `translate3d(0, ${codeYOffset}px, 0)`;
  }

  // Float elements
  const { floatElementItems } = cache;
  for (let i = 0; i < floatElementItems.length; i++) {
    const item = floatElementItems[i];
    const spread = currentScroll * item.speed;
    item.el.style.transform = `translate3d(${spread * 1.15 * item.xDirection}px, ${spread * 1.2 * item.yDirection}px, 0)`;
  }

  // Image parallax
  const { imageWrap, imageWrapSpeed, imageWrapMobileSpeed, parallaxImg: imgElement, parallaxImgSpeed, parallaxImgMobileSpeed } = cache;
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    if (imageWrap) {
      imageWrap.style.transform = `translate3d(0, ${currentScroll * imageWrapMobileSpeed}px, 0)`;
    }
    if (imgElement) {
      imgElement.style.transform = `translate3d(0, ${currentScroll * parallaxImgMobileSpeed}px, 0)`;
    }
    for (let i = 0; i < textElementItems.length; i++) {
      const item = textElementItems[i];
      if (item.isSubtext) {
        item.el.style.transform = `translate3d(0, ${currentScroll * item.mobileSpeed}px, 0)`;
        break;
      }
    }
  } else {
    if (imageWrap && imgElement) {
      const yOffsetWrap = currentScroll * imageWrapSpeed;
      const yOffsetImg = currentScroll * parallaxImgSpeed;
      imageWrap.style.transform = `translate3d(0, ${yOffsetWrap}px, 0)`;
      imgElement.style.transform = `translate3d(0, ${yOffsetImg - yOffsetWrap}px, 0)`;
    } else if (imageWrap) {
      imageWrap.style.transform = `translate3d(0, ${currentScroll * imageWrapSpeed}px, 0)`;
    }
  }

  // Image shadow parallax
  const { imageShadow, imageShadowSpeed } = cache;
  if (imageShadow) {
    const shadowSpeed = currentScroll * imageShadowSpeed;
    imageShadow.style.transform = `translate3d(${shadowSpeed * 0.2}px, ${shadowSpeed}px, 0)`;
  }
};
