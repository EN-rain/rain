import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import '../styles/clipboard-works.css';

export interface ProjectEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  image: string;
  repoUrl: string;
  techStack: string[];
  description: string;
  detailedDescription: string[];
  videoDuration: string;
}

export const PROJECTS: ProjectEntry[] = [
  {
    id: 'studentflow',
    title: 'StudentFlow',
    subtitle: 'STUDENT MANAGEMENT WEB, API, AND ANDROID APP',
    date: '2024 – 2025',
    image: '/assets/projects/studentflow.png',
    repoUrl: 'https://github.com/EN-rain/StudentFLow',
    techStack: ['Laravel 12', 'PHP 8.2', 'Blade', 'Sanctum', 'SQLite', 'Dompdf', 'Java 17', 'Retrofit'],
    description:
      'A school hub that helps administrators, teachers, and students stay on top of everyday learning. Teachers can manage classes, attendance, assignments, grades, and announcements in one place. Students can follow their work, results, and important updates from the web or mobile app.',
    detailedDescription: [
      'StudentFlow is a student-management system with a Laravel web application, Laravel REST API, and native Java Android client. It supports administrator, teacher, and student roles across school and classroom workflows.',
      'The platform includes teacher and student management, classes, enrollment, join requests, attendance, grade categories, grade items, scores, assignments, announcements, exams, reports, activity logs, and school settings. Student accounts can also use configured social sign-in providers.',
      'Teachers create classes, manage enrollment or join-code requests, record attendance and grades, publish announcements, create assignments and exams, then review student progress and reports. Students access their dashboard, class work, grades, attendance, announcements, and supported exam flows through the Android client.',
    ],
    videoDuration: '01:42',
  },
  {
    id: 'pockettrade',
    title: 'PocketTrade',
    subtitle: 'USED-PHONE MARKETPLACE',
    date: 'June 2026',
    image: '/assets/projects/pockettrade.png',
    repoUrl: 'https://github.com/EN-rain/PocketTrade',
    techStack: ['Flutter', 'Dart', 'NestJS', 'TypeScript', 'Prisma', 'PostgreSQL', 'React', 'Cloudinary', 'Socket.IO', 'Firebase'],
    description:
      'A safer place to buy and sell used phones. Browse listings, save favorites, and chat directly with sellers when you find a device you like. Built-in reporting helps users flag anything that does not look right.',
    detailedDescription: [
      'PocketTrade is a used-phone marketplace with a Flutter Android application, NestJS API, and React administration panel. The repository separates mobile, backend, admin, QA scripts, and supporting documentation.',
      'The platform supports email and password sign-in, OTP verification and reset, JWT access and refresh tokens, listings, favorites, conversations, blocks, reports, push tokens, and administrative operations.',
      'Listings are moderated before public visibility: sellers submit a listing with one to five images, the backend validates and stores it as pending, and administrators approve or reject it through the dashboard. Only approved public statuses are returned to buyer-facing listing search and detail endpoints.',
    ],
    videoDuration: '01:18',
  },
  {
    id: 'chemquest',
    title: 'ChemQuest',
    subtitle: 'STORY-DRIVEN CHEMISTRY LEARNING GAME',
    date: '2024 – 2025',
    image: '/assets/projects/chemquest.png',
    repoUrl: 'https://github.com/EN-rain/ChemQuest',
    techStack: ['Godot 4.6', 'GDScript', 'Android', 'JSON'],
    description:
      'A story-led chemistry game where players explore a hometown and complete quests. Short activities make topics such as elements, mixtures, density, and states of matter easier to understand. Progress, achievements, and a glossary give learners a clear reason to keep exploring.',
    detailedDescription: [
      "ChemQuest2 is a Godot 4.6 chemistry-learning game that combines a story-driven hometown hub with quests, an element glossary, achievements, and interactive minigames. It supports desktop preview and Android export through Godot's mobile renderer.",
      "Chapter One branches from the hometown into lessons for elements, compounds, mixtures, separation methods, accuracy and precision, density, and states of matter. NPC interactions, buildings, quests, and rewards connect those lessons to the game's progression.",
      "Shared managers coordinate quests, saving, spawning, dialogue, music, sound effects, fades, guidance, and feedback. Project data files hold quest definitions and learning content, while Godot user storage preserves the player's current scene and progress.",
    ],
    videoDuration: '02:05',
  },
  {
    id: 'typeduel',
    title: 'TypeDuel',
    subtitle: 'COMPETITIVE PIXEL TYPING DUEL',
    date: 'May 2026',
    image: '/assets/projects/typeduel-bg.png',
    repoUrl: 'https://github.com/EN-rain/TypeDuel',
    techStack: ['Godot 4.6', 'GDScript', 'Node.js', 'Express', 'Socket.IO', 'WebSockets', 'SQLite'],
    description:
      'A fast pixel-art typing battle where every word affects the fight. Players race through prompts, use character abilities, and compete on speed and accuracy. Challenge a friend in a private room or jump into a matched duel.',
    detailedDescription: [
      'TypeDuel is a competitive 2D pixel typing duel built with Godot and a Node.js backend. Players log in, enter matchmaking or create custom rooms, select a character loadout, and fight through round-based typing battles.',
      'Matches combine speed and accuracy with health, mana, active skills, passive disruption effects, win streaks, forfeits, and rematches. The documented roster includes Riven, Liora, and Zephon.',
      'REST endpoints support account, lobby, room, social, and history workflows, while Socket.IO and WebSocket connections synchronize match events. Live rooms remain in memory and SQLite persists accounts, social records, chat, leaderboards, and history.',
    ],
    videoDuration: '01:34',
  },
  {
    id: 'tsukiai',
    title: 'TsukiAI',
    subtitle: 'WPF VOICE ASSISTANT + DISCORD BRIDGE',
    date: '2025 – 2026',
    image: '/assets/projects/tsukiai.png',
    repoUrl: 'https://github.com/EN-rain/TsukiAI-Desktop',
    techStack: ['.NET 8', 'WPF', 'C#', 'ASP.NET Core', 'Node.js', 'Discord', 'Chroma', 'VOICEVOX'],
    description:
      'A desktop voice companion that listens and responds out loud. It can remember useful context during a conversation, making interactions feel less repetitive. It can also join voice conversations through Discord.',
    detailedDescription: [
      'TsukiAI Voice Chat is a .NET 8 and WPF desktop voice assistant with a local HTTP API, multi-provider language-model support, semantic memory, and Discord voice integration through a Node.js bridge.',
      'Its voice pipeline follows speech-to-text, model inference, and text-to-speech. The application supports local and remote inference, configurable cloud providers, and an optional Chroma-backed semantic-memory service.',
      'The solution separates core services, the WPF runtime, automated tests, the Discord bridge, and helper scripts. Retry policies, circuit breakers, correlation IDs, and bounded queues improve resilience around outbound requests and memory write-back.',
    ],
    videoDuration: '01:56',
  },
  {
    id: 'auvrynt',
    title: 'Auvrynt',
    subtitle: 'WEB-TO-LOCAL MCP ARSENAL',
    date: 'July – Oct 2026',
    image: '/assets/projects/auvrynt.png',
    repoUrl: 'https://github.com/EN-rain/Auvrynt',
    techStack: ['TypeScript', 'React', 'Tailwind CSS', 'Electron', 'Node.js', 'Model Context Protocol (MCP)'],
    description:
      'A self-hosted MCP server that gives AI coding assistants secure, real-time access to your local machine. It creates a tunneled connection between AI clients and your local files, terminals, build tools, and project folders with no cloud upload.',
    detailedDescription: [
      'Auvrynt is a Model Context Protocol (MCP) server you run on your own machine. It creates a secure, tunneled connection between AI clients like ChatGPT or Claude and your local development environment — your actual files, terminals, build tools, and project folders.',
      'No cloud upload and no third-party storage: your code stays on your machine. Connect once, then ask your AI to open approved project folders, read, write, search, and edit real source files, and run shell commands, tests, builds, and package scripts.',
      'Designed to work across web, .NET, Godot, Blender, and Aseprite projects, with built-in capabilities to capture screenshots of running apps and use isolated Git worktrees for parallel coding sessions.',
    ],
    videoDuration: '01:28',
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
  className = '',
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('studentflow');
  const [isFolderOpen, setIsFolderOpen] = useState<boolean>(false);
  const [isFolderExpanded, setIsFolderExpanded] = useState<boolean>(false);
  const folderRef = useRef<HTMLDivElement | null>(null);
  const projectsTitleRef = useRef<HTMLHeadingElement | null>(null);

  const selectedProject = useMemo(() => {
    return PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  const effectiveAssembled = isAssembled;

  // Automatically slide the folder in after a delay when entering the Works view, and close when leaving
  useEffect(() => {
    if (effectiveAssembled) {
      const timer = window.setTimeout(() => {
        setIsFolderOpen(true);
      }, 750);
      return () => window.clearTimeout(timer);
    } else {
      setIsFolderOpen(false);
      setIsFolderExpanded(false);
    }
  }, [effectiveAssembled]);

  // Close the folder when clicking anywhere outside the folder or project rows
  useEffect(() => {
    if (!isFolderOpen) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (folderRef.current && folderRef.current.contains(target)) return;
      if (target instanceof Element && target.closest('[data-project-row="true"]')) return;

      setIsFolderOpen(false);
      setIsFolderExpanded(false);
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [isFolderOpen]);

  // Set initial off-screen position of the dossier folder and initial centered PROJECTS title
  useEffect(() => {
    if (folderRef.current) {
      gsap.set(folderRef.current, {
        xPercent: -50,
        x: '105vw',
        yPercent: 4,
        rotation: 2,
        scale: 1,
        opacity: 0,
        force3D: true,
      });
    }
    if (projectsTitleRef.current) {
      gsap.set(projectsTitleRef.current, {
        left: '50%',
        xPercent: -50,
        force3D: true,
      });
    }
  }, []);

  // Animate the PROJECTS title: left-aligned when folder is active, centered when folder is inactive
  useEffect(() => {
    const titleEl = projectsTitleRef.current;
    if (!titleEl) return;

    const shouldAlignLeft = isFolderOpen && effectiveAssembled;
    gsap.to(titleEl, {
      left: shouldAlignLeft ? '0%' : '50%',
      xPercent: shouldAlignLeft ? 0 : -50,
      duration: 0.54,
      ease: 'expo.out',
      force3D: true,
      overwrite: 'auto',
    });
  }, [isFolderOpen, effectiveAssembled]);

  // GSAP slide-in / center-expand / slide-out animation for the dossier folder
  useEffect(() => {
    const el = folderRef.current;
    if (!el) return;

    if (isFolderOpen && effectiveAssembled) {
      if (isFolderExpanded) {
        // Centered two-page spread view
        gsap.to(el, {
          xPercent: -50,
          x: '0vw',
          yPercent: 0,
          rotation: 0,
          scale: 1.02,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          force3D: true,
          overwrite: 'auto',
        });
      } else {
        // Angled position on the right side of the clipboard
        gsap.to(el, {
          xPercent: -50,
          x: '45vw',
          yPercent: 0,
          rotation: -5.5,
          scale: 1,
          opacity: 1,
          duration: 0.65,
          ease: 'expo.out',
          force3D: true,
          overwrite: 'auto',
        });
      }
    } else {
      gsap.to(el, {
        xPercent: -50,
        x: '105vw',
        yPercent: 4,
        rotation: 2,
        scale: 1,
        opacity: 0,
        duration: 0.44,
        ease: 'power3.in',
        force3D: true,
        overwrite: 'auto',
      });
    }
  }, [isFolderOpen, isFolderExpanded, effectiveAssembled]);

  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setIsFolderOpen(true);
  }, []);

  const handleCloseFolder = useCallback(() => {
    setIsFolderOpen(false);
    setIsFolderExpanded(false);
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsFolderExpanded((prev) => !prev);
  }, []);

  return (
    <div
      className={`clipboard-works ${effectiveAssembled ? 'is-assembled' : 'is-scattered'} ${className}`}
      data-settled={effectiveAssembled ? 'true' : 'false'}
      aria-label="Works case dossiers and project clipboard"
    >
      {/* Main Layout containing all visual assets */}
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
          <div className="clipboard-idle-float-1">
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
          <div className="clipboard-idle-float-2">
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
              {/* Top Space (above first ruled line at 25.76%): 'PROJECTS' title animates between center and left */}
              <div
                className="absolute"
                style={{
                  left: '10.5%',
                  right: '10.5%',
                  top: '13.5%',
                  height: '12.26%',
                }}
              >
                <h1
                  ref={projectsTitleRef}
                  className="absolute m-0 font-extrabold uppercase tracking-[0.22em] text-[#1a1109] select-none leading-none whitespace-nowrap will-change-transform"
                  style={{
                    bottom: '0.85cqh',
                    left: '50%',
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(22px, 5.2cqh, 44px)',
                    textShadow: '0 1px 1px rgba(26, 17, 9, 0.22)',
                  }}
                >
                  PROJECTS
                </h1>
              </div>

              {/* 6 Ruled Project Rows: Bottom-aligned (items-end) so text lands cleanly right above each ruled line */}
              {PROJECTS.map((project, idx) => {
                const isSelected = project.id === selectedProjectId;
                const rowCoords = [
                  { top: '25.76%', height: '7.97%' }, // Lands on Line 2 (33.73%)
                  { top: '33.73%', height: '7.98%' }, // Lands on Line 3 (41.71%)
                  { top: '41.71%', height: '8.13%' }, // Lands on Line 4 (49.84%)
                  { top: '49.84%', height: '8.05%' }, // Lands on Line 5 (57.89%)
                  { top: '57.89%', height: '8.06%' }, // Lands on Line 6 (65.95%)
                  { top: '65.95%', height: '8.13%' }, // Lands on Line 7 (74.08%)
                ][idx];

                return (
                  <button
                    key={project.id}
                    type="button"
                    data-project-row="true"
                    onClick={() => handleSelectProject(project.id)}
                    aria-label={`Select project ${project.title}`}
                    className="group absolute flex items-end justify-between bg-transparent border-0 p-0 m-0 cursor-pointer select-none transition-colors duration-150"
                    style={{
                      left: '10.5%',
                      right: '10.5%',
                      top: rowCoords.top,
                      height: rowCoords.height,
                      paddingBottom: '0.65cqh',
                    }}
                  >
                    {/* -title format landing directly above paper line with NO background */}
                    <span
                      className={`tracking-[0.04em] flex items-baseline gap-1.5 leading-none transition-colors duration-150 ${
                        isSelected
                          ? 'text-[#0a0603] font-bold'
                          : 'text-[#352519] hover:text-[#120c07]'
                      }`}
                      style={{
                        fontSize: 'clamp(12px, 2.75cqh, 23px)',
                        textDecorationLine: isSelected ? 'underline' : 'none',
                        textDecorationColor: 'rgba(26, 17, 9, 0.45)',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      <span className="opacity-90 select-none">–</span>
                      <span>{project.title}</span>
                    </span>

                    {/* Date format landing directly above paper line */}
                    <span
                      className={`tracking-[0.05em] uppercase select-none transition-colors duration-150 leading-none ${
                        isSelected
                          ? 'text-[#1c1209] font-semibold'
                          : 'text-[#503b29] group-hover:text-[#2d1f14]'
                      }`}
                      style={{
                        fontSize: 'clamp(10px, 2.1cqh, 17px)',
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
        {/* 5. Picture Frame + Top Note (Project Name Strip, 1st & 3rd img) */}
        {/* ============================================================== */}
        <div
          className="clipboard-layer clipboard-layer-photo-frame block"
          style={{
            zIndex: 6,
            filter: 'drop-shadow(1px 3px 2px #17171666)',
            pointerEvents: effectiveAssembled ? 'auto' : 'none',
          }}
        >
          {/* Top Torn Note Strip (image_aeac6358.png) displaying Selected Project Name */}
          <div
            className="clipboard-inscribed-content absolute select-none pointer-events-none"
            style={{
              left: '28%',
              top: '-30%',
              width: '96%',
              height: '33%',
              zIndex: 8,
              containerType: 'size',
              filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.42))',
            }}
          >
            <img
              src="/assets/aistudio/image_aeac6358.png"
              alt=""
              draggable={false}
              decoding="async"
              className="w-full h-full object-fill select-none pointer-events-none"
            />
            <div
              className="absolute inset-0 flex items-center justify-center px-[10%]"
              style={{
                transform: 'rotate(7.2deg)',
                fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
              }}
            >
              <span
                className="font-bold tracking-[0.08em] text-[#1a1109] truncate leading-none text-center"
                style={{
                  fontSize: 'clamp(11px, 26cqh, 22px)',
                  textShadow: '0 0.5px 0.5px rgba(26, 17, 9, 0.22)',
                }}
              >
                {selectedProject.title}
              </span>
            </div>
          </div>

          {/* Clickable Polaroid Photo Frame */}
          <a
            href={selectedProject.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`View ${selectedProject.title} repository`}
            className="block w-full h-full cursor-pointer"
          >
            <div
              className="absolute select-none pointer-events-none"
              style={{
                width: '117.8700%',
                height: '106.1674%',
                left: '-11.9134%',
                top: '-4.4053%',
              }}
            >
              {/* Inner project screenshot rotated (-6.93deg) to match exact polaroid cutout */}
              <div
                className="absolute overflow-hidden rounded-[2px]"
                style={{
                  left: '20.15%',
                  top: '13.91%',
                  width: '65.5%',
                  height: '75.5%',
                  transform: 'rotate(-6.93deg)',
                  transformOrigin: '50% 50%',
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
                className="relative w-full h-full block select-none pointer-events-none"
                style={{
                  zIndex: 2,
                }}
              />
            </div>
          </a>
        </div>

        {/* ============================================================== */}
        {/* 6. Small Note: Bigger 'TECH STACK' Text */}
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

            {/* Small Note Body: Tech Stack on Ruled Lines (Bigger Text) */}
            <div
              className="clipboard-inscribed-content absolute inset-0 select-none"
              style={{
                fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
                pointerEvents: effectiveAssembled ? 'auto' : 'none',
              }}
            >
              {/* Header: Centered 'TECH STACK' landing cleanly above Line 1 (23.34%) */}
              <div
                className="absolute flex items-end justify-center text-center bg-transparent p-0 m-0"
                style={{
                  left: '12%',
                  right: '10%',
                  top: '14.80%',
                  height: '8.54%',
                  paddingBottom: '0.45cqh',
                }}
              >
                <span
                  className="font-extrabold tracking-[0.15em] uppercase text-[#160e07] leading-none text-center"
                  style={{
                    fontSize: 'clamp(12px, 3.35cqh, 23px)',
                    textShadow: '0 0.5px 0.5px rgba(26, 17, 9, 0.28)',
                  }}
                >
                  TECH STACK
                </span>
              </div>

              {/* 8 Ruled Line Rows strictly bottom-aligned (items-end) to small-note.png rulings */}
              {[
                { top: '23.34%', height: '6.84%' }, // Lands on Line 2 (30.18%)
                { top: '30.18%', height: '6.56%' }, // Lands on Line 3 (36.74%)
                { top: '36.74%', height: '6.49%' }, // Lands on Line 4 (43.23%)
                { top: '43.23%', height: '6.56%' }, // Lands on Line 5 (49.79%)
                { top: '49.79%', height: '6.70%' }, // Lands on Line 6 (56.49%)
                { top: '56.49%', height: '6.77%' }, // Lands on Line 7 (63.26%)
                { top: '63.26%', height: '6.70%' }, // Lands on Line 8 (69.96%)
                { top: '69.96%', height: '6.49%' }, // Lands on Line 9 (76.45%)
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
                    className="absolute flex items-end gap-1.5 leading-none bg-transparent p-0 m-0"
                    style={{
                      left: '14%',
                      right: '10%',
                      top: row.top,
                      height: row.height,
                      paddingBottom: '0.38cqh',
                    }}
                  >
                    <span
                      className="text-[#593e25] font-bold select-none leading-none shrink-0"
                      style={{ fontSize: 'clamp(10px, 2.7cqh, 18px)' }}
                    >
                      •
                    </span>
                    <span
                      className="font-semibold tracking-[0.02em] text-[#1c1108] truncate leading-none"
                      style={{
                        fontSize: 'clamp(11px, 3.15cqh, 21px)',
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

        {/* ============================================================== */}
        {/* 8. Slide-In Dossier Folder (4th image positioned in 5th image red box, */}
        {/*    or centered when Expand is clicked to reveal the Right Page) */}
        {/* ============================================================== */}
        <div
          ref={folderRef}
          aria-hidden={!isFolderOpen}
          className="absolute select-none will-change-transform"
          style={{
            left: '50%',
            top: '2.5%',
            width: '88%',
            height: '96%',
            zIndex: 14,
            pointerEvents: isFolderOpen && effectiveAssembled ? 'auto' : 'none',
            filter: 'drop-shadow(-10px 14px 24px rgba(0, 0, 0, 0.62))',
            containerType: 'size',
          }}
        >
          {/* Open Manila Folder Texture (4th attached image) */}
          <img
            src="/assets/aistudio/image_ded2db51.png"
            alt="Project dossier folder"
            draggable={false}
            decoding="async"
            className="w-full h-full object-fill select-none pointer-events-none"
          />

          {/* ============================================================ */}
          {/* LEFT PAGE OF FOLDER: Centered Title + Big X, Video,          */}
          {/* Short Description, and Bottom-Center Expand Button           */}
          {/* ============================================================ */}
          <div
            className="absolute flex flex-col justify-between"
            style={{
              left: '6.2%',
              top: '11.5%',
              width: '39.5%',
              height: '80.5%',
              padding: '2.0cqh 2.2cqw',
              fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
              color: '#1e140b',
            }}
          >
            {/* Header: Centered Project Title + Big X Close Button */}
            <div className="relative flex flex-col items-center justify-center text-center border-b border-[#3b2a1a]/35 pb-[0.9cqh] px-6 shrink-0">
              <h2
                className="m-0 font-extrabold uppercase tracking-[0.1em] text-[#160e07] leading-tight text-center truncate max-w-full"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(14px, 3.2cqh, 27px)',
                }}
              >
                {selectedProject.title}
              </h2>
              <span
                className="uppercase tracking-[0.12em] text-[#5c432b] font-bold leading-tight text-center truncate max-w-full mt-[0.3cqh]"
                style={{ fontSize: 'clamp(7.5px, 1.35cqh, 11px)' }}
              >
                {selectedProject.subtitle}
              </span>

              {/* Big X Close Button (Hidden when folder is centered/expanded) */}
              {!isFolderExpanded && (
                <button
                  type="button"
                  onClick={handleCloseFolder}
                  aria-label="Close project folder"
                  title="Close"
                  className="absolute right-0 top-0 bg-transparent border-0 p-1 -mt-1 -mr-1 text-[#1e140b] hover:text-[#8b1a1a] font-extrabold leading-none cursor-pointer select-none transition-transform duration-150 hover:scale-110 active:scale-95"
                  style={{
                    fontSize: 'clamp(22px, 4.5cqh, 36px)',
                    fontFamily: "'Cinzel', 'Special Elite', serif",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Video (Placeholder Only) */}
            <div
              className="relative w-full rounded-[3px] overflow-hidden border-2 border-[#2d1f14]/55 bg-[#161310] shadow-[inset_0_2px_12px_rgba(0,0,0,0.75)] my-[1.4cqh] shrink-0"
              style={{ height: '42%' }}
            >
              <img
                src={selectedProject.image}
                alt=""
                draggable={false}
                className="w-full h-full object-cover opacity-35 select-none pointer-events-none"
                style={{ filter: 'sepia(0.45) contrast(1.1) grayscale(0.3)' }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/30 via-black/45 to-black/70 p-3 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#e8cf92]/80 bg-[#1a120b]/80 flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.6)] mb-1.5">
                  <span
                    className="text-[#e8cf92] ml-0.5 select-none"
                    style={{ fontSize: 'clamp(13px, 2.5cqh, 20px)' }}
                  >
                    ▶
                  </span>
                </div>
                <span
                  className="uppercase tracking-[0.2em] text-[#e8cf92] font-bold"
                  style={{ fontSize: 'clamp(8.5px, 1.7cqh, 13.5px)' }}
                >
                  VIDEO PREVIEW PLACEHOLDER
                </span>
                <span
                  className="uppercase tracking-[0.14em] text-[#cbb682]/80 mt-0.5"
                  style={{ fontSize: 'clamp(7.5px, 1.35cqh, 11px)' }}
                >
                  00:00 / {selectedProject.videoDuration}
                </span>
              </div>
            </div>

            {/* Description Section + Center-Bottom Expand Button */}
            <div className="flex-1 flex flex-col justify-between min-h-0 pt-[0.3cqh]">
              <div className="overflow-y-auto pr-1">
                <div className="flex items-center gap-2 mb-[0.8cqh]">
                  <span
                    className="font-extrabold uppercase tracking-[0.18em] text-[#1a1109]"
                    style={{ fontSize: 'clamp(9.5px, 1.95cqh, 15.5px)' }}
                  >
                    DESCRIPTION
                  </span>
                  <span className="flex-1 h-[1px] bg-[#3b2a1a]/35" />
                </div>

                <p
                  className="m-0 text-[#23170d] leading-[1.52] tracking-[0.02em] font-medium"
                  style={{ fontSize: 'clamp(9.5px, 2.05cqh, 16px)' }}
                >
                  {selectedProject.description}
                </p>
              </div>

              {/* Center-Bottom See More / See Less Button */}
              <div className="pt-[1cqh] border-t border-[#3b2a1a]/30 flex items-center justify-center shrink-0">
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  aria-expanded={isFolderExpanded}
                  className="bg-transparent border-0 py-0.5 px-3 cursor-pointer select-none uppercase tracking-[0.18em] font-extrabold text-[#6e1717] hover:text-[#9e2222] transition-transform duration-150 hover:scale-105 active:scale-95"
                  style={{
                    fontSize: 'clamp(10px, 2.0cqh, 16px)',
                    textDecorationLine: 'underline',
                    textDecorationColor: 'rgba(110, 23, 23, 0.55)',
                    textUnderlineOffset: '3px',
                  }}
                >
                  {isFolderExpanded ? '← See Less' : 'See More →'}
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT PAGE OF FOLDER: Detailed Description from Portfolio-rain */}
          {/* Visible when the folder is centered via Expand               */}
          {/* ============================================================ */}
          <div
            aria-hidden={!isFolderExpanded}
            className={`absolute flex flex-col justify-between ${
              isFolderExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              left: '52.5%',
              top: '11.5%',
              width: '40.5%',
              height: '80.5%',
              padding: '2.0cqh 2.2cqw',
              fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
              color: '#1e140b',
            }}
          >
            {/* Right Page Header + Big X Close Button */}
            <div className="flex items-start justify-between border-b border-[#3b2a1a]/35 pb-[0.9cqh] shrink-0">
              <div className="flex flex-col pr-2">
                <h3
                  className="m-0 font-extrabold uppercase tracking-[0.14em] text-[#160e07] leading-tight"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(12px, 2.6cqh, 22px)',
                  }}
                >
                  PROJECT OVERVIEW
                </h3>
                <span
                  className="uppercase tracking-[0.14em] text-[#5c432b] font-bold leading-tight mt-[0.3cqh]"
                  style={{ fontSize: 'clamp(7.5px, 1.35cqh, 11px)' }}
                >
                  {selectedProject.date}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseFolder}
                aria-label="Close project folder"
                title="Close"
                className="bg-transparent border-0 p-1 -mt-1 -mr-1 text-[#1e140b] hover:text-[#8b1a1a] font-extrabold leading-none cursor-pointer select-none transition-transform duration-150 hover:scale-110 active:scale-95 shrink-0"
                style={{
                  fontSize: 'clamp(22px, 4.5cqh, 36px)',
                  fontFamily: "'Cinzel', 'Special Elite', serif",
                }}
              >
                ✕
              </button>
            </div>

            {/* Detailed Paragraphs from Portfolio-rain */}
            <div className="flex-1 overflow-y-auto pr-1.5 my-[1.4cqh] space-y-[1.5cqh]">
              {selectedProject.detailedDescription.map((paragraph, index) => (
                <p
                  key={index}
                  className="m-0 text-[#23170d] leading-[1.58] tracking-[0.02em] font-medium"
                  style={{ fontSize: 'clamp(9.5px, 2.0cqh, 15.5px)' }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Right Page Footer: Repository Link */}
            <div className="pt-[1cqh] border-t border-[#3b2a1a]/30 flex items-center justify-between shrink-0">
              <span
                className="uppercase tracking-[0.14em] text-[#5c432b] font-bold"
                style={{ fontSize: 'clamp(8px, 1.45cqh, 11.5px)' }}
              >
                {selectedProject.title}
              </span>
              <a
                href={selectedProject.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase tracking-[0.14em] font-extrabold text-[#6e1717] hover:text-[#9e2222]"
                style={{
                  fontSize: 'clamp(9px, 1.7cqh, 13.5px)',
                  textDecorationLine: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                View Repository ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FantasyClipboardWorks;
