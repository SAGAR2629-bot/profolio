import React, { useState, useMemo, useRef } from 'react';
import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import ProjectCaseStudy from '../components/ProjectCaseStudy';
import { usePortfolioData } from '../context/PortfolioDataContext';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { projects } = usePortfolioData();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('NEWEST'); // 'NEWEST', 'OLDEST', 'A-Z'
  const inspectorRef = useRef(null);

  // Derive ONLY real categories that actually exist in the database
  const availableCategories = useMemo(() => {
    const cats = new Set();
    projects.forEach(p => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [projects]);

  // Filter & sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const techMatch = (p.tech || p.technologies || []).some(t => t.toLowerCase().includes(q));
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const domainMatch = (p.domain || '').toLowerCase().includes(q);
        return titleMatch || descMatch || techMatch || catMatch || domainMatch;
      });
    }

    // Sort order
    if (sortOrder === 'NEWEST') {
      result.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sortOrder === 'OLDEST') {
      result.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    } else if (sortOrder === 'A-Z') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [projects, selectedCategory, searchQuery, sortOrder]);

  const safeIdx = (selectedIdx >= 0 && selectedIdx < projects.length) ? selectedIdx : 0;
  const activeProject = projects[safeIdx] || { title: "No project loaded", description: "", tech: [] };
  const activeId = String(safeIdx + 1).padStart(2, '0');

  const handleInspect = (proj) => {
    const idx = projects.findIndex(p => p.id === proj.id || p.title === proj.title);
    if (idx !== -1) {
      setSelectedIdx(idx);
    }
    if (inspectorRef.current) {
      inspectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="projects-page">
      <ConsoleHeaderStrip modeTitle="PROJECT ARCHIVE TERMINAL" codeId="MOD_03" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        {/* A. PROJECT ARCHIVE HEADER */}
        <header className="archive-hero">
          <div className="section-badge">ENGINEERING ARCHIVE // MODULE 03</div>
          <h1 className="archive-hero__title">PROJECT ARCHIVE</h1>
          <div className="archive-hero__tagline">
            ENGINEERING SYSTEMS / EXPERIMENTS / RESEARCH
          </div>
          <p className="archive-hero__quote">
            "Selected work across robotics, AI/ML, computer vision, reinforcement learning, simulation and intelligent systems."
          </p>

          {/* Telemetry Status Line */}
          <div className="archive-telemetry-bar">
            <div className="telemetry-bar-item">
              <span className="telemetry-lamp" aria-hidden="true" />
              <span className="telemetry-label">ARCHIVE STATUS:</span>
              <span className="telemetry-val">ONLINE</span>
            </div>
            <div className="telemetry-bar-item">
              <span className="telemetry-label">PROJECTS INDEXED:</span>
              <span className="telemetry-val">{projects.length} RECORDS</span>
            </div>
            <div className="telemetry-bar-item">
              <span className="telemetry-label">LAST UPDATED:</span>
              <span className="telemetry-val">2026.09</span>
            </div>
          </div>
        </header>

        {/* B. DEDICATED CASE STUDY INSPECTOR */}
        <section className="active-inspector-dock" ref={inspectorRef}>
          <div className="active-inspector-nav retro-panel">
            <div className="active-inspector-nav__left">
              <span className="active-inspector-lamp" />
              <span className="active-inspector-tag">
                ACTIVE_DOSSIER // CASE_{activeId}.ENG
              </span>
            </div>
            <div className="active-inspector-nav__controls">
              <button
                type="button"
                className="retro-btn retro-btn--sm"
                onClick={handlePrev}
                aria-label="Inspect Previous Project"
              >
                ◀ PREV
              </button>
              <span className="active-inspector-pager">
                {safeIdx + 1} / {projects.length}
              </span>
              <button
                type="button"
                className="retro-btn retro-btn--sm"
                onClick={handleNext}
                aria-label="Inspect Next Project"
              >
                NEXT ▶
              </button>
            </div>
          </div>

          <ProjectCaseStudy
            project={activeProject}
            projectNumber={activeId}
            allProjects={projects}
            onSelectProject={handleInspect}
          />
        </section>

        {/* C. PROJECT CONTROLS & FILTER SYSTEM */}
        <div className="archive-controls retro-panel">
          <div className="archive-controls__top">
            {/* Search Input */}
            <div className="archive-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="SEARCH ARCHIVE (TITLE, STACK, DOMAIN)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="archive-search-input"
                aria-label="Search Projects Archive"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="archive-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Controls */}
            <div className="archive-sort-group">
              <span className="sort-label">SORT:</span>
              <button
                type="button"
                className={`retro-btn retro-btn--sm ${sortOrder === 'NEWEST' ? 'retro-btn--blue is-active' : ''}`}
                onClick={() => setSortOrder('NEWEST')}
              >
                [ NEWEST ]
              </button>
              <button
                type="button"
                className={`retro-btn retro-btn--sm ${sortOrder === 'OLDEST' ? 'retro-btn--blue is-active' : ''}`}
                onClick={() => setSortOrder('OLDEST')}
              >
                [ OLDEST ]
              </button>
              <button
                type="button"
                className={`retro-btn retro-btn--sm ${sortOrder === 'A-Z' ? 'retro-btn--blue is-active' : ''}`}
                onClick={() => setSortOrder('A-Z')}
              >
                [ A-Z ]
              </button>
            </div>
          </div>

          {/* Dynamic Category Chips */}
          <div className="archive-categories-row" role="tablist" aria-label="Category Filters">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'ALL'}
              className={`retro-btn retro-btn--sm ${selectedCategory === 'ALL' ? 'retro-btn--yellow is-active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              [ ALL ({projects.length}) ]
            </button>
            {availableCategories.map((cat) => {
              const count = projects.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`retro-btn retro-btn--sm ${isSelected ? 'retro-btn--yellow is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  [ {cat.toUpperCase()} ({count}) ]
                </button>
              );
            })}
          </div>
        </div>

        {/* D. UPGRADED PROJECT CARDS GRID */}
        <section className="projects-grid-section">
          <div className="projects-grid-header">
            <span className="projects-grid-title">
              INDEXED CASE FILES // ({filteredProjects.length} RECORDS MATCHED)
            </span>
            <span className="projects-grid-hint">
              CLICK "[ INSPECT PROJECT → ]" TO OPEN COMPLETE CASE STUDY DOSSIER
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="archive-empty-state retro-panel">
              <span className="empty-state-icon">📡</span>
              <h3 className="empty-state-title">NO MATCHING CASE FILES FOUND</h3>
              <p className="empty-state-desc">
                No engineering records match the query "{searchQuery}". Reset filters or adjust search criteria.
              </p>
              <button
                type="button"
                className="retro-btn retro-btn--yellow"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              >
                [ RESET ALL FILTERS ]
              </button>
            </div>
          ) : (
            <div className="projects-catalog-grid">
              {filteredProjects.map((proj, idx) => {
                const originalIndex = projects.findIndex(p => p.id === proj.id || p.title === proj.title);
                const projNum = String(originalIndex !== -1 ? originalIndex + 1 : idx + 1).padStart(2, '0');
                const isCurrentActive = activeProject.title === proj.title;
                const imagesCount = (proj.images && proj.images.length) || (proj.image ? 1 : 0);
                const isFeatured = !!proj.featured;

                return (
                  <article
                    key={proj.title}
                    className={`project-archive-card retro-panel ${isFeatured ? 'project-archive-card--featured' : ''} ${isCurrentActive ? 'is-active-card' : ''}`}
                  >
                    {/* Top Tape */}
                    <div className="project-card__tape">
                      <div className="project-card__id-badge">
                        PROJECT_{projNum}
                      </div>
                      {isFeatured && (
                        <div className="project-card__featured-banner">
                          ★ FEATURED
                        </div>
                      )}
                      <span className={`project-card__status-chip ${proj.status === 'COMPLETED' ? 'chip-green' : 'chip-yellow'}`}>
                        [ {proj.status || 'COMPLETED'} ]
                      </span>
                    </div>

                    {/* Card Cover Visual Area */}
                    <div className="project-card__visual" onClick={() => handleInspect(proj)}>
                      {proj.image ? (
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="project-card__cover-img"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="project-card__placeholder"
                        style={{ display: proj.image ? 'none' : 'flex' }}
                      >
                        <div className="placeholder-circuit-glyph">⊞</div>
                        <span className="placeholder-tag">TELEMETRY_LOGGED</span>
                        <span className="placeholder-sub">#{projNum} // {proj.category}</span>
                      </div>
                      <div className="project-card__hover-prompt">
                        <span>[ INSPECT CASE ➔ ]</span>
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className="project-card__body">
                      <div className="project-card__meta-line">
                        <span className="project-card__year">{proj.year || "2026"}</span>
                        <span className="project-card__cat">{proj.category || "AI/ML"}</span>
                      </div>

                      <h3 className="project-card__title" onClick={() => handleInspect(proj)}>
                        {proj.title}
                      </h3>

                      <p className="project-card__desc">
                        {proj.description?.length > 130
                          ? `${proj.description.substring(0, 130)}...`
                          : proj.description}
                      </p>

                      {/* Tech Chips */}
                      <div className="project-card__tech-row">
                        {(proj.tech || proj.technologies || []).slice(0, 4).map((t) => (
                          <span key={t} className="retro-tag retro-tag--yellow">
                            {t}
                          </span>
                        ))}
                        {(proj.tech || proj.technologies || []).length > 4 && (
                          <span className="retro-tag retro-tag--cyan">
                            +{(proj.tech || proj.technologies || []).length - 4} MORE
                          </span>
                        )}
                      </div>

                      {/* Telemetry metadata row */}
                      <div className="project-card__specs-row">
                        <span className="spec-item">DOMAIN: {proj.domain || "ROBOTICS"}</span>
                        <span className="spec-item">PLATFORM: {proj.platform || "SIM/REAL"}</span>
                        <span className="spec-item">📷 {imagesCount} MEDIA</span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="project-card__footer">
                      <button
                        type="button"
                        className={`retro-btn retro-btn--sm ${isCurrentActive ? 'retro-btn--blue' : 'retro-btn--yellow'}`}
                        onClick={() => handleInspect(proj)}
                        style={{ width: '100%' }}
                      >
                        <span>{isCurrentActive ? '● INSPECTING CASE FILE' : '[ INSPECT PROJECT → ]'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
