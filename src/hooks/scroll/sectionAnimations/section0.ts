import { clamp, easeInOut, smoothProgress } from '../utils';
import type { ScrollContext, SectionAnimationState, SectionCache } from '../types';

const minScale = 0.5;
const maxScale = 1.2;

// Small visual nudges to account for font hinting/subpixel rounding.
// Negative = move left, positive = move right. Applied progressively via scroll progress.
const ABOUT_TARGET_NUDGE_EM = 0.11;
const EXPERIENCE_TARGET_NUDGE_EM = 0.17;

let _phase1BaselineCache: {
  aboutE: HTMLElement;
  aboutN: HTMLElement;
  letterEEl: HTMLElement;
  letterNEl: HTMLElement;
  aboutFontSize: number;
  aboutNudgeX: number;
  backdropFontSize: number;
  targetScale: number;
  backdropCenterX: number;
  backdropCenterY: number;
  baseECenterX: number;
  baseECenterY: number;
  baseNCenterX: number;
  baseNCenterY: number;
} | null = null;

let _phase2MergeCache:
  | {
      startGlobalTranslateOffsetX: number;
      startGlobalTranslateOffsetY: number;
      startScale: number;
      startLetterEX: number;
      startLetterEY: number;
      startLetterNX: number;
      startLetterNY: number;
      startLetterEOffsetX: number;
      startLetterEOffsetY: number;
      startLetterNOffsetX: number;
      startLetterNOffsetY: number;
      startBackdropCenterX: number;
      startBackdropCenterY: number;
      startLetterECenterX: number;
      startLetterECenterY: number;
      startLetterNCenterX: number;
      startLetterNCenterY: number;
      targetFontSize: number;
      expNudgeX: number;
      backdropFontSize: number;
      targetScale: number;
      textNode: Text | undefined;
    }
  | null = null;

// Kept for compatibility with resize handling in the main scroll hook.
export const invalidateEnTargetCache = () => {
  _phase1BaselineCache = null;
  _phase2MergeCache = null;
};

export const animateSection0 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext,
  cachedBackdrop: HTMLElement | null,
  experienceEnSpan: HTMLElement | null,
  cache: SectionCache
): SectionAnimationState => {
  const { transitionLength, pauseLength, gapVh, sectionUnit } = ctx;
  const leaveStart = pauseLength;
  const leaveEnd = leaveStart + transitionLength;

  let currentYMoveVh = 0;
  let currentRotation = 0;
  let currentScale = maxScale;
  let currentOpacity = 1;

  if (currentScroll < leaveStart) {
    currentYMoveVh = 0;
    currentRotation = 0;
    currentScale = maxScale;
    currentOpacity = 1;
  } else if (currentScroll >= leaveStart && currentScroll < leaveEnd) {
    const progress = (currentScroll - leaveStart) / transitionLength;
    const smProgress = smoothProgress(progress);
    currentYMoveVh = progress * (100 + gapVh);
    currentRotation = progress * 10;
    currentScale = maxScale - smProgress * (maxScale - minScale);
    currentOpacity = 1;
  } else {
    currentYMoveVh = 100 + gapVh;
    currentRotation = 10;
    currentScale = minScale;
    currentOpacity = 1;
  }

  // Parallax and backdrop animations - run through Phase 2 (Section 3 merge)
  if (currentScroll < sectionUnit * 2) {
    animateSection0Parallax(currentScroll, ctx, cachedBackdrop, experienceEnSpan, cache);
  }

  return { currentYMoveVh, currentRotation, currentRotationX: 0, currentRotationY: 0, currentScale, currentOpacity, lockedContentXVw: 0 };
};

