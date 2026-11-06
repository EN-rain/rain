import React from 'react';
import { GithubContributionsCard } from './GithubContributionsCard';
import '../styles/page-one-half.css';

interface PageOneHalfProps {
  assetsPath: string;
  isAssembled?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

export const PageOneHalf: React.FC<PageOneHalfProps> = ({
  assetsPath,
  isAssembled = false,
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
        <div
          className="page-half-layer page-half-backing"
          style={{ containerType: 'size' }}
        >
          <img
            src={`${assetsPath}/page-one-half/01-backing.png`}
            alt=""
            decoding="async"
            draggable={false}
            className="page-half-img"
          />

          {/* Mobile-only Description & Tech Stack overlaid directly onto 01-backing.png */}
          <div
            className="dossier-inscribed-content page-half-backing-desc flex md:hidden absolute flex-col justify-start text-[#18130e] select-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              pointerEvents: isAssembled ? 'auto' : 'none',
            }}
          >
            {/* EDITORIAL MASTHEAD */}
            <header className="shrink-0 mb-[1cqh]">
              <div className="pb-[0.6cqh] border-b border-[#1b140e]/30 flex items-end justify-between">
                <div>
                  <h2
                    className="m-0 font-extrabold uppercase tracking-[0.1em] text-[#120d09] leading-[0.95] text-[clamp(11px,3.6cqh,18px)]"
                    style={{
                      fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                    }}
                  >
                    Edrian Nieves
                  </h2>
                  <p
                    className="m-0 italic text-[#3b2c20] font-semibold tracking-[0.04em] mt-[0.3cqh] text-[clamp(7.5px,1.8cqh,11px)]"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    Developer &amp; Systems Builder
                  </p>
                </div>
                <span className="font-mono uppercase text-[#6b5240] tracking-[0.08em] text-[clamp(6.5px,1.35cqh,9.5px)] font-bold pb-[0.2cqh]">
                  LEON CITY, PH
                </span>
              </div>
            </header>

            {/* MAIN CONTENT AREA: BIOGRAPHICAL PROSE */}
            <div className="flex-1 flex flex-col overflow-hidden pr-[0.4cqw]">
              <section
                className="flex flex-col space-y-[0.55cqh] text-[#241a12] leading-[1.32] font-normal text-left tracking-[0.01em]"
                style={{ fontFamily: "'Lora', Georgia, serif" }}
              >
                <p className="m-0 text-[clamp(8px,1.95cqh,11.5px)]">
                  <span
                    className="float-left font-bold text-[#7a1c1c] leading-[0.82] mr-[0.6cqw] mt-[0.08cqh] text-[clamp(18px,4.2cqh,26px)]"
                    style={{
                      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    }}
                  >I</span>&rsquo;m a Developer based in Leon City, Philippines. I don’t have a fancy origin story. I got curious about how digital products work, broke something, fixed it, and never stopped. Everything you’ll find here came out of that loop, and it grew into a disciplined focus on engineering reliable tools that solve real operational problems.
                </p>

                <p className="m-0 text-[clamp(8px,1.95cqh,11.5px)]">
                  What keeps me interested is the part after the code runs: whether it’s easy to read, easy to change, and easy to trust. I’d rather spend an extra hour on a clear name or a clean structure than leave a puzzle for whoever opens the project next.
                </p>

