import { smoothProgress } from '../utils';
import type { ScrollContext, SectionAnimationState } from '../types';

const minScale = 0.5;
const maxScale = 1.2;

export const animateSection1 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext
): SectionAnimationState => {
  const { transitionLength, pauseLength, gapVh } = ctx;
  const enterStart = pauseLength;
  const enterEnd = enterStart + transitionLength;
  const leaveStart = pauseLength + transitionLength + pauseLength;
  const leaveEnd = leaveStart + transitionLength;

  let currentYMoveVh = 0;
  let currentRotation = 0;
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

  return { currentYMoveVh, currentRotation, currentRotationX: 0, currentRotationY: 0, currentScale, currentOpacity, lockedContentXVw: 0 };
};