const ensurePhase1BaselineCache = (cachedBackdrop: HTMLElement) => {
  if (_phase1BaselineCache) return _phase1BaselineCache;

  const aboutE = document.querySelector('.about-name-e') as HTMLElement | null;
  const aboutN = document.querySelector('.about-name-n') as HTMLElement | null;
  const letterEEl = cachedBackdrop.querySelector('.letter-e') as HTMLElement | null;
  const letterNEl = cachedBackdrop.querySelector('.letter-n') as HTMLElement | null;

  if (!aboutE || !aboutN || !letterEEl || !letterNEl) return null;

  const prevBackdropTransform = cachedBackdrop.style.transform;
  const prevETransform = letterEEl.style.transform;
  const prevNTransform = letterNEl.style.transform;

  cachedBackdrop.style.transform = 'translate3d(-50%, -50%, 0)';
  letterEEl.style.transform = 'translate3d(0%, 0%, 0) scale(1)';
  letterNEl.style.transform = 'translate3d(0%, 0%, 0) scale(1)';

  const backdropRect = cachedBackdrop.getBoundingClientRect();
  const eRect = letterEEl.getBoundingClientRect();
  const nRect = letterNEl.getBoundingClientRect();

  const aboutFontSize = parseFloat(window.getComputedStyle(aboutE).fontSize);
  const backdropFontSize = parseFloat(window.getComputedStyle(cachedBackdrop).fontSize) || 600;
  const aboutNudgeX = (Number.isFinite(aboutFontSize) ? aboutFontSize : 0) * ABOUT_TARGET_NUDGE_EM;
  const targetScale = aboutFontSize / backdropFontSize;

  cachedBackdrop.style.transform = prevBackdropTransform;
  letterEEl.style.transform = prevETransform;
  letterNEl.style.transform = prevNTransform;

  _phase1BaselineCache = {
    aboutE,
    aboutN,
    letterEEl,
    letterNEl,
    aboutFontSize,
    aboutNudgeX,
    backdropFontSize,
    targetScale,
    backdropCenterX: backdropRect.left + backdropRect.width / 2,
    backdropCenterY: backdropRect.top + backdropRect.height / 2,
    baseECenterX: eRect.left + eRect.width / 2,
    baseECenterY: eRect.top + eRect.height / 2,
    baseNCenterX: nRect.left + nRect.width / 2,
    baseNCenterY: nRect.top + nRect.height / 2,
  };

  return _phase1BaselineCache;
};

