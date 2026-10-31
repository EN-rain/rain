import React from 'react';
import '../styles/page-one-half.css';

interface PageOneHalfProps {
  assetsPath: string;
  isAssembled?: boolean;
  onBack: () => void;
  onNext: () => void;
}

const SKILL_GROUPS = [
  {
    index: '01',
    label: 'Frontend & Mobile',
    sub: 'UI & Client Systems',
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'HTML5 & CSS3',
      'Bootstrap',
      'Blade',
      'Flutter',
      'Dart',
      'Java',
    ],
  },
  {
    index: '02',
    label: 'Backend & Data',
    sub: 'APIs & Persistence',
    skills: [
      'Laravel 12',
      'PHP 8.2',
      'Node.js',
      'Express.js',
      'NestJS',
      'REST APIs',
      'Prisma',
      'Socket.IO',
      'PostgreSQL',
      'Supabase',
      'Firebase',
      'SQLite',
      'Redis',
    ],
  },
  {
    index: '03',
    label: 'AI, Desktop & Ops',
    sub: 'Tooling & Security',
    skills: [
      '.NET 8 & WPF',
      'C#',
      'Godot 4.6',
      'MCP SDK',
      'ChromaDB',
      'VOICEVOX',
      'Docker',
      'Git & GitHub',
      'Vercel & Render',
      'Cloudinary',
      'Sanctum & JWT',
      'RBAC & 2FA',
    ],
  },
];

const EXPERIENCE_HIGHLIGHTS = [
  {
    code: '01',
    title: 'React & 2FA Dashboards',
    detail: '2 full-stack admin systems with 2FA & RBAC',
  },
  {
    code: '02',
    title: 'Node.js API Architecture',
    detail: '15+ REST endpoints & email-to-CSV automation',
  },
  {
    code: '03',
    title: 'Supabase & PostgreSQL',
    detail: 'Relational data modeling with Row-Level Security',
  },
  {
    code: '04',
    title: 'Client Web Production',
    detail: '4 responsive client sites shipped end-to-end',
  },
];

