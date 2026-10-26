import { clamp, mixChannel, backgroundStops, getSectionAnchors } from './utils';
import type { ScrollContext } from './types';

export const updateBackground = (
  currentScroll: number,
  ctx: ScrollContext,
  root: HTMLElement | null
): void => {
  const { pauseLength, transitionLength, bgTransitionSpeed } = ctx;
  const sectionAnchors = getSectionAnchors(pauseLength, transitionLength, bgTransitionSpeed);

  let backgroundIndex = 0;
  while (backgroundIndex < sectionAnchors.length - 1 && currentScroll > sectionAnchors[backgroundIndex + 1]) {
    backgroundIndex += 1;
  }

  const nextBackgroundIndex = Math.min(backgroundStops.length - 1, backgroundIndex + 1);
  const currentAnchor = sectionAnchors[backgroundIndex];
  const nextAnchor = sectionAnchors[nextBackgroundIndex];
  const backgroundProgress = clamp((currentScroll - currentAnchor) / (nextAnchor - currentAnchor));

  const r = mixChannel(backgroundStops[backgroundIndex][0], backgroundStops[nextBackgroundIndex][0], backgroundProgress);
  const g = mixChannel(backgroundStops[backgroundIndex][1], backgroundStops[nextBackgroundIndex][1], backgroundProgress);
  const b = mixChannel(backgroundStops[backgroundIndex][2], backgroundStops[nextBackgroundIndex][2], backgroundProgress);
  const shellBackground = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  document.body.style.backgroundColor = shellBackground;
  document.documentElement.style.backgroundColor = shellBackground;
  if (root) root.style.backgroundColor = shellBackground;
};
