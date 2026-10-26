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
      contactHeading.style.transform = `translate3d(0, ${headingLiftPx}px, 0)`;
      contactHeading.style.opacity = '0';
    }
    if (contactSubtext) {
      contactSubtext.style.opacity = '0';
      contactSubtext.style.transform = `translate3d(0, ${subtextLiftPx}px, 0)`;
    }
    if (contactGrid) {
      contactGrid.style.opacity = '1';
      contactGrid.style.transform = 'translate3d(0, 40px, 0)';
    }
    contactTexts?.forEach(el => {
      el.style.opacity = '0';
    });
  } else if (currentScroll >= contactEnterStart && currentScroll < contactEnterStart + contactAnimDuration) {
    const p = (currentScroll - contactEnterStart) / contactAnimDuration;
    
    // Icon: Stepped Reveal
    if (contactIcon) {
      const iconP = Math.max(0, Math.min(1, p));
      const iconStepped = Math.floor(iconP * 6) / 6;
      contactIcon.style.clipPath = `inset(0 0 ${(1 - iconStepped) * 100}% 0)`;
    }
    
    // Heading: Fade + slide up (no clip)
    if (contactHeading) {
      const headingP = Math.max(0, Math.min(1, p));
      const headingEased = 1 - Math.pow(1 - headingP, 3);
      contactHeading.style.clipPath = 'none';
      contactHeading.style.transform = `translate3d(0, ${(1 - headingEased) * headingLiftPx}px, 0)`;
      contactHeading.style.opacity = headingEased.toString();
    }
    
    // Subtext: Fade + slide up
    if (contactSubtext) {
      const subP = Math.max(0, Math.min(1, (p - 0.2) / 0.6));
      const subEased = 1 - Math.pow(1 - subP, 3);
      contactSubtext.style.opacity = subEased.toString();
      contactSubtext.style.transform = `translate3d(0, ${(1 - subEased) * subtextLiftPx}px, 0)`;
    }
    
    // Grid: Slide up only (no fade)
    if (contactGrid) {
      const gridP = Math.max(0, Math.min(1, (p - 0.4) / 0.6));
      const gridEased = 1 - Math.pow(1 - gridP, 3);
      contactGrid.style.transform = `translate3d(0, ${(1 - gridEased) * 40}px, 0)`;
    }

    // Individual links fade
    contactTexts?.forEach(el => {
      const linkP = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
      el.style.opacity = linkP.toString();
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
    if (contactGrid) contactGrid.style.transform = 'translate3d(0, 0, 0)';
    
    contactTexts?.forEach(el => {
      el.style.opacity = '1';
    });
  }
};
