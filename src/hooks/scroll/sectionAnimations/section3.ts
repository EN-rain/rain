import type { ScrollContext, SectionAnimationState } from '../types';

export const animateSection3 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext
): SectionAnimationState => {
  const { transitionLength, pauseLength } = ctx;
  // Use the same base as Section 2's leaveStart to ensure synchronization
  const section2LeaveStart = 2 * (transitionLength + pauseLength) + pauseLength;
  const buffer = pauseLength * 0.1;
  
  // Start revealing exactly when Section 2 starts to shrink
  const contactRevealStart = section2LeaveStart + buffer;

  let currentYMoveVh = 0;
  let currentOpacity = 0;

  if (currentScroll < contactRevealStart) {
    currentYMoveVh = 0;
    currentOpacity = 0;
  } else if (currentScroll >= contactRevealStart) {
    currentYMoveVh = 0;
    currentOpacity = 1;
  } else {
    currentYMoveVh = 0;
    currentOpacity = 1;
  }

  return { currentYMoveVh, currentRotation: 0, currentRotationX: 0, currentRotationY: 0, currentScale: 1, currentOpacity, lockedContentXVw: 0 };
};
