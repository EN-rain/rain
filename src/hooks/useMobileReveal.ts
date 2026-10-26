import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const useMobileReveal = <T extends HTMLElement = HTMLElement>() => {
  const ref = useRef<T>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    // Activate native scroll reveals on any screen smaller than 1024px
    // since desktop JS-driven scroll animations take over at min-width: 1024px.
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) {
      // Even on desktop, add the is-revealed class just in case CSS rules depend on it
      const desktopObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          desktopObserver.disconnect();
        }
      }, { threshold: 0.1 });
      desktopObserver.observe(el);
      return;
    }

    // Set initial state
    gsap.set(el, { opacity: 0, y: 60 });
    
    // Optional: selector for content elements if you want to stagger
    // For now we'll just animate the container and its direct children
    const children = el.children;
    if (children.length > 0) {
      gsap.set(children, { opacity: 0, y: 30 });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          
          const tl = gsap.timeline({
            defaults: { ease: 'power4.out', duration: 1.2 }
          });

          tl.to(el, { opacity: 1, y: 0 })
            .to(children, { 
              opacity: 1, 
              y: 0, 
              stagger: 0.15,
              duration: 1.0
            }, '-=0.8');

          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, { scope: ref });

  return ref;
};
