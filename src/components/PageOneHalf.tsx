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
        <div className="page-half-layer page-half-backing">
          <img
            src={`${assetsPath}/page-one-half/01-backing.png`}
            alt=""
            decoding="async"
            draggable={false}
            className="page-half-img"
          />
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
                <div className="relative w-full shrink-0">
                  <GithubContributionsCard username="EN-rain" />
                </div>
              </div>
            </div>

            {/* Straightened Frame Artwork Layer with Corner Tape overlaying naturally */}
            <img
              src={`${assetsPath}/page-one-half/03-large-card.png?v=2`}
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

            {/* Inscribed Editorial Dossier on Right Manuscript */}
            <div
              className="dossier-inscribed-content absolute flex flex-col justify-start text-[#18130e] select-none"
              style={{
                left: '15.5%',
                right: '15.5%',
                top: '12%',
                bottom: '12%',
                fontFamily: "'Source Serif 4', Georgia, serif",
                pointerEvents: isAssembled ? 'auto' : 'none',
              }}
            >
              {/* EDITORIAL MASTHEAD */}
              <header className="shrink-0 mb-[3cqh]">
                <div className="pb-[1cqh] border-b border-[#1b140e]/30">
                  <h2
                    className="m-0 font-extrabold uppercase tracking-[0.16em] text-[#120d09] leading-[0.95]"
                    style={{
                      fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                      fontSize: 'clamp(18px, 4.1cqh, 34px)',
                    }}
                  >
                    Edrian Nieves
                  </h2>
                  <p
                    className="m-0 italic text-[#3b2c20] font-semibold tracking-[0.05em] mt-[0.6cqh]"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 'clamp(9px, 1.75cqh, 14.5px)',
                    }}
                  >
                    Developer &amp; Systems Builder
                  </p>
                </div>
              </header>

              {/* BIOGRAPHICAL PROSE (Editorial Serif with Classic Drop Cap) */}
              <section className="shrink-0">
                <p
                  className="m-0 text-[#1e1610] leading-[1.65] font-normal text-justify tracking-[0.015em]"
                  style={{ fontSize: 'clamp(9px, 1.8cqh, 15px)' }}
                >
                  <span
                    className="float-left font-bold text-[#7a1c1c] leading-[0.82] mr-[1.4cqw] mt-[0.15cqh]"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 'clamp(26px, 5.2cqh, 46px)',
                    }}
                  >
                    I
                  </span>
                  &rsquo;m a Developer based in Leon City, Philippines. My development journey started with curiosity about how digital products work, then grew into a disciplined focus on engineering reliable tools that solve real operational problems. Across web applications, dashboards, automation pipelines, APIs, and mobile experiences, I turn complex ideas into clear, production-ready software from architecture to final build.
                </p>
              </section>

              {/* INVENTORY — DEVELOPER'S TOOLKIT (Authentic Typewritten Evidence Ledger - NO SLASHES) */}
              <section className="mt-[1.8cqh] pt-[1.2cqh] border-t border-[#1b140e]/25 shrink-0">
                {/* Header Row */}
                <div className="flex items-baseline justify-between mb-[0.4cqh]">
                  <h3
                    className="m-0 font-extrabold uppercase tracking-[0.2em] text-[#7a1c1c]"
                    style={{
                      fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                      fontSize: 'clamp(11px, 2.1cqh, 16px)',
                    }}
                  >
                    INVENTORY
                  </h3>
                  <span
                    className="uppercase tracking-[0.16em] text-[#5a4633] font-bold text-[clamp(7.5px,1.1cqh,10px)]"
                    style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                  >
                    Developer&rsquo;s Toolkit
                  </span>
                </div>

                {/* Subtitle Description */}
                <p
                  className="m-0 mb-[0.8cqh] text-[#3d2f23] text-[clamp(7.2px,1.1cqh,10px)] leading-[1.38] tracking-[0.01em]"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  Technical inventory containing programming languages, databases, interfaces, and development tools styled as an evidence list.
                </p>

                {/* Evidence Ledger (Authentic Ruled Ledger — Zero modern box styling) */}
                <div className="border-t border-b border-[#1b140e]/20 bg-[#1a140f]/[0.025] px-[1cqw] py-[0.4cqh]">
                  {/* Ledger Column Headings */}
                  <div
                    className="flex items-center justify-between text-[clamp(6.5px,0.95cqh,8.5px)] uppercase tracking-[0.14em] text-[#6b543e] font-bold pb-[0.3cqh] border-b border-[#1b140e]/15 mb-[0.35cqh]"
                    style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                  >
                    <span>REF · TAG</span>
                    <span>SPECIFICATION &amp; EVIDENCE RECORD</span>
                  </div>

                  <div className="flex flex-col">
                    {/* 01. JS */}
                    <div className="flex items-start gap-[1.5cqw] py-[0.45cqh] border-b border-[#1b140e]/10">
                      <div className="shrink-0 flex items-center gap-[0.4cqw] mt-[0.05cqh]" style={{ width: '4.4rem' }}>
                        <span
                          className="font-bold text-[#5a4633] text-[clamp(7.8px,1.15cqh,10.5px)] tracking-[0.04em]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          01.
                        </span>
                        <span
                          className="font-bold text-[#7a1c1c] text-[clamp(7.5px,1.1cqh,10px)] tracking-[0.08em] px-[0.35rem] py-[0.04rem] bg-[#7a1c1c]/[0.08] border border-[#7a1c1c]/25 rounded-[1px]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          JS
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-[1cqw]">
                          <span
                            className="font-bold text-[#140e09] text-[clamp(8.5px,1.3cqh,11.5px)] tracking-[0.015em]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            JavaScript
                          </span>
                          <span
                            className="text-[clamp(6.8px,0.95cqh,8.8px)] uppercase tracking-[0.12em] text-[#826b55] font-semibold shrink-0"
                            style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                          >
                            Core Engine
                          </span>
                        </div>
                        <p
                          className="m-0 text-[#3a2c20] text-[clamp(7.2px,1.1cqh,10px)] leading-[1.35] tracking-[0.01em] mt-[0.1cqh]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          Modern ES6+, Web Engines, Node.js Runtimes
                        </p>
                      </div>
                    </div>

                    {/* 02. TS */}
                    <div className="flex items-start gap-[1.5cqw] py-[0.45cqh] border-b border-[#1b140e]/10">
                      <div className="shrink-0 flex items-center gap-[0.4cqw] mt-[0.05cqh]" style={{ width: '4.4rem' }}>
                        <span
                          className="font-bold text-[#5a4633] text-[clamp(7.8px,1.15cqh,10.5px)] tracking-[0.04em]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          02.
                        </span>
                        <span
                          className="font-bold text-[#7a1c1c] text-[clamp(7.5px,1.1cqh,10px)] tracking-[0.08em] px-[0.35rem] py-[0.04rem] bg-[#7a1c1c]/[0.08] border border-[#7a1c1c]/25 rounded-[1px]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          TS
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-[1cqw]">
                          <span
                            className="font-bold text-[#140e09] text-[clamp(8.5px,1.3cqh,11.5px)] tracking-[0.015em]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            TypeScript
                          </span>
                          <span
                            className="text-[clamp(6.8px,0.95cqh,8.8px)] uppercase tracking-[0.12em] text-[#826b55] font-semibold shrink-0"
                            style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                          >
                            Type System
                          </span>
                        </div>
                        <p
                          className="m-0 text-[#3a2c20] text-[clamp(7.2px,1.1cqh,10px)] leading-[1.35] tracking-[0.01em] mt-[0.1cqh]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          Strict Type Systems, Interfaces, Scalable Architecture
                        </p>
                      </div>
                    </div>

                    {/* 03. SQL */}
                    <div className="flex items-start gap-[1.5cqw] py-[0.45cqh] border-b border-[#1b140e]/10">
                      <div className="shrink-0 flex items-center gap-[0.4cqw] mt-[0.05cqh]" style={{ width: '4.4rem' }}>
                        <span
                          className="font-bold text-[#5a4633] text-[clamp(7.8px,1.15cqh,10.5px)] tracking-[0.04em]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          03.
                        </span>
                        <span
                          className="font-bold text-[#7a1c1c] text-[clamp(7.5px,1.1cqh,10px)] tracking-[0.08em] px-[0.35rem] py-[0.04rem] bg-[#7a1c1c]/[0.08] border border-[#7a1c1c]/25 rounded-[1px]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          SQL
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-[1cqw]">
                          <span
                            className="font-bold text-[#140e09] text-[clamp(8.5px,1.3cqh,11.5px)] tracking-[0.015em]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            Databases
                          </span>
                          <span
                            className="text-[clamp(6.8px,0.95cqh,8.8px)] uppercase tracking-[0.12em] text-[#826b55] font-semibold shrink-0"
                            style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                          >
                            Relational
                          </span>
                        </div>
                        <p
                          className="m-0 text-[#3a2c20] text-[clamp(7.2px,1.1cqh,10px)] leading-[1.35] tracking-[0.01em] mt-[0.1cqh]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          PostgreSQL, Relational Modeling, Query Optimization
                        </p>
                      </div>
                    </div>

                    {/* 04. API */}
                    <div className="flex items-start gap-[1.5cqw] py-[0.45cqh] border-b border-[#1b140e]/10">
                      <div className="shrink-0 flex items-center gap-[0.4cqw] mt-[0.05cqh]" style={{ width: '4.4rem' }}>
                        <span
                          className="font-bold text-[#5a4633] text-[clamp(7.8px,1.15cqh,10.5px)] tracking-[0.04em]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          04.
                        </span>
                        <span
                          className="font-bold text-[#7a1c1c] text-[clamp(7.5px,1.1cqh,10px)] tracking-[0.08em] px-[0.35rem] py-[0.04rem] bg-[#7a1c1c]/[0.08] border border-[#7a1c1c]/25 rounded-[1px]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          API
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-[1cqw]">
                          <span
                            className="font-bold text-[#140e09] text-[clamp(8.5px,1.3cqh,11.5px)] tracking-[0.015em]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            Interfaces
                          </span>
                          <span
                            className="text-[clamp(6.8px,0.95cqh,8.8px)] uppercase tracking-[0.12em] text-[#826b55] font-semibold shrink-0"
                            style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                          >
                            Endpoints
                          </span>
                        </div>
                        <p
                          className="m-0 text-[#3a2c20] text-[clamp(7.2px,1.1cqh,10px)] leading-[1.35] tracking-[0.01em] mt-[0.1cqh]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          REST Services, Token Authentication, Endpoints
                        </p>
                      </div>
                    </div>

                    {/* 05. GIT */}
                    <div className="flex items-start gap-[1.5cqw] py-[0.45cqh]">
                      <div className="shrink-0 flex items-center gap-[0.4cqw] mt-[0.05cqh]" style={{ width: '4.4rem' }}>
                        <span
                          className="font-bold text-[#5a4633] text-[clamp(7.8px,1.15cqh,10.5px)] tracking-[0.04em]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          05.
                        </span>
                        <span
                          className="font-bold text-[#7a1c1c] text-[clamp(7.5px,1.1cqh,10px)] tracking-[0.08em] px-[0.35rem] py-[0.04rem] bg-[#7a1c1c]/[0.08] border border-[#7a1c1c]/25 rounded-[1px]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          GIT
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-[1cqw]">
                          <span
                            className="font-bold text-[#140e09] text-[clamp(8.5px,1.3cqh,11.5px)] tracking-[0.015em]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            Version Control
                          </span>
                          <span
                            className="text-[clamp(6.8px,0.95cqh,8.8px)] uppercase tracking-[0.12em] text-[#826b55] font-semibold shrink-0"
                            style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                          >
                            Pipelines
                          </span>
                        </div>
                        <p
                          className="m-0 text-[#3a2c20] text-[clamp(7.2px,1.1cqh,10px)] leading-[1.35] tracking-[0.01em] mt-[0.1cqh]"
                          style={{ fontFamily: "'Courier Prime', 'Special Elite', monospace" }}
                        >
                          Branching Strategies, Release Pipelines, Commit Logs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageOneHalf;
