import { useRef, useState, useEffect, memo, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Blocks, Database, Server, Workflow, AudioLines, Bot, Brain, Gamepad2, MessageSquareMore, Mic, Puzzle, Github, ExternalLink, Award } from 'lucide-react';
import { useMobileReveal } from '../../hooks/useMobileReveal';
import { experience, projects } from '../../data/works';
import architectureFlowchart from '../../assets/images/architecture-flowchart.png';
import multiplayerFlowchart from '../../assets/images/multiplayer-flowchart.png';
import awardImg from '../../assets/images/award.png';
import projectLogoPlaceholder from '../../assets/images/icon.jpg';

const PROJECT_ABOUT: Record<string, { description: string; keyFeatures: string[] }> = {
  '01': {
    description: 'CHEMQuest is a chemistry learning adventure that turns core lessons into hands-on play. Instead of relying only on reading and memorization, players explore important chemistry topics through puzzles, action-based challenges, and interactive activities designed to make difficult ideas easier to grasp.\n\nBuilt for students studying introductory chemistry, the game focuses on essential lessons such as matter, measurements, stoichiometry, atoms, and gases. Each topic is taught through a different style of play, giving players a more active way to practice concepts, solve problems, and build confidence as they progress.\n\nDesigned for offline use on Android, CHEMQuest makes learning accessible anywhere without needing an internet connection. It is made for students who want a more engaging way to review chemistry, strengthen understanding, and turn study time into something more interactive and enjoyable.',
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
    description: 'TsukiAI is a real-time voice companion for Windows that lets you talk naturally and get spoken responses back with low friction. It listens, understands, replies, and speaks through a full live voice pipeline built for continuous conversation rather than one-off prompts.\n\nRun it locally on your desktop, connect it to different AI providers, and choose between local or cloud speech services depending on how you want it to behave. It is built to stay responsive during live use, keep track of conversation flow, remember useful past context, and recover cleanly when a provider fails.\n\nTsukiAI also works beyond the desktop. With its Discord voice bridge, it can join voice channels, listen for spoken turns, process them through the same conversation pipeline, and speak back into the channel. That makes it useful both as a personal desktop companion and as a voice runtime for shared online spaces.\n\nA built-in local API opens the system up for integrations, testing, and external tooling. Speech recognition, text processing, voice generation, health checks, and memory features can all be accessed as services, making TsukiAI more than just a standalone app.',
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
    description: 'Enter a fast-paced co-op action RPG where every run is shaped by your class, your build, and your team.\n\nChoose from distinct class paths, unlock specialized roles, and shape your own fighting style through a wide mix of active skills, passives, and progression choices. Build for raw damage, frontline defense, battlefield control, support, or hybrid play, then adapt your setup as the run grows harder.\n\nFight through escalating rounds of enemies that become more dangerous, more capable, and more demanding as the battle goes on. Success is not just about surviving longer, but learning how to combine your strengths with the rest of the party. Team composition, timing, and coordination matter.\n\nAt the center of the challenge is a boss encounter built around adaptation and counterplay. The boss is designed to respond to player patterns, punish predictable behavior, and force the team to change tactics on the fly. Winning means reading the fight, adjusting your approach, and working together under pressure.\n\nProgression carries beyond a single match. Your class growth, build development, and overall advancement are saved through the cloud, giving you room to experiment, refine strategies, and return stronger for the next run.\n\nPlay solo or squad up with others, form a party, chat during the run, and coordinate through voice communication as you push deeper into increasingly intense encounters.',
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
    description: 'Type Duel is a competitive 2D pixel typing duel built with Godot and a Node.js backend. Players register or log in, enter matchmaking or custom rooms, choose a character loadout, then fight through round-based typing battles where speed, accuracy, mana, active skills, and passive effects decide the winner.\n\nThe MVP includes a full lobby and match loop: character selection, skill selection, typing phases, combat resolution, HP sync, rematches, match history, leaderboards, friends, chat, online presence, profile updates, and feedback submission.\n\nThe backend uses REST routes for account, lobby, room, social, chat, and game flows, while real-time match state is synchronized through Socket.IO and WebSocket events. Persistent data such as users, leaderboard records, chat messages, friends, and match history is stored in SQLite.',
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
    description: 'CSCprep is a Civil Service Exam reviewer web app built to help users practice for the Philippine Civil Service Examination through interactive, exam-style sessions. Instead of studying from static reviewers only, users can answer randomized exams, subject-focused tests, and fixed CSC 11-based exams directly in the browser.\n\nThe app covers major exam areas including Verbal Reasoning, Numerical Reasoning, Analytical Ability, Filipino, and General Information. Questions are loaded from local JSON question banks, with support for image-based items, shuffled choices, hints, explanations, and answer review after submission.\n\nCSCprep is designed for focused self-review. It tracks answered questions, saves exam attempts, supports timed practice, warns users about skipped items, and lets users review correct and wrong answers after each session. Progress and in-progress exams are saved locally, so users can continue without losing their work.',
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
    description: 'StudentFlow is a comprehensive student and classroom management platform designed to streamline daily academic workflows for teachers and administrators while providing an accessible mobile experience for students. Built with a robust Laravel 11 backend and a native Java Android client, the system simplifies school administration, grading, attendance tracking, and communication.\n\nThe web dashboard allows administrators to oversee teacher accounts, audit system activity logs, and configure settings, while teachers can manage classes, record grades across weighted categories, and publish announcements with automated email notifications. For students, the platform offers a dedicated portal supporting social login (Google and GitHub) and interactive exam taking, both on the web and through the mobile app.\n\nDesigned with mobility and reliability in mind, StudentFlow\'s Android application is built using native Java, Retrofit, and Material Design components, enabling teachers and students to view profiles, track attendance, submit assignments, and review reports on the go.',
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
    description: 'PocketTrade is a comprehensive mobile and web-based marketplace platform designed to streamline peer-to-peer used phone trading for buyers and sellers while providing an administrative moderation system. Built with a robust NestJS backend, a React admin web app, and a Flutter mobile client, the system simplifies listing creation, real-time messaging, and platform administration.\n\nThe web dashboard allows administrators to manage listings, suspend user accounts, review community reports, and view search analytics, while users can publish pre-owned devices, upload photos, and update listing statuses. For buyers, the platform offers an intuitive search interface with custom filters, listing favoriting, and direct negotiation with sellers.\n\nDesigned with mobility and real-time connectivity in mind, PocketTrade\'s mobile application is built using Flutter, GoRouter, Riverpod, and Socket.IO, enabling users to browse listings, receive instant push notifications via Firebase Cloud Messaging, manage conversations, and report or block users on the go.',
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
    description: 'Cache Me Outside is a newspaper-style digital archive that revisits selected internet moments from 2020 through a structured month-and-day timeline.\n\nThe project uses an editorial workspace to prepare, review, and preview entries before they become part of the public collection.\n\nIt is designed as a curated time capsule rather than an open feed, giving each entry a consistent editorial layout and a clear place in the year.',
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
  GDScript: Puzzle,
  Mobile: Gamepad2,
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
  Vite: Blocks,
  'Vercel API': Server,
  'Local Storage': Database,
  'Laravel 11': Server,
  'PHP 8.2+': Server,
  'Android (Java)': Gamepad2,
  'SQLite / MySQL': Database,
  'Bootstrap 5': Blocks,
  'REST API (JSON)': Workflow,
  'NestJS (Node.js)': Server,
  'Flutter (Dart)': Gamepad2,
  'React 19 (Tailwind CSS)': Blocks,
  'PostgreSQL / Prisma': Database,
  'Socket.IO / REST API': Workflow,
} as const;

export const WorksSection = memo(() => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [enOpacity, setEnOpacity] = useState(0);
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

  useEffect(() => {
    const handleEnReveal = (e: CustomEvent) => {
      if (e.detail.opacity !== undefined) {
        setEnOpacity(e.detail.opacity);
      } else {
        setEnOpacity(e.detail.visible ? 1 : 0);
      }
    };
    window.addEventListener('en-reveal', handleEnReveal as EventListener);
    return () => window.removeEventListener('en-reveal', handleEnReveal as EventListener);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (oozeborneShowFlowchart) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
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
        y: e.clientY - dragStart.y
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
      window.dispatchEvent(new CustomEvent('portfolio-navigate', { detail: { path, projectTransition: true } }));
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
    <section id="works" className="stack-section mask-shaped-section works-combined-section" style={{ zIndex: 140, '--mask-color': '#6c2bd9' } as CSSProperties}>
      <div className="clip-gap-outer parallax-content h-full w-full">
        <div className="clip-gap-inner absolute inset-0 bg-black overflow-hidden">
          <div ref={scrollContainerRef} className={`works-scroll-container h-full w-full overflow-y-auto overflow-x-hidden locked-content bg-black flex flex-col ${isProjectsNavigating ? 'works-projects-leaving' : ''}`}>

            {/* Experience Part */}
            <div ref={experienceRef} className="experience-part relative min-h-screen w-full flex flex-col justify-center px-5 md:px-12 flex-shrink-0">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080">
                  <ellipse cx="350" cy="400" rx="280" ry="180" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
                  <ellipse cx="1550" cy="650" rx="320" ry="200" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0.3" />
                </svg>
              </div>
              <div className="relative z-10 w-full max-w-none">
                <motion.div
                  className="experience-header mb-4 md:mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="heading-font text-[22px] font-bold leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
                    WORK <span className="text-[#7c3aed] whitespace-nowrap">EXPERI<span data-en-target="experience-en" className="text-white" style={{ opacity: enOpacity }}>EN</span>CE</span>
                  </h2>
                </motion.div>
                <div className="space-y-6">
                  {experience.map((item, index) => (
                    <motion.div
                      key={item.role}
                      className="group relative rounded-[20px] border border-white/10 bg-white/10 p-6 transition-all duration-500 md:p-8"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="tech-font mb-2 text-sm font-bold text-[#7c3aed]">{item.year}</div>
                          <h3 className="text-2xl font-semibold text-white md:text-3xl">{item.role}</h3>
                          <div className="tech-font mt-1 text-[11px] uppercase tracking-wider text-white/50">{item.place}</div>
                          <p className="mt-4 max-w-none text-[14px] leading-relaxed text-white/70 whitespace-pre-line">{item.summary}</p>
                          <div className="mt-6 flex flex-wrap gap-4">
                            {item.highlights.map((tag) => {
                              const Icon = highlightIcons[tag as keyof typeof highlightIcons];
                              return (
                                <span key={tag} className="tech-font flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/60">
                                  <Icon size={14} /> {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Part */}
            <div ref={projectsRef} data-works-projects-start className="projects-wrapper relative min-h-screen w-full flex-shrink-0 overflow-visible mb-[80px]">
              <div className="projects-part relative min-h-screen flex flex-col justify-center px-5 md:px-12 w-full max-w-full">

                {/* Projects Header */}
                <motion.div
                  className="relative z-10 w-full max-w-none mb-8 md:mb-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="heading-font text-[22px] font-bold leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl uppercase">
                    PERSONAL <span className="text-[#7c3aed] whitespace-nowrap">PROJE<span data-en-target="projects-ct" className="text-white transition-opacity duration-0" style={{ opacity: enOpacity }}>CT</span>S</span>
                  </h2>
                </motion.div>

                {/* Projects Grid */}
                <div className="relative z-10 w-full max-w-none">
                  <div className="projects-grid">
                    {projects.slice(-2).map((project, index) => (
                      <motion.div
                        key={project.id}
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
                        className="project-card group cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          scale: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                        }}
                      >
                        <div className="project-card-media">
                          <div className="project-card-image">
                            {project.img ? (
                              <img
                                src={project.img}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
                                {project.status && (
                                  <span className="heading-font text-[14px] md:text-[18px] tracking-[0.15em] text-white/10 uppercase">{project.status}</span>
                                )}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            {project.id === '01' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="tech-font text-[10px] md:text-[11px] uppercase tracking-widest text-white text-center px-3 py-1.5 rounded-full bg-black shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
                                  Best Capstone Award
                                </div>
                              </div>
                            )}
                          </div>
                          <img
                            src={project.icon ?? projectLogoPlaceholder}
                            alt=""
                            aria-hidden="true"
                            className="project-card-logo"
                          />
                        </div>
                        <div className="project-card-info">
                          <div className="tech-font text-[13px] font-bold text-[#7c3aed] mb-1">{project.year}</div>
                          <div className="flex flex-wrap justify-center gap-2">
                            <h3 className="heading-font text-xl md:text-2xl font-bold text-white leading-tight">{project.title}</h3>
                          </div>
                          <p className="heading-font text-[11px] text-white/55 uppercase tracking-wider mt-1">{project.line2}</p>
                          <p className="mt-6 text-[13px] leading-relaxed text-white/65">{project.des}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {projects.length > 2 && (
                    <div className="mt-6 flex flex-col items-center">
                      <a
                        href="/projects"
                        onClick={(event) => {
                          event.preventDefault();
                          navigateFromWorks('/projects');
                        }}
                        className="tech-font inline-flex min-h-11 items-center border border-white/10 bg-black px-3 text-[11px] uppercase tracking-widest text-white transition-colors hover:border-[#7c3aed]"
                      >
                        Show More Projects
                      </a>
                      <span aria-hidden="true" className="mt-2 text-3xl leading-none text-white/65">⌄</span>
                    </div>
                  )}
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .works-scroll-container::-webkit-scrollbar { display: none; }
        .works-scroll-container { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; overscroll-behavior-y: contain; }
        .works-scroll-container .experience-part,
        .works-scroll-container .projects-wrapper {
          transition: opacity 260ms ease, transform 260ms ease;
        }
        .works-scroll-container.works-projects-leaving .experience-part,
        .works-scroll-container.works-projects-leaving .projects-wrapper {
          opacity: 0;
          transform: translateY(-16px);
          pointer-events: none;
        }
        .projects-part { width: 100%; }

        /* ── Project Grid ── */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        /* ── Project Card ── */
        .project-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          transition: border-color 0.4s ease;
        }
        .project-card:hover {
          border-color: rgba(124, 58, 237, 0.4);
        }
        .project-card-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 7;
          overflow: visible;
        }
        .project-card-image {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .project-card-logo {
          position: absolute;
          left: 50%;
          bottom: 0;
          z-index: 10;
          width: 120px;
          height: 120px;
          transform: translate(-50%, 50%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          object-fit: cover;
        }
        .project-card-info {
          padding: 80px 24px 24px;
          text-align: center;
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

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .works-scroll-container {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            background: #000000 !important;
            padding: 60px 0 20px !important;
            overflow: visible !important;
          }
          .projects-part, .projects-wrapper {
            position: relative !important;
            padding: 30px 24px 40px !important;
            display: block !important;
            width: 100% !important;
          }
          .experience-part {
            padding: 20px 24px 40px !important;
            min-height: auto !important;
          }
          .experience-header h2, .projects-part h2 {
            font-size: 34px !important;
            margin-bottom: 12px !important;
            line-height: 1.2 !important;
            letter-spacing: -0.03em !important;
            white-space: normal !important;
            text-align: center !important;
          }
          .experience-header, .projects-part .max-w-7xl {
            margin-bottom: 10px !important;
            text-align: center !important;
          }
          .projects-grid {
            grid-template-columns: 1fr;
            gap: 16px;
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
          {selectedId && (() => {
            const proj = projects.find(p => p.id === selectedId);
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
                      <div className="tech-font text-[13px] font-bold text-[#7c3aed] mb-1">{proj.year}</div>
                      <div className="flex items-center gap-3">
                        <h3 className="heading-font text-3xl md:text-4xl font-bold text-white leading-tight">
                          {proj.title}
                        </h3>
                        {proj.id === '01' && (
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setChemQuestShowImage(v => !v)}
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
                      <p className="heading-font text-[11px] text-[#7c3aed]/70 uppercase tracking-widest mt-1">{proj.line2}</p>
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
                                onClick={e => e.stopPropagation()}
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
                          {proj.links.map(link => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tech-font flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50 hover:text-[#7c3aed] transition-colors"
                            >
                              {link.type === 'github' ? <Github size={13} /> : link.type === 'live' ? <ExternalLink size={13} /> : <ExternalLink size={13} />}
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    <div className="project-expanded-image">
                      {proj.img ? (
                        <img src={proj.img} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
                          {proj.status && (
                            <span className="heading-font text-[28px] tracking-[0.22em] text-white/10 uppercase">{proj.status}</span>
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>

                    {/* Tech stack — below image */}
                    <div className="px-5 md:px-6 pt-4">
                      <div className="flex flex-wrap gap-3">
                        {proj.stack.map(s => {
                          const Icon = stackIcons[s as keyof typeof stackIcons] ?? Puzzle;
                          return (
                            <span key={s} className="tech-font flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/60">
                              <Icon size={13} />{s}
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
                              setOozeborneShowFlowchart(v => !v);
                              setZoom(1);
                              setPan({ x: 0, y: 0 });
                            }}
                            className={`tech-font rounded-full px-4 py-2 text-[10px] uppercase tracking-widest transition-colors border ${oozeborneShowFlowchart
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
                                  onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
                                  className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-[#7c3aed] transition-colors"
                                  title="Zoom In"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))}
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
                            <h4 className="heading-font text-[14px] md:text-[16px] font-bold text-white mb-3">About This Project</h4>
                            <p className="text-white/70 text-[12px] md:text-[13px] leading-relaxed font-light whitespace-pre-line mb-5">
                              {about.description}
                            </p>
                            <h5 className="heading-font text-[12px] md:text-[14px] font-bold text-[#7c3aed] mb-3">Key Features</h5>
                            <ul className="space-y-2">
                              {about.keyFeatures.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-white/60 text-[11px] md:text-[12px] leading-relaxed">
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
                            onClick={() => setTsukiShowFlowchart(v => !v)}
                            className={`tech-font rounded-full px-4 py-2 text-[10px] uppercase tracking-widest transition-colors border ${tsukiShowFlowchart
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
                    transition={{ duration: 2.5, times: [0, 0.2, 0.7, 1], delay: 0.6, ease: 'easeOut' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
