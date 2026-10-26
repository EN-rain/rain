import { useEffect, useMemo, useState } from 'react';
import heroImage from '../../assets/images/hero1.2.png';
import { useMobileReveal } from '../../hooks/useMobileReveal';
import { CosmicInkSvg } from '../CosmicInkSvg';
import {
  FALLBACK_GITHUB_CONTRIBUTIONS,
  type ContributionDay,
  type GithubContributionsResponse,
} from '../../data/githubContributionsFallback';

const GITHUB_USERNAME = 'EN-rain';
const GITHUB_API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;
const CACHE_KEY = `gh_contrib_${GITHUB_USERNAME}_v1`;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

    // Calculate current streak from most recent active day
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else if (i < days.length - 1) {
        break;
      }
    }

    // Group into 7-day week columns
    const weekCols: ContributionDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekCols.push(days.slice(i, i + 7));
    }

    // Determine month label headers for week columns
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
    <section ref={revealRef} id="about" className="stack-section mask-shaped-section mask-theme-purple" style={{ zIndex: 20 }}>
      <div className="clip-gap-outer parallax-content">
        <div className="clip-gap-inner">
          {/* ── Pure SVG Cosmic Ink Background ──
               Wrapper: bg-image → gets scroll counter-transform (stays screen-fixed)
               so the SVG canvas remains aligned during section scroll transitions ── */}
          <div className="about-bg-parallax" aria-hidden="true">
            <div className="about-bg-wrap bg-image">
              <CosmicInkSvg />
            </div>
          </div>

          <div className="about-shell locked-content">
            <div className="about-image-container relative">
              <div data-about-fade data-about-fade-order="0" data-about-fade-dir="left" className="about-image-wrap about-scroll-fade">
                <img src={heroImage} alt="Profile" className="about-image" decoding="async" fetchPriority="high" />
              </div>

              {/* Desktop GitHub Contributions Tracker (replaces tech stack below profile) */}
              <div
                data-about-fade
                data-about-fade-order="10"
                data-about-fade-dir="bottom"
                className="about-skills-box about-skills-box--desktop about-scroll-fade"
              >
                {/* Left Column (Over the Dark Cosmic Sphere): Live Total & Streak Readout */}
                <div className="about-gh-summary">
                  <div className="about-gh-header">
                    <a
                      href={`https://github.com/${GITHUB_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-gh-handle"
                    >
                      github.com/{GITHUB_USERNAME}
                    </a>
                    <span className="about-gh-sep" aria-hidden="true">·</span>
                    <span className="about-gh-sub">LIVE COMMITS</span>
                  </div>

                  <div className="about-gh-total-row">
                    <span className="about-gh-total-num">{stats.total.toLocaleString()}</span>
                    <span className="about-gh-total-label">contributions in the last year</span>
                  </div>

                  <div className="about-gh-metrics">
                    <span>{stats.activeDays} active days</span>
                    <span aria-hidden="true">·</span>
                    <span>{stats.longestStreak}d best streak</span>
                    <span aria-hidden="true">·</span>
                    <span>{stats.maxCount} peak day</span>
                  </div>
                </div>

                {/* Right Column (Over the Stark White Canvas): 52-Week Contribution Heatmap */}
                <div className="about-gh-heatmap-panel">
                  <div className="about-gh-heatmap-top">
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
                    <div className="about-gh-inspect">
                      {hoveredDay ? (
                        <>
                          <strong>{hoveredDay.count}</strong>{' '}
                          {hoveredDay.count === 1 ? 'contribution' : 'contributions'} on{' '}
                          {formatDateLabel(hoveredDay.date)}
                        </>
                      ) : (
                        <span>Past 12 months · Daily contribution density</span>
                      )}
                    </div>
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

                  <div className="about-gh-legend">
                    <span>Less</span>
                    <span className="about-gh-cell about-gh-cell--lvl-0" />
                    <span className="about-gh-cell about-gh-cell--lvl-1" />
                    <span className="about-gh-cell about-gh-cell--lvl-2" />
                    <span className="about-gh-cell about-gh-cell--lvl-3" />
                    <span className="about-gh-cell about-gh-cell--lvl-4" />
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-content">
              <h2 data-about-fade data-about-fade-order="1" data-about-fade-dir="top" className="about-title about-scroll-fade">Hello!, I'm</h2>
              <h3 data-about-fade data-about-fade-order="2" data-about-fade-dir="right" className="about-name about-name--first about-scroll-fade"><span className="about-name-e">E</span>drian</h3>
              <h3 data-about-fade data-about-fade-order="2.6" data-about-fade-dir="right" className="about-name about-name--second about-scroll-fade"><span className="about-name-n">N</span>ieves</h3>

              <div className="about-text-wrapper">
                <p data-about-fade data-about-fade-order="6" data-about-fade-dir="bottom" className="about-text about-scroll-fade">
                  I’m a Full-Stack Developer based in Leon City, Philippines. My development journey started with curiosity about how digital products work, then grew into a focus on building useful tools that solve real problems.
                </p>
                <p data-about-fade data-about-fade-order="8" data-about-fade-dir="bottom" className="about-text about-scroll-fade">
                  I’ve worked across web applications, dashboards, automation, APIs, and mobile experiences. Each project has helped me improve how I turn ideas into clear, reliable products, from planning the user experience to building and refining the final result.
                </p>
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

        /* Keyframe animations */
        @keyframes slideFromLeft {
          from {
            opacity: 0;
            transform: translateX(-100px) translateY(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-60px);
          }
        }

        @keyframes slideFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideFromTop {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideFromRight {
          from {
            opacity: 0;
            transform: translateX(100px) translateY(35px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes slideTextFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .about-shell {
          position: relative;
          display: grid;
          grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.22fr);
          grid-template-rows: auto auto;
          grid-template-areas:
            "image content"
            "skills skills";
          align-content: center;
          align-items: center;
          column-gap: clamp(2.5rem, 5vw, 6rem);
          row-gap: clamp(1rem, 2vh, 1.75rem);
          width: 100%;
          height: 100%;
          min-height: 0;
          padding: clamp(5.25rem, 8vh, 6.5rem) clamp(3rem, 5vw, 6rem) clamp(1.5rem, 3vh, 2.5rem);
          z-index: 1;
        }

        .about-image-container {
          display: contents;
        }

        .about-image-wrap {
          grid-area: image;
          position: relative;
          justify-self: center;
          width: min(430px, 100%);
          max-height: 54vh;
          aspect-ratio: 1 / 1;
          overflow: visible;
          opacity: 0;
        }

        .about-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .about-content {
          grid-area: content;
          align-self: center;
          max-width: 700px;
          min-width: 0;
          padding: 0;
        }

        .about-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.2rem, 1.8vw, 1.8rem);
          font-weight: 700;
          color: #11081a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0;
          margin: 0;
        }

        .about-name {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.5rem, 4vw, 4.5rem);
          font-weight: 600;
          color: #000000;
          margin-left: -0.2rem;
          line-height: 1.1;
          opacity: 0;
          display: block;
          text-align: left;
        }
        .about-name--first {
          margin-top: 0.5rem;
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
          max-width: 680px;
        }

        .about-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.92rem, 1vw, 1.02rem);
          line-height: 1.6;
          color: #4a4a5a;
          margin-top: 1.5rem;
          margin-bottom: 0;
          opacity: 0;
        }

        .about-scroll-fade {
          opacity: 0;
          animation: none !important;
          will-change: opacity, transform;
        }

        /* ── GitHub Contributions Tracker (Desktop & Mobile) ── */
        .about-skills-box {
          opacity: 0;
        }

        .about-skills-box.about-skills-box--desktop {
          grid-area: skills;
          display: grid;
          grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.22fr);
          column-gap: clamp(2.5rem, 5vw, 6rem);
          align-items: center;
          width: 100%;
          padding: 0.95rem 0 0;
          border-top: 1px solid rgba(120, 140, 180, 0.26);
          box-sizing: border-box;
        }

        .about-skills-box.about-skills-box--mobile {
          display: none;
        }

        /* Left summary column (sits over the dark cosmic void sphere) */
        .about-gh-summary {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
          justify-self: center;
          width: min(430px, 100%);
        }

        .about-gh-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
        }

        .about-gh-handle {
          color: #93c5fd;
          text-decoration: none;
          font-weight: 500;
          transition: color 150ms ease;
        }

        .about-gh-handle:hover {
          color: #ffffff;
          text-decoration: underline;
        }

        .about-gh-sep {
          color: rgba(148, 163, 184, 0.5);
        }

        .about-gh-sub {
          color: rgba(226, 232, 240, 0.65);
          font-size: 0.62rem;
        }

        .about-gh-total-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
        }

        .about-gh-total-num {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.5rem, 2.2vw, 2.1rem);
          font-weight: 700;
          line-height: 1.05;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .about-gh-total-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          color: rgba(226, 232, 240, 0.8);
          white-space: nowrap;
        }

        .about-gh-metrics {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.45rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.64rem;
          color: rgba(147, 197, 253, 0.88);
          font-variant-numeric: tabular-nums;
        }

        /* Right heatmap column (sits over the stark white canvas) */
        .about-gh-heatmap-panel {
          display: flex;
          flex-direction: column;
          gap: 0.42rem;
          max-width: 700px;
          width: 100%;
          min-width: 0;
        }

        .about-gh-heatmap-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 16px;
        }

        .about-gh-months {
          position: relative;
          flex: 1;
          height: 14px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.6rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .about-gh-month-label {
          position: absolute;
          top: 0;
          white-space: nowrap;
        }

        .about-gh-inspect {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.64rem;
          color: #334155;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .about-gh-inspect strong {
          color: #0f172a;
          font-weight: 600;
        }

        .about-gh-grid {
          display: grid;
          grid-template-columns: repeat(53, minmax(0, 1fr));
          gap: 3px;
          width: 100%;
        }

        .about-gh-week {
          display: grid;
          grid-template-rows: repeat(7, minmax(0, 1fr));
          gap: 3px;
        }

        .about-gh-cell {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 2px;
          transition: transform 120ms ease;
        }

        .about-gh-grid .about-gh-cell:hover {
          transform: scale(1.35);
          z-index: 2;
        }

        /* Cobalt & Sumi Ink Contribution Levels */
        .about-gh-cell--lvl-0 {
          background-color: rgba(15, 23, 42, 0.07);
        }
        .about-gh-cell--lvl-1 {
          background-color: #93c5fd;
        }
        .about-gh-cell--lvl-2 {
          background-color: #3b82f6;
        }
        .about-gh-cell--lvl-3 {
          background-color: #1d4ed8;
        }
        .about-gh-cell--lvl-4 {
          background-color: #0f172a;
        }

        .about-gh-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.58rem;
          color: #64748b;
          margin-top: 2px;
        }

        .about-gh-legend .about-gh-cell {
          width: 8px;
          height: 8px;
          aspect-ratio: auto;
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
            gap: 24px !important;
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
            width: min(300px, 82vw) !important;
            height: min(300px, 82vw) !important;
            transform: none !important;
            margin: 0 auto !important;
          }

          .about-content {
            width: 100% !important;
            max-width: 100% !important;
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
            margin-bottom: 1.5rem !important;
          }

          .about-name-e, .about-name-n {
            font-size: 1em !important;
            opacity: 1 !important;
          }

          .about-text {
            font-size: 15px !important;
            line-height: 1.6 !important;
            text-align: center !important;
            margin-top: 1rem !important;
          }

          .about-skills-box--desktop {
            display: none !important;
          }

          .about-skills-box--mobile {
            display: block !important;
            width: 100% !important;
            max-width: 520px !important;
            margin: 1.75rem auto 0 !important;
            opacity: 1 !important;
          }

          .about-gh-mobile-card {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(15, 23, 42, 0.1);
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
            color: #1d4ed8;
            font-weight: 600;
            text-decoration: none;
          }

          .about-gh-mobile-total {
            color: #0f172a;
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
            color: #475569;
            font-variant-numeric: tabular-nums;
          }
        }
      `}</style>
    </section>
  );
};
