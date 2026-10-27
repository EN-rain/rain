import icon from '../../assets/images/hero3.png';
import { Mail, Github, Linkedin } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section id="contact" className="stack-section">
      <div
        className="parallax-content relative flex flex-col items-center justify-center overflow-hidden pl-0 pr-0 text-[#151226]"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <div className="contact-bg-art" aria-hidden="true">
            <span className="contact-bg-symbol">@</span>
            <span className="contact-bg-text contact-bg-text--email">EMAIL</span>
            <span className="contact-bg-text contact-bg-text--social">GITHUB / LINKEDIN</span>
            <span className="contact-bg-cut contact-bg-cut--top"></span>
            <span className="contact-bg-cut contact-bg-cut--bottom"></span>
          </div>
        </div>

        <img
          id="contact-icon"
          className="contact-image"
          src={icon}
          alt="Developer portrait"
          style={{
            position: 'absolute',
            left: '-160px',
            bottom: '-33%',
            height: '1000px',
            width: 'auto',
            maxWidth: '52vw',
            objectFit: 'contain',
            transformOrigin: 'left bottom',
            pointerEvents: 'none',
            zIndex: 5
          }}
        />

        <div className="contact-shell locked-content relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center gap-10 px-8 py-12 md:px-20">
          <div
            className="contact-text contact-copy scroll-parallax-text"
            data-speed="0.04"
            style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}
          >
            <h2
              className="contact-heading"
              style={{
                margin: '0 auto',
                maxWidth: '900px',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
                lineHeight: 0.94,
                letterSpacing: '-0.06em',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#151226',
                transition: 'none'
              }}
            >
              Let&apos;s talk
              <br />
              <span className="contact-heading-accent">about your project.</span>
            </h2>

            <p
              className=""
              style={{
                margin: '1.5rem auto 0',
                maxWidth: '500px',
                fontSize: '15px',
                lineHeight: 1.85,
                color: 'rgba(21, 18, 38, 0.72)'
              }}
            >
              Full-Stack Engineer focused on building modern digital products with clean interfaces, reliable backend systems, and efficient deployment. I enjoy working across the entire development process, from planning and design to implementation and refinement.
            </p>
          </div>

          <div
            className="contact-grid scroll-parallax-text"
            data-speed="0.025"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1.5rem',
              zIndex: 20
            }}
          >
            <div className="flex" style={{ flexDirection: 'row', gap: '1.5rem', alignItems: 'center' }}>
              <a
                className="contact-text"
                href="mailto:nieves.edriancit2011@email.com"
                aria-label="Email"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  color: '#151226',
                  textDecoration: 'none'
                }}
              >
                <Mail size={18} />
              </a>

              <a
                className="contact-text"
                href="https://github.com/EN-rain"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  color: '#151226',
                  textDecoration: 'none'
                }}
              >
                <Github size={18} />
              </a>

              <a
                className="contact-text"
                href="https://linkedin.com/in/en-rain"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  color: '#151226',
                  textDecoration: 'none'
                }}
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .contact-heading-accent {
          color: #7c3aed;
        }

        /* Hide portrait on desktop; show on mobile only */
        #contact-icon {
          display: none;
        }

        .contact-bg-art {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .contact-bg-symbol {
          position: absolute;
          left: 50%;
          top: 50%;
          font-family: 'Sora', sans-serif;
          font-size: clamp(360px, 50vw, 720px);
          font-weight: 800;
          line-height: 0.8;
          color: transparent;
          -webkit-text-stroke: 2px rgba(124, 58, 237, 0.18);
          text-stroke: 2px rgba(124, 58, 237, 0.18);
          transform: translate(-50%, -52%);
        }

        .contact-bg-text {
          position: absolute;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.24em;
          color: rgba(21, 18, 38, 0.24);
        }

        .contact-bg-text--email {
          left: 8vw;
          top: 23vh;
          writing-mode: vertical-rl;
        }

        .contact-bg-text--social {
          right: 7vw;
          bottom: 18vh;
        }

        .contact-bg-cut {
          position: absolute;
          height: 1px;
          background: rgba(21, 18, 38, 0.2);
        }

        .contact-bg-cut--top {
          right: 0;
          top: 28vh;
          width: 28vw;
        }

        .contact-bg-cut--bottom {
          left: 0;
          bottom: 25vh;
          width: 34vw;
        }

        @media (max-width: 900px) {
          .contact-shell {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            padding-top: 6rem !important;
            padding-bottom: 4rem !important;
            height: auto !important;
          }

          .contact-copy,
          .contact-grid > div {
            text-align: center !important;
          }

          .contact-copy p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }

        @media (max-width: 768px) {
          .contact-shell {
            display: flex !important;
            flex-direction: column !important;
            padding: 140px 28px 60px !important; 
            height: auto !important;
            min-height: 100vh !important;
            gap: 40px !important;
            justify-content: flex-start !important;
            align-items: center !important;
          }

          .contact-copy,
          .contact-media,
          .contact-grid {
            width: 100% !important;
            max-width: 440px !important;
            margin: 0 auto !important;
          }

          .contact-grid {
            justify-content: center !important;
            gap: 0 !important;
            border-top: 1px solid rgba(124, 58, 237, 0.1) !important;
          }

          .contact-grid > div {
            padding: 1.25rem 0 !important;
            border-bottom: 1px solid rgba(124, 58, 237, 0.1) !important;
          }

          #contact-icon {
            display: block !important;
            height: 240px !important;
          }

          .contact-copy h2 {
            font-size: 54px !important;
            line-height: 1 !important;
          }
        }

        @media (max-width: 480px) {
          .contact-shell {
            padding-top: 90px !important;
            gap: 35px !important;
          }

          .contact-copy h2 {
            font-size: 42px !important;
          }

          .contact-copy p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            color: rgba(21, 18, 38, 0.6) !important;
          }

          #contact-icon { height: 200px !important; }
        }
      `}</style>
    </section>
  );
};
