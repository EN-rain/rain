import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { ScrapbookBoardProps, ScrapbookItem, ScrapbookItemNote, ScrapbookTapeConfig, DossierSideCard } from '../types';
import { InvestigationStringsWebGL, PinPosition, ActiveItemObstacles, ActiveObstacleBox } from './InvestigationStringsWebGL';
import { ScrapbookAtmosphereShader } from './ScrapbookAtmosphereShader';
import '../styles/scrapbook-lighting.css';

const DEFAULT_ITEMS: ScrapbookItem[] = [
  {
    id: 'item-1',
    title: 'StudentFlow',
    cx: 14,
    cy: 17,
    frame: {
      id: 'f1',
      image: '/assets/projects/studentflow.png',
      logo: '/assets/projects/studentflow-logo.png',
      style: { left: '3%', top: '3%', width: '22%', transform: 'rotate(-3deg)' },
    },
    note: {
      id: 'n1',
      style: { left: '19%', top: '21.5%', width: '11.2%', transform: 'rotate(-6deg)' },
      text: 'StudentFlow\n2024 – 2025\nWeb, API & Android Hub',
      tapes: [
        { src: 'tape-1.png', x: '16%', y: '9%', rotation: -35, width: '42%' },
        { src: 'tape-2.png', x: '84%', y: '9%', rotation: 35, width: '42%' },
      ],
    },
  },
  {
    id: 'item-2',
    title: 'PocketTrade',
    cx: 47,
    cy: 20,
    frame: {
      id: 'f2',
      image: '/assets/projects/pockettrade.png',
      style: { left: '36%', top: '6%', width: '22%', transform: 'rotate(4deg)' },
    },
    note: {
      id: 'n2',
      style: { left: '52%', top: '24.5%', width: '11.2%', transform: 'rotate(6deg)' },
      text: 'PocketTrade\nJune 2026\nUsed-Phone Marketplace',
      tapes: [
        { src: 'tape-3.png', x: '50%', y: '9%', rotation: -5, width: '46%' },
      ],
    },
  },
  {
    id: 'item-3',
    title: 'ChemQuest',
    cx: 80,
    cy: 16,
    frame: {
      id: 'f3',
      image: '/assets/projects/chemquest.png',
      style: { left: '69%', top: '2%', width: '22%', transform: 'rotate(-6deg)' },
    },
    note: {
      id: 'n3',
      style: { left: '85%', top: '20.5%', width: '11.2%', transform: 'rotate(-5deg)' },
      text: 'ChemQuest\n2024 – 2025\nChemistry Learning Game',
      tapes: [
        { src: 'tape-2.png', x: '16%', y: '9%', rotation: -33, width: '42%' },
        { src: 'tape-1.png', x: '84%', y: '9%', rotation: 36, width: '42%' },
      ],
    },
  },
  {
    id: 'item-4',
    title: 'TypeDuel',
    cx: 16,
    cy: 68,
    frame: {
      id: 'f4',
      image: '/assets/projects/typeduel-bg.png',
      logo: '/assets/projects/typeduel-logo.png',
      style: { left: '5%', top: '54%', width: '22%', transform: 'rotate(1deg)' },
    },
    note: {
      id: 'n4',
      style: { left: '20%', top: '70.5%', width: '11.2%', transform: 'rotate(8deg)' },
      text: 'TypeDuel\nMay 2026\nCompetitive Typing Duel',
      tapes: [
        { src: 'tape-1.png', x: '16%', y: '9%', rotation: -35, width: '44%' },
      ],
    },
  },
  {
    id: 'item-5',
    title: 'TsukiAI',
    cx: 48,
    cy: 70,
    frame: {
      id: 'f5',
      image: '/assets/projects/tsukiai.png',
      style: { left: '37%', top: '56%', width: '22%', transform: 'rotate(-4deg)' },
    },
    note: {
      id: 'n5',
      style: { left: '53%', top: '72.5%', width: '11.2%', transform: 'rotate(9deg)' },
      text: 'TsukiAI\n2025 – 2026\nVoice AI + Discord Bridge',
      tapes: [
        { src: 'tape-3.png', x: '16%', y: '9%', rotation: -35, width: '42%' },
        { src: 'tape-2.png', x: '84%', y: '89%', rotation: -35, width: '40%' },
      ],
    },
  },
  {
    id: 'item-6',
    title: 'Auvrynt',
    cx: 80,
    cy: 67,
    frame: {
      id: 'f6',
      image: '/assets/projects/auvrynt.png',
      imageFit: 'contain',
      style: { left: '69%', top: '53%', width: '22%', transform: 'rotate(3deg)' },
    },
    note: {
      id: 'n6',
      style: { left: '85%', top: '69.5%', width: '11.2%', transform: 'rotate(-6deg)' },
      text: 'Auvrynt\nJuly – Oct 2026\nWeb-to-Local MCP Arsenal',
      tapes: [
        { src: 'tape-3.png', x: '84%', y: '9%', rotation: 35, width: '44%' },
      ],
    },
  },
];

