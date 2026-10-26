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
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import './App.css';

const assetModules = import.meta.glob('./assets/**/*.{png,jpg,jpeg,webp,gif,svg,mp4,webm,ogg,mp3,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// Filter out legacy unused Canva background layers (bg_cropped/* and about_bg.png)
// so the preloader only caches and decodes active portfolio assets.
const preloadUrls = Array.from(
  new Set(
    Object.entries(assetModules)
      .filter(([path]) => !path.includes('/bg_cropped/') && !path.endsWith('/about_bg.png'))
      .map(([, url]) => url)
  )
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
  const [vh, setVh] = useState(window.innerHeight);
  const [isScrolling, setIsScrolling] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(portfolioLoadingComplete);
  const [showLoading, setShowLoading] = useState(!portfolioLoadingComplete);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isScrollingRef = useRef(false);

  useScrollAnimation(setCurrentSection);

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

  useEffect(() => {
    const handleScrollState = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        setIsScrolling(true);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        setIsScrolling(false);
      }, 1500);
    };

    window.addEventListener('scroll', handleScrollState, { passive: true });
    window.addEventListener('wheel', handleScrollState, { passive: true });
    window.addEventListener('touchmove', handleScrollState, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollState);
      window.removeEventListener('wheel', handleScrollState);
      window.removeEventListener('touchmove', handleScrollState);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationValues = useMemo(() => {
    const transitionLength = vh;
    const pauseLength = vh;
    const sectionUnit = transitionLength + pauseLength;

    return {
      home: 0,
      about: sectionUnit,
      works: 2 * sectionUnit,
      contact: 3 * sectionUnit,
    };
  }, [vh]);

  const scrollToSection = useCallback((section: 'home' | 'about' | 'works' | 'contact') => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const target = isMobile ? `#${section}` : navigationValues[section];

    window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: target }));
  }, [navigationValues]);

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
      <nav className={`fixed-navbar ${isScrolling ? 'scrolling' : ''}`}>
        <button
          onClick={() => scrollToSection('home')}
          className={`navbar-link ${currentSection === 0 ? 'active' : ''}`}
        >
          <span className="link-text">Home</span>
          <span className="link-dot"></span>
        </button>
        <button
          onClick={() => scrollToSection('about')}
          className={`navbar-link ${currentSection === 1 ? 'active' : ''}`}
        >
          <span className="link-text">About</span>
          <span className="link-dot"></span>
        </button>
        <button
          onClick={() => scrollToSection('works')}
          className={`navbar-link ${currentSection === 2 ? 'active' : ''}`}
        >
          <span className="link-text">Works</span>
          <span className="link-dot"></span>
        </button>
        <button
          onClick={() => scrollToSection('contact')}
          className={`navbar-link ${currentSection === 3 ? 'active' : ''}`}
        >
          <span className="link-text">Contact</span>
          <span className="link-dot"></span>
        </button>
      </nav>
      <main style={{ position: 'relative', height: '900vh' }}>
        <div aria-hidden="true" className="global-en-backdrop mobile-hide">
          <span className="letter-e">E</span>
          <span className="letter-n">N</span>
        </div>
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
