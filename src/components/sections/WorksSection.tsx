import { useRef, useState, useEffect, useMemo, useCallback, memo, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, stagger, remove } from 'animejs';
import {
  Blocks,
  Database,
  Server,
  Workflow,
  AudioLines,
  Bot,
  Brain,
  Gamepad2,
  MessageSquareMore,
  Mic,
  Puzzle,
  Github,
  ExternalLink,
  Award,
  ArrowUpRight,
  Sparkles,
  Layers,
  Compass,
} from 'lucide-react';
import { useMobileReveal } from '../../hooks/useMobileReveal';
import { experience, projects } from '../../data/works';
import { WorksTimelineWebGL } from './WorksTimelineWebGL';
import architectureFlowchart from '../../assets/images/architecture-flowchart.png';
import multiplayerFlowchart from '../../assets/images/multiplayer-flowchart.png';
import awardImg from '../../assets/images/award.png';
import projectLogoPlaceholder from '../../assets/images/icon.jpg';

const PROJECT_ABOUT: Record<string, { description: string; keyFeatures: string[] }> = {
  '01': {
    description:
      'CHEMQuest is a chemistry learning adventure that turns core lessons into hands-on play. Instead of relying only on reading and memorization, players explore important chemistry topics through puzzles, action-based challenges, and interactive activities designed to make difficult ideas easier to grasp.\n\nBuilt for students studying introductory chemistry, the game focuses on essential lessons such as matter, measurements, stoichiometry, atoms, and gases. Each topic is taught through a different style of play, giving players a more active way to practice concepts, solve problems, and build confidence as they progress.\n\nDesigned for offline use on Android, CHEMQuest makes learning accessible anywhere without needing an internet connection. It is made for students who want a more engaging way to review chemistry, strengthen understanding, and turn study time into something more interactive and enjoyable.',
    keyFeatures: [
      'Learn core introductory chemistry through interactive gameplay',
      'Explore lessons on matter, measurements, stoichiometry, atoms, and gases',
      'Solve puzzles and complete action-based challenges tied to chemistry concepts',
      'Practice problem-solving in a more engaging format than traditional study methods',
      'Play fully offline on Android with no internet required',
      'Built as a supplementary learning tool for STEM students',
    ],
  },
  '03': {
    description:
      'TsukiAI is a real-time voice companion for Windows that lets you talk naturally and get spoken responses back with low friction. It listens, understands, replies, and speaks through a full live voice pipeline built for continuous conversation rather than one-off prompts.\n\nRun it locally on your desktop, connect it to different AI providers, and choose between local or cloud speech services depending on how you want it to behave. It is built to stay responsive during live use, keep track of conversation flow, remember useful past context, and recover cleanly when a provider fails.\n\nTsukiAI also works beyond the desktop. With its Discord voice bridge, it can join voice channels, listen for spoken turns, process them through the same conversation pipeline, and speak back into the channel. That makes it useful both as a personal desktop companion and as a voice runtime for shared online spaces.\n\nA built-in local API opens the system up for integrations, testing, and external tooling. Speech recognition, text processing, voice generation, health checks, and memory features can all be accessed as services, making TsukiAI more than just a standalone app.',
    keyFeatures: [
      'Real-time voice conversation with a full speech-to-text, AI response, and text-to-speech pipeline',
      'Support for both local and cloud speech processing',
      'Multi-provider AI routing with failover across several model services',
      'Lightweight semantic memory for recalling relevant past context',
      'Local and remote voice synthesis options',
      'Conversation history, latency tracking, and live pipeline controls',
      'Built-in local API for integrations and external tools',
      'Discord voice bridge for channel-based spoken interaction',
    ],
  },
  '04': {
    description:
      'Enter a fast-paced co-op action RPG where every run is shaped by your class, your build, and your team.\n\nChoose from distinct class paths, unlock specialized roles, and shape your own fighting style through a wide mix of active skills, passives, and progression choices. Build for raw damage, frontline defense, battlefield control, support, or hybrid play, then adapt your setup as the run grows harder.\n\nFight through escalating rounds of enemies that become more dangerous, more capable, and more demanding as the battle goes on. Success is not just about surviving longer, but learning how to combine your strengths with the rest of the party. Team composition, timing, and coordination matter.\n\nAt the center of the challenge is a boss encounter built around adaptation and counterplay. The boss is designed to respond to player patterns, punish predictable behavior, and force the team to change tactics on the fly. Winning means reading the fight, adjusting your approach, and working together under pressure.\n\nProgression carries beyond a single match. Your class growth, build development, and overall advancement are saved through the cloud, giving you room to experiment, refine strategies, and return stronger for the next run.\n\nPlay solo or squad up with others, form a party, chat during the run, and coordinate through voice communication as you push deeper into increasingly intense encounters.',
    keyFeatures: [
      'Build your character through class progression, subclass paths, and flexible skill choices',
      'Create custom playstyles across damage, tank, support, control, and hybrid roles',
      'Battle through rounds that grow tougher, smarter, and more punishing over time',
      'Face a major boss encounter that adapts to player behavior and demands teamwork',
      'Play cooperatively in shared sessions with party-based strategy and coordination',
      'Use text chat and voice communication to react in real time',
      'Keep your progress through cloud saving and ongoing character growth',
    ],
  },
  '05': {
    description:
      'Type Duel is a competitive 2D pixel typing duel built with Godot and a Node.js backend. Players register or log in, enter matchmaking or custom rooms, choose a character loadout, then fight through round-based typing battles where speed, accuracy, mana, active skills, and passive effects decide the winner.\n\nThe MVP includes a full lobby and match loop: character selection, skill selection, typing phases, combat resolution, HP sync, rematches, match history, leaderboards, friends, chat, online presence, profile updates, and feedback submission.\n\nThe backend uses REST routes for account, lobby, room, social, chat, and game flows, while real-time match state is synchronized through Socket.IO and WebSocket events. Persistent data such as users, leaderboard records, chat messages, friends, and match history is stored in SQLite.',
    keyFeatures: [
      'Real-time multiplayer typing duels with matchmaking and custom rooms',
      'Round loop with skill selection, typing, combat resolution, HP, mana, win streaks, and rematches',
      'Three playable characters: Riven, Liora, and Zephon',
      'Active skills and passive disruption effects that alter typing and combat flow',
      'Account registration, login, profile updates, profile pictures, friends, chat, and leaderboards',
      'REST API for lobby/account/social flows with Socket.IO and WebSocket match sync',
      'SQLite persistence for users, leaderboard records, chat, friends, and match history',
    ],
  },
  '06': {
    description:
      'CSCprep is a Civil Service Exam reviewer web app built to help users practice for the Philippine Civil Service Examination through interactive, exam-style sessions. Instead of studying from static reviewers only, users can answer randomized exams, subject-focused tests, and fixed CSC 11-based exams directly in the browser.\n\nThe app covers major exam areas including Verbal Reasoning, Numerical Reasoning, Analytical Ability, Filipino, and General Information. Questions are loaded from local JSON question banks, with support for image-based items, shuffled choices, hints, explanations, and answer review after submission.\n\nCSCprep is designed for focused self-review. It tracks answered questions, saves exam attempts, supports timed practice, warns users about skipped items, and lets users review correct and wrong answers after each session. Progress and in-progress exams are saved locally, so users can continue without losing their work.',
    keyFeatures: [
      'Practice Civil Service Exam questions across five major subjects',
      'Take random mixed exams, subject-specific exams, or fixed CSC 11-based exams',
      'Use optional timed mode with a customizable timer',
      'Answer image-based questions with enlarged image preview support',
      'Get hints while answering and explanations during review',
      'Review results with score, pass/fail status, correct answers, wrong answers, and skipped items',
      'Save exam history and view previous attempts with subject-level performance',
      'Track question usage to reduce repeated questions across exams',
      'Save in-progress exams locally in the browser',
      'Report problematic questions, with local fallback and optional shared report syncing',
      'Switch between light and dark themes',
      'Built as a practical reviewer tool for Civil Service Exam preparation',
    ],
  },
  '02': {
    description:
      "StudentFlow is a comprehensive student and classroom management platform designed to streamline daily academic workflows for teachers and administrators while providing an accessible mobile experience for students. Built with a robust Laravel 11 backend and a native Java Android client, the system simplifies school administration, grading, attendance tracking, and communication.\n\nThe web dashboard allows administrators to oversee teacher accounts, audit system activity logs, and configure settings, while teachers can manage classes, record grades across weighted categories, and publish announcements with automated email notifications. For students, the platform offers a dedicated portal supporting social login (Google and GitHub) and interactive exam taking, both on the web and through the mobile app.\n\nDesigned with mobility and reliability in mind, StudentFlow's Android application is built using native Java, Retrofit, and Material Design components, enabling teachers and students to view profiles, track attendance, submit assignments, and review reports on the go.",
    keyFeatures: [
      'Manage classes, teacher/student records, and course enrollments from a responsive web dashboard',
      'Support for distinct roles (Admin, Teacher, Student) with secure, token-based Sanctum authentication',
      'Mark and track attendance status (Present, Absent, Late, Excused) with calculated attendance percentages',
      'Configure custom grade categories with automatic final grade calculations and ranking',
      'Create quizzes and exams with secure per-student magic links and automated score sync to the gradebook',
      'Access student profiles, announcements, assignments, and grades via the native Android mobile app',
      'Generate and export academic reports (attendance, failing grades, missing assignments) in PDF, CSV, and Web formats',
    ],
  },
  '07': {
    description:
      "PocketTrade is a comprehensive mobile and web-based marketplace platform designed to streamline peer-to-peer used phone trading for buyers and sellers while providing an administrative moderation system. Built with a robust NestJS backend, a React admin web app, and a Flutter mobile client, the system simplifies listing creation, real-time messaging, and platform administration.\n\nThe web dashboard allows administrators to manage listings, suspend user accounts, review community reports, and view search analytics, while users can publish pre-owned devices, upload photos, and update listing statuses. For buyers, the platform offers an intuitive search interface with custom filters, listing favoriting, and direct negotiation with sellers.\n\nDesigned with mobility and real-time connectivity in mind, PocketTrade's mobile application is built using Flutter, GoRouter, Riverpod, and Socket.IO, enabling users to browse listings, receive instant push notifications via Firebase Cloud Messaging, manage conversations, and report or block users on the go.",
    keyFeatures: [
      'Publish and search pre-owned phone listings with details on brand, condition, storage, price, and location',
      'Log in securely with a one-time password (OTP) sent directly to your email',
      'Upload multiple high-quality photos of your device during the listing process',
      'Negotiate and chat in real time with buyers or sellers directly inside the app',
      'Manage active listings, suspend accounts, and review reported content from the admin web dashboard',
      'Track marketplace metrics, user activity, and popular device searches with analytics charts',
      'Favorite listings to save them for later and receive updates when a listing is sold',
      'Report or block suspicious users and listings to maintain a safe trading community',
      'Receive instant push notifications for new incoming chat messages and account updates',
    ],
  },
  '08': {
    description:
      'Cache Me Outside is a newspaper-style digital archive that revisits selected internet moments from 2020 through a structured month-and-day timeline.\n\nThe project uses an editorial workspace to prepare, review, and preview entries before they become part of the public collection.\n\nIt is designed as a curated time capsule rather than an open feed, giving each entry a consistent editorial layout and a clear place in the year.',
    keyFeatures: [
      'Browse selected 2020 internet moments by month and day',
      'Prepare and review archive entries before publishing',
      'Preview entries in their final newspaper-style presentation',
      'Keep drafts and published archive pieces organized separately',
      'Explore a focused collection rather than an endless live feed',
    ],
  },
};

