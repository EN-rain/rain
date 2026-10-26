import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { projects } from '../data/works';
import { useLenis } from '../hooks/scroll/useLenis';
import projectLogoPlaceholder from '../assets/images/icon.jpg';

export function ProjectsPage() {
  useLenis();
  const [isLeaving, setIsLeaving] = useState(false);

  const openProject = (projectId: string) => {
    window.dispatchEvent(new CustomEvent('portfolio-navigate', { detail: { path: `/projects/${projectId}`, projectTransition: true } }));
  };

  const returnToPortfolio = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    window.dispatchEvent(new CustomEvent('portfolio-navigate', {
      detail: { path: '/', projectTransition: true, returnToWorksProjects: true },
    }));
  };

  return (
    <main className="projects-page projects-index-page min-h-screen bg-black px-5 py-10 text-white md:px-12 md:py-14">
      <div className="mx-auto w-full max-w-7xl">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            returnToPortfolio();
          }}
          className={`project-back-button tech-font fixed left-5 top-6 z-50 inline-flex min-h-11 items-center gap-2 border border-white/10 bg-black/80 px-3 text-[11px] uppercase tracking-widest text-white/75 backdrop-blur-sm transition-[transform,opacity,border-color,color] duration-300 ease-in-out hover:border-[#7c3aed] hover:text-white md:left-12 md:top-10 ${isLeaving ? '-translate-x-10 opacity-0 pointer-events-none' : ''}`}
        >
          <ArrowLeft size={15} />
          Back to portfolio
        </a>

        <header className="projects-page-header mb-10 pt-16 md:pt-14">
          <p className="tech-font mb-3 text-[11px] uppercase tracking-[0.22em] text-[#7c3aed]">
            Personal work
          </p>
          <h1 className="heading-font text-4xl font-bold uppercase tracking-tight md:text-6xl">
            All Projects
          </h1>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...projects].reverse().map((project) => (
            <article
              key={project.id}
              role="link"
              tabIndex={0}
              aria-label={`Open ${project.title} project`}
              onClick={() => openProject(project.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openProject(project.id);
                }
              }}
              className="projects-page-card relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <div className="relative aspect-[16/7] overflow-visible">
                <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#080808]">
                  {project.img ? (
                    <img
                      src={project.img}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <span className="heading-font text-lg uppercase tracking-[0.18em] text-white/15">
                        {project.status ?? project.line2}
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <img
                  src={project.icon ?? projectLogoPlaceholder}
                  alt=""
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 z-10 h-[120px] w-[120px] -translate-x-1/2 translate-y-1/2 rounded-xl border border-white/10 object-cover"
                />
              </div>

              <div className="px-6 pb-6 pt-20 text-center">
                <p className="tech-font mb-2 text-[12px] font-bold text-[#7c3aed]">{project.year}</p>
                <h2 className="heading-font text-2xl font-bold md:text-3xl">{project.title}</h2>
                <p className="heading-font mt-1 text-[11px] uppercase tracking-wider text-white/45">
                  {project.line2}
                </p>
                <p className="mt-8 text-[13px] leading-relaxed text-white/65">{project.des}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