// Helper to calculate obstacle bounding boxes (in percentage of board content)
function computeItemObstacles(item: ScrapbookItem): ActiveItemObstacles {
  const result: ActiveItemObstacles = { itemId: item.id };

  if (item.frame?.style) {
    const left = parseFloat(String(item.frame.style.left || '0'));
    const top = parseFloat(String(item.frame.style.top || '0'));
    const width = parseFloat(String(item.frame.style.width || '22'));
    // Frame ratio 3/2 = 1.5; board content ratio 1024 / 477 = 2.1467
    const height = (width * 2.1467) / 1.5;
    result.frameBox = {
      minX: Math.max(0, left - 1.5),
      maxX: Math.min(100, left + width + 1.5),
      minY: Math.max(0, top - 1.5),
      maxY: Math.min(100, top + height + 1.5),
    };
  }

  if (item.note?.style) {
    const left = parseFloat(String(item.note.style.left || '0'));
    const top = parseFloat(String(item.note.style.top || '0'));
    const width = parseFloat(String(item.note.style.width || '11.2'));
    // Note ratio 1070 / 364 = 2.94
    const height = (width * 2.1467) / 2.94;
    result.noteBox = {
      minX: Math.max(0, left - 1.5),
      maxX: Math.min(100, left + width + 1.5),
      minY: Math.max(0, top - 1.5),
      maxY: Math.min(100, top + height + 1.5),
    };
  }

  return result;
}

// Calculate the exact center of the photo frame within the content area
function getPhotoFrameCenter(item: ScrapbookItem): { x: number; y: number } {
  if (item.frame?.style) {
    const left = parseFloat(String(item.frame.style.left || '0'));
    const top = parseFloat(String(item.frame.style.top || '0'));
    const width = parseFloat(String(item.frame.style.width || '22'));
    // Content aspect ratio: (1672 * 0.73) / (941 * 0.665) = 1.95. Frame ratio: 1.5.
    const height = (width * 1.95) / 1.5;
    return {
      x: left + width * 0.5,
      y: top + height * 0.5,
    };
  }
  return { x: item.cx ?? 50, y: item.cy ?? 50 };
}