const animateSection0Parallax = (
  currentScroll: number,
  ctx: ScrollContext,
  cachedBackdrop: HTMLElement | null,
  experienceEnSpan: HTMLElement | null,
  cache: SectionCache
): void => {
  const { transitionLength, pauseLength } = ctx;
  const edTransitionStart = pauseLength + transitionLength * 0.2;
  const edTransitionEnd = pauseLength + transitionLength;
  const section3EnterStart = pauseLength + transitionLength + pauseLength;
  const section3SettleEnd = section3EnterStart + transitionLength * 0.8;

  let edTranslateX = -50, edTranslateY = -50, edScale = 1, edPrimaryOpacity = 1;
  let edPrimaryColor = 'rgba(255, 255, 255, 1)';
  let homeLetterEX = 0, homeLetterEY = 0, homeLetterNX = 0, homeLetterNY = 0, homeEnScale = 1;
  let letterEX = 0, letterEY = 0, letterNX = 0, letterNY = 0, globalEnScale = 1;
  let globalEnTranslateX = -50, globalEnTranslateY = -50;
  let globalEnTranslateOffsetX = 0, globalEnTranslateOffsetY = 0;
  let letterEOffsetX = 0, letterEOffsetY = 0, letterNOffsetX = 0, letterNOffsetY = 0;

  // Phase 1: Section 2 shrink animation (Zero forced synchronous reflows using cached baseline geometry)
  if (currentScroll > edTransitionStart && cachedBackdrop) {
    const progress = easeInOut(clamp((currentScroll - edTransitionStart) / Math.max(1, edTransitionEnd - edTransitionStart)));
    const p1 = ensurePhase1BaselineCache(cachedBackdrop);

    globalEnTranslateX = -50;
    globalEnTranslateY = -50;
    globalEnScale = 1;
    letterEX = 0;
    letterEY = 0;
    letterNX = 0;
    letterNY = 0;

    if (p1) {
      const eTargetRect = p1.aboutE.getBoundingClientRect();
      const nTargetRect = p1.aboutN.getBoundingClientRect();
      const eTargetCenterX = eTargetRect.left + eTargetRect.width / 2;
      const eTargetCenterY = eTargetRect.top + eTargetRect.height / 2;
      const nTargetCenterX = nTargetRect.left + nTargetRect.width / 2;
      const nTargetCenterY = nTargetRect.top + nTargetRect.height / 2;

      const nudgedETargetCenterX = eTargetCenterX + p1.aboutNudgeX;
      const nudgedNTargetCenterX = nTargetCenterX + p1.aboutNudgeX;

      const targetCenterX = (nudgedETargetCenterX + nudgedNTargetCenterX) / 2;
      const targetCenterY = (eTargetCenterY + nTargetCenterY) / 2;

      globalEnTranslateOffsetX = (targetCenterX - p1.backdropCenterX) * progress;
      globalEnTranslateOffsetY = (targetCenterY - p1.backdropCenterY) * progress;
      globalEnScale = 1 + (p1.targetScale - 1) * progress;

      const eCenterX = p1.baseECenterX + globalEnTranslateOffsetX;
      const eCenterY = p1.baseECenterY + globalEnTranslateOffsetY;
      const nCenterX = p1.baseNCenterX + globalEnTranslateOffsetX;
      const nCenterY = p1.baseNCenterY + globalEnTranslateOffsetY;

      letterEOffsetX = (nudgedETargetCenterX - eCenterX) * progress;
      letterEOffsetY = (eTargetCenterY - eCenterY) * progress;
      letterNOffsetX = (nudgedNTargetCenterX - nCenterX) * progress;
      letterNOffsetY = (nTargetCenterY - nCenterY) * progress;
    }
  }

  // Phase 2: Section 3 merge animation
  if (currentScroll > section3EnterStart && cachedBackdrop && experienceEnSpan) {
    const progress3 = easeInOut(clamp((currentScroll - section3EnterStart) / Math.max(1, section3SettleEnd - section3EnterStart)));
    if (!_phase2MergeCache) {
      cachedBackdrop.style.transform = `translate3d(calc(${globalEnTranslateX}% + ${globalEnTranslateOffsetX}px), calc(${globalEnTranslateY}% + ${globalEnTranslateOffsetY}px), 0)`;
      const letterEEl = cachedBackdrop.querySelector('.letter-e') as HTMLElement | null;
      const letterNEl = cachedBackdrop.querySelector('.letter-n') as HTMLElement | null;
      if (letterEEl) letterEEl.style.transform = `translate3d(calc(${letterEX}% + ${letterEOffsetX}px), calc(${letterEY}% + ${letterEOffsetY}px), 0) scale(${globalEnScale})`;
      if (letterNEl) letterNEl.style.transform = `translate3d(calc(${letterNX}% + ${letterNOffsetX}px), calc(${letterNY}% + ${letterNOffsetY}px), 0) scale(${globalEnScale})`;

      const backdropRect = cachedBackdrop.getBoundingClientRect();
      const backdropCenterX = backdropRect.left + backdropRect.width / 2;
      const backdropCenterY = backdropRect.top + backdropRect.height / 2;

      const eRect = letterEEl?.getBoundingClientRect();
      const nRect = letterNEl?.getBoundingClientRect();
      const eCenterX = eRect ? eRect.left + eRect.width / 2 : backdropCenterX;
      const eCenterY = eRect ? eRect.top + eRect.height / 2 : backdropCenterY;
      const nCenterX = nRect ? nRect.left + nRect.width / 2 : backdropCenterX;
      const nCenterY = nRect ? nRect.top + nRect.height / 2 : backdropCenterY;

      const targetFontSize = parseFloat(window.getComputedStyle(experienceEnSpan).fontSize);
      const expNudgeX = (Number.isFinite(targetFontSize) ? targetFontSize : 0) * EXPERIENCE_TARGET_NUDGE_EM;
      const backdropFontSize = parseFloat(window.getComputedStyle(cachedBackdrop).fontSize) || 600;
      const targetScale = targetFontSize / backdropFontSize;
      const textNode = Array.from(experienceEnSpan.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE && (node.textContent?.length || 0) >= 2
      ) as Text | undefined;

      _phase2MergeCache = {
        startGlobalTranslateOffsetX: globalEnTranslateOffsetX,
        startGlobalTranslateOffsetY: globalEnTranslateOffsetY,
        startScale: globalEnScale,
        startLetterEX: letterEX,
        startLetterEY: letterEY,
        startLetterNX: letterNX,
        startLetterNY: letterNY,
        startLetterEOffsetX: letterEOffsetX,
        startLetterEOffsetY: letterEOffsetY,
        startLetterNOffsetX: letterNOffsetX,
        startLetterNOffsetY: letterNOffsetY,
        startBackdropCenterX: backdropCenterX,
        startBackdropCenterY: backdropCenterY,
        startLetterECenterX: eCenterX,
        startLetterECenterY: eCenterY,
        startLetterNCenterX: nCenterX,
        startLetterNCenterY: nCenterY,
        targetFontSize,
        expNudgeX,
        backdropFontSize,
        targetScale,
        textNode,
      };
    }

    const data = _phase2MergeCache;
    const targetRect = experienceEnSpan.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2 + data.expNudgeX;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    const parentDeltaFullX = targetCenterX - data.startBackdropCenterX;
    const parentDeltaFullY = targetCenterY - data.startBackdropCenterY;
    globalEnTranslateOffsetX = data.startGlobalTranslateOffsetX + parentDeltaFullX * progress3;
    globalEnTranslateOffsetY = data.startGlobalTranslateOffsetY + parentDeltaFullY * progress3;
    globalEnScale = data.startScale + (data.targetScale - data.startScale) * progress3;

    letterEX = data.startLetterEX * (1 - progress3);
    letterEY = data.startLetterEY * (1 - progress3);
    letterNX = data.startLetterNX * (1 - progress3);
    letterNY = data.startLetterNY * (1 - progress3);

    let targetECenterX = targetRect.left + targetRect.width * 0.25 + data.expNudgeX;
    let targetECenterY = targetCenterY;
    let targetNCenterX = targetRect.left + targetRect.width * 0.75 + data.expNudgeX;
    let targetNCenterY = targetCenterY;

    if (data.textNode) {
      const range = document.createRange();
      range.setStart(data.textNode, 0);
      range.setEnd(data.textNode, 1);
      const eCharRect = range.getBoundingClientRect();
      range.setStart(data.textNode, 1);
      range.setEnd(data.textNode, 2);
      const nCharRect = range.getBoundingClientRect();
      if (eCharRect.width > 0 || eCharRect.height > 0) {
        targetECenterX = eCharRect.left + eCharRect.width / 2 + data.expNudgeX;
        targetECenterY = eCharRect.top + eCharRect.height / 2;
      }
      if (nCharRect.width > 0 || nCharRect.height > 0) {
        targetNCenterX = nCharRect.left + nCharRect.width / 2 + data.expNudgeX;
        targetNCenterY = nCharRect.top + nCharRect.height / 2;
      }
    }

    letterEOffsetX =
      data.startLetterEOffsetX +
      (targetECenterX - data.startLetterECenterX - parentDeltaFullX) * progress3;
    letterEOffsetY =
      data.startLetterEOffsetY +
      (targetECenterY - data.startLetterECenterY - parentDeltaFullY) * progress3;
    letterNOffsetX =
      data.startLetterNOffsetX +
      (targetNCenterX - data.startLetterNCenterX - parentDeltaFullX) * progress3;
    letterNOffsetY =
      data.startLetterNOffsetY +
      (targetNCenterY - data.startLetterNCenterY - parentDeltaFullY) * progress3;
  }

  if (currentScroll > edTransitionStart) {
    const progress = easeInOut((currentScroll - edTransitionStart) / Math.max(1, edTransitionEnd - edTransitionStart));
    edTranslateX = -50 + progress * 10;
    edTranslateY = -50 - progress * 10;
    edScale = 1 - progress * 0.83;
    edPrimaryOpacity = 1 - progress * 0.5;
    edPrimaryColor = `rgba(255, 255, 255, ${1 - progress * 0.2})`;
    homeLetterEX = progress * -10;
    homeLetterEY = progress * -100;
    homeLetterNX = progress * -90;
    homeLetterNY = progress * -40;
    homeEnScale = 1 - progress * 0.83;
  }

  const { edPrimaryItems, heroPortrait } = cache;

  for (let i = 0; i < edPrimaryItems.length; i++) {
    const item = edPrimaryItems[i];
    item.el.style.transform = `translate3d(${edTranslateX}%, ${edTranslateY}%, 0)`;
    item.el.style.opacity = `${edPrimaryOpacity}`;
    item.el.style.color = edPrimaryColor;
    if (item.homeLetterE) item.homeLetterE.style.transform = `translate3d(${homeLetterEX}%, ${homeLetterEY}%, 0) scale(${homeEnScale})`;
    if (item.homeLetterN) item.homeLetterN.style.transform = `translate3d(${homeLetterNX}%, ${homeLetterNY}%, 0) scale(${homeEnScale})`;
  }

  if (heroPortrait) {
    heroPortrait.style.transform = `scale(${edScale})`;
    heroPortrait.style.opacity = `${edPrimaryOpacity}`;
  }

  if (cachedBackdrop) {
    cachedBackdrop.style.transform = `translate3d(calc(${globalEnTranslateX}% + ${globalEnTranslateOffsetX}px), calc(${globalEnTranslateY}% + ${globalEnTranslateOffsetY}px), 0)`;
    const p1 = _phase1BaselineCache;
    const letterE = p1?.letterEEl ?? (cachedBackdrop.querySelector('.letter-e') as HTMLElement | null);
    const letterN = p1?.letterNEl ?? (cachedBackdrop.querySelector('.letter-n') as HTMLElement | null);
    if (letterE) letterE.style.transform = `translate3d(calc(${letterEX}% + ${letterEOffsetX}px), calc(${letterEY}% + ${letterEOffsetY}px), 0) scale(${globalEnScale})`;
    if (letterN) letterN.style.transform = `translate3d(calc(${letterNX}% + ${letterNOffsetX}px), calc(${letterNY}% + ${letterNOffsetY}px), 0) scale(${globalEnScale})`;
  }

  // Parallax layers using pre-parsed cache
  const { parallaxLayerItems } = cache;
  const parallaxIntensity = 0.5;
  for (let i = 0; i < parallaxLayerItems.length; i++) {
    const layer = parallaxLayerItems[i];
    if (layer.isCrosshair) continue;
    layer.el.style.transform = `translate3d(${currentScroll * layer.speedX * parallaxIntensity}px, ${currentScroll * layer.speedY * parallaxIntensity}px, 0)`;
  }

  // Text parallax using pre-parsed cache
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

  // Float elements using pre-parsed cache
  const { floatElementItems } = cache;
  for (let i = 0; i < floatElementItems.length; i++) {
    const item = floatElementItems[i];
    const spread = currentScroll * item.speed;
    item.el.style.transform = `translate3d(${spread * 1.15 * item.xDirection}px, ${spread * 1.2 * item.yDirection}px, 0)`;
  }

  // Image parallax using pre-parsed speeds
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
