import type { ScrollContext, SectionAnimationState, SectionCache } from '../types';

let lastTimelineProgress = 0;
let lastDispatchTime = 0;

const applyWorksHorizontalTimeline = (
  worksContainer: HTMLElement | null,
  progress: number
) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const now = performance.now();
  const dt = Math.max(8, Math.min(64, now - lastDispatchTime));
  const rawVel = ((clamped - lastTimelineProgress) / (dt * 0.001)) * 0.65;
  const velocity = Math.max(-2.5, Math.min(2.5, rawVel));

  if (Math.abs(clamped - lastTimelineProgress) > 0.0002 || Math.abs(velocity) > 0.01) {
    lastTimelineProgress = clamped;
    lastDispatchTime = now;
    window.dispatchEvent(
      new CustomEvent('works-timeline-scroll', {
        detail: { progress: clamped, velocity },
      })
    );
  }

  if (!worksContainer) return;

  const isDesktop = window.innerWidth > 768;
  const track = worksContainer.querySelector<HTMLElement>('.works-horizontal-track');

  if (isDesktop && track) {
    worksContainer.scrollTop = 0;
    const maxShift = Math.max(0, track.scrollWidth - worksContainer.clientWidth);
    track.style.transform = `translate3d(${-clamped * maxShift}px, 0, 0)`;
  } else {
    if (track) {
      track.style.transform = 'none';
    }
    const scrollRange = Math.max(0, worksContainer.scrollHeight - worksContainer.clientHeight);
    worksContainer.scrollTop = clamped * scrollRange;
  }
};

export const animateSection2 = (
  _sec: Element,
  currentScroll: number,
  ctx: ScrollContext,
  cache: SectionCache
): SectionAnimationState => {
  const { transitionLength, pauseLength } = ctx;
  const enterStart = pauseLength + transitionLength + pauseLength; // 3 * vh
  const enterEnd = enterStart + transitionLength; // 4 * vh
  const leaveStart = 2 * (pauseLength + transitionLength) + pauseLength; // 5 * vh
  const leaveEnd = leaveStart + transitionLength; // 6 * vh

  const worksContainer = cache.worksScrollContainer;

  // Solid opacity without fade out/in: strictly 1 during its active range, 0 otherwise
  const isVisible = currentScroll >= enterStart && currentScroll < leaveEnd;
  const currentOpacity = isVisible ? 1 : 0;

  if (currentScroll < enterEnd) {
    applyWorksHorizontalTimeline(worksContainer, 0);
  } else if (currentScroll >= enterEnd && currentScroll < leaveStart) {
    const scrollStartDelay = pauseLength * 0.1;
    const scrollStart = enterEnd + scrollStartDelay;

    if (currentScroll < scrollStart) {
      applyWorksHorizontalTimeline(worksContainer, 0);
    } else {
      const timelineProgress = (currentScroll - scrollStart) / Math.max(1, leaveStart - scrollStart);
      applyWorksHorizontalTimeline(worksContainer, timelineProgress);
    }
  } else {
    applyWorksHorizontalTimeline(worksContainer, 1);
  }

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