const highlightIcons = {
  React: Blocks,
  'Node.js': Server,
  'Express.js': Server,
  Supabase: Database,
  PostgreSQL: Database,
  n8n: Workflow,
  TypeScript: Blocks,
  'Tailwind CSS': Blocks,
} as const;

const stackIcons = {
  WPF: Puzzle,
  'C#': Bot,
  'Node.js': Server,
  Python: Workflow,
  Discord: MessageSquareMore,
  Audio: AudioLines,
  VAD: Mic,
  Godot: Gamepad2,
  'Godot 4.6': Gamepad2,
  GDScript: Puzzle,
  Mobile: Gamepad2,
  Android: Gamepad2,
  JSON: Puzzle,
  Memory: Brain,
  AI: Bot,
  Context: Brain,
  Express: Server,
  SQLite: Database,
  'Socket.IO': MessageSquareMore,
  WebSockets: Server,
  Lenis: Workflow,
  'React 19': Blocks,
  React: Blocks,
  Vite: Blocks,
  'Vercel API': Server,
  'Local Storage': Database,
  'Laravel 11': Server,
  'Laravel 12': Server,
  'PHP 8.2+': Server,
  'PHP 8.2': Server,
  'Android (Java)': Gamepad2,
  'SQLite / MySQL': Database,
  'Bootstrap 5': Blocks,
  'REST API (JSON)': Workflow,
  'NestJS (Node.js)': Server,
  NestJS: Server,
  'Flutter (Dart)': Gamepad2,
  Flutter: Gamepad2,
  'React 19 (Tailwind CSS)': Blocks,
  'PostgreSQL / Prisma': Database,
  PostgreSQL: Database,
  'Socket.IO / REST API': Workflow,
} as const;

