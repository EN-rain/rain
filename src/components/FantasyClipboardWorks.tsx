import React, { useState, useCallback, useMemo } from 'react';
import '../styles/clipboard-works.css';

export interface ProjectEntry {
  id: string;
  title: string;
  date: string;
  image: string;
  repoUrl: string;
  techStack: string[];
}

export const PROJECTS: ProjectEntry[] = [
  {
    id: 'studentflow',
    title: 'StudentFlow',
    date: '2024 – 2025',
    image: '/assets/projects/studentflow.png',
    repoUrl: 'https://github.com/EN-rain/StudentFlow',
    techStack: ['Next.js 14', 'React 18', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Kotlin'],
  },
  {
    id: 'pockettrade',
    title: 'PocketTrade',
    date: 'June 2026',
    image: '/assets/projects/pockettrade.png',
    repoUrl: 'https://github.com/EN-rain/PocketTrade',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Cloudinary'],
  },
  {
    id: 'chemquest',
    title: 'ChemQuest',
    date: '2024 – 2025',
    image: '/assets/projects/chemquest.png',
    repoUrl: 'https://github.com/EN-rain/ChemQuest',
    techStack: ['Unity 2022.3 LTS', 'C#', 'HLSL Shaders', 'WebGL', 'UI Toolkit'],
  },
  {
    id: 'typeduel',
    title: 'TypeDuel',
    date: 'May 2026',
    image: '/assets/projects/typeduel-bg.png',
    repoUrl: 'https://github.com/EN-rain/TypeDuel',
    techStack: ['Godot 4.6', 'GDScript', 'Node.js', 'Express', 'Socket.IO', 'WebSockets', 'SQLite'],
  },
  {
    id: 'tsukiai',
    title: 'TsukiAI',
    date: '2025 – 2026',
    image: '/assets/projects/tsukiai.png',
    repoUrl: 'https://github.com/EN-rain/TsukiAI-Desktop',
    techStack: ['.NET 8', 'WPF', 'C#', 'ASP.NET Core', 'Node.js', 'Discord.js', 'ChromaDB', 'VOICEVOX'],
  },
  {
    id: 'auvrynt',
    title: 'Auvrynt',
    date: 'July – Oct 2026',
    image: '/assets/projects/auvrynt.png',
    repoUrl: 'https://github.com/EN-rain/Auvrynt',
    techStack: ['TypeScript', 'React', 'Tailwind CSS', 'Electron', 'Node.js', 'Model Context Protocol (MCP)'],
  },
];

interface FantasyClipboardWorksProps {
  isAssembled?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  className?: string;
}

export const FantasyClipboardWorks: React.FC<FantasyClipboardWorksProps> = ({
  isAssembled = false,
  onBack,
  onNext,
  className = '',
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('studentflow');
  const [isRescattering, setIsRescattering] = useState<boolean>(false);

  const selectedProject = useMemo(() => {
    return PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  const effectiveAssembled = isAssembled && !isRescattering;

  const handleToggleScatter = useCallback(() => {
    if (!isAssembled) return;
    setIsRescattering(true);
    setTimeout(() => {
      setIsRescattering(false);
    }, 280);
  }, [isAssembled]);

  return (
    <div
      className={`clipboard-works ${effectiveAssembled ? 'is-assembled' : 'is-scattered'} ${className}`}
      aria-label="Works case dossiers and project clipboard"
    >
      {/* Top Controls Overlay */}
      <div className="clipboard-works-controls">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2.5 px-4 py-2 bg-[#1b1c18]/90 hover:bg-[#252720] border border-[#524c3a]/60 text-[#d8cbb1] text-xs uppercase tracking-[0.2em] font-mono transition-all duration-200 hover:text-[#f2e7ce] active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer"
          style={{ fontFamily: "'Space Grotesk', 'IBM Plex Mono', monospace" }}
        >
          <span className="text-[#c99f57] font-bold">←</span>
          <span>RETURN TO DESK</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href={selectedProject.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#252820]/80 hover:bg-[#34382c] border border-[#5a5440]/60 text-[#e4dac4] text-xs font-mono uppercase tracking-[0.16em] transition-all duration-200 hover:text-[#fff] shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <span>CASE DOSSIER</span>
            <span className="text-[#c99f57]">↗</span>
          </a>

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#252820]/80 hover:bg-[#34382c] border border-[#5a5440]/60 text-[#e4dac4] text-xs font-mono uppercase tracking-[0.16em] transition-all duration-200 hover:text-[#fff] shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <span>CONTACTS</span>
              <span className="text-[#c99f57]">→</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleScatter}
            title="Scatter and reassemble clipboard pieces"
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1f211c]/90 hover:bg-[#2a2d24] border border-[#484232]/60 text-[#c7ba9f] text-xs uppercase tracking-[0.18em] font-mono transition-all duration-200 hover:text-[#ede2c8] active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <span className="inline-block transition-transform duration-500 hover:rotate-180">✦</span>
            <span>RE-SCATTER</span>
          </button>
        </div>
      </div>

      {/* Main Layout containing all 7 visual assets */}
      <div className="clipboard-works-layout">
        {/* ============================================================== */}
        {/* 1. Clipboard Board Backing */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-board"
          style={{
            zIndex: 1,
            clipPath: 'inset(11% 0 0 0)',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))',
          }}
        >
          <img
            alt="Clipboard wooden board"
            draggable={false}
            src="/assets/clipboard/clipboard-board.png"
            className="absolute max-w-none select-none pointer-events-none"
            style={{
              width: '108.6137%',
              height: '111.9540%',
              left: '-4.3069%',
              top: '-2.9885%',
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 2. Bottom Parchment Paper */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-bottom-paper"
          style={{
            zIndex: 2,
            filter: 'drop-shadow(1px 3px 2px #241b1355)',
            transformOrigin: '50% 50%',
          }}
        >
          <img
            alt="Bottom parchment sheet"
            draggable={false}
            src="/assets/clipboard/bottom-paper.png"
            className="absolute max-w-none select-none pointer-events-none"
            style={{
              width: '109.4241%',
              height: '131.3089%',
              left: '-4.7120%',
              top: '-15.7068%',
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 3. Middle Parchment Paper */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-middle-paper"
          style={{
            zIndex: 3,
            filter: 'drop-shadow(1px 3px 2px #241b1355)',
            transformOrigin: '50% 50%',
          }}
        >
          <img
            alt="Middle parchment sheet"
            draggable={false}
            src="/assets/clipboard/middle-paper.png"
            className="absolute max-w-none select-none pointer-events-none"
            style={{
              width: '109.4241%',
              height: '131.3089%',
              left: '-4.7120%',
              top: '-15.7068%',
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 4. Front Paper with Stamped 'PROJECTS' Title and Ruled List */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-front-paper"
          style={{
            zIndex: 4,
            filter: 'drop-shadow(1px 3px 2px #241b1355)',
            pointerEvents: effectiveAssembled ? 'auto' : 'none',
          }}
        >
          <div
            className="absolute inset-0 select-none"
            style={{
              width: '109.4241%',
              height: '131.3089%',
              left: '-4.7120%',
              top: '-15.7068%',
              containerType: 'size',
            }}
          >
            {/* Base Paper Image Texture */}
            <img
              alt="Blank front paper"
              draggable={false}
              src="/assets/clipboard/front-paper.png"
              className="w-full h-full block select-none pointer-events-none"
            />

            {/* Inscribed Paper Content: Aligns directly to paper lines with ZERO background */}
            <div
              className="clipboard-inscribed-content absolute inset-0 select-none"
              style={{
                fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
                pointerEvents: effectiveAssembled ? 'auto' : 'none',
              }}
            >
              {/* Top Space (above first ruled line at y=324): 'PROJECTS' title */}
              <div
                className="absolute flex items-end justify-between"
                style={{
                  left: '10.5%',
                  right: '10.5%',
                  top: '13.2%',
                  height: '11.8%',
                  paddingBottom: '0.7cqh',
                }}
              >
                <h1
                  className="m-0 font-bold uppercase tracking-[0.18em] text-[#1a1109] select-none leading-none"
                  style={{
                    fontSize: 'clamp(16px, 4cqh, 34px)',
                    textShadow: '0 0.5px 0.5px rgba(26, 17, 9, 0.28)',
                  }}
                >
                  PROJECTS
                </h1>
              </div>

              {/* 6 Ruled Project Rows: Sticking strictly to the paper lines */}
              {PROJECTS.map((project, idx) => {
                const isSelected = project.id === selectedProjectId;
                const rowCoords = [
                  { top: '25.84%', height: '7.97%' },
                  { top: '33.81%', height: '8.05%' },
                  { top: '41.87%', height: '8.05%' },
                  { top: '49.92%', height: '8.05%' },
                  { top: '57.97%', height: '8.13%' },
                  { top: '66.11%', height: '8.05%' },
                ][idx];

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    aria-label={`Select project ${project.title}`}
                    className="group absolute flex items-baseline justify-between bg-transparent border-0 p-0 m-0 cursor-pointer select-none transition-colors duration-150"
                    style={{
                      left: '10.5%',
                      right: '10.5%',
                      top: rowCoords.top,
                      height: rowCoords.height,
                      paddingBottom: '0.42cqh',
                    }}
                  >
                    {/* -title format directly on line with NO background */}
                    <span
                      className={`tracking-[0.04em] flex items-baseline gap-1 leading-none transition-colors duration-150 ${
                        isSelected
                          ? 'text-[#0a0603] font-bold'
                          : 'text-[#352519] hover:text-[#120c07]'
                      }`}
                      style={{
                        fontSize: 'clamp(12px, 2.8cqh, 24px)',
                        textDecoration: isSelected ? 'underline' : 'none',
                        textDecorationColor: 'rgba(26, 17, 9, 0.4)',
                        textUnderlineOffset: '2.5px',
                      }}
                    >
                      <span className="opacity-90 select-none">–</span>
                      <span>{project.title}</span>
                    </span>

                    {/* Date format sticking directly to paper line */}
                    <span
                      className={`tracking-[0.05em] uppercase select-none transition-colors duration-150 leading-none ${
                        isSelected
                          ? 'text-[#1c1209] font-semibold'
                          : 'text-[#503b29] group-hover:text-[#2d1f14]'
                      }`}
                      style={{
                        fontSize: 'clamp(10px, 2.15cqh, 17px)',
                      }}
                    >
                      {project.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. Picture Frame: Image Only inside the transparent frame */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-photo-frame"
          style={{
            zIndex: 5,
            filter: 'drop-shadow(1px 3px 2px #17171666)',
            pointerEvents: effectiveAssembled ? 'auto' : 'none',
          }}
        >
          {/* Inner project screenshot (Image Only) */}
          <div
            className="absolute overflow-hidden rounded-[2px]"
            style={{
              inset: '8% 10% 12% 10%',
              zIndex: 1,
              background: '#1a1916',
            }}
          >
            <img
              alt={`${selectedProject.title} photograph`}
              src={selectedProject.image}
              className="w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
              style={{
                filter: 'sepia(0.12) contrast(1.05) brightness(0.96)',
              }}
            />
          </div>

          {/* Transparent Photo Frame Layer */}
          <img
            alt="Transparent antique photo frame asset"
            draggable={false}
            src="/assets/clipboard/transparent-photo-frame.png"
            className="absolute max-w-none select-none pointer-events-none"
            style={{
              width: '117.8700%',
              height: '106.1674%',
              left: '-11.9134%',
              top: '-4.4053%',
              zIndex: 2,
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* 6. Small Note: Only Tech Stack Displayed on Ruled Lines */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-small-note"
          style={{
            zIndex: 5,
            filter: 'drop-shadow(1px 3px 2px #17171666)',
            pointerEvents: effectiveAssembled ? 'auto' : 'none',
          }}
        >
          <div
            className="absolute inset-0 select-none"
            style={{
              width: '115.5319%',
              height: '123.7607%',
              left: '-8.7234%',
              top: '-12.3932%',
              containerType: 'size',
            }}
          >
            {/* Base Note Paper Texture */}
            <img
              alt="Parchment small note asset"
              draggable={false}
              src="/assets/clipboard/small-note.png"
              className="w-full h-full block select-none pointer-events-none"
            />

            {/* Small Note Body: Exclusively Tech Stack on Ruled Lines */}
            <div
              className="clipboard-inscribed-content absolute inset-0 select-none"
              style={{
                fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
                pointerEvents: effectiveAssembled ? 'auto' : 'none',
              }}
            >
              {/* Header: 'TECH STACK' placed on top ruled line y=156 */}
              <div
                className="absolute flex items-end justify-between bg-transparent p-0 m-0"
                style={{
                  left: '14%',
                  right: '12%',
                  top: '12.4%',
                  height: '7.8%',
                  paddingBottom: '0.42cqh',
                }}
              >
                <span
                  className="font-bold tracking-[0.14em] uppercase text-[#1a1109] leading-none"
                  style={{
                    fontSize: 'clamp(10px, 2.6cqh, 19px)',
                    textShadow: '0 0.5px 0.5px rgba(26, 17, 9, 0.25)',
                  }}
                >
                  TECH STACK
                </span>
              </div>

              {/* 8 Ruled Line Rows strictly aligned to small-note.png rulings */}
              {[
                { top: '20.2%', height: '7.8%' },
                { top: '28.0%', height: '7.8%' },
                { top: '35.8%', height: '7.8%' },
                { top: '43.6%', height: '7.8%' },
                { top: '51.4%', height: '7.8%' },
                { top: '59.2%', height: '7.8%' },
                { top: '67.0%', height: '7.8%' },
                { top: '74.8%', height: '7.8%' },
              ].map((row, idx) => {
                const list = selectedProject.techStack;
                let tech: string | undefined;
                if (idx < 7) {
                  tech = list[idx];
                } else if (idx === 7) {
                  tech = list.length > 8 ? list.slice(7).join(' • ') : list[7];
                }

                if (!tech) return null;

                return (
                  <div
                    key={`${selectedProject.id}-${idx}-${tech}`}
                    className="absolute flex items-baseline gap-1.5 leading-none bg-transparent p-0 m-0"
                    style={{
                      left: '14%',
                      right: '12%',
                      top: row.top,
                      height: row.height,
                      paddingBottom: '0.42cqh',
                    }}
                  >
                    <span
                      className="text-[#644930] select-none leading-none shrink-0"
                      style={{ fontSize: 'clamp(8px, 1.9cqh, 14px)' }}
                    >
                      •
                    </span>
                    <span
                      className="font-medium tracking-[0.03em] text-[#22160d] truncate leading-none"
                      style={{
                        fontSize: 'clamp(9px, 2.2cqh, 16px)',
                      }}
                    >
                      {tech}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 7. Complete Clipboard Clip */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-clip"
          style={{
            zIndex: 9,
          }}
        >
          <img
            alt="Complete clipboard metal clip"
            draggable={false}
            src="/assets/clipboard/clipboard-clip.png"
            className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </div>
  );
};

export default FantasyClipboardWorks;
