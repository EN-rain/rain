import { useState } from 'react';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { projects } from '../data/works';
import { projectDetails } from '../data/projectDetails';
import { useLenis } from '../hooks/scroll/useLenis';
import projectLogoPlaceholder from '../assets/images/icon.jpg';

type ProjectDetailPageProps = {
  projectId: string;
};

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  useLenis();
  const [isLeaving, setIsLeaving] = useState(false);

  const project = projects.find((item) => item.id === projectId);
  const detail = projectDetails[projectId];

  if (!project || !detail) return null;

  const returnToProjects = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    window.dispatchEvent(new CustomEvent('portfolio-navigate', {
      detail: { path: '/projects' },
    }));
  };

  return (
    <main className="projects-page project-detail-page min-h-dvh bg-black text-left text-white">
      <article className="w-full">
        <a
          href="/projects"
          onClick={(event) => {
            event.preventDefault();
            returnToProjects();
          }}
          className={`project-back-button tech-font fixed left-5 top-6 z-50 inline-flex min-h-11 items-center gap-2 border border-white/10 bg-black/80 px-3 text-[11px] uppercase tracking-widest text-white/75 backdrop-blur-sm transition-[transform,opacity,border-color,color] duration-300 ease-in-out hover:border-[#7c3aed] hover:text-white md:left-12 md:top-10 ${isLeaving ? '-translate-x-10 opacity-0 pointer-events-none' : ''}`}
        >
          <ArrowLeft size={15} />
          Back to all projects
        </a>

        <div className="relative min-h-[72dvh] overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#080808] md:min-h-dvh">
          {project.img ? (
            <img src={project.img} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end px-5 pb-10 text-left md:px-12 md:pb-16">
              <span className="heading-font text-lg uppercase tracking-[0.18em] text-white/15">
                {project.status ?? project.line2}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />

          <div className="absolute inset-x-5 bottom-10 z-10 text-left md:inset-x-12 md:bottom-16">
            <img
              src={project.icon ?? projectLogoPlaceholder}
              alt=""
              aria-hidden="true"
              className="mb-5 h-[120px] w-[120px] rounded-xl border border-white/10 object-cover"
            />
            <p className="tech-font mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/65 md:text-[12px]">{project.year}</p>
            <h1 className="heading-font text-4xl font-bold tracking-tight md:text-7xl">{project.title}</h1>
            <p className="heading-font mt-2 text-[11px] uppercase tracking-wider text-white/60">{project.line2}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((technology) => (
                <span
                  key={technology}
                  className="tech-font border border-white/15 bg-black/20 px-2.5 py-2 text-[9px] uppercase tracking-widest text-white/70 backdrop-blur-sm"
                >
                  {technology}
                </span>
              ))}
            </div>
            {project.links && project.links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tech-font inline-flex min-h-11 items-center gap-2 border border-white/20 bg-black/20 px-4 py-2 text-[10px] uppercase tracking-widest text-white/85 backdrop-blur-sm transition-colors hover:border-[#7c3aed] hover:text-white"
                  >
                    {link.type === 'github' ? <Github size={14} /> : <ExternalLink size={14} />}
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="bg-black px-5 pb-10 pt-6 md:px-12 md:pb-16 md:pt-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 border-t border-white/10 pt-6 lg:grid-cols-12 lg:gap-16 lg:pt-7">
              <div className="lg:col-span-3">
                <p className="tech-font text-[10px] uppercase tracking-[0.22em] text-[#7c3aed]">Overview</p>
                <h2 className="heading-font mt-3 text-2xl font-bold uppercase md:text-3xl">About the project</h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-white/75 lg:col-span-8 lg:col-start-5 md:text-[17px]">
                {detail.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-7xl border-t border-white/10 pt-7 lg:grid-cols-12 lg:gap-16 lg:pt-9">
            <div className="lg:col-span-3">
              <p className="tech-font text-[10px] uppercase tracking-[0.22em] text-[#7c3aed]">Scope</p>
              <h2 className="heading-font mt-3 text-2xl font-bold uppercase md:text-3xl">Features</h2>
            </div>
            <section className="lg:col-span-9">
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:mt-1">
                {detail.features.map((feature, index) => (
                  <li key={feature} className="flex gap-4 text-sm leading-relaxed text-white/70">
                    <span className="tech-font text-xs text-[#7c3aed]">{String(index + 1).padStart(2, '0')}</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {detail.readmeSections.length > 0 && (
            <section className="mx-auto mt-14 max-w-7xl border-t border-white/10 pt-7 lg:pt-9">
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-3">
                  <p className="tech-font text-[10px] uppercase tracking-[0.22em] text-[#7c3aed]">Implementation notes</p>
                  <h2 className="heading-font mt-3 text-2xl font-bold uppercase md:text-3xl">How it is built</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:col-span-9">
                {detail.readmeSections.map((section) => (
                  <article key={section.title} className="bg-white/[0.02] p-5 md:p-7">
                    <p className="tech-font text-[10px] uppercase tracking-[0.18em] text-[#7c3aed]">{section.eyebrow}</p>
                    <h3 className="heading-font mt-3 text-xl font-bold uppercase">{section.title}</h3>
                    <ul className="mt-6 space-y-3">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/65">
                          <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#7c3aed]" />
                          <span className="whitespace-pre-line">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
                </div>
              </div>
            </section>
          )}
        </section>
      </article>
    </main>
  );
}