// Featured projects shown as dedicated horizontal timeline stations
const FEATURED_PROJECT_IDS = ['01', '03', '04', '08'];

export const WorksSection = memo(() => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressReadoutRef = useRef<HTMLSpanElement>(null);

  const [activeStation, setActiveStation] = useState(0);
  const [isProjectsNavigating, setIsProjectsNavigating] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [tsukiShowFlowchart, setTsukiShowFlowchart] = useState(false);
  const [oozeborneShowFlowchart, setOozeborneShowFlowchart] = useState(false);
  const [chemQuestShowImage, setChemQuestShowImage] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const experienceRef = useMobileReveal<HTMLDivElement>();
  const projectsRef = useMobileReveal<HTMLDivElement>();

  const featuredProjects = useMemo(
    () =>
      FEATURED_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).filter(
        (p): p is NonNullable<typeof p> => Boolean(p)
      ),
    []
  );

  const archivePreviewProjects = useMemo(
    () => projects.filter((p) => !FEATURED_PROJECT_IDS.includes(p.id)),
    []
  );

  const timelineStations = useMemo(
    () => [
      { index: 0, code: '00', label: 'EXPERIENCE', year: experience[0]?.year ?? '2025-2026' },
      ...featuredProjects.map((proj, idx) => ({
        index: idx + 1,
        code: `0${idx + 1}`,
        label: proj.title.toUpperCase(),
        year: proj.year,
      })),
      {
        index: featuredProjects.length + 1,
        code: `0${featuredProjects.length + 1}`,
        label: 'ARCHIVE',
        year: `${projects.length} WORKS`,
      },
    ],
    [featuredProjects]
  );


  // Listen to horizontal timeline progress from section2.ts and drive progress bar + active station detection
  useEffect(() => {
    const totalSegments = Math.max(1, timelineStations.length - 1);
    let lastStationIdx = 0;

    const handleTimelineScroll = (e: Event) => {
      const detail = (e as CustomEvent<{ progress: number; velocity: number }>).detail;
      if (!detail) return;
      const p = Math.max(0, Math.min(1, detail.progress));

      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${p})`;
      }
      if (progressReadoutRef.current) {
        progressReadoutRef.current.textContent = `${Math.round(p * 100)
          .toString()
          .padStart(2, '0')}%`;
      }

      const nextStation = Math.min(
        timelineStations.length - 1,
        Math.round(p * totalSegments)
      );
      if (nextStation !== lastStationIdx) {
        lastStationIdx = nextStation;
        setActiveStation(nextStation);
      }
    };

    window.addEventListener('works-timeline-scroll', handleTimelineScroll);
    return () => window.removeEventListener('works-timeline-scroll', handleTimelineScroll);
  }, [timelineStations.length]);

  // Trigger Anime.js choreography whenever a timeline station becomes active
  useEffect(() => {
    const stationEl = stationRefs.current[activeStation];
    if (!stationEl) return;

    const rings = stationEl.querySelectorAll('.anime-node-ring');
    const staggerItems = stationEl.querySelectorAll('.anime-stagger-item');
    const techPills = stationEl.querySelectorAll('.anime-tech-pill');
    const railLine = stationEl.querySelectorAll('.anime-rail-pulse');

    remove([rings, staggerItems, techPills, railLine]);

    if (rings.length > 0) {
      animate(rings, {
        scale: [0.55, 1.18, 1],
        opacity: [0.2, 1, 0.85],
        rotate: ['0deg', '180deg'],
        duration: 950,
        delay: stagger(90),
        ease: 'outElastic(1, .65)',
      });
    }

    if (railLine.length > 0) {
      animate(railLine, {
        opacity: [0.3, 1],
        duration: 800,
        ease: 'inOutSine',
      });
    }

    if (staggerItems.length > 0) {
      animate(staggerItems, {
        translateY: [18, 0],
        opacity: [0.25, 1],
        duration: 620,
        delay: stagger(55),
        ease: 'outExpo',
      });
    }

    if (techPills.length > 0) {
      animate(techPills, {
        scale: [0.84, 1],
        opacity: [0.2, 1],
        duration: 480,
        delay: stagger(35, { start: 140 }),
        ease: 'outBack',
      });
    }
  }, [activeStation]);

  const handleCardHoverEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rings = card.closest('.timeline-station')?.querySelectorAll('.anime-node-ring');
    const badge = card.querySelector('.anime-card-badge');

    if (rings && rings.length > 0) {
      remove(rings);
      animate(rings, {
        scale: 1.25,
        rotate: '+=90deg',
        duration: 500,
        ease: 'outBack',
      });
    }
    if (badge) {
      remove(badge);
      animate(badge, {
        translateX: [0, 4],
        duration: 320,
        ease: 'outQuad',
      });
    }
  }, []);

  const handleCardHoverLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rings = card.closest('.timeline-station')?.querySelectorAll('.anime-node-ring');
    const badge = card.querySelector('.anime-card-badge');

    if (rings && rings.length > 0) {
      remove(rings);
      animate(rings, {
        scale: 1,
        duration: 420,
        ease: 'outExpo',
      });
    }
    if (badge) {
      remove(badge);
      animate(badge, {
        translateX: 0,
        duration: 320,
        ease: 'outQuad',
      });
    }
  }, []);

  // Jump smoothly to any timeline station when clicked on the bottom HUD scrubber
  const scrollToTimelineStation = useCallback(
    (stationIndex: number) => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        const el = stationRefs.current[stationIndex];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      const vh = window.innerHeight;
      const enterEnd = 4 * vh;
      const scrollStart = enterEnd + 0.1 * vh; // 4.1 * vh
      const leaveStart = 5 * vh; // 5.0 * vh
      const totalSegments = Math.max(1, timelineStations.length - 1);
      const targetProgress = stationIndex / totalSegments;
      const targetScroll = scrollStart + targetProgress * (leaveStart - scrollStart);

      window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: targetScroll }));
    },
    [timelineStations.length]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (oozeborneShowFlowchart) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 5));
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [oozeborneShowFlowchart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const navigateFromWorks = (path: string) => {
    if (isProjectsNavigating) return;

    setIsProjectsNavigating(true);
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('portfolio-navigate', { detail: { path, projectTransition: true } })
      );
    }, 260);
  };

  // Lock body scroll and pause Lenis when a project is expanded
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.dispatchEvent(new Event('lenis-stop'));
      setTsukiShowFlowchart(false);
      setOozeborneShowFlowchart(false);
      setChemQuestShowImage(false);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('lenis-start'));
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('lenis-start'));
    };
  }, [selectedId]);

  return (
    <section
      id="works"
      className="stack-section mask-shaped-section works-combined-section"
      style={{ '--mask-color': '#6c2bd9' } as CSSProperties}
    >
      <div className="clip-gap-outer parallax-content h-full w-full">
        <div className="clip-gap-inner absolute inset-0 bg-[#050508] overflow-hidden">
          {/* Velocity-reactive WebGL Energy Wave & Particle Field Backdrop */}
          <WorksTimelineWebGL />

          <div
            ref={scrollContainerRef}
            className={`works-scroll-container relative z-10 h-full w-full overflow-y-auto md:overflow-hidden locked-content bg-transparent flex flex-col ${
              isProjectsNavigating ? 'works-projects-leaving' : ''
            }`}
          >
            {/* Unified Horizontal Timeline Track */}
            <div
              ref={trackRef}
              className="works-horizontal-track relative flex flex-col md:flex-row md:items-center md:h-full md:w-max will-change-transform"
            >
              {/* Continuous Desktop Horizontal SVG & Laser Timeline Rail */}
              <div
                aria-hidden="true"
                className="pointer-events-none hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0"
              >
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#7c3aed]/40 to-transparent" />
                <svg
                  className="w-full h-12 -mt-6 overflow-visible opacity-55"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="0"
                    y1="24"
                    x2="100%"
                    y2="24"
                    stroke="rgba(167, 139, 250, 0.28)"
                    strokeWidth="1"
                    strokeDasharray="6 10"
                  />
                </svg>
              </div>

              {/* ──────────────────────────────────────────────────────────
                  STATION 00: WORK EXPERIENCE ANCHOR (Progress = 0)
                  Preserves exact stationary viewport coordinates for EN docking
                 ────────────────────────────────────────────────────────── */}
              <div
                ref={(el) => {
                  stationRefs.current[0] = el;
                  (experienceRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }}
                className="timeline-station experience-part relative min-h-screen md:h-full w-full md:w-screen flex-shrink-0 flex flex-col justify-center px-5 md:px-14 lg:px-20 py-14 md:py-0"
              >
                <div className="relative z-10 w-full max-w-6xl mx-auto">
                  {/* Top Timeline Coordinate Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3 md:mb-5">
                    <div className="inline-flex items-center gap-2.5">
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        <span className="anime-node-ring absolute inset-0 rounded-full border border-[#7c3aed]/70" />
                        <span className="anime-node-ring absolute inset-1 rounded-full border border-[#a78bfa]/50" />
                        <span className="h-2 w-2 rounded-full bg-[#a78bfa] shadow-[0_0_12px_#7c3aed]" />
                      </span>
                      <span className="tech-font text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[#a78bfa]">
                        STATION 00 // CAREER MILESTONE
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 tech-font text-[10px] uppercase tracking-[0.2em] text-white/45">
                      <span>SCROLL TO TRAVERSE TIMELINE</span>
                      <span className="text-[#a78bfa] animate-pulse">→</span>
                    </div>
                  </div>

                  {/* WORK EXPERIENCE Heading */}
                  <div className="experience-header mb-5 md:mb-7">
                    <h2 className="heading-font text-[24px] font-bold leading-[1.08] tracking-tight text-white md:text-4xl lg:text-5xl">
                      WORK{' '}
                      <span className="text-[#7c3aed] whitespace-nowrap">
                        EXPERIENCE
                      </span>
                    </h2>
                  </div>

                  {/* Experience Timeline Card */}
                  <div className="space-y-6">
                    {experience.map((item) => (
                      <div
                        key={item.role}
                        onMouseEnter={handleCardHoverEnter}
                        onMouseLeave={handleCardHoverLeave}
                        className="group relative rounded-[22px] border border-white/12 bg-[#0b0b12]/80 backdrop-blur-xl p-6 md:p-8 lg:p-9 transition-all duration-500 hover:border-[#7c3aed]/55 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
                      >
                        {/* Subtle top violet light bar */}
                        <div className="pointer-events-none absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#7c3aed]/70 to-transparent" />

                        <div className="flex flex-col gap-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2.5">
                              <span className="tech-font px-3 py-1 rounded-md bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-xs font-bold text-[#a78bfa]">
                                {item.year}
                              </span>
                              <span className="tech-font text-[10px] uppercase tracking-[0.18em] text-white/40">
                                VERIFIED ROLE
                              </span>
                            </div>
                            <span className="anime-card-badge tech-font text-[10px] uppercase tracking-[0.16em] text-[#a78bfa]/80">
                              NODE // 00
                            </span>
                          </div>

                          <div className="anime-stagger-item">
                            <h3 className="heading-font text-2xl font-bold text-white md:text-3xl lg:text-[32px] leading-tight">
                              {item.role}
                            </h3>
                            <div className="tech-font mt-1.5 text-[11px] uppercase tracking-[0.16em] text-white/55">
                              {item.place}
                            </div>
                          </div>

                          <p className="anime-stagger-item max-w-4xl text-[13px] md:text-[14px] leading-relaxed text-white/75 whitespace-pre-line">
                            {item.summary}
                          </p>

                          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3 md:gap-4">
                            {item.highlights.map((tag) => {
                              const Icon =
                                highlightIcons[tag as keyof typeof highlightIcons] ?? Blocks;
                              return (
                                <span
                                  key={tag}
                                  className="anime-tech-pill tech-font inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/75 group-hover:border-[#7c3aed]/35 transition-colors"
                                >
                                  <Icon size={13} className="text-[#a78bfa]" /> {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────
                  STATIONS 01 – 04: FEATURED PERSONAL PROJECTS ON TIMELINE
                 ────────────────────────────────────────────────────────── */}
              <div
                ref={projectsRef}
                data-works-projects-start
                className="projects-wrapper contents"
              >
                {featuredProjects.map((project, index) => {
                  const stationNumber = index + 1;
                  const stationCode = `0${stationNumber}`;
                  const isActive = activeStation === stationNumber;

                  return (
                    <div
                      key={project.id}
                      ref={(el) => {
                        stationRefs.current[stationNumber] = el;
                      }}
                      className="timeline-station relative min-h-screen md:h-full w-full md:w-[88vw] lg:w-[78vw] xl:w-[72vw] flex-shrink-0 flex flex-col justify-center px-5 md:px-10 lg:px-14 py-12 md:py-0"
                    >
                      <div className="relative z-10 w-full max-w-5xl mx-auto">
                        {/* Station Header & Animated Timeline Node */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 md:mb-6">
                          <div className="flex items-center gap-3.5">
                            <div className="relative flex h-9 w-9 items-center justify-center">
                              <svg
                                className="anime-node-ring absolute inset-0 h-full w-full text-[#7c3aed]"
                                viewBox="0 0 36 36"
                              >
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeDasharray="14 6"
                                />
                              </svg>
                              <span
                                className={`anime-node-ring absolute inset-1.5 rounded-full border transition-colors duration-300 ${
                                  isActive
                                    ? 'border-[#a78bfa] bg-[#7c3aed]/25'
                                    : 'border-white/20 bg-white/5'
                                }`}
                              />
                              <span className="tech-font text-[10px] font-bold text-white">
                                {stationCode}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="tech-font text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                                  {project.year}
                                </span>
                                <span className="text-white/25">•</span>
                                <span className="tech-font text-[10px] uppercase tracking-[0.16em] text-white/55">
                                  {project.category}
                                </span>
                              </div>
                              {index === 0 && (
                                <div className="tech-font text-[10px] uppercase tracking-[0.22em] text-white/40 mt-0.5">
                                  PERSONAL{' '}
                                  <span className="text-[#7c3aed]">
                                    PROJECTS
                                  </span>{' '}
                                  // SELECTED TIMELINE
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {project.id === '01' && (
                              <span className="tech-font inline-flex items-center gap-1.5 rounded-md border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-amber-200">
                                <Award size={12} /> Best Capstone Award
                              </span>
                            )}
                            {project.status && (
                              <span className="tech-font inline-flex items-center gap-1.5 rounded-md border border-[#7c3aed]/40 bg-[#7c3aed]/15 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#c4b5fd]">
                                <Sparkles size={11} /> {project.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Horizontal Timeline Project Showcase Card */}
                        <div
                          role="link"
                          tabIndex={0}
                          aria-label={`Open ${project.title} project`}
                          onClick={() => navigateFromWorks(`/projects/${project.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              navigateFromWorks(`/projects/${project.id}`);
                            }
                          }}
                          onMouseEnter={handleCardHoverEnter}
                          onMouseLeave={handleCardHoverLeave}
                          className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-white/12 bg-[#0a0a12]/85 backdrop-blur-xl transition-all duration-500 hover:border-[#7c3aed]/65 shadow-[0_28px_90px_rgba(0,0,0,0.75)]"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* Left / Top Media Column */}
                            <div className="relative lg:col-span-6 aspect-[16/10] lg:aspect-auto lg:min-h-[340px] overflow-hidden bg-[#0f0f1a]">
                              {project.img ? (
                                <img
                                  src={project.img}
                                  alt={project.title}
                                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#09090f]">
                                  <span className="heading-font text-lg uppercase tracking-[0.2em] text-white/20">
                                    {project.title}
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0a0a12]/20 lg:to-[#0a0a12]" />

                              {/* Floating Project Emblem */}
                              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
                                <img
                                  src={project.icon ?? projectLogoPlaceholder}
                                  alt=""
                                  aria-hidden="true"
                                  className="h-12 w-12 rounded-xl border border-white/15 bg-black/70 object-cover p-0.5 shadow-lg"
                                />
                                <div className="rounded-lg bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1">
                                  <span className="tech-font text-[10px] font-bold uppercase tracking-[0.18em] text-[#a78bfa]">
                                    PROJECT #{project.id}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right / Bottom Details Column */}
                            <div className="lg:col-span-6 flex flex-col justify-between p-6 md:p-8">
                              <div>
                                <div className="anime-stagger-item flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="heading-font text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-[#c4b5fd] transition-colors">
                                      {project.title}
                                    </h3>
                                    <p className="tech-font mt-1 text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-[#a78bfa]/80">
                                      {project.line2}
                                    </p>
                                  </div>
                                  <span className="anime-card-badge flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 group-hover:border-[#7c3aed] group-hover:bg-[#7c3aed]/20 group-hover:text-white transition-all">
                                    <ArrowUpRight size={17} />
                                  </span>
                                </div>

                                <p className="anime-stagger-item mt-4 text-[13px] md:text-[14px] leading-relaxed text-white/70 line-clamp-4">
                                  {project.des}
                                </p>

                                {/* Staggered Tech Stack Pills */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                  {project.stack.map((tech) => {
                                    const Icon =
                                      stackIcons[tech as keyof typeof stackIcons] ?? Puzzle;
                                    return (
                                      <span
                                        key={tech}
                                        className="anime-tech-pill tech-font inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/70"
                                      >
                                        <Icon size={11} className="text-[#a78bfa]" />
                                        {tech}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Bottom Action Bar */}
                              <div className="anime-stagger-item mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  {project.links?.slice(0, 2).map((link) => (
                                    <a
                                      key={link.url}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="tech-font inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/55 hover:text-[#a78bfa] transition-colors"
                                    >
                                      {link.type === 'github' ? (
                                        <Github size={12} />
                                      ) : (
                                        <ExternalLink size={12} />
                                      )}
                                      {link.label}
                                    </a>
                                  ))}
                                </div>

                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedId(project.id);
                                    }}
                                    className="tech-font rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/80 hover:border-[#7c3aed] hover:text-white transition-colors"
                                  >
                                    Quick Inspect
                                  </button>
                                  <span className="tech-font inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#a78bfa] group-hover:translate-x-0.5 transition-transform">
                                    Case Study →
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* ──────────────────────────────────────────────────────────
                    STATION 05: TERMINAL ARCHIVE PORTAL NODE
                   ────────────────────────────────────────────────────────── */}
                <div
                  ref={(el) => {
                    stationRefs.current[featuredProjects.length + 1] = el;
                  }}
                  className="timeline-station relative min-h-screen md:h-full w-full md:w-[76vw] lg:w-[64vw] flex-shrink-0 flex flex-col justify-center px-5 md:px-12 lg:px-16 py-12 md:py-0 mb-[70px] md:mb-0"
                >
                  <div className="relative z-10 w-full max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="relative flex h-8 w-8 items-center justify-center">
                        <span className="anime-node-ring absolute inset-0 rounded-full border border-[#7c3aed]" />
                        <Compass size={15} className="text-[#a78bfa]" />
                      </span>
                      <span className="tech-font text-[11px] uppercase tracking-[0.22em] text-[#a78bfa]">
                        STATION 0{featuredProjects.length + 1} // COMPLETE ARCHIVE PORTAL
                      </span>
                    </div>

                    <div
                      onMouseEnter={handleCardHoverEnter}
                      onMouseLeave={handleCardHoverLeave}
                      className="group relative overflow-hidden rounded-[24px] border border-white/15 bg-[#0a0a14]/85 backdrop-blur-xl p-6 md:p-9 shadow-[0_28px_90px_rgba(0,0,0,0.75)] hover:border-[#7c3aed]/70 transition-all duration-500"
                    >
                      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7c3aed]/15 blur-3xl" />

                      <div className="anime-stagger-item flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="tech-font text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                            {projects.length} ENGINEERED PROJECTS
                          </div>
                          <h3 className="heading-font mt-1 text-2xl md:text-4xl font-bold text-white">
                            EXPLORE FULL WORKS ARCHIVE
                          </h3>
                        </div>
                        <Layers size={28} className="text-[#a78bfa]/70" />
                      </div>

                      <p className="anime-stagger-item mt-3 text-[13px] md:text-[14px] leading-relaxed text-white/65">
                        Dive into the complete catalog including full-stack web platforms, mobile
                        marketplaces, real-time multiplayer games, and developer tooling.
                      </p>

                      {/* Mini Preview Grid of Additional Archive Projects */}
                      <div className="anime-stagger-item mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {archivePreviewProjects.map((item) => (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigateFromWorks(`/projects/${item.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigateFromWorks(`/projects/${item.id}`);
                              }
                            }}
                            className="anime-tech-pill flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-[#7c3aed]/50 hover:bg-white/[0.06] transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.icon ?? projectLogoPlaceholder}
                                alt=""
                                aria-hidden="true"
                                className="h-9 w-9 rounded-lg border border-white/10 object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="heading-font text-sm font-semibold text-white truncate">
                                  {item.title}
                                </div>
                                <div className="tech-font text-[9px] uppercase tracking-wider text-white/45 truncate">
                                  {item.category}
                                </div>
                              </div>
                            </div>
                            <ArrowUpRight size={14} className="text-[#a78bfa] flex-shrink-0" />
                          </div>
                        ))}
                      </div>

                      <div className="anime-stagger-item mt-7 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/10">
                        <a
                          href="/projects"
                          onClick={(event) => {
                            event.preventDefault();
                            navigateFromWorks('/projects');
                          }}
                          className="tech-font inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-[#7c3aed]/60 bg-[#7c3aed]/20 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#7c3aed] transition-all shadow-[0_0_30px_rgba(124,58,237,0.35)]"
                        >
                          <span>Show All {projects.length} Projects</span>
                          <ArrowUpRight size={15} />
                        </a>

                        <span className="tech-font text-[10px] uppercase tracking-[0.18em] text-white/45">
                          CONTINUE SCROLLING FOR CONTACT ↓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────
                BOTTOM INTERACTIVE TIMELINE SCRUBBER HUD (Desktop)
               ────────────────────────────────────────────────────────── */}
            <div className="hidden md:flex items-center justify-between gap-4 pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,860px)] rounded-2xl border border-white/12 bg-[#080810]/80 backdrop-blur-xl px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]" />
                <span className="tech-font text-[10px] uppercase tracking-[0.2em] text-white/60">
                  TIMELINE
                </span>
              </div>

              {/* Station Nodes & Progress Rail */}
              <div className="relative flex-1 flex items-center justify-between px-2">
                {/* Base Track */}
                <div className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 overflow-hidden rounded-full">
                  <div
                    ref={progressFillRef}
                    className="h-full w-full origin-left bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#38bdf8]"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>

                {timelineStations.map((st) => {
                  const isCurrent = activeStation === st.index;
                  const isPassed = activeStation > st.index;
                  return (
                    <button
                      key={st.code}
                      type="button"
                      onClick={() => scrollToTimelineStation(st.index)}
                      className="group relative z-10 flex flex-col items-center gap-1 py-1 focus:outline-none"
                      title={`Jump to ${st.label}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'scale-125 bg-[#a78bfa] ring-4 ring-[#7c3aed]/35'
                            : isPassed
                            ? 'bg-[#7c3aed]'
                            : 'bg-white/25 group-hover:bg-white/60'
                        }`}
                      />
                      <span
                        className={`tech-font text-[9px] uppercase tracking-wider transition-colors ${
                          isCurrent
                            ? 'text-white font-bold'
                            : 'text-white/45 group-hover:text-white/80'
                        }`}
                      >
                        {st.code}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 min-w-[52px] justify-end">
                <span
                  ref={progressReadoutRef}
                  className="tech-font text-[11px] font-bold tracking-widest text-[#a78bfa]"
                >
                  00%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .works-scroll-container::-webkit-scrollbar { display: none; }
        .works-scroll-container { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; overscroll-behavior-y: contain; }
        .works-scroll-container .works-horizontal-track {
          transition: opacity 260ms ease;
        }
        .works-scroll-container.works-projects-leaving .works-horizontal-track {
          opacity: 0;
          pointer-events: none;
        }

        /* ── Expanded Overlay (scoped to projects area) ── */
        .project-expanded-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .project-expanded-card {
          position: relative;
          width: 100%;
          max-width: 820px;
          max-height: 85vh;
          overflow: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0d0d0d;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(124, 58, 237, 0.15);
        }
        .project-expanded-scroll {
          max-height: 85vh;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .project-expanded-scroll::-webkit-scrollbar { width: 4px; }
        .project-expanded-scroll::-webkit-scrollbar-track { background: transparent; }
        .project-expanded-scroll::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.3); border-radius: 10px; }
        .project-expanded-image {
          position: relative;
          width: calc(100% - 32px);
          margin: 20px 16px 0;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 12px;
        }
        .project-expanded-content {
          padding: 28px 32px 32px;
        }

        /* ── Close Button ── */
        .project-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 50;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          color: #fff;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .project-close-btn:hover {
          background: rgba(124, 58, 237, 0.6);
          border-color: rgba(124, 58, 237, 0.5);
          transform: rotate(90deg);
        }

        /* ── Scroll hint ── */
        .project-scroll-hint {
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 14px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: var(--font-tech, monospace);
          pointer-events: none;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .works-scroll-container {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            background: transparent !important;
            padding: 48px 0 20px !important;
            overflow: visible !important;
          }
          .works-horizontal-track {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            transform: none !important;
          }
          .timeline-station {
            min-height: auto !important;
            width: 100% !important;
            padding: 24px 20px !important;
          }
          .experience-header h2 {
            font-size: 32px !important;
            line-height: 1.2 !important;
            letter-spacing: -0.03em !important;
          }
          .project-expanded-backdrop {
            padding: 20px;
          }
          .project-expanded-card {
            max-height: 90vh;
          }
          .project-expanded-scroll {
            max-height: 90vh;
          }
          .project-expanded-content {
            padding: 20px 20px 24px;
          }
        }
      `}</style>

      {/* Expanded Project Overlay — portaled above everything */}
      {createPortal(
        <AnimatePresence>
          {selectedId &&
            (() => {
              const proj = projects.find((p) => p.id === selectedId);
              if (!proj) return null;
              return (
                <motion.div
                  key="project-overlay"
                  className="project-expanded-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedId('')}
                >
                  <motion.div
                    className="project-expanded-card"
                    data-lenis-prevent
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      className="project-close-btn"
                      onClick={() => setSelectedId('')}
                      aria-label="Close project"
                    >
                      ✕
                    </button>

                    <div className="project-expanded-scroll">
                      {/* Header — above image */}
                      <div className="px-5 md:px-6 pt-4 pb-3">
                        <div className="tech-font text-[13px] font-bold text-[#7c3aed] mb-1">
                          {proj.year}
                        </div>
                        <div className="flex items-center gap-3">
                          <h3 className="heading-font text-3xl md:text-4xl font-bold text-white leading-tight">
                            {proj.title}
                          </h3>
                          {proj.id === '01' && (
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => setChemQuestShowImage((v) => !v)}
                                className="tech-font flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest border transition-colors duration-300 bg-transparent text-white/50 border-white/15 hover:text-[#7c3aed] hover:border-[#7c3aed]/40"
                              >
                                <Award size={13} />
                                Best Capstone Award
                              </button>
                              {/* Hover preview */}
                              <button
                                type="button"
                                onClick={() => setChemQuestShowImage(true)}
                                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[240px] rounded-[10px] border border-white/10 bg-black/95 p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-[100] shadow-2xl"
                                aria-label="Open award preview"
                              >
                                <img
                                  src={awardImg}
                                  alt="Best Capstone Award"
                                  className="w-full h-auto rounded-[6px]"
                                />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="heading-font text-[11px] text-[#7c3aed]/70 uppercase tracking-widest mt-1">
                          {proj.line2}
                        </p>
                        {proj.id === '01' && (
                          <AnimatePresence>
                            {chemQuestShowImage && (
                              <motion.div
                                key="chemquest-popup"
                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                onClick={() => setChemQuestShowImage(false)}
                              >
                                <motion.div
                                  className="relative max-w-lg w-[90%] rounded-[16px] border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,58,237,0.15)]"
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.9, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setChemQuestShowImage(false)}
                                    className="absolute top-3 right-3 text-white/50 hover:text-white text-lg leading-none"
                                  >
                                    ✕
                                  </button>
                                  <img
                                    src={awardImg}
                                    alt="CHEMQuest award"
                                    className="w-full h-auto rounded-[12px]"
                                  />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                        {proj.links && proj.links.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-3">
                            {proj.links.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tech-font flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50 hover:text-[#7c3aed] transition-colors"
                              >
                                {link.type === 'github' ? (
                                  <Github size={13} />
                                ) : (
                                  <ExternalLink size={13} />
                                )}
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      <div className="project-expanded-image">
                        {proj.img ? (
                          <img
                            src={proj.img}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
                            {proj.status && (
                              <span className="heading-font text-[28px] tracking-[0.22em] text-white/10 uppercase">
                                {proj.status}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      </div>

                      {/* Tech stack — below image */}
                      <div className="px-5 md:px-6 pt-4">
                        <div className="flex flex-wrap gap-3">
                          {proj.stack.map((s) => {
                            const Icon = stackIcons[s as keyof typeof stackIcons] ?? Puzzle;
                            return (
                              <span
                                key={s}
                                className="tech-font flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/60"
                              >
                                <Icon size={13} />
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content below image */}
                      <div className="project-expanded-content">
                        {proj.id === '04' && (
                          <div className="mb-6">
                            <button
                              type="button"
                              onClick={() => {
                                setOozeborneShowFlowchart((v) => !v);
                                setZoom(1);
                                setPan({ x: 0, y: 0 });
                              }}
                              className={`tech-font rounded-full px-4 py-2 text-[10px] uppercase tracking-widest transition-colors border ${
                                oozeborneShowFlowchart
                                  ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                                  : 'bg-transparent text-white/70 border-white/15 hover:text-white'
                              }`}
                            >
                              {oozeborneShowFlowchart ? 'Hide flow chart' : 'Show flow chart'}
                            </button>
                          </div>
                        )}

                        {proj.id === '04' && (
                          <AnimatePresence initial={false}>
                            {oozeborneShowFlowchart && (
                              <motion.div
                                key="oozeborne-flowchart"
                                ref={containerRef}
                                className="mt-4 rounded-[14px] border border-white/10 bg-black/30 overflow-hidden mb-6 relative cursor-grab active:cursor-grabbing select-none"
                                style={{ height: '400px', touchAction: 'none' }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                              >
                                <div className="absolute top-2 left-2 z-10 tech-font text-[9px] text-white/40 uppercase bg-black/50 px-2 py-1 rounded">
                                  Scroll to Zoom • Drag to Pan • Click button to Toggle
                                </div>

                                <div className="absolute top-2 right-2 z-20 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setZoom((prev) => Math.min(prev * 1.2, 5))}
                                    className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-[#7c3aed] transition-colors"
                                    title="Zoom In"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setZoom((prev) => Math.max(prev / 1.2, 0.5))}
                                    onDoubleClick={handleReset}
                                    className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-[#7c3aed] transition-colors"
                                    title="Zoom Out (Double click to reset)"
                                  >
                                    -
                                  </button>
                                </div>
                                <motion.div
                                  style={{
                                    x: pan.x,
                                    y: pan.y,
                                    scale: zoom,
                                    transformOrigin: 'center',
                                  }}
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  <img
                                    src={multiplayerFlowchart}
                                    alt="Oozeborne multiplayer flowchart"
                                    className="max-w-none pointer-events-none"
                                    style={{ width: '100%', height: 'auto' }}
                                  />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}

                        {(() => {
                          const about = PROJECT_ABOUT[proj.id];
                          if (!about) return null;
                          return (
                            <div className="mb-5">
                              <h4 className="heading-font text-[14px] md:text-[16px] font-bold text-white mb-3">
                                About This Project
                              </h4>
                              <p className="text-white/70 text-[12px] md:text-[13px] leading-relaxed font-light whitespace-pre-line mb-5">
                                {about.description}
                              </p>
                              <h5 className="heading-font text-[12px] md:text-[14px] font-bold text-[#7c3aed] mb-3">
                                Key Features
                              </h5>
                              <ul className="space-y-2">
                                {about.keyFeatures.map((feature, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-white/60 text-[11px] md:text-[12px] leading-relaxed"
                                  >
                                    <span className="text-[#7c3aed] mt-0.5 flex-shrink-0">▸</span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}

                        {proj.id === '03' && (
                          <div className="mb-6">
                            <button
                              type="button"
                              onClick={() => setTsukiShowFlowchart((v) => !v)}
                              className={`tech-font rounded-full px-4 py-2 text-[10px] uppercase tracking-widest transition-colors border ${
                                tsukiShowFlowchart
                                  ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                                  : 'bg-transparent text-white/70 border-white/15 hover:text-white'
                              }`}
                            >
                              {tsukiShowFlowchart ? 'Hide flow chart' : 'Show flow chart'}
                            </button>
                          </div>
                        )}

                        {proj.id === '03' && (
                          <AnimatePresence initial={false}>
                            {tsukiShowFlowchart && (
                              <motion.div
                                key="tsuki-flowchart"
                                className="mt-4 rounded-[14px] border border-white/10 bg-black/30 p-3 overflow-hidden mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                              >
                                <img
                                  src={architectureFlowchart}
                                  alt="TSUKIAI architecture flowchart"
                                  className="w-full h-auto"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    </div>

                    {/* Scroll hint — absolute top center of card */}
                    <motion.div
                      className="project-scroll-hint"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, 0] }}
                      transition={{
                        duration: 2.5,
                        times: [0, 0.2, 0.7, 1],
                        delay: 0.6,
                        ease: 'easeOut',
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      scroll down
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })()}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
});
