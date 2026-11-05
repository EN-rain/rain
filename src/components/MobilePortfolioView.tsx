import React, { useState } from 'react';
import { GithubContributionsCard } from './GithubContributionsCard';
import { PROJECTS, ProjectEntry } from './FantasyClipboardWorks';

interface MobilePortfolioViewProps {
  initialSection?: 'home' | 'about' | 'works' | 'contact';
}

type SectionKey = 'home' | 'about' | 'works' | 'contact';

export const MobilePortfolioView: React.FC<MobilePortfolioViewProps> = ({
  initialSection = 'home',
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('studentflow');
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const selectedProject =
    PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0];

  const handleSelectTab = (sec: SectionKey) => {
    setActiveSection(sec);
    if (sec !== 'works') {
      setIsFolderOpen(false);
    }
  };

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setGalleryIndex(0);
    setIsFolderOpen(true);
  };

  const handleCloseFolder = () => {
    setIsFolderOpen(false);
  };

  const handleNextSlide = () => {
    if (!selectedProject.gallery?.length) return;
    setGalleryIndex((prev) => (prev + 1) % selectedProject.gallery!.length);
  };

  const handlePrevSlide = () => {
    if (!selectedProject.gallery?.length) return;
    setGalleryIndex((prev) =>
      prev === 0 ? selectedProject.gallery!.length - 1 : prev - 1
    );
  };

  return (
    <div
      className="md:hidden relative w-full h-[100dvh] overflow-hidden flex flex-col bg-[#0f0b08] select-none text-[#1b140e]"
      style={{
        fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
      }}
    >
      {/* Background Vintage Leather Desk Texture */}
      <img
        src="/assets/dark-backing.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(20,15,10,0.15) 0%, rgba(10,7,5,0.78) 85%)',
        }}
      />

      {/* ============================================================== */}
      {/* TOP DOSSIER TAB NAVIGATION: Clean, non-overlapping hanging tabs */}
      {/* ============================================================== */}
      <header className="relative z-50 shrink-0 w-full px-2 pt-2 pb-1.5 bg-[#140e0a]/90 backdrop-blur-md border-b border-[#3b2a1a]/60 shadow-lg">
        <nav
          aria-label="Mobile Portfolio Navigation"
          className="flex items-center justify-between gap-1 max-w-[420px] mx-auto"
        >
          {(
            [
              { key: 'home', label: 'HOME' },
              { key: 'about', label: 'ABOUT' },
              { key: 'works', label: 'WORKS' },
              { key: 'contact', label: 'CONTACT' },
            ] as const
          ).map((tab) => {
            const isActive = activeSection === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelectTab(tab.key)}
                className={`group relative flex-1 py-1.5 px-1 rounded-sm border-0 cursor-pointer touch-manipulation transition-all duration-200 ${
                  isActive
                    ? 'bg-[#d8c49e] shadow-[0_2px_8px_rgba(0,0,0,0.45)] scale-[1.02]'
                    : 'bg-[#bba47c]/70 hover:bg-[#c9b48b] active:scale-95 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Torn Parchment Tab Texture Overlay */}
                <div className="flex items-center justify-center gap-1.5">
                  {/* Crimson Active Pin */}
                  <span
                    aria-hidden="true"
                    className={`inline-block w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#801b1b] shadow-[0_0_4px_rgba(128,27,27,0.8)] scale-100'
                        : 'bg-transparent scale-0'
                    }`}
                  />
                  <span
                    className={`text-[0.72rem] xs:text-[0.80rem] font-bold tracking-[0.14em] uppercase leading-none transition-colors duration-200 ${
                      isActive ? 'text-[#120a05]' : 'text-[#33251a]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>

                {/* Stamped Underline */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0.5 left-2 right-2 h-[2px] bg-[#801b1b] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT: Fills the entire mobile screen                   */}
      {/* ============================================================== */}
      <main className="relative flex-1 w-full h-full overflow-hidden z-10">
        {/* ============================================================ */}
        {/* VIEW 1: HOME (Vintage Parchment Editorial Document)          */}
        {/* ============================================================ */}
        {activeSection === 'home' && (
          <div className="w-full h-full p-3 xs:p-4 flex flex-col items-center justify-center animate-fadeIn">
            <div
              className="relative w-full max-w-[390px] h-full max-h-[640px] flex flex-col justify-between p-5 rounded-[4px] shadow-[0_12px_36px_rgba(0,0,0,0.85)] border border-[#3b2a1a]/40 bg-[#dfceaa] overflow-hidden"
              style={{
                backgroundImage: 'url(/assets/white-page-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dossier Header Stamp */}
              <div className="flex items-center justify-between border-b border-[#3b2a1a]/30 pb-2">
                <span className="text-[0.68rem] tracking-[0.2em] font-bold uppercase text-[#4d3625]">
                  CASE FILE // 2026-DEV
                </span>
                <span className="text-[0.62rem] tracking-[0.18em] font-extrabold uppercase px-1.5 py-0.5 border border-[#801b1b]/50 text-[#801b1b] rounded-sm">
                  CONFIDENTIAL
                </span>
              </div>

              {/* Center Editorial Statement */}
              <div className="my-auto py-2 text-center flex flex-col items-center">
                <h1
                  className="m-0 font-extrabold uppercase tracking-[0.06em] text-[#140c06] leading-[1.12]"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(24px, 6.4vw, 34px)',
                    textShadow: '0 1px 1px rgba(20, 12, 6, 0.16)',
                  }}
                >
                  “I DON'T JUST WRITE CODE.
                </h1>

                <h1
                  className="m-0 font-extrabold uppercase tracking-[0.06em] text-[#7a1c1c] leading-[1.12] mt-2"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(24px, 6.4vw, 34px)',
                    textShadow: '0 1px 1px rgba(20, 12, 6, 0.16)',
                  }}
                >
                  I BUILD THINGS THAT WORK.”
                </h1>

                <div className="w-12 h-[2px] bg-[#801b1b]/40 my-4" />

                <p
                  className="m-0 text-[#3d2b1f] leading-[1.55] tracking-[0.02em] font-medium text-[0.84rem] xs:text-[0.92rem] max-w-[92%]"
                >
                  “Anything I have to do twice becomes a workflow. Anything that breaks becomes a lesson — preferably someone else’s.”
                </p>
              </div>

              {/* Bottom Dossier Stamp & Portrait Accent */}
              <div className="border-t border-[#3b2a1a]/30 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-sm border border-[#3b2a1a]/40 overflow-hidden shadow-sm bg-[#120a05] shrink-0">
                    <img
                      src="/assets/edrian-portrait-new.png"
                      alt="Edrian Nieves"
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span
                      className="font-extrabold text-[#140c06] uppercase tracking-[0.14em] text-[0.82rem] leading-tight"
                      style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                    >
                      EDRIAN NIEVES
                    </span>
                    <span className="text-[0.66rem] uppercase tracking-[0.1em] text-[#5a4231] font-semibold mt-0.5">
                      Systems Builder &middot; Leon City, PH
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab('works')}
                  className="bg-[#7a1c1c] text-[#f7edd9] border-0 py-1.5 px-3 rounded-sm font-bold uppercase tracking-[0.16em] text-[0.68rem] shadow hover:bg-[#962424] active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  WORKS →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: ABOUT (Full-Length Vertical Personnel Dossier)       */}
        {/* ============================================================ */}
        {activeSection === 'about' && (
          <div className="w-full h-full overflow-y-auto px-3.5 py-3 space-y-3.5 animate-fadeIn">
            {/* Top Identity Card */}
            <div className="relative p-4 rounded-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.65)] border border-[#3b2a1a]/40 bg-[#dfceaa]">
              <div className="flex items-start gap-3.5">
                <div className="relative w-24 h-28 rounded-sm overflow-hidden border-2 border-[#f7eed8] shadow-md bg-[#160f0a] shrink-0">
                  <img
                    src="/assets/edrian-portrait-new.png"
                    alt="Edrian Nieves"
                    className="w-full h-full object-cover"
                  />
                  {/* Scotch Tape Graphic Accent */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-white/40 rotate-[-4deg] shadow-sm backdrop-blur-[1px] pointer-events-none" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2
                      className="m-0 font-extrabold uppercase tracking-[0.14em] text-[#140c06] leading-none"
                      style={{
                        fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                        fontSize: '1.25rem',
                      }}
                    >
                      Edrian Nieves
                    </h2>
                    <p className="m-0 italic text-[#4a3628] font-semibold text-[0.80rem] mt-1">
                      Developer &amp; Systems Builder
                    </p>
                    <span className="inline-block font-mono uppercase text-[#735740] tracking-[0.12em] text-[0.68rem] font-bold mt-1">
                      LEON CITY, PHILIPPINES
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#3b2a1a]/25 flex items-center justify-between">
                    <span className="text-[0.66rem] font-bold tracking-[0.12em] text-[#801b1b] uppercase">
                      STATUS: ACTIVE DISPATCH
                    </span>
                  </div>
                </div>
              </div>

              {/* Live GitHub Contributions Heatmap */}
              <div className="mt-3.5 pt-3 border-t border-[#3b2a1a]/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.68rem] font-bold tracking-[0.16em] uppercase text-[#3b2a1a]">
                    GITHUB FIELD ACTIVITY
                  </span>
                  <a
                    href="https://github.com/EN-rain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.66rem] font-bold tracking-[0.12em] uppercase text-[#7a1c1c] underline"
                  >
                    @EN-rain ↗
                  </a>
                </div>
                <div className="p-2 rounded bg-[#0f0c09] border border-[#3b2a1a]/50 overflow-x-auto">
                  <GithubContributionsCard username="EN-rain" />
                </div>
              </div>
            </div>

            {/* Biography & Engineering Philosophy */}
            <div className="relative p-4 rounded-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.65)] border border-[#3b2a1a]/40 bg-[#dfceaa] space-y-3">
              <div className="flex items-center justify-between border-b border-[#3b2a1a]/30 pb-1.5">
                <span className="text-[0.72rem] font-bold tracking-[0.18em] uppercase text-[#140c06]">
                  BIOGRAPHICAL DOSSIER
                </span>
                <span className="text-[0.66rem] tracking-[0.14em] text-[#6b5240] font-bold uppercase">
                  RECORD NO. 014
                </span>
              </div>

              <div
                className="text-[#2b1f16] leading-[1.6] space-y-2.5 text-[0.86rem]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                <p className="m-0">
                  <span className="float-left font-bold text-[#7a1c1c] leading-[0.8] text-[2.2rem] mr-2 mt-0.5">
                    I
                  </span>
                  ’m a Developer based in Leon City, Philippines. I don’t have a fancy origin story. I got curious about how digital products work, broke something, fixed it, and never stopped. Everything you’ll find here came out of that loop, and it grew into a disciplined focus on engineering reliable tools that solve real operational problems.
                </p>

                <p className="m-0">
                  What keeps me interested is the part after the code runs: whether it’s easy to read, easy to change, and easy to trust. I’d rather spend an extra hour on a clear name or a clean structure than leave a puzzle for whoever opens the project next.
                </p>

                <p className="m-0">
                  I like starting with the question behind the question. What is this supposed to solve, who will use it, and what happens on the day something goes wrong? Once those answers are clear, the rest of the work gets calmer and a lot faster.
                </p>
              </div>

              {/* Tech Stack Breakdown */}
              <div className="pt-3 border-t border-[#3b2a1a]/30 space-y-2">
                <span className="text-[0.70rem] font-bold tracking-[0.18em] uppercase text-[#7a1c1c] block">
                  TECHNICAL ARSENAL &amp; STACK
                </span>

                <div className="space-y-1.5 text-[0.78rem] text-[#241a12] leading-[1.45]">
                  <p className="m-0">
                    <strong className="text-[#120a05]">Languages &amp; Runtimes:</strong> TypeScript, JavaScript (ES6+), PHP 8.2, C# (.NET 8), Java 17, Dart, GDScript, Node.js
                  </p>
                  <p className="m-0">
                    <strong className="text-[#120a05]">Frameworks &amp; Engines:</strong> React, Next.js, Laravel 12, Flutter, Godot 4.6, Three.js, Electron, Tailwind CSS
                  </p>
                  <p className="m-0">
                    <strong className="text-[#120a05]">Databases &amp; Architecture:</strong> MySQL, PostgreSQL, SQLite, Chroma DB, RESTful APIs, WebSockets, MCP
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: WORKS (Clipboard List + Project Folder Modal)        */}
        {/* ============================================================ */}
        {activeSection === 'works' && (
          <div className="w-full h-full p-3 xs:p-4 flex flex-col items-center justify-center animate-fadeIn">
            {/* Clipboard Project List */}
            <div
              className="relative w-full max-w-[390px] h-full max-h-[640px] flex flex-col justify-between p-5 rounded-[4px] shadow-[0_12px_36px_rgba(0,0,0,0.85)] border border-[#3b2a1a]/40 bg-[#dfceaa] overflow-hidden"
              style={{
                backgroundImage: 'url(/assets/clipboard/front-paper.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Clipboard Header */}
              <div className="border-b border-[#3b2a1a]/35 pb-2 text-center">
                <span className="text-[0.66rem] tracking-[0.22em] font-bold uppercase text-[#5a4231] block">
                  EVIDENCE REPOSITORY
                </span>
                <h2
                  className="m-0 font-extrabold uppercase tracking-[0.18em] text-[#160e07] leading-tight mt-0.5"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: '1.45rem',
                  }}
                >
                  PROJECTS
                </h2>
              </div>

              {/* 6 Ruled Project Rows */}
              <div className="my-auto py-2 flex flex-col space-y-1">
                {PROJECTS.map((proj) => {
                  const isSelected = proj.id === selectedProjectId;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleOpenProject(proj.id)}
                      className={`w-full flex items-center justify-between py-2 px-2.5 rounded border-0 cursor-pointer text-left transition-all duration-150 touch-manipulation ${
                        isSelected
                          ? 'bg-[#1c120a] text-[#f2e6cb] shadow-sm'
                          : 'bg-transparent text-[#261910] hover:bg-[#3b2a1a]/10 active:scale-98'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#801b1b] font-bold">–</span>
                        <span className="font-bold tracking-[0.06em] text-[0.88rem]">
                          {proj.title}
                        </span>
                      </div>
                      <span
                        className={`text-[0.68rem] font-bold tracking-[0.1em] uppercase ${
                          isSelected ? 'text-[#c7af80]' : 'text-[#5a4231]'
                        }`}
                      >
                        {proj.date}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Prompt */}
              <div className="border-t border-[#3b2a1a]/30 pt-2.5 flex items-center justify-between">
                <span className="text-[0.68rem] text-[#4d3625] italic">
                  Tap any project row to inspect dossier
                </span>
                <button
                  type="button"
                  onClick={() => setIsFolderOpen(true)}
                  className="bg-[#7a1c1c] text-[#f7edd9] border-0 py-1.5 px-3 rounded-sm font-bold uppercase tracking-[0.14em] text-[0.68rem] shadow hover:bg-[#962424] active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  OPEN →
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PROJECT CASE FOLDER MODAL: Tailored Mobile Presentation  */}
            {/* ======================================================== */}
            {isFolderOpen && (
              <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm p-3 flex flex-col justify-center items-center animate-fadeIn">
                <div
                  className="relative w-full max-w-[420px] max-h-[92dvh] flex flex-col rounded-[6px] shadow-[0_16px_48px_rgba(0,0,0,0.95)] border-2 border-[#543d26] bg-[#dcc9a4] overflow-hidden"
                  style={{
                    backgroundImage: 'url(/assets/white-page-bg.png)',
                    backgroundSize: 'cover',
                  }}
                >
                  {/* Folder Top Banner */}
                  <div className="flex items-center justify-between p-3 border-b border-[#3b2a1a]/35 bg-[#cfb98f]/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                      {selectedProject.icon && (
                        <img
                          src={selectedProject.icon}
                          alt=""
                          className="w-8 h-8 rounded object-contain bg-white p-0.5 border border-[#3b2a1a]/30 shadow-sm shrink-0"
                        />
                      )}
                      <div>
                        <h3
                          className="m-0 font-extrabold uppercase tracking-[0.12em] text-[#160e07] leading-tight text-[1.05rem]"
                          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                        >
                          {selectedProject.title}
                        </h3>
                        <span className="text-[0.64rem] font-bold tracking-[0.1em] uppercase text-[#5c432b] block mt-0.5">
                          {selectedProject.date}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseFolder}
                      aria-label="Close dossier"
                      className="bg-transparent border-0 p-1 text-[#1e140b] hover:text-[#8b1a1a] text-[1.4rem] font-extrabold cursor-pointer active:scale-95 touch-manipulation"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Media Section: Video Player or Interactive Carousel */}
                  <div className="relative w-full h-[195px] bg-[#0c0805] overflow-hidden shrink-0 border-b border-[#3b2a1a]/30">
                    {selectedProject.gallery?.length ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={selectedProject.gallery[galleryIndex]}
                          alt={`${selectedProject.title} screenshot ${galleryIndex + 1}`}
                          className="w-full h-full object-contain select-none"
                        />

                        {/* Prev Button */}
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          aria-label="Previous slide"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center border border-white/20 text-sm cursor-pointer active:scale-90"
                        >
                          ‹
                        </button>

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          aria-label="Next slide"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center border border-white/20 text-sm cursor-pointer active:scale-90"
                        >
                          ›
                        </button>

                        {/* Slide Indicator */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/70 px-2 py-0.5 rounded-full text-[0.62rem] text-white/90 font-mono">
                          {galleryIndex + 1} / {selectedProject.gallery.length}
                        </div>
                      </div>
                    ) : selectedProject.videoUrl ? (
                      <video
                        key={selectedProject.videoUrl}
                        src={selectedProject.videoUrl}
                        poster={selectedProject.image}
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-cover select-none"
                      />
                    ) : (
                      <img
                        src={selectedProject.image}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Description Section (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-[#24170d] text-[0.82rem] leading-[1.52]">
                    <div className="flex items-center gap-2 border-b border-[#3b2a1a]/25 pb-1">
                      <span className="font-extrabold uppercase tracking-[0.16em] text-[#140c06] text-[0.72rem]">
                        OPERATIONAL SUMMARY
                      </span>
                    </div>

                    <p className="m-0 font-medium">
                      {selectedProject.description}
                    </p>

                    {selectedProject.detailedDescription?.map((para, i) => (
                      <p key={i} className="m-0 text-[#2b1e14]">
                        {para}
                      </p>
                    ))}

                    <div className="pt-2 border-t border-[#3b2a1a]/25">
                      <span className="font-bold text-[0.68rem] tracking-[0.14em] uppercase text-[#7a1c1c] block mb-1">
                        TECHNOLOGIES EMPLOYED
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[0.64rem] font-bold px-1.5 py-0.5 rounded bg-[#3b2a1a]/15 text-[#1a1109]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Folder Footer Action Buttons */}
                  <div className="p-3 border-t border-[#3b2a1a]/35 bg-[#cfb98f]/80 flex items-center justify-between shrink-0">
                    <button
                      type="button"
                      onClick={handleCloseFolder}
                      className="bg-transparent border-0 font-extrabold uppercase tracking-[0.14em] text-[#6e1717] hover:text-[#9e2222] text-[0.82rem] cursor-pointer underline touch-manipulation"
                    >
                      ← Back to List
                    </button>

                    <a
                      href={selectedProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#7a1c1c] text-[#f7edd9] py-1.5 px-3.5 rounded font-extrabold uppercase tracking-[0.16em] text-[0.72rem] shadow hover:bg-[#962424] active:scale-95 transition-all touch-manipulation no-underline"
                    >
                      GitHub ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: CONTACTS (Detective Case Scrapbook Board)            */}
        {/* ============================================================ */}
        {activeSection === 'contact' && (
          <div className="w-full h-full p-3.5 overflow-y-auto space-y-3.5 flex flex-col items-center justify-center animate-fadeIn">
            <div
              className="relative w-full max-w-[390px] p-5 rounded-[6px] shadow-[0_12px_36px_rgba(0,0,0,0.85)] border-2 border-[#45311e] bg-[#bf9862] text-[#18110a]"
              style={{
                backgroundImage: 'url(/assets/scrapbook/board-standalone.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Pushpin Graphic Accent */}
              <div className="flex justify-center -mt-3 mb-2">
                <img
                  src="/assets/scrapbook/pin-red-3d.png"
                  alt=""
                  className="w-6 h-6 object-contain drop-shadow-md select-none pointer-events-none"
                />
              </div>

              {/* Pinned Case File Header */}
              <div className="bg-[#f7ebd4] p-4 rounded shadow-md border border-[#3b2a1a]/30 space-y-3 rotate-[-0.8deg]">
                <div className="border-b border-[#3b2a1a]/30 pb-2 text-center">
                  <span className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-[#7a1c1c] block">
                    DIRECT COMMUNIQUE
                  </span>
                  <h2
                    className="m-0 font-extrabold uppercase tracking-[0.16em] text-[#140c06] leading-tight mt-0.5"
                    style={{
                      fontFamily: "'Cinzel', Georgia, serif",
                      fontSize: '1.35rem',
                    }}
                  >
                    CONTACTS
                  </h2>
                </div>

                <p className="m-0 text-[0.84rem] text-[#2e2015] leading-[1.5] text-center">
                  Looking for a systems builder, full-stack engineer, or want to discuss an operational problem? Dispatch a message below.
                </p>

                {/* Contact Rows */}
                <div className="space-y-2 pt-1">
                  <a
                    href="mailto:edriannieves@gmail.com"
                    className="flex items-center justify-between p-2.5 rounded bg-[#3b2a1a]/10 hover:bg-[#3b2a1a]/20 text-[#140c06] no-underline font-bold text-[0.82rem] transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span>✉</span>
                      <span>Email</span>
                    </span>
                    <span className="text-[0.74rem] text-[#7a1c1c] underline">
                      edriannieves@gmail.com
                    </span>
                  </a>

                  <a
                    href="https://github.com/EN-rain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded bg-[#3b2a1a]/10 hover:bg-[#3b2a1a]/20 text-[#140c06] no-underline font-bold text-[0.82rem] transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span>⌨</span>
                      <span>GitHub</span>
                    </span>
                    <span className="text-[0.74rem] text-[#7a1c1c] underline">
                      @EN-rain ↗
                    </span>
                  </a>

                  <div className="flex items-center justify-between p-2.5 rounded bg-[#3b2a1a]/10 text-[#140c06] font-bold text-[0.82rem]">
                    <span className="flex items-center gap-2">
                      <span>📍</span>
                      <span>Location</span>
                    </span>
                    <span className="text-[0.74rem] text-[#523b28]">
                      Leon City, Philippines
                    </span>
                  </div>
                </div>

                {/* Status Footnote */}
                <div className="pt-2 border-t border-[#3b2a1a]/20 text-center">
                  <span className="text-[0.66rem] font-bold tracking-[0.14em] uppercase text-[#7a1c1c]">
                    ● AVAILABLE FOR TECHNICAL COLLABORATIONS
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MobilePortfolioView;
