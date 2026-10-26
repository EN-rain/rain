import homeImage from '../../assets/images/hero.png';

const glyphs = [
  { className: 'home-section__glyph--en-1', floatSpeed: '0.06', text: '{}' },
  { className: 'home-section__glyph--en-2', floatSpeed: '0.08', text: '</>' },
  { className: 'home-section__glyph--en-3', floatSpeed: '0.05', text: '//' },
  { className: 'home-section__glyph--en-4', floatSpeed: '0.04', text: '()' },
  { className: 'home-section__glyph--en-5', floatSpeed: '0.06', text: '/*' },
  { className: 'home-section__glyph--en-6', floatSpeed: '0.05', text: '=>' },
  { className: 'home-section__glyph--en-7', floatSpeed: '0.07', text: '!=' },
] as const;

export const HomeSection = () => {
  return (
    <section id="home" className="stack-section mask-shaped-section mask-theme-purple" style={{ zIndex: 300, transform: 'translate3d(0, 0, 0)' }}>
      <div className="clip-gap-outer parallax-content">
        <div className="clip-gap-inner" style={{ backgroundColor: '#020202' }}>
          <div className="home-section">
            {/* Background gradient orb with parallax */}
            <div className="home-section__orb parallax-layer mobile-hide" data-speed="0.05" data-speed-x="-0.02" />

            <div className="home-section__grain parallax-layer mobile-hide" data-speed="-0.08" data-speed-x="0.02" />
            <div className="home-section__vignette parallax-layer mobile-hide" data-speed="-0.05" />
            <div className="home-section__ring parallax-layer home-section__intro-ring mobile-hide" data-speed="-0.2" data-speed-x="0.05" />
            <div className="home-section__crosshair parallax-layer locked-content home-section__intro-crosshair mobile-hide" data-speed="0.16" data-speed-x="-0.03" />

            {/* Floating geometric shapes with parallax */}
            <div className="home-section__shape home-section__shape--1 parallax-layer mobile-hide" data-speed="-0.12" data-speed-x="0.08" />
            <div className="home-section__shape home-section__shape--2 parallax-layer mobile-hide" data-speed="0.18" data-speed-x="-0.06" />
            <div className="home-section__shape home-section__shape--3 parallax-layer mobile-hide" data-speed="-0.15" data-speed-x="0.04" />

            <div className="home-section__circuit home-section__circuit--left locked-content home-section__intro-rail-left mobile-hide" />
            <div className="home-section__circuit home-section__circuit--right locked-content home-section__intro-rail-right mobile-hide" />

            <div className="home-section__center locked-content">
              <div className="home-section__image-wrap" data-speed-mobile="0.15">
                <div className="home-section__image-stack home-section__intro-image">
                  <div className="home-section__image-shadow" />
                  <span className="home-section__image-bg-text mobile-hide">
                    <span className="home-letter-e">E</span>
                    <span className="home-letter-n">N</span>
                  </span>
                  {/* Glyphs above EN with mix-blend-mode for color inversion */}
                  {glyphs.map((glyph) => (
                    <div
                      key={glyph.className}
                      className={`home-section__glyph home-section__glyph--en ${glyph.className} parallax-float mobile-hide`}
                      data-float-speed={glyph.floatSpeed}
                    >
                      {glyph.text}
                    </div>
                  ))}
                  <img className="home-section__image parallax-img" src={homeImage} alt="Portrait" decoding="async" fetchPriority="high" data-img-scroll="0.14" data-img-scroll-mobile="0.25" />
                </div>
              </div>

              <div className="home-section__subtext" data-speed-mobile="0.08">
                <p className="home-section__subtext-inner home-section__intro-baseline">
                  I don't just write code. I build things that works.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .home-section {
          position: relative;
          height: 100%;
          overflow: hidden;
          background:
            #020202;
          color: #f3f3f0;
        }

        .home-section__grain,
        .home-section__vignette,
        .home-section__subtext,
        .home-section__center {
          position: absolute;
          inset: 0;
        }

        .home-section__grain {
          display: none;
        }

        .home-section__vignette {
          display: none;
        }

        /* Gradient orb with parallax */
        .home-section__orb {
          display: none;
        }

        /* Floating geometric shapes */
        .home-section__shape {
          position: absolute;
          border: 1px solid rgba(167, 139, 250, 0.12);
          will-change: transform;
        }

        .home-section__shape--1 {
          width: 120px;
          height: 120px;
          top: 20%;
          left: 15%;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: morphShape 8s ease-in-out infinite;
        }

        .home-section__shape--2 {
          width: 80px;
          height: 80px;
          bottom: 30%;
          right: 20%;
          transform: rotate(45deg);
          animation: rotateShape 20s linear infinite;
        }

        .home-section__shape--3 {
          width: 60px;
          height: 60px;
          top: 60%;
          right: 35%;
          border-radius: 50%;
          border-style: dashed;
          animation: pulseShape 4s ease-in-out infinite;
        }

        @keyframes morphShape {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
        }

        @keyframes rotateShape {
          from { transform: rotate(45deg); }
          to { transform: rotate(405deg); }
        }

        @keyframes pulseShape {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }

        .home-section__ring {
          inset: 12vh auto auto 50%;
          width: min(62vw, 820px);
          height: min(62vw, 820px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          transform: translateX(-50%);
          opacity: 0.55;
        }

        .home-section__crosshair {
          background:
            linear-gradient(90deg, transparent calc(50% - 140px), rgba(255, 255, 255, 0.08) calc(50% - 140px), rgba(255, 255, 255, 0.08) calc(50% - 139px), transparent calc(50% - 139px), transparent calc(50% + 139px), rgba(255, 255, 255, 0.08) calc(50% + 139px), rgba(255, 255, 255, 0.08) calc(50% + 140px), transparent calc(50% + 140px)),
            linear-gradient(180deg, transparent calc(50% - 220px), rgba(255, 255, 255, 0.08) calc(50% - 220px), rgba(255, 255, 255, 0.08) calc(50% - 219px), transparent calc(50% - 219px), transparent calc(50% + 219px), rgba(255, 255, 255, 0.08) calc(50% + 219px), rgba(255, 255, 255, 0.08) calc(50% + 220px), transparent calc(50% + 220px));
          opacity: 0.4;
        }

        .home-section__circuit,
        .home-section__glyph,
        .home-section__code {
          position: absolute;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
        }

        .home-section__circuit {
          width: 240px;
          height: 240px;
          opacity: 0.34;
          background-repeat: no-repeat;
        }

        .home-section__circuit--left {
          top: 16%;
          left: 7%;
          background-image:
            linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)),
            linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12)),
            linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12));
          background-size: 1px 94px, 92px 1px, 1px 68px;
          background-position: 36px 28px, 36px 122px, 128px 122px;
        }

        .home-section__circuit--right {
          right: 6%;
          bottom: 18%;
          background-image:
            linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)),
            linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12)),
            linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12)),
            radial-gradient(circle, rgba(255,255,255,0.55) 0 2px, transparent 3px);
          background-size: 1px 76px, 102px 1px, 74px 1px, 14px 14px;
          background-position: 182px 40px, 80px 116px, 108px 40px, 175px 34px;
        }

        .home-section__glyph {
          top: 50%;
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(2rem, 4vw, 3.5rem);
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.18);
        }

        /* Glyphs positioned above EN text with color inversion */
        .home-section__glyph--en {
          position: absolute;
          z-index: 2;
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(2rem, 5vw, 4rem);
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 1);
          mix-blend-mode: difference;
          pointer-events: none;
          will-change: transform;
        }

        /* Position glyphs using exact original layout */
        .home-section__glyph--en {
          top: 50%;
        }

        .home-section__glyph--en-1 {
          left: 12%;
        }

        .home-section__glyph--en-2 {
          right: 11%;
        }

        .home-section__glyph--en-3 {
          top: 3%;
          left: 50%;
          transform: translateX(-50%);
        }

        .home-section__glyph--en-4 {
          top: 18%;
          left: 22%;
        }

        .home-section__glyph--en-5 {
          top: 12%;
          right: 18%;
        }

        .home-section__glyph--en-6 {
          bottom: 15%;
          left: 18%;
        }

        .home-section__glyph--en-7 {
          bottom: 20%;
          right: 22%;
        }

        .home-section__code {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: rgba(255, 255, 255, 0.42);
          white-space: nowrap;
        }

        .home-section__code--left {
          left: clamp(24px, 5vw, 72px);
          bottom: 22%;
          top: auto;
        }

        .home-section__code--right {
          right: clamp(24px, 5vw, 72px);
          top: 22%;
          text-align: right;
        }

        .home-section__code-line em {
          font-style: normal;
          color: rgba(255, 255, 255, 0.28);
        }

        .home-section__code-line strong {
          font-weight: 400;
          color: rgba(255, 255, 255, 0.82);
        }

        .home-section__code-line {
          display: block;
          will-change: transform;
          transition: transform 0.1s ease-out;
        }

        .code-line-1 { transform: translateX(0); }
        .code-line-2 { transform: translateX(8px); }
        .code-line-3 { transform: translateX(16px); }

        .home-section__center {
          z-index: 2;
          display: grid;
          place-items: stretch;
          padding: 0;
          transform-origin: center center;
        }

        .home-section__intro-copy,
        .home-section__intro-image,
        .home-section__intro-baseline,
        .home-section__intro-ring,
        .home-section__intro-crosshair {
          opacity: 0;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }

        .home-section__intro-image {
          animation-name: homeImageEnter;
          animation-duration: 1.25s;
          animation-delay: 0.32s;
        }

        .home-section__intro-copy {
          animation-name: homeFadeLift;
          animation-duration: 0.9s;
          animation-delay: 0.46s;
        }

        .home-section__intro-baseline {
          animation-name: homeFadeLift;
          animation-duration: 0.9s;
          animation-delay: 0.8s;
        }

        .home-section__intro-ring {
          animation-name: homeRingEnter;
          animation-duration: 1.2s;
          animation-delay: 0.1s;
        }

        .home-section__intro-crosshair {
          animation-name: homeCrosshairEnter;
          animation-duration: 1.2s;
          animation-delay: 0.16s;
        }

        .home-section__subtext {
          inset: auto 0 118px 0;
          z-index: 2;
          display: flex;
          justify-content: center;
          padding: 0 1.5rem;
        }

        .home-section__subtext-inner {
          margin: 0 auto;
          max-width: 520px;
          text-align: center;
          font-size: 13px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.58);
          will-change: transform;
        }

        .home-section__image-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          min-width: 0;
          max-height: none;
          aspect-ratio: auto;
          display: grid;
          place-items: center;
        }

        .home-section__image-stack {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          place-items: stretch;
          will-change: transform;
        }

        .home-section__image-shadow {
          display: none;
        }

        .home-section__image-bg-text {
          position: absolute;
          top: 40%;
          left: 55%;
          transform: translate(-50%, -50%);
          z-index: 1;
          font-family: 'Sora', sans-serif;
          font-size: clamp(400px, 150vw, 600px);
          font-weight: 700;
          letter-spacing: 0.3em;
          line-height: 0.82;
          color: #ffffff;
          opacity: 1;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          will-change: transform, opacity, color;
        }

        .home-letter-e,
        .home-letter-n {
          display: inline-block;
          text-shadow:
            0 0 24px rgba(255, 255, 255, 0.22),
            0 0 56px rgba(255, 255, 255, 0.14),
            0 0 120px rgba(255, 255, 255, 0.1),
            0 0 180px rgba(255, 255, 255, 0.06);
        }

        .home-section__image {
          position: relative;
          inset: auto;
          width: 100%;
          height: 100%;
          z-index: 2;
          object-fit: cover;
          object-position: center center;
          mix-blend-mode: normal;
          filter: contrast(1.12) brightness(1.04);
          box-shadow: none;
          user-select: none;
          pointer-events: none;
          will-change: transform;
        }

        @keyframes homeImageEnter {
          0% {
            opacity: 0;
            transform: translate3d(0, 68px, 0) scale(0.9);
            filter: blur(12px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes homeFadeLift {
          0% {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes homeRingEnter {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }

        @keyframes homeCrosshairEnter {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 900px) {
          .home-section__image-wrap {
            width: 100%;
            height: 100%;
          }

          .home-section__crosshair {
            opacity: 0.24;
          }
        }

        @media (max-width: 768px) {
          .home-section {
            display: block !important;
            padding: 10px 0 40px !important; /* Extremely tight top padding */
            padding-top: 0 !important;
            min-height: 80vh !important; /* Allow it to be shorter if content is compact */
            height: auto !important;
            background: #000000 !important;
            position: relative !important;
            overflow: hidden !important;
          }

          .home-section__center {
             padding-top: 20px !important; /* Move content way up */
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
            height: auto !important;
            gap: 20px !important;
            position: relative !important;
            z-index: 10 !important;
          }

          .home-section__intro-copy:not(.home-section__code) {
             position: relative !important;
             top: auto !important;
             left: auto !important;
             text-align: center !important;
             width: 100% !important;
             padding: 0 24px !important;
             order: -1 !important;
             margin-bottom: 0 !important;
          }

          /* Hide complex code and glyphs on mobile to prevent bad spacing */
          .home-section__code,
          .home-section__glyph,
          .home-section__orb,
          .home-section__shape {
            display: none !important;
          }

          .home-section__image-wrap {
            position: relative !important;
            width: 220px !important;
            height: 310px !important;
            margin: 10px auto !important;
          }

          .home-section__image {
            border-radius: 8px !important;
            box-shadow: none !important;
          }

          .home-section__image-bg-text {
            font-size: 45vw !important;
            opacity: 1 !important;
            color: #ffffff !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100vw !important;
            letter-spacing: 0 !important;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4)) !important;
          }

          .home-section__subtext {
            position: relative !important;
            width: 100% !important;
            padding: 10px 24px 0 !important;
            text-align: center !important;
            display: block !important;
            inset: auto !important;
          }

          .home-section__subtext-inner {
            font-size: 13px !important;
            line-height: 1.6 !important;
            color: rgba(255, 255, 255, 0.4) !important;
            max-width: 260px !important;
          }
        }
      `}</style>
    </section>
  );
};
