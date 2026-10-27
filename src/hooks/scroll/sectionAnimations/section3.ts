import type { ScrollContext, SectionAnimationState } from '../types';

export const animateSection3 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext
): SectionAnimationState => {
  const { transitionLength, pauseLength } = ctx;
  const enterStart = 2 * (transitionLength + pauseLength) + pauseLength; // 5 * vh
  const enterEnd = enterStart + transitionLength; // 6 * vh

  // Solid opacity without fade out/in: strictly 1 once entered, 0 before
  const isVisible = currentScroll >= enterStart;
  const currentOpacity = isVisible ? 1 : 0;

  return {
    currentYMoveVh: 0,
    currentRotation: 0,
    currentRotationX: 0,
    currentRotationY: 0,
    currentScale: 1,
    currentOpacity,
    lockedContentXVw: 0,
  };
};