export const PageOneHalf: React.FC<PageOneHalfProps> = ({
  assetsPath,
  isAssembled = false,
  onBack,
  onNext,
}) => {
  return (
    <div
      className={`page-half ${isAssembled ? 'is-assembled' : 'is-scattered'}`}
      data-settled={isAssembled ? 'true' : 'false'}
      aria-label="Edrian Nieves Personnel Dossier — About Me"
    >
      <div className="page-half-layout">
        {/* ============================================================ */}
        {/* 1. Angled Backing Sheet (01-backing.png)                     */}
        {/* ============================================================ */}
        <div className="page-half-layer page-half-backing">
          <img
            src={`${assetsPath}/page-one-half/01-backing.png`}
            alt=""
            decoding="async"
            draggable={false}
            className="page-half-img page-half-idle-backing"
          />
        </div>

        {/* ============================================================ */}
        {/* 2. Main Open Two-Page Dossier Spread (02-spread.png)         */}
        {/* ============================================================ */}
        <div
          className="page-half-layer page-half-spread"
          style={{ containerType: 'size' }}
        >
          <img
            src={`${assetsPath}/page-one-half/02-spread.png`}
            alt=""
            decoding="async"
            draggable={false}
            className="page-half-img page-half-idle-spread"
          />

          {/* Left Margin Vertical Classification Index next to black stripe */}
          <div
            className="dossier-inscribed-content absolute select-none pointer-events-none flex flex-col justify-between text-[#1f1c18]"
            style={{
              left: '8.2%',
              top: '11%',
              width: '5.5%',
              height: '52%',
              fontFamily: "'IBM Plex Mono', 'Courier Prime', monospace",
            }}
          >
            <div
              className="uppercase tracking-[0.22em] font-semibold text-[#2b2520]/80"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: 'clamp(7.5px, 1.25cqh, 11px)',
              }}
            >
              PERSONNEL FILE — EN-2026 · ILOILO, PH
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. Dark Backing Square Accent (04-black-card-square.png)     */}
        {/* ============================================================ */}
        <div className="page-half-layer page-half-black-card">
          <img
            src={`${assetsPath}/page-one-half/04-black-card-square.png`}
            alt=""
            decoding="async"
            draggable={false}
            className="page-half-img page-half-idle-black-card"
          />
        </div>

        {/* ============================================================ */}
        {/* 4. Left Page Taped Picture Frame (03-large-card.png):        */}
        {/*    Purely a Portrait Picture Inside the Taped Frame          */}
        {/* ============================================================ */}
        <div
          className="page-half-layer page-half-large-card"
          style={{ containerType: 'size' }}
        >
          <div className="relative w-full h-full page-half-idle-large-card">
            {/* Base Picture Frame Artwork */}
            <img
              src={`${assetsPath}/page-one-half/03-large-card.png`}
              alt=""
              decoding="async"
              draggable={false}
              className="page-half-img relative z-[1]"
            />

            {/* Full-Bleed Portrait Inside the Frame Border (Just a Picture, Zero Text) */}
            <div
              className="dossier-inscribed-content absolute overflow-hidden bg-[#141210] shadow-[inset_0_2px_12px_rgba(0,0,0,0.45)] select-none pointer-events-none"
              style={{
                left: '13.2%',
                top: '13.3%',
                width: '76%',
                height: '75.8%',
                transform: 'rotate(-1.5deg)',
                zIndex: 2,
              }}
            >
              <img
                src={`${assetsPath}/edrian-about.png`}
                alt="Edrian Nieves"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                style={{
                  filter: 'sepia(0.12) contrast(1.05) brightness(0.97)',
                }}
              />
            </div>

            {/* Top-Left Translucent Tape Strip Restored Over the Photo Corner */}
            <img
              src={`${assetsPath}/page-one-half/03-large-card.png`}
              alt=""
              decoding="async"
              draggable={false}
              className="page-half-img absolute inset-0 z-[3] pointer-events-none select-none"
              style={{
                clipPath: 'polygon(3.5% 22.3%, 27.5% 9.7%, 32.8% 14.1%, 8.8% 26.8%)',
                opacity: 0.82,
              }}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. Right Page Manuscript Sheet (06-paper.png):               */}
        {/*    High-Craft Editorial Dossier Layout                       */}
        {/* ============================================================ */}
        <div
          className="page-half-layer page-half-paper"
          style={{
            containerType: 'size',
            pointerEvents: isAssembled ? 'auto' : 'none',
          }}
        >
          <div className="relative w-full h-full page-half-idle-paper">
            <img
              src={`${assetsPath}/page-one-half/06-paper.png`}
              alt=""
              decoding="async"
              draggable={false}
              className="page-half-img"
            />

            {/* Inscribed Editorial Dossier on Right Manuscript */}
            <div
              className="dossier-inscribed-content absolute flex flex-col justify-between text-[#18130e] select-none"
              style={{
                left: '9.2%',
                right: '9.2%',
                top: '6.6%',
                bottom: '6.6%',
                fontFamily: "'Source Serif 4', Georgia, serif",
                pointerEvents: isAssembled ? 'auto' : 'none',
              }}
            >
              {/* 1. EDITORIAL MASTHEAD */}
              <header className="shrink-0">
                {/* Top Archival Metadata Bar */}
                <div
                  className="flex items-center justify-between pb-[0.45cqh] border-b-2 border-[#1b140e]"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 'clamp(6.5px, 1.12cqh, 10px)',
                  }}
                >
                  <span className="uppercase tracking-[0.2em] text-[#7a1c1c] font-semibold">
                    SECTION I — BIOGRAPHICAL DOSSIER
                  </span>
                  <span className="uppercase tracking-[0.16em] text-[#3d2f22] font-medium tabular-nums">
                    LEON CITY, ILOILO · PH
                  </span>
                </div>

                {/* Secondary Thin Hairline Rule + Name & Stamp Block */}
                <div className="border-t border-[#1b140e]/35 mt-[2px] pt-[0.8cqh] pb-[0.85cqh] border-b border-[#1b140e]/30 flex items-end justify-between gap-[2cqw]">
                  <div className="min-w-0">
                    <h2
                      className="m-0 font-extrabold uppercase tracking-[0.04em] text-[#120d09] leading-[0.95]"
                      style={{
                        fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                        fontSize: 'clamp(18px, 3.85cqh, 34px)',
                      }}
                    >
                      Edrian Nieves
                    </h2>
                    <p
                      className="m-0 italic text-[#3b2c20] font-semibold tracking-[0.01em] mt-[0.35cqh]"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 'clamp(8.5px, 1.55cqh, 13.5px)',
                      }}
                    >
                      Full-Stack Developer &amp; Systems Builder
                    </p>
                  </div>

                  {/* Archival Index Stamp */}
                  <div
                    className="shrink-0 border border-[#7a1c1c]/55 px-[1.3cqw] py-[0.35cqh] text-right bg-[#7a1c1c]/[0.03]"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <div
                      className="uppercase tracking-[0.18em] text-[#7a1c1c] font-bold leading-tight"
                      style={{ fontSize: 'clamp(6px, 0.98cqh, 8.5px)' }}
                    >
                      DOSSIER NO. 01
                    </div>
                    <div
                      className="uppercase tracking-[0.12em] text-[#2b2017] font-semibold leading-tight mt-[0.15cqh]"
                      style={{ fontSize: 'clamp(6px, 1.02cqh, 9px)' }}
                    >
                      FULL-STACK · AI
                    </div>
                  </div>
                </div>
              </header>

              {/* 2. BIOGRAPHICAL PROSE (Editorial Serif with Classic Drop Cap) */}
              <section className="my-[0.65cqh] shrink-0">
                <p
                  className="m-0 text-[#1e1610] leading-[1.46] font-normal text-justify"
                  style={{ fontSize: 'clamp(8px, 1.46cqh, 12.8px)' }}
                >
                  <span
                    className="float-left font-bold text-[#7a1c1c] leading-[0.82] mr-[1.2cqw] mt-[0.15cqh]"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 'clamp(22px, 4.1cqh, 36px)',
                    }}
                  >
                    I
                  </span>
                  &rsquo;m a Full-Stack Developer based in Leon City, Philippines. My development journey started with curiosity about how digital products work, then grew into a disciplined focus on engineering reliable tools that solve real operational problems. Across web applications, dashboards, automation pipelines, APIs, and mobile experiences, I turn complex ideas into clear, production-ready software from architecture to final build.
                </p>
              </section>

              {/* 3. EXPERIENCE RECORD (Structured 2x2 Deliverable Ledger) */}
              <section className="border-t border-[#1b140e]/30 pt-[0.75cqh] pb-[0.65cqh] shrink-0">
                <div className="flex items-baseline justify-between mb-[0.55cqh]">
                  <div className="flex items-baseline gap-[1.2cqw] min-w-0">
                    <span
                      className="uppercase tracking-[0.16em] font-bold text-[#7a1c1c] shrink-0"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 'clamp(6.5px, 1.12cqh, 9.8px)',
                      }}
                    >
                      FIELD RECORD
                    </span>
                    <h3
                      className="m-0 font-bold text-[#140e09] truncate"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 'clamp(8.5px, 1.55cqh, 13.5px)',
                      }}
                    >
                      Full-Stack Developer Intern —{' '}
                      <span className="italic font-semibold text-[#3a2b1e]">
                        BILT IT Solutions
                      </span>
                    </h3>
                  </div>
                  <span
                    className="uppercase tracking-[0.14em] font-semibold text-[#7a1c1c] tabular-nums shrink-0"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 'clamp(6.5px, 1.15cqh, 10px)',
                    }}
                  >
                    2025 – 2026
                  </span>
                </div>

                {/* 2x2 Structured Engineering Deliverables Grid */}
                <div className="grid grid-cols-2 gap-x-[2.4cqw] gap-y-[0.55cqh] pt-[0.35cqh] border-t border-[#1b140e]/15">
                  {EXPERIENCE_HIGHLIGHTS.map((item) => (
                    <div key={item.code} className="flex items-start gap-[0.9cqw] min-w-0">
                      <span
                        className="text-[#7a1c1c] font-bold tabular-nums shrink-0 mt-[0.1cqh]"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 'clamp(6.5px, 1.1cqh, 9.5px)',
                        }}
                      >
                        {item.code}
                      </span>
                      <div className="min-w-0 leading-[1.28]">
                        <div
                          className="font-bold text-[#18120c] truncate"
                          style={{ fontSize: 'clamp(7.2px, 1.3cqh, 11.2px)' }}
                        >
                          {item.title}
                        </div>
                        <div
                          className="text-[#3e2f21] truncate"
                          style={{ fontSize: 'clamp(6.8px, 1.2cqh, 10.4px)' }}
                        >
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. TECHNICAL ARSENAL (2-Column Architectural Spec Table) */}
              <section className="flex-1 flex flex-col justify-between border-t-2 border-b border-[#1b140e]/75 py-[0.65cqh] min-h-0">
                {/* Section Subheader */}
                <div
                  className="flex items-center justify-between pb-[0.4cqh] border-b border-[#1b140e]/20 shrink-0"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 'clamp(6.5px, 1.1cqh, 9.6px)',
                  }}
                >
                  <span className="uppercase tracking-[0.2em] font-bold text-[#18120c]">
                    SECTION II — TECHNICAL SPECIFICATIONS
                  </span>
                  <span className="uppercase tracking-[0.14em] text-[#523f2d]">
                    3 CORE DOMAINS
                  </span>
                </div>

                {/* Structured 2-Column Rows */}
                <div className="flex-1 flex flex-col justify-evenly divide-y divide-[#1b140e]/15 min-h-0">
                  {SKILL_GROUPS.map((group) => (
                    <div
                      key={group.index}
                      className="grid grid-cols-12 items-baseline gap-x-[1.8cqw] py-[0.55cqh]"
                    >
                      {/* Left Column: Index + Domain Title */}
                      <div className="col-span-4 pr-[0.8cqw]">
                        <div className="flex items-baseline gap-[0.7cqw]">
                          <span
                            className="font-bold text-[#7a1c1c] tabular-nums shrink-0"
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 'clamp(7px, 1.22cqh, 10.5px)',
                            }}
                          >
                            {group.index}
                          </span>
                          <span
                            className="font-bold text-[#140e09] tracking-[0.01em] leading-tight"
                            style={{
                              fontFamily: "'Playfair Display', Georgia, serif",
                              fontSize: 'clamp(8px, 1.42cqh, 12.2px)',
                            }}
                          >
                            {group.label}
                          </span>
                        </div>
                        <div
                          className="uppercase tracking-[0.1em] text-[#5a4633] pl-[2.1cqw] mt-[0.1cqh]"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 'clamp(5.8px, 0.96cqh, 8.5px)',
                          }}
                        >
                          {group.sub}
                        </div>
                      </div>

                      {/* Right Column: Clean Unboxed Typographic Spec List */}
                      <div className="col-span-8">
                        <p
                          className="m-0 text-[#221911] leading-[1.42] font-medium"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 'clamp(6.8px, 1.22cqh, 10.6px)',
                          }}
                        >
                          {group.skills.map((skill, sIdx) => (
                            <React.Fragment key={skill}>
                              <span className="text-[#1a130d] font-medium">{skill}</span>
                              {sIdx < group.skills.length - 1 && (
                                <span className="text-[#7a1c1c]/70 mx-[0.55cqw] font-normal">
                                  /
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. BOTTOM ARCHIVAL FOOTER & NAVIGATION */}
              <footer
                className="pt-[0.75cqh] flex items-center justify-between shrink-0"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                <button
                  type="button"
                  onClick={onBack}
                  className="bg-transparent border-0 p-0 cursor-pointer uppercase tracking-[0.16em] font-semibold text-[#3a2819] hover:text-[#140d07] transition-colors flex items-center gap-[0.6cqw] group"
                  style={{ fontSize: 'clamp(7px, 1.28cqh, 11px)' }}
                >
                  <span className="transition-transform group-hover:-translate-x-0.5">←</span>
                  <span className="border-b border-[#3a2819]/45 group-hover:border-[#140d07] pb-[1px]">
                    Return to Home
                  </span>
                </button>

                <span
                  className="uppercase tracking-[0.2em] text-[#5a4633]/80 font-medium tabular-nums"
                  style={{ fontSize: 'clamp(6px, 1.05cqh, 9px)' }}
                >
                  FOLIO 01 · BIO
                </span>

                <button
                  type="button"
                  onClick={onNext}
                  className="bg-transparent border-0 p-0 cursor-pointer uppercase tracking-[0.16em] font-bold text-[#7a1c1c] hover:text-[#a12323] transition-colors flex items-center gap-[0.6cqw] group"
                  style={{ fontSize: 'clamp(7px, 1.28cqh, 11px)' }}
                >
                  <span className="border-b border-[#7a1c1c]/60 group-hover:border-[#a12323] pb-[1px]">
                    Inspect Works Clipboard
                  </span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </footer>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. Small Polaroid Photo Frame (05-small-card.png)            */}
        {/* ============================================================ */}
        <div
          className="page-half-layer page-half-small-card"
          style={{ containerType: 'size' }}
        >
          <div className="relative w-full h-full page-half-idle-small-card">
            <img
              src={`${assetsPath}/page-one-half/05-small-card.png`}
              alt=""
              decoding="async"
              draggable={false}
              className="page-half-img relative z-[1]"
            />

            {/* Inner Polaroid Picture Fitted Inside the White Frame Border */}
            <div
              className="dossier-inscribed-content absolute overflow-hidden bg-[#161311] select-none pointer-events-none"
              style={{
                left: '12.7%',
                top: '14.8%',
                width: '74.6%',
                height: '68.6%',
                transform: 'rotate(-14.5deg)',
                zIndex: 2,
              }}
            >
              <img
                src={`${assetsPath}/edrian-hero.png`}
                alt=""
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                style={{
                  filter: 'sepia(0.28) contrast(1.08) brightness(0.94)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