                <p className="m-0 text-[clamp(8px,1.95cqh,11.5px)]">
                  I like starting with the question behind the question. What is this supposed to solve, who will use it, and what happens on the day something goes wrong? Once those answers are clear, the rest of the work gets calmer and a lot faster.
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. Main Open Dossier Folder Spread (02-spread.png)           */}
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
            className="page-half-img"
          />
        </div>

        {/* ============================================================ */}
        {/* 4. Large Archival Evidence Card (03-large-card.png)          */}
        {/*    Framed Evidence Photo with Tape & GitHub Contributions    */}
        {/* ============================================================ */}
        <div
          className="page-half-layer page-half-large-card"
          style={{ containerType: 'size' }}
        >
          <div className="relative w-full h-full page-half-idle-large-card">
            {/* Inset Aperture: Straight rectangular aperture tucked cleanly under the white frame border */}
            {/* Always solid black backing so when scattered it remains solid black */}
            <div
              className="absolute bg-[#0d0b09] select-none overflow-hidden rounded-[1px]"
              style={{
                left: '11.0%',
                top: '12.8%',
                width: '80.6%',
                height: '78.2%',
                zIndex: 1,
                pointerEvents: isAssembled ? 'auto' : 'none',
              }}
            >
              {/* Inscribed Content: Fades in image and contributions on assemble, fades out to black when scattered */}
              <div
                className="dossier-inscribed-content w-full h-full flex flex-col overflow-hidden"
                style={{
                  pointerEvents: isAssembled ? 'auto' : 'none',
                }}
              >
                {/* Part 1: Portrait Image (Top) - Expands naturally to fill available space */}
                <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-[#12100e]">
                  <img
                    src={`${assetsPath}/edrian-portrait-new.png`}
                    alt="Edrian Nieves — Developer & Systems Builder"
                    decoding="async"
                    draggable={false}
                    className="w-full h-full object-cover object-[center_8%] select-none pointer-events-none"
                    style={{
                      filter: 'contrast(1.05) brightness(0.98)',
                    }}
                  />
                </div>

                {/* Part 2: GitHub Contributions Activity Below (Snug, compact, zero wasted vertical space) */}
                <div className="hidden md:block relative w-full shrink-0">
                  <GithubContributionsCard username="EN-rain" />
                </div>
              </div>
            </div>

            {/* Straightened Frame Artwork Layer with Corner Tape overlaying naturally */}
            <img
              src={`${assetsPath}/page-one-half/03-large-card.png`}
              alt="Archival Evidence Frame"
              decoding="async"
              draggable={false}
              className="page-half-img relative z-[2] pointer-events-none"
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. Manuscript Parchment Sheet (06-paper.png)                 */}
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

            {/* Mobile-only Tech Stack on 06-paper.png (top right beside hero image) */}
            <div
              className="dossier-inscribed-content flex md:hidden absolute left-[11%] right-[11%] top-[8.5%] bottom-[8.5%] flex-col justify-start text-[#18130e] select-none overflow-hidden"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                pointerEvents: isAssembled ? 'auto' : 'none',
              }}
            >
              <p
                className="m-0 pb-[0.8cqh] mb-[0.8cqh] border-b border-[#1b140e]/25 font-bold uppercase tracking-[0.08em] text-[#7a1c1c] text-[clamp(6.5px,2.8cqh,10px)] leading-[1.15]"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              >
                Tech Stack &amp; Technologies
              </p>

              <div className="space-y-[0.7cqh] text-[#2b1e14] leading-[1.3] text-[clamp(6.2px,2.4cqh,9.5px)]">
                <p className="m-0">
                  <span className="font-semibold text-[#18130e]">Languages &amp; Runtimes:</span> TypeScript &middot; JavaScript (ES6+) &middot; PHP 8.2 &middot; C# (.NET 8) &middot; Java 17 &middot; Dart &middot; GDScript &middot; Node.js
                </p>
                <p className="m-0">
                  <span className="font-semibold text-[#18130e]">Frameworks &amp; Web:</span> React &middot; NestJS &middot; Laravel 12 &middot; ASP.NET Core &middot; Flutter &middot; Electron &middot; WPF &middot; Blade &middot; Tailwind CSS
                </p>
                <p className="m-0">
                  <span className="font-semibold text-[#18130e]">Databases &amp; Backend:</span> PostgreSQL &middot; SQLite &middot; Prisma &middot; Firebase &middot; Express &middot; Socket.IO &middot; WebSockets &middot; MCP &middot; Chroma DB
                </p>
                <p className="m-0">
                  <span className="font-semibold text-[#18130e]">Engines &amp; Tooling:</span> Godot Engine 4.6 &middot; Git &amp; GitHub &middot; REST APIs &middot; Cloudinary &middot; Sanctum &middot; Dompdf &middot; Retrofit &middot; VOICEVOX
                </p>
              </div>
            </div>

            {/* Inscribed Editorial Dossier on Right Manuscript (Desktop only; on mobile, 06-paper.png sits beside the hero image on the top row) */}
            <div
              className="dossier-inscribed-content hidden md:flex absolute left-[11%] right-[11%] top-[9.5%] md:top-[6%] bottom-[7.5%] flex-col justify-start text-[#18130e] select-none"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                pointerEvents: isAssembled ? 'auto' : 'none',
              }}
            >
              {/* EDITORIAL MASTHEAD */}
              <header className="shrink-0 mb-[1cqh] md:mb-[2.2cqh]">
                <div className="pb-[0.6cqh] md:pb-[1cqh] border-b border-[#1b140e]/30 flex items-end justify-between">
                  <div>
                    <h2
                      className="m-0 font-extrabold uppercase tracking-[0.1em] md:tracking-[0.14em] text-[#120d09] leading-[0.95] text-[clamp(11px,3.6cqh,18px)] md:text-[clamp(20px,4cqh,32px)]"
                      style={{
                        fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                      }}
                    >
                      Edrian Nieves
                    </h2>
                    <p
                      className="m-0 italic text-[#3b2c20] font-semibold tracking-[0.04em] md:tracking-[0.05em] mt-[0.3cqh] md:mt-[0.4cqh] text-[clamp(7.5px,1.8cqh,11px)] md:text-[clamp(11px,1.9cqh,15px)]"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      Developer &amp; Systems Builder
                    </p>
                  </div>
                  <span
                    className="font-mono uppercase text-[#6b5240] tracking-[0.08em] md:tracking-[0.12em] text-[clamp(6.5px,1.35cqh,9.5px)] md:text-[clamp(9px,1.4cqh,12px)] font-bold pb-[0.2cqh]"
                  >
                    LEON CITY, PH
                  </span>
                </div>
              </header>

              {/* MAIN CONTENT AREA: BIOGRAPHICAL PROSE */}
              <div className="flex-1 flex flex-col overflow-hidden md:overflow-y-auto pr-[0.4cqw] custom-scrollbar">
                <section
                  className="flex flex-col space-y-[0.55cqh] md:space-y-[1.1cqh] text-[#241a12] leading-[1.32] md:leading-[1.52] font-normal text-left tracking-[0.01em] md:tracking-[0.015em]"
                  style={{ fontFamily: "'Lora', Georgia, serif" }}
                >
                  <p className="m-0 text-[clamp(7.2px,1.65cqh,10.5px)] md:text-[clamp(11px,1.7cqh,14.5px)]">
                    <span
                      className="float-left font-bold text-[#7a1c1c] leading-[0.82] mr-[0.6cqw] mt-[0.08cqh] text-[clamp(18px,4cqh,26px)] md:text-[clamp(28px,4.4cqh,38px)]"
                      style={{
                        fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                      }}
                    >I</span>&rsquo;m a Developer based in Leon City, Philippines. I don’t have a fancy origin story. I got curious about how digital products work, broke something, fixed it, and never stopped. Everything you’ll find here came out of that loop, and it grew into a disciplined focus on engineering reliable tools that solve real operational problems.
                  </p>

                  <p className="m-0 text-[clamp(7.2px,1.65cqh,10.5px)] md:text-[clamp(11px,1.7cqh,14.5px)]">
                    What keeps me interested is the part after the code runs: whether it’s easy to read, easy to change, and easy to trust. I’d rather spend an extra hour on a clear name or a clean structure than leave a puzzle for whoever opens the project next.
                  </p>

                  <p className="m-0 mb-[0.35cqh] md:mb-[0.8cqh] text-[clamp(7.2px,1.65cqh,10.5px)] md:text-[clamp(11px,1.7cqh,14.5px)]">
                    I like starting with the question behind the question. What is this supposed to solve, who will use it, and what happens on the day something goes wrong? Once those answers are clear, the rest of the work gets calmer and a lot faster.
                  </p>

                  {/* TECH STACK - COMPLETE & CLEAN MINIMAL TEXT */}
                  <div className="mt-[0.35cqh] md:mt-[0.8cqh] pt-[0.5cqh] md:pt-[0.9cqh] border-t border-[#1b140e]/20 space-y-[0.25cqh] md:space-y-[0.45cqh]">
                    <p
                      className="m-0 font-bold uppercase tracking-[0.1em] md:tracking-[0.12em] text-[#7a1c1c] text-[clamp(6.8px,1.25cqh,9.5px)] md:text-[clamp(8.5px,1.25cqh,11px)]"
                      style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                    >
                      Tech Stack &amp; Technologies Used
                    </p>

                    <div
                      className="space-y-[0.2cqh] md:space-y-[0.3cqh] text-[#2b1e14] leading-[1.28] md:leading-[1.4] text-[clamp(6.8px,1.3cqh,9.5px)] md:text-[clamp(9px,1.3cqh,11.5px)]"
                      style={{
                        fontFamily: "'Lora', Georgia, serif",
                      }}
                    >
                      <p className="m-0">
                        <span className="font-semibold text-[#18130e]">Languages &amp; Runtimes:</span> TypeScript &middot; JavaScript (ES6+) &middot; PHP 8.2 &middot; C# (.NET 8) &middot; Java 17 &middot; Dart &middot; GDScript &middot; Node.js
                      </p>
                      <p className="m-0">
                        <span className="font-semibold text-[#18130e]">Frameworks &amp; Web:</span> React &middot; NestJS &middot; Laravel 12 &middot; ASP.NET Core &middot; Flutter &middot; Electron &middot; WPF &middot; Blade &middot; Tailwind CSS
                      </p>
                      <p className="m-0">
                        <span className="font-semibold text-[#18130e]">Databases &amp; Backend:</span> PostgreSQL &middot; SQLite &middot; Prisma &middot; Firebase &middot; Express &middot; Socket.IO &middot; WebSockets &middot; Model Context Protocol (MCP) &middot; Chroma DB
                      </p>
                      <p className="m-0">
                        <span className="font-semibold text-[#18130e]">Engines &amp; Tooling:</span> Godot Engine 4.6 &middot; Git &amp; GitHub &middot; REST APIs &middot; Cloudinary &middot; Sanctum &middot; Dompdf &middot; Retrofit &middot; VOICEVOX
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageOneHalf;
