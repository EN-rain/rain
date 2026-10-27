import type { ScrollContext } from './types';

export const animateContact = (
  currentScroll: number,
  ctx: ScrollContext,
  contactIcon: HTMLElement | null,
  contactHeading: HTMLElement | null,
  contactSubtext: HTMLElement | null,
  contactGrid: HTMLElement | null,
  contactTexts: NodeListOf<HTMLElement> | null
): void => {
  const { transitionLength, pauseLength } = ctx;
  const section2LeaveStart = 2 * (transitionLength + pauseLength) + pauseLength;
  const contactEnterStart = section2LeaveStart;
  const contactAnimDuration = transitionLength * 0.8;

  const headingLiftPx = 140;
  const subtextLiftPx = 80;

  if (currentScroll < contactEnterStart) {
    // Initial states
    if (contactIcon) {
      contactIcon.style.transform = 'translate3d(0, 0, 0)';
      contactIcon.style.opacity = '1';
      contactIcon.style.clipPath = 'inset(0 0 100% 0)';
    }
    if (contactHeading) {
      contactHeading.style.clipPath = 'none';
      contactHeading.style.transform = 'translate3d(0, 0, 0)';
      contactHeading.style.opacity = '1';
    }
    if (contactSubtext) {
      contactSubtext.style.opacity = '1';
      contactSubtext.style.transform = 'translate3d(0, 0, 0)';
    }
    if (contactGrid) {
      contactGrid.style.opacity = '1';
      contactGrid.style.transform = 'translate3d(0, 0, 0)';
    }
    contactTexts?.forEach(el => {
      el.style.opacity = '1';
    });
  } else if (currentScroll >= contactEnterStart && currentScroll < contactEnterStart + contactAnimDuration) {
    const p = (currentScroll - contactEnterStart) / contactAnimDuration;
    
    // Icon: Stepped Reveal
    if (contactIcon) {
      const iconP = Math.max(0, Math.min(1, p));
      const iconStepped = Math.floor(iconP * 6) / 6;
      contactIcon.style.clipPath = `inset(0 0 ${(1 - iconStepped) * 100}% 0)`;
    }
    
    // Heading: Solid opacity
    if (contactHeading) {
      contactHeading.style.clipPath = 'none';
      contactHeading.style.transform = 'translate3d(0, 0, 0)';
      contactHeading.style.opacity = '1';
    }
    
    // Subtext: Solid opacity
    if (contactSubtext) {
      contactSubtext.style.opacity = '1';
      contactSubtext.style.transform = 'translate3d(0, 0, 0)';
    }
    
    // Grid: Solid opacity
    if (contactGrid) {
      contactGrid.style.transform = 'translate3d(0, 0, 0)';
      contactGrid.style.opacity = '1';
    }

    // Individual links: Solid opacity
    contactTexts?.forEach(el => {
      el.style.opacity = '1';
    });
  } else {
    // Final states
    if (contactIcon) contactIcon.style.clipPath = 'inset(0% 0 0 0)';
    if (contactHeading) {
      contactHeading.style.clipPath = 'none';
      contactHeading.style.transform = 'translate3d(0, 0, 0)';
      contactHeading.style.opacity = '1';
    }
    if (contactSubtext) {
      contactSubtext.style.opacity = '1';
      contactSubtext.style.transform = 'translate3d(0, 0, 0)';
    }
    if (contactGrid) {
      contactGrid.style.transform = 'translate3d(0, 0, 0)';
      contactGrid.style.opacity = '1';
    }
    
    contactTexts?.forEach(el => {
      el.style.opacity = '1';
    });
  }
};
