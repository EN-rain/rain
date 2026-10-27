import type { ScrollContext, SectionAnimationState } from '../types';

export const animateSection1 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext
): SectionAnimationState => {
  const { transitionLength, pauseLength } = ctx;
  const enterStart = pauseLength; // 1 * vh
  const leaveEnd = 2 * pauseLength + 2 * transitionLength; // 4 * vh

  // Solid opacity without fade out/in: strictly 1 during its active range, 0 otherwise
  const isVisible = currentScroll >= enterStart && currentScroll < leaveEnd;

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
