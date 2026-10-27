import { useEffect, useMemo, useState } from 'react';
import { useMobileReveal } from '../../hooks/useMobileReveal';
import { WebGLCanvas } from '../WebGLCanvas';
import { EnsoSceneConfig } from '../../types';
import {
  FALLBACK_GITHUB_CONTRIBUTIONS,
  type ContributionDay,
  type GithubContributionsResponse,
} from '../../data/githubContributionsFallback';

const ABOUT_PORTRAIT_SRC = '/assets/aistudio/image_fbee149c.png';

const ABOUT_WEBGL_CONFIG: EnsoSceneConfig = {
  viewMode: 'study',
  palette: 'ultramarine',
  flowSpeed: 0.75,
  bristleDetail: 0.68,
  inkDensity: 0.72,
  emberIntensity: 0.0,
  horizonRadius: 1.0,
  compareSplit: 0.0,
  showEditorial: false,
  dockCollapsed: true,
  audioEnabled: false,
};

const GITHUB_USERNAME = 'EN-rain';
const GITHUB_API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;
const CACHE_KEY = `gh_contrib_${GITHUB_USERNAME}_v1`;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FOCUS_PILLARS = [
  {
    index: '01.',
    title: 'Web & APIs',
    items: 'React · TypeScript · Laravel · Node.js',
  },
  {
    index: '02.',
    title: 'Systems & Data',
    items: 'PostgreSQL · Prisma · Supabase · Docker',
  },
  {
    index: '03.',
    title: 'Mobile & Live',
    items: 'Flutter · Android · Socket.IO · REST',
  },
] as const;

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${MONTH_NAMES[monthIdx] || parts[1]} ${day}, ${year}`;
}

export const AboutSection = () => {
  const revealRef = useMobileReveal<HTMLElement>();
  const [contribData, setContribData] = useState<GithubContributionsResponse>(FALLBACK_GITHUB_CONTRIBUTIONS);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as GithubContributionsResponse;
        if (parsed?.contributions?.length) {
          setContribData(parsed);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }

    fetch(GITHUB_API_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then((data: GithubContributionsResponse) => {
        if (!cancelled && data?.contributions?.length) {
          setContribData(data);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
          } catch {
            // ignore quota errors
          }
        }
      })
      .catch(() => {
        // fallback snapshot is already active
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { weeks, monthLabels, stats } = useMemo(() => {
    const days = contribData.contributions || [];
    const total = contribData.total?.lastYear ?? days.reduce((acc, d) => acc + d.count, 0);

    let activeDays = 0;
    let maxCount = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    let runningStreak = 0;

    for (let i = 0; i < days.length; i++) {
      const c = days[i].count;
      if (c > 0) {
        activeDays++;
        runningStreak++;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
        if (c > maxCount) maxCount = c;
      } else {
        runningStreak = 0;
      }
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else if (i < days.length - 1) {
        break;
      }
    }

    const weekCols: ContributionDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekCols.push(days.slice(i, i + 7));
    }

    const labels: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    weekCols.forEach((week, wIdx) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const m = parseInt(firstDay.date.split('-')[1], 10) - 1;
      if (m !== lastMonth && wIdx > 0) {
        if (labels.length === 0 || wIdx - labels[labels.length - 1].weekIndex >= 3) {
          labels.push({ weekIndex: wIdx, label: MONTH_NAMES[m] });
          lastMonth = m;
        }
      } else if (wIdx === 0) {
        labels.push({ weekIndex: 0, label: MONTH_NAMES[m] });
        lastMonth = m;
      }
    });

    return {
      weeks: weekCols,
      monthLabels: labels,
      stats: {
        total,
        activeDays,
        maxCount,
        longestStreak,
        currentStreak,
      },
    };
  }, [contribData]);

  const mobileWeeks = useMemo(() => weeks.slice(-26), [weeks]);

  return (
    <section ref={revealRef} id="about" className="stack-section mask-shaped-section mask-theme-purple">
      <div className="clip-gap-outer parallax-content">
        <div className="clip-gap-inner">
          {/* ── WebGL Cosmic Ink Background ──
               Wrapper: bg-image → gets scroll counter-transform (stays screen-fixed)
               so the WebGL canvas remains aligned during section scroll transitions ── */}
          <div className="about-bg-parallax" aria-hidden="true">
            <div className="about-bg-wrap bg-image">
              <WebGLCanvas config={ABOUT_WEBGL_CONFIG} />
            </div>
          </div>

          <div className="about-shell locked-content">
            {/* ── LEFT ZONE: Seated inside the Dark Cosmic Sphere Void ── */}
            <div className="about-image-container relative">
              <div
                data-about-fade
                data-about-fade-order="0"
                data-about-fade-dir="left"
                className="about-image-wrap about-scroll-fade"
              >
                <div className="about-portrait-stage">
                  {!imgError ? (
                    <img
                      src={ABOUT_PORTRAIT_SRC}
                      alt="Edrian Nieves portrait"
                      className="about-image"
                      decoding="async"
                      fetchPriority="high"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="about-portrait-fallback" aria-label="Edrian Nieves">
                      <span>EN</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop GitHub Contributions Pedestal (anchored in 1 row + compact grid on the left sphere side) */}
              <div
                data-about-fade
                data-about-fade-order="10"
                data-about-fade-dir="bottom"
                className="about-skills-box about-skills-box--desktop about-scroll-fade"
              >
                <div className="about-gh-left-card">
                  <div className="about-gh-single-row">
                    <div className="about-gh-single-main">
                      <span className="about-gh-total-num">{stats.total.toLocaleString()}</span>
                      <span className="about-gh-total-label">contributions</span>
                      <span className="about-gh-sep" aria-hidden="true">·</span>
                      <a
                        href={`https://github.com/${GITHUB_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-gh-handle"
                      >
                        @{GITHUB_USERNAME}
                      </a>
                    </div>

                    <div className="about-gh-inspect">
                      {hoveredDay ? (
                        <>
                          <strong>{hoveredDay.count}</strong> on {formatDateLabel(hoveredDay.date)}
                        </>
                      ) : (
                        <span>
                          {stats.activeDays}d active · {stats.longestStreak}d streak · {stats.maxCount} peak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="about-gh-heatmap-panel">
                    <div className="about-gh-months">
                      {monthLabels.map((m) => (
                        <span
                          key={`${m.label}-${m.weekIndex}`}
                          className="about-gh-month-label"
                          style={{ left: `${(m.weekIndex / Math.max(1, weeks.length)) * 100}%` }}
                        >
                          {m.label}
                        </span>
                      ))}
                    </div>

                    <div
                      className="about-gh-grid"
                      onMouseLeave={() => setHoveredDay(null)}
                      role="img"
                      aria-label={`GitHub contribution graph for ${GITHUB_USERNAME}: ${stats.total} contributions in the last year`}
                    >
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="about-gh-week">
                          {week.map((day) => (
                            <div
                              key={day.date}
                              onMouseEnter={() => setHoveredDay(day)}
                              className={`about-gh-cell about-gh-cell--lvl-${day.level}`}
                              title={`${day.count} contributions on ${day.date}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT ZONE: Seated over the Stark White Canvas ── */}
            <div className="about-content">
              <div
                data-about-fade
                data-about-fade-order="1"
                data-about-fade-dir="top"
                className="about-header-group about-scroll-fade"
              >
                <div className="about-editorial-kicker">
                  <span className="about-kicker-index">01. Profile</span>
                  <span className="about-kicker-sep" aria-hidden="true">·</span>
                  <span>Leon City, Philippines</span>
                  <span className="about-kicker-sep" aria-hidden="true">·</span>
                  <span className="about-kicker-role">Full-Stack Engineer</span>
                </div>
                <h2 className="about-title">Hello!, I&apos;m</h2>
              </div>

              <h3
                data-about-fade
                data-about-fade-order="2"
                data-about-fade-dir="right"
                className="about-name about-name--first about-scroll-fade"
              >
                Edrian
              </h3>
              <h3
                data-about-fade
                data-about-fade-order="2.6"
                data-about-fade-dir="right"
                className="about-name about-name--second about-scroll-fade"
              >
                Nieves
              </h3>

              <div className="about-text-wrapper">
                <p
                  data-about-fade
                  data-about-fade-order="6"
                  data-about-fade-dir="bottom"
                  className="about-text about-text--lead about-scroll-fade"
                >
                  I’m a Full-Stack Developer based in Leon City, Philippines. My development journey started with curiosity about how digital products work, then grew into a focus on building useful tools that solve real problems.
                </p>
                <p
                  data-about-fade
                  data-about-fade-order="8"
                  data-about-fade-dir="bottom"
                  className="about-text about-scroll-fade"
                >
                  I’ve worked across web applications, dashboards, automation, APIs, and mobile experiences. Each project has helped me improve how I turn ideas into clear, reliable products, from planning the user experience to building and refining the final result.
                </p>
              </div>

              {/* Clean Editorial Focus Strip on the White Canvas */}
              <div
                data-about-fade
                data-about-fade-order="9"
                data-about-fade-dir="bottom"
                className="about-focus-strip about-scroll-fade"
              >
                {FOCUS_PILLARS.map((pillar) => (
                  <div key={pillar.index} className="about-focus-item">
                    <div className="about-focus-heading">
                      <span className="about-focus-idx">{pillar.index}</span>
                      <span className="about-focus-title">{pillar.title}</span>
                    </div>
                    <p className="about-focus-list">{pillar.items}</p>
                  </div>
                ))}
              </div>

              {/* Mobile GitHub Contributions View */}
              <div className="about-skills-box about-skills-box--mobile">
                <div className="about-gh-mobile-card">
                  <div className="about-gh-mobile-header">
                    <a
                      href={`https://github.com/${GITHUB_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-gh-mobile-handle"
                    >
                      @{GITHUB_USERNAME}
                    </a>
                    <span className="about-gh-mobile-total">
                      {stats.total.toLocaleString()} commits / yr
                    </span>
                  </div>

                  <div className="about-gh-grid about-gh-grid--mobile">
                    {mobileWeeks.map((week, wIdx) => (
                      <div key={wIdx} className="about-gh-week">
                        {week.map((day) => (
                          <div
                            key={day.date}
                            className={`about-gh-cell about-gh-cell--lvl-${day.level}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="about-gh-mobile-meta">
                    <span>{stats.activeDays} active days</span>
                    <span aria-hidden="true">·</span>
                    <span>{stats.longestStreak}d best streak</span>
                    <span aria-hidden="true">·</span>
                    <span>{stats.maxCount} peak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── About WebGL bg layer ── */
        .about-bg-parallax {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* Wrapper: scroll system writes bg-image counter-transform here — keeps it screen-fixed */
        .about-bg-parallax .about-bg-wrap.bg-image {
          position: absolute;
          inset: 0;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* ── Dual-Zone Shell: Single-row 2-column grid where Portrait & GitHub share "left" ── */
        .about-shell {
          position: relative;
          display: grid;
          grid-template-columns: minmax(340px, 42%) minmax(0, 47%);
          grid-template-rows: 1fr;
          grid-template-areas: "left content";
          justify-content: space-between;
          align-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          min-height: 0;
          padding: clamp(4rem, 5.5vh, 5.25rem) clamp(2rem, 4vw, 4.75rem) clamp(1.25rem, 2.5vh, 2.25rem);
          z-index: 1;
        }

        .about-image-container {
          display: contents;
        }

        /* ── Left Zone: Large Hero Portrait (overlapped at the bottom by GitHub Contributions) ──
             Note: useScrollAnimation applies translateY(-60px) to .about-image-wrap,
             so top: 44px seats the large portrait down behind the overlapping GitHub card. ── */
        .about-image-wrap {
          grid-area: left;
          position: relative;
          top: 44px;
          justify-self: center;
          align-self: center;
          width: min(640px, 114%);
          height: clamp(460px, 78vh, 760px);
          overflow: visible;
          opacity: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .about-portrait-stage {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          -webkit-mask-image: linear-gradient(
            180deg,
            #000000 0%,
            #000000 88%,
            rgba(0, 0, 0, 0.45) 96%,
            transparent 100%
          );
          mask-image: linear-gradient(
            180deg,
            #000000 0%,
            #000000 88%,
            rgba(0, 0, 0, 0.45) 96%,
            transparent 100%
          );
        }

        .about-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          transform: scale(1.12);
          filter: contrast(1.03) brightness(0.99);
          user-select: none;
          pointer-events: none;
        }

        .about-portrait-fallback {
          width: 260px;
          height: 260px;
          border-radius: 50%;
          border: 1px solid rgba(167, 139, 250, 0.35);
          background: radial-gradient(circle, rgba(124, 58, 237, 0.25), rgba(6, 5, 16, 0.9));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
        }

        /* ── Right Zone: Editorial Monograph seated 100% on the Stark White Canvas ── */
        .about-content {
          grid-area: content;
          align-self: center;
          justify-self: start;
          max-width: 640px;
          width: 100%;
          min-width: 0;
          padding: 0;
        }

        .about-header-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 0.15rem;
        }

        .about-editorial-kicker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: #5b5470;
          padding-bottom: 0.55rem;
          border-bottom: 1px solid rgba(17, 8, 26, 0.1);
        }

        .about-kicker-index {
          color: #7c3aed;
          font-weight: 600;
        }

        .about-kicker-sep {
          color: rgba(17, 8, 26, 0.28);
        }

        .about-kicker-role {
          color: #11081a;
          font-weight: 500;
        }

        .about-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.1rem, 1.5vw, 1.45rem);
          font-weight: 700;
          color: #11081a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0.2rem 0 0;
        }

        .about-name {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.5rem, 4vw, 4.5rem);
          font-weight: 600;
          color: #000000;
          margin-left: -0.2rem;
          line-height: 1.08;
          opacity: 1;
          display: block;
          text-align: left;
        }
        .about-name--first {
          margin-top: 0.35rem;
        }
        .about-name--second {
          margin-top: 0;
        }
        .about-name-e,
        .about-name-n {
          font-size: 1.5em;
          display: inline-block;
          line-height: 0.8;
          opacity: 0;
          pointer-events: none;
          user-select: none;
        }

        .about-text-wrapper {
          max-width: 630px;
          margin-top: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .about-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.9rem, 0.98vw, 1rem);
          line-height: 1.62;
          color: #4a455a;
          margin: 0;
          opacity: 1;
        }

        .about-text--lead {
          color: #1e182b;
          font-weight: 500;
        }

        /* ── Clean 3-Column Architectural Focus Index on the White Canvas ── */
        .about-focus-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          margin-top: 1.35rem;
          padding-top: 0.95rem;
          border-top: 1px solid rgba(17, 8, 26, 0.12);
          max-width: 630px;
          opacity: 1;
        }

        .about-focus-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .about-focus-heading {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          font-family: 'Sora', sans-serif;
          font-size: 0.74rem;
          font-weight: 600;
          color: #11081a;
          white-space: nowrap;
        }

        .about-focus-idx {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.66rem;
          font-weight: 600;
          color: #7c3aed;
        }

        .about-focus-list {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.62rem;
          line-height: 1.45;
          color: #5b5470;
          margin: 0;
        }

        .about-scroll-fade {
          opacity: 1;
          animation: none !important;
          will-change: transform;
        }

        /* ── Larger GitHub Contributions Card Overlapping the Portrait in "left" ── */
        .about-skills-box {
          opacity: 1;
        }

        .about-skills-box.about-skills-box--desktop {
          grid-area: left;
          justify-self: center;
          align-self: end;
          margin-bottom: clamp(0.25rem, 1.5vh, 1.25rem);
          width: min(530px, 100%);
          padding: 0.95rem 1.2rem 0.9rem;
          background: rgba(6, 5, 14, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(124, 58, 237, 0.34);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
          border-radius: 10px;
          box-sizing: border-box;
          z-index: 3;
        }

        .about-skills-box.about-skills-box--mobile {
          display: none;
        }

        .about-gh-left-card {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          width: 100%;
          min-width: 0;
        }

        .about-gh-single-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.65rem;
          flex-wrap: nowrap;
          min-width: 0;
        }

        .about-gh-single-main {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
          min-width: 0;
          white-space: nowrap;
        }

        .about-gh-total-num {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.25rem, 1.55vw, 1.5rem);
          font-weight: 700;
          line-height: 1;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .about-gh-total-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem;
          color: rgba(237, 233, 254, 0.86);
        }

        .about-gh-sep {
          color: rgba(167, 139, 250, 0.55);
          font-size: 0.8rem;
        }

        .about-gh-handle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.76rem;
          color: #a78bfa;
          text-decoration: none;
          font-weight: 600;
          transition: color 150ms ease;
        }

        .about-gh-handle:hover {
          color: #ffffff;
          text-decoration: underline;
        }

        .about-gh-inspect {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.66rem;
          color: rgba(196, 181, 253, 0.86);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .about-gh-inspect strong {
          color: #ffffff;
          font-weight: 600;
        }

        .about-gh-heatmap-panel {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          width: 100%;
          min-width: 0;
        }

        .about-gh-months {
          position: relative;
          width: 100%;
          height: 13px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          color: rgba(221, 214, 254, 0.74);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .about-gh-month-label {
          position: absolute;
          top: 0;
          white-space: nowrap;
        }

        .about-gh-grid {
          display: grid;
          grid-template-columns: repeat(53, minmax(0, 1fr));
          gap: 2.5px;
          width: 100%;
        }

        .about-gh-week {
          display: grid;
          grid-template-rows: repeat(7, minmax(0, 1fr));
          gap: 2.5px;
        }

        .about-gh-cell {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 2px;
          transition: transform 120ms ease;
        }

        .about-gh-grid .about-gh-cell:hover {
          transform: scale(1.45);
          z-index: 2;
        }

        /* Experience-matched Purple (#7c3aed / #a78bfa) Contribution Levels */
        .about-gh-cell--lvl-0 {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .about-gh-cell--lvl-1 {
          background-color: #3b1774;
        }
        .about-gh-cell--lvl-2 {
          background-color: #6c2bd9;
        }
        .about-gh-cell--lvl-3 {
          background-color: #7c3aed;
        }
        .about-gh-cell--lvl-4 {
          background-color: #c4b5fd;
        }

        @media (max-width: 768px), (hover: none) and (pointer: coarse) {
          .about-bg-parallax,
          .about-shell,
          .about-content,
          .about-skills-box--mobile {
            max-width: 100%;
            overflow-x: clip;
          }

          .about-shell {
            display: flex !important;
            flex-direction: column !important;
            padding: 24px 20px 56px !important;
            height: auto !important;
            min-height: 100vh !important;
            gap: 20px !important;
            align-items: center !important;
            text-align: center !important;
          }

          .about-image-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
          }

          .about-image-wrap {
            top: 0 !important;
            width: min(290px, 80vw) !important;
            height: min(340px, 92vw) !important;
            transform: none !important;
            margin: 0 auto !important;
          }

          .about-content {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
          }

          .about-header-group {
            align-items: center !important;
          }

          .about-editorial-kicker {
            justify-content: center !important;
          }

          .about-title { display: none !important; }

          .about-name {
            font-size: 32px !important;
            text-align: center !important;
            margin: 0 auto !important;
            text-transform: uppercase !important;
            transform: none !important;
            width: 100% !important;
          }
          .about-name--first {
            margin-bottom: 0 !important;
          }
          .about-name--second {
            margin-bottom: 1.25rem !important;
          }

          .about-name-e, .about-name-n {
            font-size: 1em !important;
            opacity: 1 !important;
          }

          .about-text {
            font-size: 15px !important;
            line-height: 1.6 !important;
            text-align: center !important;
            margin-top: 0.75rem !important;
          }

          .about-focus-strip {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
            text-align: center !important;
          }

          .about-focus-heading {
            justify-content: center !important;
          }

          .about-skills-box--desktop {
            display: none !important;
          }

          .about-skills-box--mobile {
            display: block !important;
            width: 100% !important;
            max-width: 520px !important;
            margin: 1.5rem auto 0 !important;
            opacity: 1 !important;
          }

          .about-gh-mobile-card {
            background: rgba(12, 8, 26, 0.88);
            border: 1px solid rgba(124, 58, 237, 0.28);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .about-gh-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.72rem;
          }

          .about-gh-mobile-handle {
            color: #a78bfa;
            font-weight: 600;
            text-decoration: none;
          }

          .about-gh-mobile-total {
            color: #ffffff;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
          }

          .about-gh-grid--mobile {
            grid-template-columns: repeat(26, minmax(0, 1fr));
            gap: 2.5px;
          }

          .about-gh-mobile-meta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.65rem;
            color: rgba(196, 181, 253, 0.82);
            font-variant-numeric: tabular-nums;
          }
        }
      `}</style>
    </section>
  );
};
