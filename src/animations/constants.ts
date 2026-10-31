export const ANIMATION_CONFIG = {
  // Folder envelope
  FOLDER_INTRO: {
    duration: 1100,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    overshootY: -6,
  },
  FOLDER_OUTRO: {
    delay: 180,
    duration: 460,
    easing: 'cubic-bezier(0.4, 0, 0.65, 1)',
  },

  // Parchment paper bundle carrier
  PAPERS_INTRO: {
    delay: 70,
    duration: 1050,
    easing: 'cubic-bezier(0.18, 1, 0.28, 1)',
  },
  PAPERS_OUTRO: {
    delay: 40,
    duration: 420,
    easing: 'cubic-bezier(0.35, 0, 0.2, 1)',
    tuckDepthY: 240,
  },

  // Individual staggered paper sheets - organic fan bloom with distinct motions
  SHEET_ONE_INTRO: {
    delay: 90,
    duration: 980,
    easing: 'cubic-bezier(0.18, 1, 0.28, 1)',
  },
  SHEET_TWO_INTRO: {
    delay: 140,
    duration: 1040,
    easing: 'cubic-bezier(0.16, 1, 0.28, 1)',
  },
  SHEET_THREE_INTRO: {
    delay: 190,
    duration: 1100,
    easing: 'cubic-bezier(0.15, 1, 0.26, 1)',
  },
  SHEET_ONE_OUTRO: {
    delay: 50,
    duration: 360,
    easing: 'cubic-bezier(0.38, 0, 0.25, 1)',
  },
  SHEET_TWO_OUTRO: {
    delay: 25,
    duration: 360,
    easing: 'cubic-bezier(0.38, 0, 0.25, 1)',
  },
  SHEET_THREE_OUTRO: {
    delay: 0,
    duration: 360,
    easing: 'cubic-bezier(0.38, 0, 0.25, 1)',
  },

  // 4 Navigation Bookmark tabs on center-left of the screen
  BOOKMARK_ITEMS: [
    {
      id: 'home',
      paperId: 'home',
      label: 'Home',
      rotation: '-1.8deg',
      overshoot: -14,
      introDelay: 380,
      outroDelay: 0,
    },
    {
      id: 'about',
      paperId: 'about',
      label: 'About',
      rotation: '1.4deg',
      overshoot: -16,
      introDelay: 425,
      outroDelay: 18,
    },
    {
      id: 'works',
      paperId: 'works',
      label: 'Works',
      rotation: '-1.2deg',
      overshoot: -14,
      introDelay: 470,
      outroDelay: 36,
    },
    {
      id: 'contacts',
      paperId: 'contacts',
      label: 'Contacts',
      rotation: '1.6deg',
      overshoot: -16,
      introDelay: 515,
      outroDelay: 54,
    },
  ],
  BOOKMARK_INTRO_DURATION: 460,
  BOOKMARK_INTRO_EASING: 'cubic-bezier(0.18, 1.22, 0.32, 1)',
  BOOKMARK_OUTRO_DURATION: 240,
  BOOKMARK_OUTRO_EASING: 'cubic-bezier(0.36, 0, 0.2, 1)',
  BOOKMARK_HIDDEN_OFFSET_X: 145,

  // Desk photos and magnifier
  PHOTO_BUNDLE_INTRO: {
    duration: 1120,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  PHOTO_BUNDLE_OUTRO: {
    delay: 30,
    duration: 420,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
  PHOTO_INTRO: {
    delay: 120,
    duration: 1040,
    easing: 'cubic-bezier(0.2, 1, 0.3, 1)',
  },
  PHOTO_OUTRO: {
    delay: 25,
    duration: 390,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
  PORTRAIT_INTRO: {
    delay: 200,
    duration: 1080,
    easing: 'cubic-bezier(0.19, 1, 0.28, 1)',
  },
  PORTRAIT_OUTRO: {
    delay: 15,
    duration: 380,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
  MAGNIFIER_INTRO: {
    delay: 260,
    duration: 1120,
    easing: 'cubic-bezier(0.18, 0.95, 0.26, 1)',
  },
  MAGNIFIER_OUTRO: {
    duration: 360,
    easing: 'cubic-bezier(0.4, 0, 0.8, 1)',
  },
} as const;