// Generates rich left & right dossier pop-up descriptions for zoom inspection
function getDossierCards(item: ScrapbookItem): {
  left: DossierSideCard;
  right: DossierSideCard;
} {
  if (item.dossierDetails?.leftCard && item.dossierDetails?.rightCard) {
    return {
      left: item.dossierDetails.leftCard,
      right: item.dossierDetails.rightCard,
    };
  }

  const detailsMap: Record<string, { left: DossierSideCard; right: DossierSideCard }> = {
    'item-1': {
      left: {
        tag: 'WEB / MOBILE / EDUCATION',
        caseNo: 'PRJ-01 // SF',
        title: 'StudentFlow',
        subtitle: 'Student Management Web, API & Android App',
        date: '2024 – 2025',
        classification: 'FULL-STACK',
        lines: [
          'A school hub that helps administrators, teachers, and students stay on top of everyday learning.',
          'Teachers manage classes, attendance, assignments, grades, exams, and announcements in one place.',
          'Students follow their classwork, scores, attendance, and updates from the web or native Android app.',
        ],
        repoUrl: 'https://github.com/EN-rain/StudentFLow',
        stamp: 'DEPLOYED',
      },
      right: {
        tag: 'TECH STACK // MANIFEST',
        caseNo: 'PRJ-01 // STACK',
        title: 'StudentFlow Stack',
        subtitle: 'Web, REST API & Native Android',
        date: 'GITHUB // EN-RAIN/STUDENTFLOW',
        classification: 'VERIFIED BUILD',
        stack: ['Laravel 12', 'PHP 8.2', 'Blade', 'Sanctum', 'SQLite', 'Dompdf', 'Java 17', 'Retrofit'],
        lines: [
          'Web & API: Laravel 12, PHP 8.2, Blade, Sanctum',
          'Database & Docs: SQLite, Dompdf PDF Reports',
          'Mobile Client: Native Java 17 Android, Retrofit',
        ],
        stamp: 'VERIFIED',
      },
    },
    'item-2': {
      left: {
        tag: 'WEB / MOBILE / MARKETPLACE',
        caseNo: 'PRJ-02 // PT',
        title: 'PocketTrade',
        subtitle: 'Used-Phone Marketplace & Admin Suite',
        date: 'JUNE 2026',
        classification: 'MARKETPLACE',
        lines: [
          'A safer marketplace to buy and sell used phones with moderated multi-photo listings.',
          'Browse approved listings, save favorites, and chat directly with sellers in real time.',
          'Includes an admin moderation queue and built-in user reporting to flag suspicious activity.',
        ],
        repoUrl: 'https://github.com/EN-rain/PocketTrade',
        stamp: 'VERIFIED',
      },
      right: {
        tag: 'TECH STACK // MANIFEST',
        caseNo: 'PRJ-02 // STACK',
        title: 'PocketTrade Stack',
        subtitle: 'Mobile, Backend & Admin Portal',
        date: 'GITHUB // EN-RAIN/POCKETTRADE',
        classification: 'FULL-STACK',
        stack: ['Flutter', 'Dart', 'NestJS', 'TypeScript', 'Prisma', 'PostgreSQL', 'React', 'Cloudinary', 'Socket.IO', 'Firebase'],
        lines: [
          'Mobile & Admin: Flutter, Dart, React, Vite',
          'Backend & DB: NestJS, TypeScript, Prisma, PostgreSQL',
          'Realtime & Cloud: Socket.IO, Cloudinary, Firebase',
        ],
        stamp: 'APPROVED',
      },
    },
    'item-3': {
      left: {
        tag: 'GAMES / EDUCATION',
        caseNo: 'PRJ-03 // CQ',
        title: 'ChemQuest',
        subtitle: 'Story-Driven Chemistry Learning Game',
        date: '2024 – 2025',
        classification: 'INTERACTIVE',
        lines: [
          'A story-led 2D chemistry game where players explore a hometown hub and complete quests.',
          'Short interactive activities cover elements, compounds, mixtures, density, and states of matter.',
          'Features an element glossary, quest achievements, local save states, and Android mobile export.',
        ],
        repoUrl: 'https://github.com/EN-rain/ChemQuest',
        stamp: 'PLAYABLE',
      },
      right: {
        tag: 'TECH STACK // MANIFEST',
        caseNo: 'PRJ-03 // STACK',
        title: 'ChemQuest Stack',
        subtitle: 'Game Engine & Mobile Export',
        date: 'GITHUB // EN-RAIN/CHEMQUEST',
        classification: 'CHAPTER ONE',
        stack: ['Godot 4.6', 'GDScript', 'Android', 'JSON', 'Mobile Renderer', 'Local Storage'],
        lines: [
          'Engine: Godot 4.6 (2D Mobile Renderer)',
          'Scripting & Data: GDScript, Autoloads, JSON',
          'Target Platforms: Desktop Preview & Android ARM64',
        ],
        stamp: 'RELEASED',
      },
    },
    'item-4': {
      left: {
        tag: 'GAMES / MULTIPLAYER',
        caseNo: 'PRJ-04 // TD',
        title: 'TypeDuel',
        subtitle: 'Competitive 2D Pixel Typing Duel',
        date: 'MAY 2026',
        classification: 'REALTIME PVP',
        lines: [
          'A fast pixel-art typing battle where every word, WPM burst, and typo affects the fight.',
          'Players race through prompts, cast character abilities (Riven, Liora, Zephon), and disrupt rivals.',
          'Challenge friends in private custom rooms or jump into live matchmaking with leaderboards.',
        ],
        repoUrl: 'https://github.com/EN-rain/TypeDuel',
        stamp: 'MVP v1.0',
      },
      right: {
        tag: 'TECH STACK // MANIFEST',
        caseNo: 'PRJ-04 // STACK',
        title: 'TypeDuel Stack',
        subtitle: 'Client, Realtime Server & DB',
        date: 'GITHUB // EN-RAIN/TYPEDUEL',
        classification: 'LOW LATENCY',
        stack: ['Godot 4.6', 'GDScript', 'Node.js', 'Express', 'Socket.IO', 'WebSockets', 'SQLite'],
        lines: [
          'Game Client: Godot 4.6, GDScript, Pixel HUD',
          'Realtime Server: Node.js, Express, Socket.IO, WS',
          'Persistence: SQLite (Accounts, History, Ranks)',
        ],
        stamp: 'RELEASED',
      },
    },
    'item-5': {
      left: {
        tag: 'AI / VOICE ASSISTANT',
        caseNo: 'PRJ-05 // TA',
        title: 'TsukiAI',
        subtitle: 'WPF Voice Assistant + Discord Bridge',
        date: '2025 – 2026',
        classification: 'AI PIPELINE',
        lines: [
          'A desktop voice companion that listens and responds out loud with low-latency voice synthesis.',
          'Remembers useful conversational context across sessions using ChromaDB semantic memory.',
          'Joins Discord voice channels through a Node.js sidecar bridge for live voice conversations.',
        ],
        repoUrl: 'https://github.com/EN-rain/TsukiAI-Desktop',
        stamp: 'ONLINE',
      },
      right: {
        tag: 'TECH STACK // MANIFEST',
        caseNo: 'PRJ-05 // STACK',
        title: 'TsukiAI Stack',
        subtitle: 'Desktop Runtime, AI & Voice Bridge',
        date: 'GITHUB // EN-RAIN/TSUKIAI-DESKTOP',
        classification: 'AI VOICE',
        stack: ['.NET 8', 'WPF', 'C#', 'ASP.NET Core', 'Node.js', 'Discord.js', 'ChromaDB', 'VOICEVOX'],
        lines: [
          'Desktop & API: .NET 8, WPF, C#, ASP.NET Core',
          'AI & Memory: Multi-LLM Routing, ChromaDB, Whisper',
          'Voice & Bridge: VOICEVOX TTS, Node.js Discord Bot',
        ],
        stamp: 'ACTIVE',
      },
    },
    'item-6': {
      left: {
        tag: 'DEVELOPER TOOLS / MCP',
        caseNo: 'PRJ-06 // AV',
        title: 'Auvrynt',
        subtitle: 'Web-to-Local MCP Arsenal',
        date: 'JULY – OCT 2026',
        classification: 'NPM PACKAGE',
        lines: [
          'A self-hosted Model Context Protocol (MCP) server giving AI assistants secure real-time local access.',
          'Exposes 150+ local tools for files, shell, Git worktrees, Web, .NET, Godot, Blender, and Aseprite.',
          'Keeps code 100% on your machine with managed Cloudflare/ngrok tunnels and live profile switching.',
        ],
        repoUrl: 'https://github.com/EN-rain/Auvrynt',
        stamp: 'PUBLISHED',
      },
      right: {
        tag: 'TECH STACK // MANIFEST',
        caseNo: 'PRJ-06 // STACK',
        title: 'Auvrynt Stack',
        subtitle: 'MCP Server, Tunnels & Tooling',
        date: 'GITHUB // EN-RAIN/AUVRYNT',
        classification: 'MIT LICENSE',
        stack: ['TypeScript', 'Node.js 22', 'MCP SDK', 'Cloudflare Tunnel', 'ngrok', 'Playwright', 'Godot', 'Blender', 'Aseprite'],
        lines: [
          'Core Runtime: TypeScript, Node.js, MCP Protocol',
          'Tunnels & Auth: Cloudflare, ngrok, Owner Token',
          'Integrations: Web, .NET, Godot, Blender, Aseprite',
        ],
        stamp: 'NPM LIVE',
      },
    },
  };

  return detailsMap[item.id] || {
    left: {
      tag: 'CASE DOSSIER',
      caseNo: `REF #${item.id.toUpperCase()}`,
      title: item.title,
      subtitle: 'Detective Investigation File',
      date: 'OCTOBER 1948',
      classification: 'CONFIDENTIAL',
      lines: [
        item.note?.text || 'Evidence catalogued and registered to case board.',
        'Primary suspect and timeline connections documented.',
        'Awaiting cross-department laboratory verification.',
      ],
      stamp: 'OFFICIAL',
    },
    right: {
      tag: 'FIELD REPORT',
      title: 'Forensic Companion Note',
      subtitle: 'Chain of Custody Record',
      date: 'VERIFIED LOG ENTRY',
      classification: 'OFFICIAL RECORD',
      lines: [
        'Supplemental evidence gathered during physical search.',
        'Observation timestamps verified with central dispatch.',
        'Transcripts cross-referenced with municipal records.',
      ],
      stamp: 'VERIFIED',
    },
  };
}

