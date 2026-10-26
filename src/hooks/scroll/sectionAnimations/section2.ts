import { smoothProgress } from '../utils';
import type { ScrollContext, SectionAnimationState, SectionCache } from '../types';

const minScale = 0.5;
const maxScale = 1.2;

export const animateSection2 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext,
  cache: SectionCache
): SectionAnimationState => {
  const { transitionLength, pauseLength, gapVh } = ctx;
  const enterStart = pauseLength + transitionLength + pauseLength;
  const enterEnd = enterStart + transitionLength;
  const leaveStart = 2 * (pauseLength + transitionLength) + pauseLength;
  const leaveEnd = leaveStart + transitionLength;

  const worksContainer = cache.worksScrollContainer;

  let currentYMoveVh = 0;
  let currentRotation = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;
  let currentScale = maxScale;
  let currentOpacity = 1;

  if (currentScroll < enterStart) {
    currentYMoveVh = -(100 + gapVh);
    currentRotation = -10;
    currentScale = minScale;
    currentOpacity = 1;
  } else if (currentScroll >= enterStart && currentScroll < enterEnd) {
    const progress = (currentScroll - enterStart) / transitionLength;
    const smProgress = smoothProgress(progress);
    currentYMoveVh = -(100 + gapVh) + progress * (100 + gapVh);
    currentRotation = -10 + progress * 10;
    currentScale = minScale + smProgress * (maxScale - minScale);
    currentOpacity = 1;
  } else if (currentScroll >= enterEnd && currentScroll < leaveStart) {
    currentYMoveVh = 0;
    currentRotation = 0;
    currentScale = maxScale;
    currentOpacity = 1;
    // Horizontal scroll starts after section is centered (delay by pauseLength * 0.1)
    const scrollStartDelay = pauseLength * 0.1;
    const scrollStart = enterEnd + scrollStartDelay;

    if (worksContainer) {
      if (currentScroll < scrollStart) {
        worksContainer.scrollTop = 0;
      } else if (currentScroll >= scrollStart && currentScroll < leaveStart) {
        const scrollRange = worksContainer.scrollHeight - worksContainer.clientHeight;
        worksContainer.scrollTop = ((currentScroll - scrollStart) / (leaveStart - scrollStart)) * scrollRange;
      } else if (currentScroll >= leaveStart) {
        worksContainer.scrollTop = worksContainer.scrollHeight - worksContainer.clientHeight;
      }
    }
  } else if (currentScroll >= leaveStart && currentScroll < leaveEnd) {
    // Reduced buffer to give more space for the animation to feel slower
    const buffer = pauseLength * 0.2;
    const effectiveTransitionLength = transitionLength - (2 * buffer);
    
    if (currentScroll < leaveStart + buffer) {
      // Stay centered (Section 2 state)
      currentYMoveVh = 0;
      currentRotation = 0;
      currentScale = maxScale;
      currentOpacity = 1;
      if (worksContainer) worksContainer.scrollTop = worksContainer.scrollHeight - worksContainer.clientHeight;
      return { currentYMoveVh, currentRotation, currentRotationX, currentRotationY, currentScale, currentOpacity, lockedContentXVw: 0 };
    }
    
    if (currentScroll > leaveEnd - buffer) {
      // Stay at exit state (Section 3 threshold)
      currentYMoveVh = 100 + gapVh;
      currentRotation = 0;
      currentRotationY = 70;
      currentScale = maxScale - maxScale * 0.8;
      currentOpacity = 0;
      if (worksContainer) worksContainer.scrollTop = worksContainer.scrollHeight - worksContainer.clientHeight;
      return { currentYMoveVh, currentRotation, currentRotationX, currentRotationY, currentScale, currentOpacity, lockedContentXVw: 0 };
    }

    // Actual animation range
    const progress = (currentScroll - (leaveStart + buffer)) / effectiveTransitionLength;
    // Slowed down the individual phases by increasing their progress duration
    const pShrink = Math.max(0, Math.min(1, progress / 0.8));
    const pRotate = Math.max(0, Math.min(1, (progress - 0.10) / 0.80));
    const pExit = Math.max(0, Math.min(1, (progress - 0.50) / 0.70));
    const sShrink = pShrink < 0.5 ? 2 * pShrink * pShrink : 1 - Math.pow(-2 * pShrink + 2, 2) / 2;
    const sRotate = pRotate < 0.5 ? 2 * pRotate * pRotate : 1 - Math.pow(-2 * pRotate + 2, 2) / 2;
    const sExit = pExit < 0.5 ? 2 * pExit * pExit : 1 - Math.pow(-2 * pExit + 2, 2) / 2;
    currentScale = maxScale - sShrink * (maxScale * 0.8);
    currentYMoveVh = sShrink * 30 + sExit * (100 + gapVh - 30);
    currentRotationY = sRotate * 70;
    currentOpacity = 1;
    currentRotation = 0;
    if (worksContainer) {
      worksContainer.scrollTop = worksContainer.scrollHeight - worksContainer.clientHeight;
    }
  } else {
    currentYMoveVh = 100 + gapVh;
    currentRotation = 0;
    currentRotationY = 70;
    currentScale = maxScale - maxScale * 0.8;
    currentOpacity = 0;
  }

  return { currentYMoveVh, currentRotation, currentRotationX, currentRotationY, currentScale, currentOpacity, lockedContentXVw: 0 };
};
