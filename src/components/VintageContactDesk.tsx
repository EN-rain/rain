import React, { useEffect, useState, useCallback } from 'react';

interface VintageContactDeskProps {
  onBack?: () => void;
  onNavigateSection?: (section: 'home' | 'about' | 'works') => void;
  className?: string;
  active?: boolean;
}

const SCENE_WIDTH = 1672;
const SCENE_HEIGHT = 941;

const INQUIRY_SCOPES = [
  'Full-Stack Web',
  'Mobile & Flutter',
  'AI & MCP Tooling',
  'Game / Realtime',
  'Role / Internship',
] as const;

export const VintageContactDesk: React.FC<VintageContactDeskProps> = ({
  onBack,
  onNavigateSection,
  className = '',
  active = true,
}) => {
  const [transform, setTransform] = useState<string>('translate(0px, 0px) scale(1)');
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<string>('Full-Stack Web');
  const [messageBody, setMessageBody] = useState<string>('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / SCENE_WIDTH, vh / SCENE_HEIGHT);
      const dx = (vw - SCENE_WIDTH * scale) / 2;
      const dy = (vh - SCENE_HEIGHT * scale) / 2;
      setTransform(`translate(${dx}px, ${dy}px) scale(${scale})`);
    };

    updateScale();
    window.addEventListener('resize', updateScale, { passive: true });
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleCopyText = useCallback((value: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedField(label);
    window.setTimeout(() => {
      setCopiedField((curr) => (curr === label ? null : curr));
    }, 2200);
  }, []);

  const handleSubmitDispatch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = senderName.trim();
      const trimmedEmail = senderEmail.trim();
      const trimmedMsg = messageBody.trim();

      if (!trimmedName || !trimmedEmail || !trimmedMsg) {
        setFormError('Please complete your name, return email, and message brief before sealing.');
        return;
      }

      setFormError(null);
      const now = new Date();
      const stampTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSubmittedAt(`${now.toLocaleDateString()} · ${stampTime}`);

      const subject = encodeURIComponent(`[Portfolio Dispatch · ${selectedScope}] from ${trimmedName}`);
      const body = encodeURIComponent(
        `Sender: ${trimmedName}\nReturn Email: ${trimmedEmail}\nInquiry Scope: ${selectedScope}\n\nProject Brief / Message:\n${trimmedMsg}`
      );
      const mailtoLink = document.createElement('a');
      mailtoLink.href = `mailto:nieves.edriancit2011@email.com?subject=${subject}&body=${body}`;
      mailtoLink.click();
    },
    [messageBody, selectedScope, senderEmail, senderName]
  );

  const handleResetDispatch = useCallback(() => {
    setSubmittedAt(null);
    setFormError(null);
    setSenderName('');
    setSenderEmail('');
    setMessageBody('');
  }, []);

  const handleJumpSection = useCallback(
    (section: 'home' | 'about' | 'works') => {
      if (onNavigateSection) {
        onNavigateSection(section);
      } else {
        onBack?.();
      }
    },
    [onBack, onNavigateSection]
  );

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden select-none bg-[#1c100a] ${className}`}
      style={{
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {/* Full-bleed ambient mahogany desk backdrop */}
      <img
        src="/assets/detective-desk/detective-desk-scene.png"
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover opacity-55 blur-[10px] scale-105 pointer-events-none select-none"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(45,22,10,0.2) 0%, rgba(18,9,4,0.82) 100%)',
        }}
      />

      {/* 1672 x 941 Authentic Detective_Desk_Complete Scene */}
      <main
        aria-label="Edrian Nieves — Detective Correspondence & Contact Desk"
        style={{
          width: `${SCENE_WIDTH}px`,
          height: `${SCENE_HEIGHT}px`,
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'hidden',
          transformOrigin: '0 0',
          isolation: 'isolate',
          background: '#2b160c',
          transform,
          boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
        }}
      >
        {/* Complete Native Detective Desk Artwork (Wood, Parchment Stack, Compass Sheet, Journal, Ink Bottle, Fountain Pen, Wax-Sealed Envelope, Gold Bookmark) */}
        <img
          src="/assets/detective-desk/detective-desk-scene.png"
          alt="Vintage detective correspondence desk"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ================================================================ */}
        {/* 1. INSCRIBED CORRESPONDENCE SHEET (On Clean Paper Stack Left)    */}
        {/* ================================================================ */}
        <div
          style={{
            position: 'absolute',
            left: '164px',
            top: '146px',
            width: '634px',
            height: '746px',
            zIndex: 10,
            transform: 'rotate(3.1deg)',
            transformOrigin: 'center center',
            fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
          }}
          className="flex flex-col justify-between text-[#23160c]"
        >
          {/* Top Archival Letterhead & Hook Lead */}
          <div>
            <div className="flex items-center justify-between border-b border-[#3a2414]/40 pb-1.5">
              <span className="text-[10.5px] font-extrabold tracking-[0.2em] uppercase text-[#4d321e]">
                CORRESPONDENCE DISPATCH // REF #EN-2026
              </span>
              <span className="text-[10.5px] font-extrabold tracking-[0.18em] uppercase text-[#7a1c1c]">
                SECTION 04 · CONTACTS
              </span>
            </div>

            <div className="mt-3.5 pb-3 border-b border-[#3a2414]/30">
              <p className="m-0 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-[#7a1c1c] mb-1">
                DIRECT INQUIRY &amp; COLLABORATION
              </p>
              <h1
                className="m-0 font-extrabold uppercase tracking-[0.05em] text-[#160d06] leading-[1.06]"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                  fontSize: '28px',
                }}
              >
                LET&rsquo;S TALK ABOUT YOUR PROJECT.
              </h1>
              <p className="m-0 mt-2 text-[12.5px] leading-[1.52] text-[#2b1b0f] font-semibold">
                Full-Stack Engineer focused on building modern digital products with clean interfaces, reliable backend systems, and efficient deployment — from planning and design to implementation and refinement.
              </p>
            </div>
          </div>

          {/* Interactive Typewritten Dispatch Form */}
          <form onSubmit={handleSubmitDispatch} className="flex-1 flex flex-col justify-between py-3">
            {/* Row 1: Sender Name & Return Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-sender-name"
                  className="block text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#1c1108] mb-1"
                >
                  01. YOUR NAME / CALLSIGN
                </label>
                <input
                  id="contact-sender-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#3a2414]/[0.06] border-b-2 border-[#3a2414]/55 px-2.5 py-1.5 text-[13.5px] font-bold text-[#140c06] placeholder:text-[#5c4028]/65 focus:outline-none focus:border-[#7a1c1c] focus:bg-[#3a2414]/[0.12] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-sender-email"
                  className="block text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#1c1108] mb-1"
                >
                  02. RETURN EMAIL ADDRESS
                </label>
                <input
                  id="contact-sender-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-[#3a2414]/[0.06] border-b-2 border-[#3a2414]/55 px-2.5 py-1.5 text-[13.5px] font-bold text-[#140c06] placeholder:text-[#5c4028]/65 focus:outline-none focus:border-[#7a1c1c] focus:bg-[#3a2414]/[0.12] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Project Scope Selector */}
            <div className="my-1.5">
              <span className="block text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#1c1108] mb-1.5">
                03. PROJECT SCOPE / SUBJECT CLASSIFICATION
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {INQUIRY_SCOPES.map((scope) => {
                  const isSelected = selectedScope === scope;
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setSelectedScope(scope)}
                      className={`px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] cursor-pointer transition-all whitespace-nowrap shrink-0 border ${
                        isSelected
                          ? 'bg-[#26160b] text-[#f4dfba] border-[#26160b] shadow-xs'
                          : 'bg-[#3a2414]/[0.05] text-[#352112] border-[#3a2414]/45 hover:border-[#26160b] hover:text-[#140c06]'
                      }`}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Message Brief Textarea */}
            <div className="my-1">
              <label
                htmlFor="contact-message-body"
                className="block text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#1c1108] mb-1"
              >
                04. PROJECT BRIEF &amp; TIMELINE
              </label>
              <textarea
                id="contact-message-body"
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Share details about your project goals, stack requirements, or team opportunity..."
                className="w-full resize-none bg-[#3a2414]/[0.06] border border-[#3a2414]/50 p-2.5 text-[13px] leading-[1.5] font-semibold text-[#140c06] placeholder:text-[#5c4028]/65 focus:outline-none focus:border-[#7a1c1c] focus:bg-[#3a2414]/[0.12] transition-colors"
              />
            </div>

            {/* Validation or Confirmation Stamp */}
            {formError && (
              <div className="px-3 py-1.5 border border-[#8b1e1e] bg-[#8b1e1e]/12 text-[#7a1616] text-[11.5px] font-bold">
                {formError}
              </div>
            )}

            {submittedAt && (
              <div className="px-3 py-1.5 border-2 border-[#2a5429]/80 bg-[#2a5429]/12 text-[#1d3f1c] flex items-center justify-between text-[11.5px] font-extrabold uppercase tracking-[0.1em]">
                <span>✓ DISPATCH SEALED ({submittedAt}) · MAIL CLIENT READY</span>
                <button
                  type="button"
                  onClick={handleResetDispatch}
                  className="bg-transparent border-0 underline cursor-pointer text-[#1d3f1c] font-extrabold text-[10.5px] uppercase"
                >
                  New Dispatch
                </button>
              </div>
            )}

            {/* Submit & Copy Email Row */}
            <div className="pt-1.5 flex items-center justify-between gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#6e1b1b] hover:bg-[#882121] text-[#f8e8c8] border border-[#3d0d0d] text-[12px] font-extrabold uppercase tracking-[0.16em] cursor-pointer transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.35)] whitespace-nowrap shrink-0"
              >
                Seal &amp; Transmit Dispatch →
              </button>

              <button
                type="button"
                onClick={() => handleCopyText('nieves.edriancit2011@email.com', 'sheet-email')}
                className="px-3 py-2 bg-[#3a2414]/[0.06] hover:bg-[#3a2414]/[0.15] text-[#24160b] border border-[#3a2414]/55 text-[11px] font-extrabold uppercase tracking-[0.12em] cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                {copiedField === 'sheet-email' ? '✓ Email Copied' : 'Copy Email Address'}
              </button>
            </div>
          </form>

          {/* Bottom Sheet Footer: Direct Channels & Section Navigation */}
          <div className="pt-2 border-t border-[#3a2414]/40 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.14em]">
            <button
              type="button"
              onClick={() => handleJumpSection('home')}
              className="bg-transparent border-0 p-0 cursor-pointer text-[#24160b] hover:text-[#7a1c1c] underline decoration-[#3a2414]/50 underline-offset-3"
            >
              ← Return to Home
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleJumpSection('about')}
                className="bg-transparent border-0 p-0 cursor-pointer text-[#382313] hover:text-[#7a1c1c] underline decoration-[#3a2414]/45 underline-offset-3"
              >
                About Dossier
              </button>
              <span aria-hidden="true" className="text-[#5c432b]">·</span>
              <button
                type="button"
                onClick={() => handleJumpSection('works')}
                className="bg-transparent border-0 p-0 cursor-pointer text-[#382313] hover:text-[#7a1c1c] underline decoration-[#3a2414]/45 underline-offset-3"
              >
                Works Clipboard
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. UPPER-MIDDLE COMPASS DOCUMENT STAMP (Preserves Compass Art)   */}
        {/* ================================================================ */}
        <div
          style={{
            position: 'absolute',
            left: '838px',
            top: '56px',
            width: '215px',
            zIndex: 8,
            transform: 'rotate(12.2deg)',
            transformOrigin: 'top left',
            fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
            pointerEvents: 'none',
          }}
          className="text-[#2c1b0e]/85"
        >
          <div className="text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-[#6e1b1b]">
            FIELD LOG // ILOILO, PH
          </div>
          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#1e1209] mt-0.5">
            AVAILABLE FOR ROLES &amp; PROJECTS
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3. WAX-SEALED CORRESPONDENCE ENVELOPE: DIRECT CHANNELS           */}
        {/* ================================================================ */}
        <div
          style={{
            position: 'absolute',
            left: '986px',
            top: '472px',
            width: '412px',
            height: '374px',
            zIndex: 12,
            transform: 'rotate(-16.2deg)',
            transformOrigin: 'center center',
            fontFamily: "'Special Elite', 'Courier Prime', Courier, monospace",
          }}
          className="flex flex-col justify-between text-[#23150b] pointer-events-none"
        >
          {/* Upper Envelope Flap Inscription (Above the Center 3D Wax Seal) */}
          <div className="pt-[18px] px-[42px] text-center">
            <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-[#6e1b1b]">
              VERIFIED CHANNELS // DIRECT ACCESS
            </span>
            <h2
              className="m-0 font-extrabold uppercase tracking-[0.12em] text-[#180e07] mt-0.5"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                fontSize: '15.5px',
              }}
            >
              EDRIAN NIEVES · EN-RAIN
            </h2>
          </div>

          {/* Lower Envelope Body (Below the Center 3D Wax Seal at y≈44%) */}
          <div className="pb-[20px] px-[26px] flex flex-col gap-2 pointer-events-auto">
            {/* Direct Email Row */}
            <div className="flex items-center justify-between gap-2 border-b border-[#3a2414]/35 pb-1.5">
              <div className="min-w-0">
                <span className="block text-[8.5px] font-extrabold uppercase tracking-[0.16em] text-[#6e1b1b]">
                  01. ELECTRONIC MAIL
                </span>
                <a
                  href="mailto:nieves.edriancit2011@email.com"
                  className="block text-[11.5px] font-extrabold text-[#160d06] hover:text-[#7a1c1c] underline decoration-[#3a2414]/45 underline-offset-2 truncate"
                >
                  nieves.edriancit2011@email.com
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleCopyText('nieves.edriancit2011@email.com', 'env-email')}
                className="px-2 py-0.5 bg-[#26160b] hover:bg-[#3d2413] text-[#f4dfba] text-[9px] font-extrabold uppercase tracking-[0.12em] cursor-pointer transition-colors shrink-0"
              >
                {copiedField === 'env-email' ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* GitHub & LinkedIn Split Row */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <a
                href="https://github.com/EN-rain"
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-[#3a2414]/45 bg-[#3a2414]/[0.06] hover:bg-[#26160b] px-2.5 py-1.5 no-underline transition-colors"
              >
                <span className="block text-[8px] font-extrabold uppercase tracking-[0.16em] text-[#6e1b1b] group-hover:text-[#e6c48c]">
                  02. GITHUB ARCHIVE ↗
                </span>
                <span className="block text-[11px] font-extrabold text-[#160d06] group-hover:text-[#f8e8c8] truncate mt-0.5">
                  github.com/EN-rain
                </span>
              </a>

              <a
                href="https://linkedin.com/in/en-rain"
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-[#3a2414]/45 bg-[#3a2414]/[0.06] hover:bg-[#26160b] px-2.5 py-1.5 no-underline transition-colors"
              >
                <span className="block text-[8px] font-extrabold uppercase tracking-[0.16em] text-[#6e1b1b] group-hover:text-[#e6c48c]">
                  03. LINKEDIN NETWORK ↗
                </span>
                <span className="block text-[11px] font-extrabold text-[#160d06] group-hover:text-[#f8e8c8] truncate mt-0.5">
                  linkedin.com/in/en-rain
                </span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation Bar */}
      {onBack && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-1.5 rounded-[6px] border border-[#9f7244]/70 bg-[#1a100b]/90 text-[#f4d9a6] text-xs tracking-[0.16em] uppercase shadow-[0_6px_20px_rgba(0,0,0,0.65)]"
          style={{ fontFamily: "'Special Elite', 'IBM Plex Mono', monospace" }}
        >
          <button
            type="button"
            onClick={() => handleJumpSection('home')}
            className="bg-transparent border-0 p-0 text-[#f4d9a6] hover:text-white cursor-pointer uppercase tracking-[0.16em] font-bold whitespace-nowrap"
          >
            ← Home Desk
          </button>
          <span aria-hidden="true" className="opacity-45">·</span>
          <button
            type="button"
            onClick={() => handleJumpSection('about')}
            className="bg-transparent border-0 p-0 text-[#d8be8c] hover:text-white cursor-pointer uppercase tracking-[0.16em] font-bold whitespace-nowrap"
          >
            About
          </button>
          <span aria-hidden="true" className="opacity-45">·</span>
          <button
            type="button"
            onClick={() => handleJumpSection('works')}
            className="bg-transparent border-0 p-0 text-[#d8be8c] hover:text-white cursor-pointer uppercase tracking-[0.16em] font-bold whitespace-nowrap"
          >
            Works
          </button>
        </div>
      )}
    </div>
  );
};
