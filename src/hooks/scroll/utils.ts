export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

export const easeInOut = (value: number): number => {
  const p = clamp(value);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
};

export const mixChannel = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

export const backgroundStops = [
  [255, 255, 255],
  [255, 255, 255],
  [0, 0, 0],
  [0, 0, 0],
  [255, 255, 255],
  [255, 255, 255],
  [255, 255, 255],
] as const;

export const getSectionAnchors = (pauseLength: number, transitionLength: number, bgTransitionSpeed: number): number[] => [
  0,
  pauseLength,
  pauseLength + bgTransitionSpeed,
  pauseLength + transitionLength + pauseLength,
  pauseLength + transitionLength + pauseLength + bgTransitionSpeed,
  2 * (pauseLength + transitionLength) + pauseLength,
  2 * (pauseLength + transitionLength) + pauseLength + bgTransitionSpeed,
];

export const smoothProgress = (progress: number): number =>
  progress < 0.75 ? (progress / 0.75) * (progress / 0.75) : 1;
