export const ANIMATION_CONFIG = {
  // Folder envelope
  FOLDER_INTRO: {
    duration: 1250,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    overshootY: -6,
  },
  FOLDER_OUTRO: {
    delay: 560,
    duration: 620,
    easing: 'cubic-bezier(0.42, 0, 0.65, 1)',
  },

  // Parchment paper bundle carrier
  PAPERS_INTRO: {
    delay: 110,
    duration: 1250,
    easing: 'cubic-bezier(0.18, 1, 0.28, 1)',
  },
  PAPERS_OUTRO: {
    delay: 180,
    duration: 480,
    easing: 'cubic-bezier(0.35, 0, 0.2, 1)',
    tuckDepthY: 240,
  },

  // Individual staggered paper sheets - organic fan bloom with distinct motions
  SHEET_ONE_INTRO: {
    delay: 130,
    duration: 1100,
    easing: 'cubic-bezier(0.18, 1, 0.28, 1)',
  },
  SHEET_TWO_INTRO: {
    delay: 210,
    duration: 1200,
    easing: 'cubic-bezier(0.16, 1, 0.28, 1)',
  },
  SHEET_THREE_INTRO: {
    delay: 290,
    duration: 1260,
    easing: 'cubic-bezier(0.15, 1, 0.26, 1)',
  },
  SHEET_ONE_OUTRO: {
    delay: 130,
    duration: 420,
    easing: 'cubic-bezier(0.38, 0, 0.25, 1)',
  },
  SHEET_TWO_OUTRO: {
    delay: 80,
    duration: 420,
    easing: 'cubic-bezier(0.38, 0, 0.25, 1)',
  },
  SHEET_THREE_OUTRO: {
    delay: 30,
    duration: 420,
    easing: 'cubic-bezier(0.38, 0, 0.25, 1)',
  },

  // 4 Navigation Bookmark tabs on center-left of the screen
  BOOKMARK_ITEMS: [
    {
      id: 'home',
      paperId: 'home',
      label: 'Home',
      rotation: '-1.8deg',
      overshoot: -18,
      introDelay: 480,
      outroDelay: 120,
    },
    {
      id: 'about',
      paperId: 'about',
      label: 'About',
      rotation: '1.4deg',
      overshoot: -20,
      introDelay: 580,
      outroDelay: 80,
    },
    {
      id: 'works',
      paperId: 'works',
      label: 'Works',
      rotation: '-1.2deg',
      overshoot: -18,
      introDelay: 680,
      outroDelay: 40,
    },
    {
      id: 'contacts',
      paperId: 'contacts',
      label: 'Contacts',
      rotation: '1.6deg',
      overshoot: -20,
      introDelay: 780,
      outroDelay: 0,
    },
  ],
  BOOKMARK_INTRO_DURATION: 620,
  BOOKMARK_INTRO_EASING: 'cubic-bezier(0.16, 1.25, 0.3, 1)',
  BOOKMARK_OUTRO_DURATION: 380,
  BOOKMARK_OUTRO_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOOKMARK_HIDDEN_OFFSET_X: 140,

  // Desk photos and magnifier
  PHOTO_BUNDLE_INTRO: {
    duration: 1300,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  PHOTO_BUNDLE_OUTRO: {
    delay: 70,
    duration: 480,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
  PHOTO_INTRO: {
    delay: 180,
    duration: 1180,
    easing: 'cubic-bezier(0.2, 1, 0.3, 1)',
  },
  PHOTO_OUTRO: {
    delay: 60,
    duration: 440,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
  PORTRAIT_INTRO: {
    delay: 300,
    duration: 1220,
    easing: 'cubic-bezier(0.19, 1, 0.28, 1)',
  },
  PORTRAIT_OUTRO: {
    delay: 40,
    duration: 420,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
  MAGNIFIER_INTRO: {
    delay: 380,
    duration: 1250,
    easing: 'cubic-bezier(0.18, 0.95, 0.26, 1)',
  },
  MAGNIFIER_OUTRO: {
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
} as const;
