export interface CachedAboutFadeItem {
  el: HTMLElement;
  order: number;
  dir: string;
  isImageWrap: boolean;
  children: HTMLElement[];
}

export interface CachedParallaxLayerItem {
  el: HTMLElement;
  speedY: number;
  speedX: number;
  isCrosshair: boolean;
}

export interface CachedFloatElementItem {
  el: HTMLElement;
  speed: number;
  xDirection: number;
  yDirection: number;
}

export interface CachedTextElementItem {
  el: HTMLElement;
  speed: number;
  isSubtext: boolean;
  mobileSpeed: number;
}

export interface CachedEdPrimaryItem {
  el: HTMLElement;
  homeLetterE: HTMLElement | null;
  homeLetterN: HTMLElement | null;
}

export interface SectionCache {
  parallaxContent: HTMLElement | null;
  lockedContent: NodeListOf<HTMLElement>;
  textParallaxBlocks: NodeListOf<HTMLElement>;
  textParallaxBlockItems: { el: HTMLElement; speed: number }[];
  frameOverlay: HTMLElement | null;
  clipInner: HTMLElement | null;
  clipOuter: HTMLElement | null;
  bgImages: NodeListOf<HTMLElement>;
  // For specific sections (cached globally to be safe)
  edPrimaryElements: NodeListOf<HTMLElement>;
  edPrimaryItems: CachedEdPrimaryItem[];
  heroPortrait: HTMLElement | null;
  parallaxLayers: NodeListOf<HTMLElement>;
  parallaxLayerItems: CachedParallaxLayerItem[];
  textElements: NodeListOf<HTMLElement>;
  textElementItems: CachedTextElementItem[];
  codeLines: NodeListOf<HTMLElement>;
  floatElements: NodeListOf<HTMLElement>;
  floatElementItems: CachedFloatElementItem[];
  imageWrap: HTMLElement | null;
  imageWrapSpeed: number;
  imageWrapMobileSpeed: number;
  imageShadow: HTMLElement | null;
  imageShadowSpeed: number;
  worksScrollContainer: HTMLElement | null;
  parallaxImg: HTMLElement | null;
  parallaxImgSpeed: number;
  parallaxImgMobileSpeed: number;
  section2Desc: HTMLElement | null;
  section2Image: HTMLElement | null;
  section2Skills: HTMLElement | null;
  aboutFadeTargets: NodeListOf<HTMLElement>;
  aboutFadeItems: CachedAboutFadeItem[];
}

export interface DomCache {
  sections: NodeListOf<Element> | null;
  sectionCaches: SectionCache[];
  globalEnBackdrop: HTMLElement | null;
  backdropLetterE: HTMLElement | null;
  backdropLetterN: HTMLElement | null;
  aboutNameE: HTMLElement | null;
  aboutNameN: HTMLElement | null;
  experienceEnSpan: HTMLElement | null;
  progressEl: HTMLElement | null;
  root: HTMLElement | null;
  contactIcon: HTMLElement | null;
  contactHeading: HTMLElement | null;
  contactSubtext: HTMLElement | null;
  contactGrid: HTMLElement | null;
  contactTexts: NodeListOf<HTMLElement> | null;
}

export interface ScrollContext {
  currentScroll: number;
  vh: number;
  transitionLength: number;
  pauseLength: number;
  sectionUnit: number;
  gapVh: number;
  bgTransitionSpeed: number;
}

export interface SectionAnimationState {
  currentYMoveVh: number;
  currentRotation: number;
  currentRotationX: number;
  currentRotationY: number;
  currentScale: number;
  currentOpacity: number;
  lockedContentXVw: number;
}

export interface LenisInstance {
  scroll: number;
  raf: (time: number) => void;
  on: (event: string, callback: (e: any) => void) => void;
  scrollTo: (value: number | string | HTMLElement, options?: { immediate?: boolean; lock?: boolean; force?: boolean; [key: string]: any }) => void;
  stop: () => void;
  start: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    Lenis: new (options: LenisOptions) => LenisInstance;
  }
}

export interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  smoothTouch?: boolean;
  touchMultiplier?: number;
  lerp?: number;
  wheelMultiplier?: number;
  infinite?: boolean;
}
