import { projects } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Projects.css';

export default function Projects() {
  const ref = useScrollReveal();

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">CASE REGISTRY // 004</div>
          <h2 className="section-title">Engineering Projects</h2>
          <p className="section-subtitle">
            Documented robotic architectures, perception systems, and autonomous controllers.
          </p>
        </div>

        <div className="projects__grid scroll-reveal" ref={ref}>
          {projects.map((project, idx) => {
            const projectNumber = String(idx + 1).padStart(2, '0');
            const isFeatured = idx < 2;

            return (
              <article 
                key={project.title} 
                className={`project-case retro-panel ${isFeatured ? 'project-case--featured' : ''}`}
              >
                {/* Case File Header Tape */}
                <div className="project-case__tape">
                  <div className="project-case__id">
                    <span className="project-case__id-badge">ID_{projectNumber}</span>
                    <span className="project-case__filename">CASE_FILE_{projectNumber}.ENG</span>
                  </div>
                  <div className="project-case__status-box">
                    <span className="project-case__status-lamp" aria-hidden="true" />
                    <span>SYSTEM_VERIFIED</span>
                  </div>
                </div>

                <div className="project-case__content">
                  <h3 className="project-case__title">{project.title}</h3>
                  <p className="project-case__desc">{project.description}</p>

                  {/* Technical Blueprint Specifications */}
                  <div className="project-case__tech-block">
                    <span className="project-case__block-label">STACK & TOOLCHAIN:</span>
                    <div className="project-case__tech-tags">
                      {project.tech.map((t) => (
                        <span key={t} className="retro-tag retro-tag--yellow">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tactile Control Actions */}
                <div className="project-case__actions">
                  {project.github && (
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="retro-btn retro-btn--sm retro-btn--blue"
                    >
                      <span>[ SOURCE CODE ↗ ]</span>
                    </a>
                  )}
                  {project.live && (
                    <a 
                      href={project.live} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="retro-btn retro-btn--sm retro-btn--yellow"
                    >
                      <span>[ LIVE DEMO ↗ ]</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
