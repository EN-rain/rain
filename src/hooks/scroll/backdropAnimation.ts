import { clamp, easeInOut } from './utils';
import type { ScrollContext } from './types';

let lastDispatchedEnOpacity = -1;
let lastMixBlendMode = '';
let lastBackdropOpacity = '';
let lastBackdropVisibility = '';

export const animateBackdrop = (
  currentScroll: number,
  ctx: ScrollContext,
  cachedBackdrop: HTMLElement | null
): void => {
  if (!cachedBackdrop) return;

  const { transitionLength, pauseLength } = ctx;
  const section2Start = pauseLength;

  const mergeStart = pauseLength + transitionLength + pauseLength;
  const mergeSettleEnd = mergeStart + transitionLength * 0.8;

  const blendOffThreshold = 0.94;
  const localAppearThreshold = 0.9999;
  const globalDisappearThreshold = 0.99999;

  let mixBlendMode: 'difference' | 'normal' =
    currentScroll >= section2Start ? 'difference' : 'normal';

  let backdropOpacity = 1;
  let backdropVisibility: 'visible' | 'hidden' = 'visible';
  let localEnOpacity = 0;

  if (currentScroll >= mergeStart) {
    const mergeProgress = easeInOut(
      clamp((currentScroll - mergeStart) / Math.max(1, mergeSettleEnd - mergeStart))
    );

    if (mergeProgress >= localAppearThreshold) localEnOpacity = 1;
    if (mergeProgress >= globalDisappearThreshold) {
      backdropOpacity = 0;
      backdropVisibility = 'hidden';
    }

    if (mergeProgress >= blendOffThreshold) {
      mixBlendMode = 'normal';
    }

    if (currentScroll > mergeSettleEnd) {
      mixBlendMode = 'normal';
      localEnOpacity = 1;
      backdropOpacity = 0;
      backdropVisibility = 'hidden';
    }
  }

  const opacityStr = String(backdropOpacity);
  if (mixBlendMode !== lastMixBlendMode) {
    cachedBackdrop.style.mixBlendMode = mixBlendMode;
    lastMixBlendMode = mixBlendMode;
  }
  if (opacityStr !== lastBackdropOpacity) {
    cachedBackdrop.style.opacity = opacityStr;
    lastBackdropOpacity = opacityStr;
  }
  if (backdropVisibility !== lastBackdropVisibility) {
    cachedBackdrop.style.visibility = backdropVisibility;
    lastBackdropVisibility = backdropVisibility;
  }

  // Only dispatch CustomEvent when localEnOpacity actually changes
  if (localEnOpacity !== lastDispatchedEnOpacity) {
    lastDispatchedEnOpacity = localEnOpacity;
    window.dispatchEvent(new CustomEvent('en-reveal', { detail: { opacity: localEnOpacity } }));
  }
};
