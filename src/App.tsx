import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import {
  HomeSection,
  AboutSection,
  WorksSection,
  ContactSection
} from './components/sections';
import { LoadingScreen } from './components/LoadingScreen';
import { SectionScrollTransition } from './components/SectionScrollTransition';
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { textureManager } from './utils/TextureManager';
import './App.css';

const NAV_ITEMS = [
  { index: 0, label: 'Home' },
  { index: 1, label: 'About' },
  { index: 2, label: 'Works' },
  { index: 3, label: 'Contact' },
] as const;

const assetModules = import.meta.glob('./assets/**/*.{png,jpg,jpeg,webp,gif,svg,mp4,webm,ogg,mp3,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// Filter out legacy unused Canva background layers (bg_cropped/* and about_bg.png)
// so the preloader only caches and decodes active portfolio assets.
const preloadUrls = Array.from(
  new Set([
    '/assets/aistudio/image_fbee149c.png',
    ...Object.entries(assetModules)
      .filter(
        ([path]) =>
          !path.includes('/bg_cropped/') &&
          !path.endsWith('/about_bg.png') &&
          !path.endsWith('/hero1.2.png')
      )
      .map(([, url]) => url),
  ])
);

const mediaExtensions = /\.(mp4|webm|ogg|mp3|wav)(\?.*)?$/i;
let portfolioLoadingComplete = false;

// Persistent in-memory decoded Image cache so the browser compositor never evicts
// or re-decodes bitmaps during fast scroll transitions between sections.
const pinnedDecodedImages: HTMLImageElement[] = [];

const withTimeout = (promise: Promise<void>, timeoutMs: number) =>
  new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, timeoutMs);
    promise.finally(() => {
      window.clearTimeout(timeout);
      resolve();
    });
  });

const preloadImage = (url: string) =>
  withTimeout(new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      pinnedDecodedImages.push(img);
      if (img.decode) {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = url;
  }), 10000);

const preloadMedia = (url: string) =>
  withTimeout(new Promise<void>((resolve) => {
    const media = document.createElement(url.match(/\.(mp4|webm)(\?.*)?$/i) ? 'video' : 'audio');
    media.preload = 'auto';
    media.oncanplaythrough = () => resolve();
    media.onloadeddata = () => resolve();
    media.onerror = () => resolve();
    media.src = url;
    media.load();
  }), 10000);

const waitForWindowLoad = () =>
  withTimeout(new Promise<void>((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }
    window.addEventListener('load', () => resolve(), { once: true });
  }), 10000);

const waitForFonts = () =>
  withTimeout(document.fonts ? document.fonts.ready.then(() => undefined).catch(() => undefined) : Promise.resolve(), 10000);

