import React, { useMemo } from 'react';
import RetroImageSlider from './RetroImageSlider';
import RelatedRecords from './RelatedRecords';
import './ProjectCaseStudy.css';

export default function ProjectCaseStudy({
  project,
  projectNumber = "01",
  allProjects = [],
  onSelectProject,
  onClose,
  isModal = false
}) {
  // Compute 2-3 related projects based on shared category and technologies
  const relatedProjects = useMemo(() => {
    if (!project || !allProjects || allProjects.length <= 1) return [];
    const currentTech = new Set((project.tech || project.technologies || []).map(t => t.toLowerCase()));
    const currentCategory = (project.category || '').toLowerCase();

    return allProjects
      .filter(p => (p.id !== project.id && p.title !== project.title))
      .map(p => {
        let score = 0;
        if ((p.category || '').toLowerCase() === currentCategory) score += 3;
        const otherTech = (p.tech || p.technologies || []).map(t => t.toLowerCase());
        otherTech.forEach(t => {
          if (currentTech.has(t)) score += 1;
        });
        return { project: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.project);
  }, [project, allProjects]);

  if (!project) return null;

  const num = String(projectNumber).padStart(2, '0');
  const links = project.links || {};
  const hasGithub = project.github || links.github;
  const hasLive = project.live || project.demo || links.demo || links.live;
  const hasDocs = links.documentation || links.docs;
  const hasPaper = links.paper || links.research_paper;
  const hasVideo = links.video;
  const hasDataset = links.dataset;
  const hasOther = links.other;
  const hasAnyLinks = hasGithub || hasLive || hasDocs || hasPaper || hasVideo || hasDataset || hasOther;

  const images = useMemo(() => {
    const list = [...(project.images || [])];
    if (list.length === 0 && project.image) {
      list.push({ url: project.image, caption: project.title, is_cover: true });
    }
    if (hasVideo && !list.some(item => item.url === hasVideo)) {
      list.unshift({
        url: hasVideo,
        caption: `${project.title} — Demonstration Video Stream`,
        media_type: 'VIDEO',
        is_cover: false
      });
    }
    return list;
  }, [project, hasVideo]);

  const metrics = (project.metrics && Array.isArray(project.metrics)) ? project.metrics : [];
  const challenges = (project.challenges && Array.isArray(project.challenges)) ? project.challenges : [];
  const milestones = (project.milestones && Array.isArray(project.milestones)) ? project.milestones : [];
  const technologies = (project.tech && project.tech.length > 0) ? project.tech : (project.technologies || []);

  const overviewText = project.overview || project.fullDescription || project.description || "";

  return (
    <article className={`project-dossier retro-panel ${isModal ? 'project-dossier--modal' : ''}`}>
      {/* 1. PROJECT IDENTITY & HEADER TAPE */}
      <header className="project-dossier__header">
        <div className="project-dossier__tape">
          <div className="project-dossier__id-group">
            <span className="project-dossier__status-dot" aria-hidden="true" />
            <span className="project-dossier__badge">CASE_DOSSIER // AS-ENG-ARCHIVE_{num}</span>
            {project.featured && (
              <span className="project-dossier__featured-tag">★ FEATURED SYSTEM</span>
            )}
          </div>
          <div className="project-dossier__header-actions">
            <span className="project-dossier__status-tag">
              STATUS: {project.status || "COMPLETED"}
            </span>
            {onClose && (
              <button
                type="button"
                className="retro-btn retro-btn--sm"
                onClick={onClose}
                aria-label="Close Case File"
              >
                [ CLOSE ✕ ]
              </button>
            )}
          </div>
        </div>

        <div className="project-dossier__title-banner">
          <div className="project-dossier__meta-strip">
            <span className="retro-tag retro-tag--yellow">YEAR: {project.year || "2026"}</span>
            <span className="retro-tag retro-tag--blue">CATEGORY: {project.category || "AI/ML"}</span>
            {project.domain && (
              <span className="retro-tag retro-tag--cyan">DOMAIN: {project.domain}</span>
            )}
            {project.platform && (
              <span className="retro-tag retro-tag--green">PLATFORM: {project.platform}</span>
            )}
          </div>

          <h1 className="project-dossier__title">{project.title}</h1>

          {/* External Action Controls */}
          {hasAnyLinks && (
            <div className="project-dossier__actions">
              {hasGithub && (
                <a
                  href={hasGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn retro-btn--blue"
                >
                  <span>[ GITHUB REPOSITORY ↗ ]</span>
                </a>
              )}
              {hasLive && (
                <a
                  href={hasLive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn retro-btn--yellow"
                >
                  <span>[ LIVE DEMO INTERFACE ↗ ]</span>
                </a>
              )}
              {hasDocs && (
                <a
                  href={hasDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn"
                >
                  <span>[ DOCUMENTATION ↗ ]</span>
                </a>
              )}
              {hasPaper && (
                <a
                  href={hasPaper}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn retro-btn--cyan"
                >
                  <span>[ RESEARCH PAPER ↗ ]</span>
                </a>
              )}
              {hasVideo && (
                <a
                  href={hasVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn retro-btn--cyan"
                >
                  <span>[ ▶ VIDEO STREAM ↗ ]</span>
                </a>
              )}
              {hasDataset && (
                <a
                  href={hasDataset}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn"
                >
                  <span>[ DATASET ↗ ]</span>
                </a>
              )}
              {hasOther && (
                <a
                  href={hasOther}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn"
                >
                  <span>[ EXTERNAL LINK ↗ ]</span>
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="project-dossier__body">
        {/* MEDIA SECTION (If telemetry imagery exists) */}
        {images.length > 0 && (
          <section className="dossier-section dossier-section--media">
            <div className="dossier-section__header">
              <span className="dossier-section__num">10 //</span>
              <h2 className="dossier-section__title">Project Telemetry & Imagery</h2>
              <span className="dossier-section__meta">[{images.length} CAPTURES LOGGED]</span>
            </div>
            <div className="dossier-media-container">
              <RetroImageSlider images={images} title={`TELEMETRY DATA // ${project.title}`} />
            </div>
          </section>
        )}

        {/* 01 // OVERVIEW */}
        {overviewText && (
          <section className="dossier-section">
            <div className="dossier-section__header">
              <span className="dossier-section__num">01 //</span>
              <h2 className="dossier-section__title">Project Overview</h2>
            </div>
            <div className="dossier-text-block">
              <p>{overviewText}</p>
            </div>
          </section>
        )}

        {/* 02 // THE PROBLEM */}
        {project.problem && (
          <section className="dossier-section dossier-section--problem">
            <div className="dossier-section__header">
              <span className="dossier-section__num">02 //</span>
              <h2 className="dossier-section__title">The Engineering Problem</h2>
            </div>
            <div className="dossier-callout dossier-callout--problem">
              <div className="dossier-callout__marker">! CHALLENGE SPECIFICATION</div>
              <p>{project.problem}</p>
            </div>
          </section>
        )}

        {/* 03 // APPROACH */}
        {project.approach && (
          <section className="dossier-section">
            <div className="dossier-section__header">
              <span className="dossier-section__num">03 //</span>
              <h2 className="dossier-section__title">Methodological Approach</h2>
            </div>
            <div className="dossier-text-block">
              <p>{project.approach}</p>
            </div>
          </section>
        )}

        {/* 04 // IMPLEMENTATION */}
        {project.implementation && (
          <section className="dossier-section">
            <div className="dossier-section__header">
              <span className="dossier-section__num">04 //</span>
              <h2 className="dossier-section__title">System Implementation</h2>
            </div>
            <div className="dossier-text-block">
              <p>{project.implementation}</p>
            </div>
          </section>
        )}

        {/* 05 // ARCHITECTURE */}
        {project.architecture && (
          <section className="dossier-section">
            <div className="dossier-section__header">
              <span className="dossier-section__num">05 //</span>
              <h2 className="dossier-section__title">Pipeline & Architecture</h2>
            </div>
            <div className="dossier-text-block dossier-text-block--arch">
              <p>{project.architecture}</p>
            </div>
          </section>
        )}

        {/* 06 // TECHNOLOGY STACK */}
        {technologies.length > 0 && (
          <section className="dossier-section dossier-section--tech">
            <div className="dossier-section__header">
              <span className="dossier-section__num">06 //</span>
              <h2 className="dossier-section__title">Deployed Hardware & Toolchain</h2>
            </div>
            <div className="dossier-tech-grid">
              {technologies.map((t) => (
                <div key={t} className="dossier-tech-chip">
                  <span className="dossier-tech-chip__led" aria-hidden="true" />
                  <span className="dossier-tech-chip__name">{t}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 07 // RESULTS / METRICS */}
        {metrics.length > 0 && (
          <section className="dossier-section dossier-section--results">
            <div className="dossier-section__header">
              <span className="dossier-section__num">07 //</span>
              <h2 className="dossier-section__title">Benchmarked Results & Telemetry</h2>
              <span className="dossier-section__meta">[VERIFIED EXPERIMENTAL DATA]</span>
            </div>
            <div className="dossier-metrics-grid">
              {metrics.map((m, idx) => (
                <div key={idx} className="dossier-metric-card">
                  <div className="dossier-metric-card__header">
                    <span className="dossier-metric-card__idx">METRIC_{String(idx + 1).padStart(2, '0')}</span>
                    <span className="dossier-metric-card__led" />
                  </div>
                  <div className="dossier-metric-card__val">{m.value}</div>
                  <div className="dossier-metric-card__label">{m.label}</div>
                  {m.description && (
                    <div className="dossier-metric-card__desc">{m.description}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 08 // CHALLENGES & SOLUTIONS */}
        {challenges.length > 0 && (
          <section className="dossier-section dossier-section--challenges">
            <div className="dossier-section__header">
              <span className="dossier-section__num">08 //</span>
              <h2 className="dossier-section__title">Engineering Challenges & Resolutions</h2>
            </div>
            <div className="dossier-challenges-list">
              {challenges.map((c, idx) => (
                <div key={idx} className="dossier-challenge-row">
                  <div className="dossier-challenge-box">
                    <div className="dossier-challenge-tag">
                      <span>CHALLENGE_{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="dossier-challenge-content">{c.challenge}</p>
                  </div>
                  <div className="dossier-challenge-arrow">➔</div>
                  <div className="dossier-solution-box">
                    <div className="dossier-solution-tag">
                      <span>ENGINEERED RESOLUTION</span>
                    </div>
                    <p className="dossier-solution-content">{c.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 09 // ENGINEERING NOTES */}
        {project.engineering_notes && (
          <section className="dossier-section dossier-section--notes">
            <div className="dossier-section__header">
              <span className="dossier-section__num">09 //</span>
              <h2 className="dossier-section__title">Engineering Notes & Observations</h2>
            </div>
            <div className="dossier-notes-box">
              <div className="dossier-notes-tape">LAB_NOTEBOOK_ENTRY // CONFIDENTIAL ARCHIVE</div>
              <p>{project.engineering_notes}</p>
            </div>
          </section>
        )}

        {/* 11 // TIMELINE / MILESTONES */}
        {milestones.length > 0 && (
          <section className="dossier-section dossier-section--timeline">
            <div className="dossier-section__header">
              <span className="dossier-section__num">11 //</span>
              <h2 className="dossier-section__title">Development Milestones</h2>
            </div>
            <div className="dossier-timeline-trail">
              {milestones.map((m, idx) => (
                <div key={idx} className="dossier-timeline-step">
                  <div className="dossier-timeline-node">
                    <span className="dossier-timeline-pin" />
                    <span className="dossier-timeline-date">{m.date}</span>
                  </div>
                  <div className="dossier-timeline-info">
                    <h3 className="dossier-timeline-title">{m.title}</h3>
                    {m.description && (
                      <p className="dossier-timeline-desc">{m.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 13 // RELATED PROJECTS */}
        {relatedProjects.length > 0 && (
          <section className="dossier-section dossier-section--related">
            <div className="dossier-section__header">
              <span className="dossier-section__num">13 //</span>
              <h2 className="dossier-section__title">Related Engineering Cases</h2>
              <span className="dossier-section__meta">[MATCHED ON DOMAIN & STACK]</span>
            </div>
            <div className="dossier-related-grid">
              {relatedProjects.map((rel) => (
                <div
                  key={rel.title}
                  className="dossier-related-card"
                  onClick={() => onSelectProject && onSelectProject(rel)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProject && onSelectProject(rel)}
                >
                  <div className="dossier-related-card__header">
                    <span className="retro-tag retro-tag--yellow">{rel.year || "2026"}</span>
                    <span className="retro-tag retro-tag--cyan">{rel.category}</span>
                  </div>
                  <h4 className="dossier-related-card__title">{rel.title}</h4>
                  <p className="dossier-related-card__desc">
                    {rel.description?.length > 90 ? `${rel.description.substring(0, 90)}...` : rel.description}
                  </p>
                  <div className="dossier-related-card__footer">
                    <span>[ INSPECT CASE ➔ ]</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONNECTED ARCHIVE REGISTRIES */}
        <div style={{ marginTop: '2rem' }}>
          <RelatedRecords
            skills={technologies}
            title="CONNECTED REGISTRY RECORDS // DEMONSTRATED SKILLS"
          />
        </div>
      </div>

      <footer className="project-dossier__footer">
        <div className="project-dossier__footer-seal">
          <span>END OF FILE // AS-ENG-REGISTRY-{num}</span>
        </div>
      </footer>
    </article>
  );
}