export const ScrapbookBoard: React.FC<ScrapbookBoardProps> = ({
  assetsPath = '/assets',
  onBack,
  className = '',
  items = DEFAULT_ITEMS,
  dimLevel: propDimLevel = 0.60,
  enableShader = true,
  active = true,
  entered = true,
  transitionComplete = true,
}) => {
  const [zoomedId, setZoomedId] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(false);
  const [activeItemPos, setActiveItemPos] = useState<{ x: number; y: number } | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  const boardRef = useRef<HTMLElement>(null);
  const lampRef = useRef<HTMLButtonElement>(null);
  const [yarnPins, setYarnPins] = useState<PinPosition[]>([]);

  useEffect(() => {
    if (!entered) {
      setHasEntered(false);
      setZoomedId(null);
      setLampOn(false);
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [entered]);

  // Turn the wall lamp on automatically once the Page 1 -> Page 2 transition completes
  useEffect(() => {
    if (entered && transitionComplete) {
      setLampOn(true);
    }
  }, [entered, transitionComplete]);

  const currentDimLevel = propDimLevel;
  const activeItem = items.find((it) => it.id === zoomedId) || null;

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const measurePins = () => {
      const bounds = board.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const nextPins = Array.from(board.querySelectorAll<HTMLElement>('[data-yarn-anchor]'), (anchor) => {
        const point = anchor.getBoundingClientRect();
        return {
          id: anchor.dataset.yarnAnchor!,
          xPct: ((point.x - bounds.x) / bounds.width) * 100,
          yPct: ((point.y - bounds.y) / bounds.height) * 100,
        };
      });
      setYarnPins((prev) => {
        if (
          prev.length === nextPins.length &&
          prev.every(
            (p, idx) =>
              p.id === nextPins[idx].id &&
              Math.abs(p.xPct - nextPins[idx].xPct) < 0.05 &&
              Math.abs(p.yPct - nextPins[idx].yPct) < 0.05
          )
        ) {
          return prev;
        }
        return nextPins;
      });
    };

    measurePins();
    const observer = new ResizeObserver(measurePins);
    observer.observe(board);
    return () => observer.disconnect();
  }, [items]);

  // Compute active obstacles in O(1) without synchronous DOM reflow during zoom click
  const activeObstacles = useMemo<ActiveItemObstacles | null>(() => {
    if (!activeItem) return null;
    return computeItemObstacles(activeItem);
  }, [activeItem]);

  const lastActiveItemRef = useRef<ScrapbookItem>(items[0]);
  if (activeItem) {
    lastActiveItemRef.current = activeItem;
  }
  const displayedDossierItem = activeItem ?? lastActiveItemRef.current;

  // Track active item screen coordinates for focus spotlight shader
  useEffect(() => {
    if (!zoomedId) {
      setActiveItemPos(null);
      return;
    }
    // Zoom targets the center of the viewport
    setActiveItemPos({
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
    });
  }, [zoomedId]);

  const handleToggleZoom = useCallback((itemId: string) => {
    setZoomedId((curr) => (curr === itemId ? null : itemId));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomedId(null);
  }, []);

  // Keyboard shortcut: Escape to reset zoom
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoomedId) {
        handleZoomOut();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleZoomOut, zoomedId]);

  const getScrapbookAsset = (filename: string) => `${assetsPath}/scrapbook/${filename}`;

  // Cinematic Camera Zoom:
  // Drives the entire room (single continuous wall backdrop, lamp, clock, keys, board, notes, yarn)
  // as one unified camera push-in towards the active dossier card with a wide, cinematic field of view.
  const zoomScale = 4;

  let camX = 50;
  let camY = 50;

  if (activeItem && typeof window !== 'undefined') {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const sceneRatio = 1672 / 941;
    let sceneWidth = W;
    let sceneHeight = W / sceneRatio;

    if (sceneHeight > H) {
      sceneHeight = H;
      sceneWidth = H * sceneRatio;
    }

    const sceneLeft = (W - sceneWidth) * 0.5;
    const sceneTop = (H - sceneHeight) * 0.5;

    const frameCenter = getPhotoFrameCenter(activeItem);
    // Align camera so the left folder edge and the picture frame's outer left border meet cleanly
    const targetBoardX = frameCenter.x - 1.9;
    const targetBoardY = frameCenter.y + 1.8;
    const stageX = 13 + (targetBoardX / 100) * 73;
    const stageY = 12 + (targetBoardY / 100) * 66.5;

    const itemPxX = sceneLeft + (stageX / 100) * sceneWidth;
    const itemPxY = sceneTop + (stageY / 100) * sceneHeight;

    camX = (itemPxX / W) * 100;
    camY = (itemPxY / H) * 100;
  }

  const cameraZoomStyle: React.CSSProperties = {
    transformOrigin: '0 0',
    transform: activeItem
      ? `translate3d(${50 - zoomScale * camX}%, ${50 - zoomScale * camY}%, 0) scale(${zoomScale})`
      : 'translate3d(0%, 0%, 0) scale(1)',
    transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const renderTapeStrip = (tape: ScrapbookTapeConfig, idx: number) => {
    return (
      <img
        key={`${tape.src}-${idx}`}
        src={getScrapbookAsset(tape.src)}
        alt=""
        className="scrapbook-tape absolute pointer-events-none select-none"
        style={{
          left: tape.x,
          top: tape.y,
          width: tape.width || '42%',
          height: 'auto',
          transform: `translate(-50%, -50%) rotate(${tape.rotation}deg)`,
          opacity: 0.92,
          zIndex: 10,
        }}
      />
    );
  };

  const renderNote = (
    note: ScrapbookItemNote,
    itemId: string,
    isItemActive: boolean,
    zIndexBase: number,
    itemIndex: number
  ) => {
    const tapeList: ScrapbookTapeConfig[] = note.tapes && note.tapes.length > 0
      ? note.tapes
      : note.tape
        ? [{ src: note.tape, x: '50%', y: '9%', rotation: -5, width: '46%' }]
        : [];

    return (
      <div
        key={note.id}
        data-note-id={itemId}
        style={{
          ...note.style,
          zIndex: zIndexBase + (isItemActive ? 8 : 1),
          ['--item-index' as string]: itemIndex,
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleZoom(itemId);
        }}
        className={`absolute group select-none transition-transform duration-300 ease-out ${isItemActive
            ? 'cursor-zoom-out'
            : 'cursor-zoom-in hover:scale-105 hover:z-20'
          }`}
        aria-label="Examine note"
      >
        {/* Lined Note Paper: tightly cropped 3-line ratio */}
        <div className="scrapbook-note-inner relative drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
          <img
            src={`${getScrapbookAsset('note-illustrated.png')}?v=7`}
            alt="Lined paper note"
            className="block w-full h-auto pointer-events-none select-none"
          />

          {/* Note Text Inscription: sits directly on ruled lines 1, 2, and 3 */}
          <div
            className="absolute top-[33.5%] bottom-[15.5%] left-[7.5%] right-[7.5%] overflow-hidden pointer-events-none flex flex-col justify-between"
            style={{
              fontFamily: "'Special Elite', 'Courier Prime', monospace, serif",
              color: '#281d14',
            }}
          >
            {(note.text ?? '').split('\n').map((line, i) => (
              <p
                key={i}
                className={`scrapbook-note-copy whitespace-nowrap transition-opacity duration-300 leading-none ${i === 0
                    ? 'font-bold text-[#1c130c] tracking-wide'
                    : i === 1
                      ? 'font-semibold text-[#5a3c28] opacity-90'
                      : 'font-bold text-[#281d14] tracking-tight'
                  } ${isItemActive ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Washi Tapes: Visible when unzoomed, hidden after zoom in */}
          <div
            className={`transition-opacity duration-300 ease-out ${isItemActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            aria-hidden="true"
          >
            {tapeList.map((t, idx) => renderTapeStrip(t, idx))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={zoomedId ? handleZoomOut : undefined}
      className={`fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden select-none bg-[#0e1012] ${zoomedId ? 'cursor-zoom-out' : ''
        } ${className}`}
    >
      {/* Back Button Only (Top Left) */}
      {onBack && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-4 left-6 z-50 pointer-events-auto"
        >
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d8c39d]/40 bg-[#1e2024]/90 backdrop-blur-md text-[#e6d8ba] text-xs font-serif tracking-widest uppercase hover:bg-[#2c2f35] hover:border-[#d8c39d] hover:scale-105 active:scale-95 transition cursor-pointer shadow-xl"
          >
            <span>&#8592;</span>
            <span>Back to Desk</span>
          </button>
        </div>
      )}

      {/* Cinematic Camera Rig: Zooms and pans the entire world (wall backdrop, lamp, clock, keys, board, notes, yarn) */}
      <div
        className="scrapbook-camera-rig absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        style={cameraZoomStyle}
      >
        {/* Single Seamless Wall Backdrop (Zero seams, zero split lines) */}
        <div
          className="scrapbook-wall-backdrop absolute inset-[-30%] w-[160%] h-[160%] pointer-events-none"
          data-lamp-on={lampOn}
          style={{
            backgroundImage: `url(${getScrapbookAsset('wall-extension.png')})`,
          }}
          aria-hidden="true"
        />

        {/* Main Wall Scene Container (Transparent layout stage) */}
        <div
          className="scrapbook-wall-scene pointer-events-auto"
          data-lamp-on={lampOn}
          data-zoomed={!!zoomedId}
          data-entered={hasEntered}
        >
          {/* Wall Accents (Stay on wall, softly dimming during zoom) */}
          <img src={getScrapbookAsset('wall-clock.png')} alt="Antique wall clock" className="scrapbook-clock-art" />
          <img src={getScrapbookAsset('wall-keys.png')} alt="Antique keys on a wall hook" className="scrapbook-keys-art" />

          {/* Interactive Wall Lamp */}
          <button
            ref={lampRef}
            type="button"
            className="scrapbook-wall-lamp"
            aria-label={lampOn ? 'Turn wall lamp off' : 'Turn wall lamp on'}
            aria-pressed={lampOn}
            onClick={(event) => {
              event.stopPropagation();
              setLampOn((on) => !on);
            }}
          >
            <img src={getScrapbookAsset('wall-lamp-off.png')} alt="" className="scrapbook-lamp-off" />
            <img src={getScrapbookAsset('wall-lamp-on.png')} alt="" className="scrapbook-lamp-on" />
          </button>

          {/* Corkboard Surface Artwork & Evidence Content */}
          <div className="scrapbook-corkboard-stage">
            {/* Framed Corkboard Surface Artwork */}
            <img
              src={getScrapbookAsset('board-standalone.png')}
              alt="Illustrated framed corkboard"
              className="scrapbook-board-art"
            />

            {/* Notes and photos aligned with the illustrated cork surface */}
            <main
              ref={boardRef}
              className="scrapbook-wall-content z-20 overflow-visible pointer-events-auto"
              aria-label="Vintage scrapbook investigation board"
            >
              {/* 3D WebGL Investigation Red String Connections */}
              <InvestigationStringsWebGL
                pins={yarnPins}
                activeItemId={zoomedId}
                obstacles={activeObstacles}
                lampOn={lampOn}
                active={active}
                entered={hasEntered}
                className="!z-[40]"
              />

              {items.map((item, itemIndex) => {
                const isItemActive = zoomedId === item.id;
                const zIndexBase = isItemActive ? 35 : 10;

                return (
                  <React.Fragment key={item.id}>
                    {/* Picture Frame with Black Placeholder */}
                    {item.frame && (
                      <div
                        data-frame-id={item.id}
                        style={{
                          ...item.frame.style,
                          zIndex: zIndexBase,
                          ['--item-index' as string]: itemIndex,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleZoom(item.id);
                        }}
                        className={`absolute group select-none ${isItemActive
                          ? 'cursor-zoom-out drop-shadow-none'
                          : 'cursor-zoom-in hover:scale-[1.02] hover:z-20 transition-transform duration-200 ease-out'
                          }`}
                        aria-label={`Examine ${item.title}`}
                      >
                        <div className="scrapbook-frame-inner relative w-full h-full">
                          {/* Project Image Inside Vintage Picture Frame */}
                          <div
                            className="absolute bg-[#120e1e] overflow-hidden pointer-events-none flex items-center justify-center"
                            style={{
                              left: '12%',
                              top: '16%',
                              width: '76%',
                              height: '59%',
                              zIndex: 0,
                            }}
                            aria-label={`${item.title} preview`}
                          >
                            {item.frame.image && (
                              <img
                                src={item.frame.image}
                                alt={item.title}
                                className={`w-full h-full select-none pointer-events-none ${item.frame.imageFit === 'contain' ? 'object-contain p-[6%]' : 'object-cover'
                                  }`}
                              />
                            )}
                            {item.frame.logo && (
                              <img
                                src={item.frame.logo}
                                alt=""
                                className="absolute w-[38%] h-[58%] object-contain select-none pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)]"
                              />
                            )}
                          </div>

                          {/* Ornate Vintage Black Picture Frame (No black back shadow on zoom in) */}
                          <img
                            src={getScrapbookAsset('photo-card-illustrated.png')}
                            alt="Vintage picture frame"
                            className={`relative z-[1] block w-full h-auto select-none pointer-events-none ${isItemActive
                              ? 'drop-shadow-none filter-none'
                              : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]'
                              }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* One Note Per Picture Frame */}
                    {item.note && renderNote(item.note, item.id, isItemActive, zIndexBase, itemIndex)}

                    {/* Auxiliary notes if present */}
                    {item.notes?.map((n) => renderNote(n, item.id, isItemActive, zIndexBase, itemIndex))}
                  </React.Fragment>
                );
              })}

              {/* 3D Pushpins with Yarn Anchors */}
              {items.map((item, itemIndex) => item.frame && (
                <div
                  key={`pin-${item.id}`}
                  style={{
                    ...item.frame.style,
                    aspectRatio: '3 / 2',
                    zIndex: 50,
                    ['--item-index' as string]: itemIndex,
                  }}
                  className="absolute pointer-events-none"
                >
                  <span data-yarn-anchor={item.id} className="absolute" style={{ left: '48.4%', top: '13.5%' }} />
                  <img
                    src={getScrapbookAsset('pin-red-3d.png')}
                    alt="Investigation red pushpin"
                    className="scrapbook-pin-img absolute w-[18%] h-auto left-[43%] top-[-2%] select-none pointer-events-none drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
                  />
                </div>
              ))}
            </main>
          </div>
        </div>
      </div>

      {/* WebGL Atmospheric Dimming & Lighting Shader */}
      {enableShader && (
        <ScrapbookAtmosphereShader
          lampOn={lampOn}
          dimLevel={currentDimLevel}
          activeItemPos={activeItemPos}
          isZoomed={!!zoomedId}
          active={active}
        />
      )}

      {/* Cinematic Ambient Vignette & Focus Backdrop Overlays */}
      <div
        className="scrapbook-ambient-vignette"
        style={{ opacity: zoomedId ? 0.25 : currentDimLevel > 0 ? 0.75 : 0.15 }}
        aria-hidden="true"
      />
      <div className="scrapbook-focus-backdrop" data-active={!!zoomedId} aria-hidden="true" />

      {/* Pop-up Open Case Folder (Left Description on Zoom In) & Dossier Tech Stack Card (Upper Right on Zoom In) */}
      {displayedDossierItem && (() => {
        const { left: descData, right: stackData } = getDossierCards(displayedDossierItem);
        const isCardOpen = !!activeItem;

        return (
          <>
            {/* Left Marked Area: Open Vintage Detective Case Folder — pure slide in with elastic bounce (no fade) */}
            <aside
              onClick={(e) => e.stopPropagation()}
              className={`fixed left-0 bottom-0 z-45 select-none will-change-transform ${isCardOpen
                  ? 'pointer-events-auto'
                  : 'pointer-events-none'
                }`}
              style={{
                width: 'min(62vw, 940px)',
                transform: isCardOpen
                  ? 'translate3d(-45.5%, 4%, 0) rotate(-9deg)'
                  : 'translate3d(-128%, 26%, 0) rotate(-20deg)',
                transition: isCardOpen
                  ? 'transform 0.82s cubic-bezier(0.34, 1.45, 0.64, 1) 30ms'
                  : 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              }}
              aria-label="Open Detective Case File Folder"
            >
              <div className="relative w-full drop-shadow-[0_26px_48px_rgba(0,0,0,0.88)]">
                <img
                  src={getScrapbookAsset('case-folder-open.png')}
                  alt="Open vintage detective case folder with document pages"
                  className="w-full h-auto block select-none pointer-events-none"
                />

                {/* Project Description Inscription on the visible Right Page of the Open Folder */}
                <div
                  className="absolute top-[11%] bottom-[10%] left-[53.5%] right-[5.5%] flex flex-col justify-between text-[#231911] pointer-events-auto"
                  style={{ fontFamily: "'Special Elite', 'Courier Prime', monospace, serif" }}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#3c2a1c]/35 pb-1.5 mb-2.5 text-[0.65rem] sm:text-[0.72rem] tracking-widest uppercase font-bold opacity-85">
                      <span>{descData.tag || 'PROJECT DOSSIER'}</span>
                      <span className="text-[#a42028]">{descData.caseNo}</span>
                    </div>

                    <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-wide uppercase text-[#19110b] mb-0.5">
                      {descData.title}
                    </h3>
                    <p className="text-[0.72rem] sm:text-[0.78rem] italic text-[#3d2c1e] mb-3.5">
                      {descData.subtitle}
                    </p>

                    <div className="space-y-3 text-[0.74rem] sm:text-[0.8rem] lg:text-[0.86rem] leading-relaxed text-[#241a12]/95">
                      {descData.lines.map((line, idx) => (
                        <p key={idx} className="flex gap-2 items-start">
                          <span className="text-[#8b2626] font-bold select-none">›</span>
                          <span>{line}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Folder Page Footer with Date, Repo Link & Stamp */}
                  <div className="pt-2.5 border-t border-[#3c2a1c]/30 flex items-center justify-between text-[0.62rem] sm:text-[0.68rem]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold tracking-wider uppercase opacity-80">{descData.date}</span>
                      {descData.repoUrl && (
                        <a
                          href={descData.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7c1d24] underline hover:text-[#a42028] font-bold tracking-wide pointer-events-auto"
                        >
                          VIEW GITHUB REPO ↗
                        </a>
                      )}
                    </div>
                    {descData.stamp && (
                      <span className="px-2 py-0.5 border-2 border-[#a42028]/70 text-[#a42028] font-bold tracking-widest uppercase rotate-[-4deg] text-[0.62rem]">
                        {descData.stamp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Upper Right: Aged Dossier Card displaying Tech Stack — pure slide in with elastic bounce (no fade) */}
            <aside
              onClick={(e) => e.stopPropagation()}
              className={`fixed right-2 sm:right-3 lg:right-4 top-2 sm:top-3 lg:top-4 z-45 select-none will-change-transform ${isCardOpen
                  ? 'pointer-events-auto'
                  : 'pointer-events-none'
                }`}
              style={{
                width: 'min(22vw, 330px)',
                transform: isCardOpen
                  ? 'translate3d(0%, 0%, 0) rotate(1.5deg)'
                  : 'translate3d(140%, -18%, 0) rotate(14deg)',
                transition: isCardOpen
                  ? 'transform 0.78s cubic-bezier(0.34, 1.48, 0.64, 1) 70ms'
                  : 'transform 0.44s cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              }}
              aria-label="Project Tech Stack Card"
            >
              <div className="relative w-full rounded-sm overflow-hidden drop-shadow-[0_18px_36px_rgba(0,0,0,0.75)]">
                {/* Authentic Vintage Parchment Card Artwork with Deckle Edges & Paperclip */}
                <img
                  src={getScrapbookAsset('dossier-card-clean.png')}
                  alt="Aged dossier index card"
                  className="w-full h-auto block select-none pointer-events-none"
                />

                {/* Plain Typewritten Letters Only (Zero boxes, borders, or extra badges) */}
                <div
                  className="absolute inset-0 pt-[16%] px-[12%] pb-[14%] flex flex-col justify-start text-[#241a12] pointer-events-none"
                  style={{ fontFamily: "'Special Elite', 'Courier Prime', monospace, serif" }}
                >
                  <p className="text-[0.72rem] sm:text-[0.78rem] tracking-[0.14em] uppercase font-bold text-[#1c140e] mb-3">
                    TECH STACK
                  </p>

                  {stackData.stack && stackData.stack.length > 0 && (
                    <p className="text-[0.76rem] sm:text-[0.84rem] leading-[1.75] font-bold tracking-wide text-[#241a12]">
                      {stackData.stack.join('  ·  ')}
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </>
        );
      })()}
    </div>
  );
};

export default ScrapbookBoard;
