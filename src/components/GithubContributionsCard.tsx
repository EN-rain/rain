import React, { useState, useEffect, useMemo } from 'react';
import fallbackData from '../data/githubContributions.json';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionsPayload {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

const LEVEL_COLORS = [
  '#1a1714', // Level 0: dark charcoal slate
  '#0e4429', // Level 1: deep emerald
  '#006d32', // Level 2: medium forest green
  '#26a641', // Level 3: bright green
  '#39d353', // Level 4: vivid green
];

export const GithubContributionsCard: React.FC<{ username?: string }> = ({
  username = 'EN-rain',
}) => {
  const [data, setData] = useState<ContributionsPayload>(fallbackData as unknown as ContributionsPayload);

  // Fetch live updates in the background, fallback immediately available
  useEffect(() => {
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch contributions');
        return res.json();
      })
      .then((json: ContributionsPayload) => {
        if (!cancelled && json?.contributions?.length) {
          setData(json);
        }
      })
      .catch(() => {
        // Silently retain pre-baked fallback data
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  // Compute 52 weeks (364 days)
  const { weeks, totalCount } = useMemo(() => {
    const days = data.contributions || [];
    const recentDays = days.slice(-364); // last 52 weeks * 7 days
    const cols: ContributionDay[][] = [];
    for (let i = 0; i < recentDays.length; i += 7) {
      cols.push(recentDays.slice(i, i + 7));
    }
    const total = recentDays.reduce((acc, d) => acc + d.count, 0) || 4074;
    return { weeks: cols, totalCount: total };
  }, [data]);

  return (
    <div className="relative w-full bg-[#0d0b09] text-[#e2dacb] flex flex-col px-[2.8cqw] py-[0.5cqh] gap-[0.3cqh] select-none pointer-events-auto overflow-hidden">
      {/* 1. Header Bar: Identity + Total Stamped Count */}
      <div className="flex items-center justify-between border-b border-[#2a2016]/80 pb-[0.2cqh] shrink-0">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-[1.2cqw] text-[#e2dacb] hover:text-[#5ee87a] transition-colors no-underline group"
          title={`View ${username} on GitHub`}
        >
          {/* GitHub Octocat Icon */}
          <svg
            viewBox="0 0 16 16"
            className="w-[2.8cqw] h-[2.8cqw] min-w-[11px] min-h-[11px] fill-current text-[#b3a896] group-hover:text-[#5ee87a] transition-colors"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span
            className="font-bold tracking-[0.14em] uppercase text-[clamp(7.5px,1.25cqh,11px)] text-[#d5c7b3] group-hover:text-[#5ee87a]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            @{username}
          </span>
        </a>

        {/* Clean Commit Count - Card/Border Design Removed */}
        <div
          className="flex items-center gap-[0.8cqw]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <span className="w-[5px] h-[5px] rounded-full bg-[#39d353] shadow-[0_0_5px_#39d353] animate-pulse" />
          <span className="text-[clamp(7px,1.1cqh,10px)] font-bold text-[#e8dfcf] tabular-nums tracking-[0.06em]">
            {totalCount.toLocaleString()}
          </span>
          <span className="text-[clamp(6px,0.95cqh,8.5px)] uppercase tracking-[0.12em] text-[#9a8d7a]">
            commits
          </span>
        </div>
      </div>

      {/* 2. Scalable Heatmap Grid via Pure SVG for Pixel-Crisp Display at Any Resolution */}
      <div className="flex items-center justify-center w-full shrink-0 my-0">
        <svg
          viewBox={`0 0 ${weeks.length * 9.5} 67`}
          className="w-full h-auto"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {weeks.map((week, colIdx) =>
            week.map((day, rowIdx) => {
              const fill = LEVEL_COLORS[day.level] || LEVEL_COLORS[0];
              const x = colIdx * 9.5;
              const y = rowIdx * 9.5;
              return (
                <rect
                  key={day.date || `${colIdx}-${rowIdx}`}
                  x={x}
                  y={y}
                  width="8"
                  height="8"
                  rx="1.2"
                  fill={fill}
                  className="transition-colors hover:stroke-[#e2dacb] hover:stroke-1"
                >
                  <title>{`${day.count} contributions on ${day.date}`}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      {/* 3. Footer Bar: Heat Scale Legend + External Link */}
      <div
        className="flex items-center justify-between text-[clamp(6px,0.92cqh,8px)] text-[#8a7d6d] uppercase tracking-[0.14em] shrink-0 border-t border-[#201812]/80 pt-[0.2cqh]"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        <span>FIELD ACTIVITY · 365 DAYS</span>

        {/* Legend */}
        <div className="flex items-center gap-[0.6cqw]">
          <span className="opacity-75">Less</span>
          <div className="flex items-center gap-[1.5px]">
            {LEVEL_COLORS.map((color, i) => (
              <span
                key={i}
                className="w-[6px] h-[6px] rounded-[1px] inline-block"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="opacity-75">More</span>
        </div>
      </div>
    </div>
  );
};

export default GithubContributionsCard;