function PortfolioApp() {
  const [currentSection, setCurrentSection] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(portfolioLoadingComplete);
  const [showLoading, setShowLoading] = useState(!portfolioLoadingComplete);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  useScrollAnimation(setCurrentSection);

  useEffect(() => {
    const handleScrollActivity = () => {
      if (isNavigatingRef.current) return;
      setIsScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    };

    window.addEventListener('scroll', handleScrollActivity, { passive: true });
    window.addEventListener('wheel', handleScrollActivity, { passive: true });
    window.addEventListener('touchmove', handleScrollActivity, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollActivity);
      window.removeEventListener('wheel', handleScrollActivity);
      window.removeEventListener('touchmove', handleScrollActivity);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const navigateToSection = useCallback((targetIndex: number) => {
    if (targetIndex === currentSection || isNavigatingRef.current) return;

    const isMobile = window.innerWidth <= 768;
    const sectionIds = ['home', 'about', 'works', 'contact'];

    if (isMobile) {
      const el = document.getElementById(sectionIds[targetIndex]);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setCurrentSection(targetIndex);
      }
      return;
    }

    isNavigatingRef.current = true;
    (window as any).__isProgrammaticSectionTransition = true;
    setIsScrolling(true);

    const fromIndex = currentSection;
    const direction: 1 | -1 = targetIndex > fromIndex ? 1 : -1;
    const duration = 720;
    const startTime = performance.now();
    const vh = window.innerHeight;
    const targetScrollPositions = [0, 2 * vh, 4 * vh, 6 * vh];
    const targetScroll = targetScrollPositions[targetIndex] ?? 0;
    let scrollSwapped = false;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress >= 0.48 && !scrollSwapped) {
        scrollSwapped = true;
        window.scrollTo({ top: targetScroll, behavior: 'auto' });
        window.dispatchEvent(
          new CustomEvent('lenis-scroll', {
            detail: { target: targetScroll, immediate: true },
          })
        );
        setCurrentSection(targetIndex);
      }

      window.dispatchEvent(
        new CustomEvent('section-scroll-transition', {
          detail: {
            active: progress < 1,
            fromIndex,
            toIndex: targetIndex,
            progress,
            direction,
          },
        })
      );

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.dispatchEvent(
          new CustomEvent('section-scroll-transition', {
            detail: {
              active: false,
              fromIndex,
              toIndex: targetIndex,
              progress: 1,
              direction,
            },
          })
        );
        (window as any).__isProgrammaticSectionTransition = false;
        isNavigatingRef.current = false;
        if (scrollTimeoutRef.current !== null) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      }
    };

    requestAnimationFrame(step);
  }, [currentSection]);

  useEffect(() => {
    if (portfolioLoadingComplete) return;

    let cancelled = false;
    let completed = 0;
    const tasks = [
      ...preloadUrls.map((url) => mediaExtensions.test(url) ? preloadMedia(url) : preloadImage(url)),
      waitForFonts(),
      waitForWindowLoad(),
    ];

    const updateProgress = () => {
      completed += 1;
      if (!cancelled) {
        setLoadingProgress(Math.round((completed / tasks.length) * 100));
      }
    };

    tasks.forEach(task => {
      task.then(updateProgress).catch(updateProgress);
    });

    Promise.all(tasks).then(() => {
      if (!cancelled) {
        setLoadingProgress(100);
        setIsLoaded(true);
        portfolioLoadingComplete = true;
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {showLoading && (
        <LoadingScreen
          progress={loadingProgress}
          isComplete={isLoaded}
          onComplete={() => {
            portfolioLoadingComplete = true;
            setShowLoading(false);
          }}
        />
      )}

      {/* Restored floating centered pill navbar */}
      <nav className={`fixed-navbar ${isScrolling ? 'scrolling' : ''}`} aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.index}
            type="button"
            onClick={() => navigateToSection(item.index)}
            className={`navbar-link ${currentSection === item.index ? 'active' : ''}`}
            aria-label={`Navigate to ${item.label}`}
          >
            <span className="link-text">{item.label}</span>
            <span className="link-dot" aria-hidden="true"></span>
          </button>
        ))}
      </nav>

      <main style={{ position: 'relative', height: '900vh' }}>
        <SectionScrollTransition />
        <HomeSection />
        <AboutSection />
        <WorksSection />
        <ContactSection />
      </main>
    </>
  );
}

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentPathRef = useRef(window.location.pathname);
  const routeScrollPositionsRef = useRef<Record<string, number>>({
    [window.location.pathname]: window.scrollY,
  });

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const restoreRouteScroll = (path: string) => {
      const savedPosition = routeScrollPositionsRef.current[path] ?? 0;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: savedPosition, behavior: 'auto' });
        });
      });
    };

    const handlePopState = () => {
      routeScrollPositionsRef.current[currentPathRef.current] = window.scrollY;
      const nextPath = window.location.pathname;
      currentPathRef.current = nextPath;
      setPathname(nextPath);
      restoreRouteScroll(nextPath);
    };
    const handleNavigation = (event: Event) => {
      const { path, projectTransition, returnToWorksProjects } = (event as CustomEvent<{
        path: string;
        projectTransition?: boolean;
        returnToWorksProjects?: boolean;
      }>).detail;
      if (!path || path === window.location.pathname || isTransitioning) return;

      routeScrollPositionsRef.current[currentPathRef.current] = window.scrollY;

      if (path.startsWith('/projects')) {
        textureManager.disposeAll();
      }

      if (returnToWorksProjects) {
        setIsTransitioning(true);

        window.setTimeout(() => {
          window.history.pushState({}, '', path);
          currentPathRef.current = path;
          setPathname(path);

          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              const isMobile = window.matchMedia('(max-width: 768px)').matches;
              const worksTarget = isMobile
                ? document.querySelector<HTMLElement>('#works')?.offsetTop ?? 0
                : window.innerHeight * 5 - 2;

              window.scrollTo({ top: worksTarget, behavior: 'auto' });

              const worksContainer = document.querySelector<HTMLElement>('.works-scroll-container');
              if (worksContainer) {
                const projectsStart = worksContainer.querySelector<HTMLElement>('[data-works-projects-start]');
                const previousScrollBehavior = worksContainer.style.scrollBehavior;
                worksContainer.style.scrollBehavior = 'auto';
                worksContainer.scrollTop = projectsStart?.offsetTop
                  ?? worksContainer.scrollHeight - worksContainer.clientHeight;
                worksContainer.style.scrollBehavior = previousScrollBehavior;
              }

              window.requestAnimationFrame(() => setIsTransitioning(false));
            });
          });
        }, 320);
        return;
      }

      if (projectTransition) {
        window.history.pushState({}, '', path);
        currentPathRef.current = path;
        setPathname(path);
        restoreRouteScroll(path);
        return;
      }

      setIsTransitioning(true);
      window.setTimeout(() => {
        window.history.pushState({}, '', path);
        currentPathRef.current = path;
        setPathname(path);
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: routeScrollPositionsRef.current[path] ?? 0, behavior: 'auto' });
          window.requestAnimationFrame(() => setIsTransitioning(false));
        });
      }, 320);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('portfolio-navigate', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('portfolio-navigate', handleNavigation);
    };
  }, [isTransitioning]);

  return (
    <>
      <div className={`route-content ${isTransitioning ? 'route-content--hidden' : ''} ${pathname.startsWith('/projects') ? 'route-content--projects' : ''}`}>
        {pathname.startsWith('/projects') ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pathname}
              className="project-route-layer"
              initial={{ opacity: 0, y: 64 }}
              animate={isTransitioning
                ? { opacity: 1, y: -18, filter: 'blur(2px)' }
                : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -64 }}
              transition={isTransitioning
                ? { duration: 0.32, ease: [0.45, 0, 0.55, 1] }
                : { duration: 1.4, delay: 0.12, ease: [0.45, 0, 0.55, 1] }}
            >
              {pathname === '/projects' ? <ProjectsPage /> : <ProjectDetailPage projectId={pathname.split('/')[2]} />}
            </motion.div>
          </AnimatePresence>
        ) : (
          <PortfolioApp />
        )}
      </div>
      <div className={`route-transition ${isTransitioning ? 'route-transition--active' : ''}`} aria-hidden="true" />
    </>
  );
}

export default App;
