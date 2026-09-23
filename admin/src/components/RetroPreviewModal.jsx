import React, { useState } from 'react';
import './RetroPreviewModal.css';

export default function RetroPreviewModal({ isOpen, onClose, type = "project", data }) {
  const [activeTheme, setActiveTheme] = useState('warm-archive');
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!isOpen || !data) return null;

  const themes = [
    { id: 'warm-archive', label: 'Warm Archive' },
    { id: 'blueprint', label: 'Blueprint' },
    { id: 'mint-lab', label: 'Mint Lab' },
    { id: 'sunset-eng', label: 'Sunset' },
  ];

  const images = data.images || [];
  const safeImgIdx = images.length > 0 ? (activeImgIdx % images.length + images.length) % images.length : 0;
  const currentImg = images[safeImgIdx] || null;

  const technologies = data.technologies || data.tech || [];
  const metrics = data.metrics || [];
  const challenges = data.challenges || [];
  const milestones = data.milestones || [];
  const links = data.links || {};

  const overviewText = data.overview || data.full_description || data.description || '';

  return (
    <div className="retro-preview-overlay" onClick={onClose}>
      <div className="retro-preview-window" onClick={(e) => e.stopPropagation()}>
        {/* Top Preview Control Deck */}
        <div className="preview-top-deck">
          <div className="preview-deck-title">
            <span className={data.published ? "live-tag" : "draft-tag"}>
              {data.published ? "● LIVE RECORD PREVIEW" : "○ DRAFT PREVIEW (UNPUBLISHED)"}
            </span>
            <span>[{type.toUpperCase()}: {data.title || "UNTITLED"}]</span>
          </div>

          <div className="preview-theme-selector">
            <span className="theme-label">TEST THEME:</span>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-pill ${activeTheme === t.id ? 'active' : ''}`}
                onClick={() => setActiveTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn-close-preview" onClick={onClose}>
            ✕ EXIT PREVIEW
          </button>
        </div>

        {/* Viewport Frame with Public Theme Binding */}
        <div className="retro-preview-body" data-theme={activeTheme}>
          {type === 'project' && (
            <div className="retro-preview-panel">
              {/* Header Tape */}
              <div className="retro-header-plate">
                <span className="plate-tag">ACTIVE_DOSSIER // {data.slug || "CASE_FILE"}.ENG</span>
                <span className={`plate-badge ${data.published ? 'badge-pub' : 'badge-draft'}`}>
                  {data.published ? "● PUBLISHED RECORD" : "○ DRAFT RECORD"}
                </span>
              </div>

              <div className="retro-panel-inner">
                {/* Meta strip */}
                <div className="preview-meta-tags">
                  <span className="preview-tag tag-cyan">DOMAIN: {data.domain || data.category || "AI/ML"}</span>
                  <span className="preview-tag tag-yellow">YEAR: {data.year || "2026"}</span>
                  <span className="preview-tag tag-green">STATUS: {data.status || "COMPLETED"}</span>
                  {data.platform && <span className="preview-tag tag-blue">PLATFORM: {data.platform}</span>}
                </div>

                <h1 className="preview-project-title">{data.title}</h1>

                {/* External links */}
                <div className="preview-links-row">
                  {(links.github || data.github_url) && (
                    <span className="preview-btn-mock">[ GITHUB ↗ ]</span>
                  )}
                  {(links.demo || data.demo_url) && (
                    <span className="preview-btn-mock">[ LIVE DEMO ↗ ]</span>
                  )}
                  {links.documentation && (
                    <span className="preview-btn-mock">[ DOCS ↗ ]</span>
                  )}
                  {links.paper && (
                    <span className="preview-btn-mock">[ PAPER ↗ ]</span>
                  )}
                </div>

                {/* Media Gallery */}
                {images.length > 0 && (
                  <div className="preview-gallery-container">
                    <div className="preview-gallery-header">
                      <span>10 // TELEMETRY IMAGERY [{safeImgIdx + 1} / {images.length}]</span>
                      <span className="preview-type-chip">[{currentImg?.media_type || "SCREENSHOT"}]</span>
                    </div>
                    <div className="preview-gallery-main">
                      <img
                        src={currentImg?.url || currentImg?.media?.public_url}
                        alt="Preview"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {images.length > 1 && (
                        <div className="preview-gallery-nav">
                          <button
                            type="button"
                            onClick={() => setActiveImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>
                    {currentImg?.caption && (
                      <div className="preview-caption-bar">
                        <span>#CAPTION:</span> {currentImg.caption}
                      </div>
                    )}
                    {images.length > 1 && (
                      <div className="preview-gallery-thumbs">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            className={`thumb-box ${i === safeImgIdx ? 'selected' : ''}`}
                            onClick={() => setActiveImgIdx(i)}
                          >
                            <img src={img.url || img.media?.public_url} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 01 // Overview */}
                {overviewText && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">01 // OVERVIEW:</span>
                    <p className="preview-project-desc">{overviewText}</p>
                  </div>
                )}

                {/* 02 // The Problem */}
                {data.problem && (
                  <div className="preview-section-block preview-problem-callout">
                    <span className="preview-section-label">02 // THE PROBLEM:</span>
                    <p>{data.problem}</p>
                  </div>
                )}

                {/* 03 // Approach */}
                {data.approach && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">03 // APPROACH:</span>
                    <p className="preview-project-desc">{data.approach}</p>
                  </div>
                )}

                {/* 04 // Implementation */}
                {data.implementation && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">04 // IMPLEMENTATION:</span>
                    <p className="preview-project-desc">{data.implementation}</p>
                  </div>
                )}

                {/* 05 // Architecture */}
                {data.architecture && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">05 // ARCHITECTURE:</span>
                    <p className="preview-project-desc">{data.architecture}</p>
                  </div>
                )}

                {/* 06 // Toolchain */}
                {technologies.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">06 // TOOLCHAIN & ARCHITECTURE:</span>
                    <div className="tech-pills">
                      {technologies.map((t) => (
                        <span key={t} className="preview-tag tag-yellow">◆ {t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 07 // Results */}
                {metrics.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">07 // BENCHMARKED RESULTS:</span>
                    <div className="preview-metrics-grid">
                      {metrics.map((m, i) => (
                        <div key={i} className="preview-metric-box">
                          <span className="metric-val">{m.value}</span>
                          <span className="metric-lbl">{m.label}</span>
                          {m.description && <span className="metric-sub">{m.description}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 08 // Challenges */}
                {challenges.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">08 // CHALLENGES & RESOLUTIONS:</span>
                    <div className="preview-challenges-list">
                      {challenges.map((c, i) => (
                        <div key={i} className="preview-challenge-item">
                          <div><strong>CHALLENGE:</strong> {c.challenge}</div>
                          <div><strong>SOLUTION:</strong> {c.solution}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 09 // Notes */}
                {data.engineering_notes && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">09 // ENGINEERING NOTES:</span>
                    <p className="preview-project-desc">{data.engineering_notes}</p>
                  </div>
                )}

                {/* 11 // Milestones */}
                {milestones.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">11 // MILESTONES:</span>
                    <div className="preview-milestones-list">
                      {milestones.map((m, i) => (
                        <div key={i} className="preview-milestone-step">
                          <span className="milestone-date">[{m.date}]</span>
                          <strong>{m.title}</strong>
                          {m.description && <span> — {m.description}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACHIEVEMENT PREVIEW */}
          {type === 'achievement' && (
            <div className="retro-preview-panel">
              <div className="retro-header-plate">
                <span className="plate-tag">MISSION_LOG // YEAR {data.year || '2026'} // {data.category || 'MILESTONE'}</span>
                <span className={`plate-badge ${data.published ? 'badge-pub' : 'badge-draft'}`}>
                  {data.published ? "● PUBLISHED RECORD" : "○ DRAFT RECORD"}
                </span>
              </div>
              <div className="retro-panel-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', background: 'var(--admin-bg-base)', border: '2px solid #17191C', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                    {data.badge || "🏆"}
                  </span>
                  <div>
                    <h2 className="preview-project-title" style={{ margin: 0 }}>{data.title}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="preview-tag tag-blue">ORG: {data.organization || "Independent"}</span>
                      {data.event_date && <span className="preview-tag tag-yellow">DATE: {data.event_date}</span>}
                      {data.status && <span className="preview-tag tag-green">STATUS: {data.status}</span>}
                    </div>
                  </div>
                </div>

                {data.description && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">01 // LOG SYNOPSIS:</span>
                    <p className="preview-project-desc">{data.description}</p>
                  </div>
                )}

                {data.accomplishment && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">02 // ACCOMPLISHMENT:</span>
                    <p className="preview-project-desc">{data.accomplishment}</p>
                  </div>
                )}

                {data.contribution && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">03 // ENGINEERING CONTRIBUTION:</span>
                    <p className="preview-project-desc">{data.contribution}</p>
                  </div>
                )}

                {data.result && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">04 // RESULT & BENCHMARKS:</span>
                    <p className="preview-project-desc">{data.result}</p>
                  </div>
                )}

                {/* Evidence Images */}
                {images.length > 0 && (
                  <div className="preview-gallery-container" style={{ marginTop: '1rem' }}>
                    <div className="preview-gallery-header">
                      <span>TELEMETRY EVIDENCE [{safeImgIdx + 1} / {images.length}]</span>
                    </div>
                    <div className="preview-gallery-main">
                      <img src={currentImg?.url || currentImg?.media?.public_url} alt="" />
                    </div>
                  </div>
                )}

                {data.verification_url && (
                  <div style={{ marginTop: '1rem' }}>
                    <span className="preview-btn-mock">[ VERIFY EXTERNAL RECORD ↗ ]</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CERTIFICATE PREVIEW */}
          {type === 'certificate' && (
            <div className="retro-preview-panel">
              <div className="retro-header-plate">
                <span className="plate-tag">CREDENTIAL_VAULT // {data.issuer || "VERIFIED_ISSUER"}</span>
                <span className={`plate-badge ${data.published ? 'badge-pub' : 'badge-draft'}`}>
                  {data.published ? "● PUBLISHED RECORD" : "○ DRAFT RECORD"}
                </span>
              </div>
              <div className="retro-panel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <h2 className="preview-project-title" style={{ margin: 0 }}>{data.title}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="preview-tag tag-blue">ISSUER: {data.issuer}</span>
                      <span className="preview-tag tag-yellow">DATE: {data.date}</span>
                      {data.credential_id && <span className="preview-tag tag-cyan">ID: {data.credential_id}</span>}
                    </div>
                  </div>
                </div>

                {data.description && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">01 // CREDENTIAL SPECIFICATION:</span>
                    <p className="preview-project-desc">{data.description}</p>
                  </div>
                )}

                {data.media?.public_url && (
                  <div style={{ margin: '1rem 0', border: '2px solid #17191C', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={data.media.public_url} alt="Certificate Document" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#000' }} />
                  </div>
                )}

                {data.related_skills && data.related_skills.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">02 // VERIFIED SKILLS:</span>
                    <div className="tech-pills">
                      {data.related_skills.map((s, i) => (
                        <span key={i} className="preview-tag tag-yellow">◆ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.verification_url && (
                  <div style={{ marginTop: '1rem' }}>
                    <span className="preview-btn-mock">[ AUTHENTICATE CREDENTIAL ↗ ]</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKILL CATEGORY PREVIEW */}
          {type === 'skill' && (
            <div className="retro-preview-panel">
              <div className="retro-header-plate">
                <span className="plate-tag">TECHNICAL_REGISTRY // {data.category?.toUpperCase() || 'MODULE'}</span>
                <span className={`plate-badge ${data.published ? 'badge-pub' : 'badge-draft'}`}>
                  {data.published ? "● PUBLISHED RECORD" : "○ DRAFT RECORD"}
                </span>
              </div>
              <div className="retro-panel-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{data.icon || '⚙️'}</span>
                  <div>
                    <h2 className="preview-project-title" style={{ margin: 0 }}>{data.category}</h2>
                    {data.description && <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: '0.3rem 0 0' }}>{data.description}</p>}
                  </div>
                </div>

                <div className="preview-section-block">
                  <span className="preview-section-label">REGISTERED COMPETENCIES:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {(data.items || []).map((it, i) => {
                      const name = typeof it === 'string' ? it : it.name;
                      const level = typeof it === 'object' ? it.level : null;
                      return (
                        <div key={i} style={{ border: '2px solid #17191C', padding: '0.35rem 0.65rem', background: '#FDFBF7', color: '#17191C', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <span>{name}</span>
                          {level && <span style={{ fontSize: '0.7rem', color: '#2563EB', background: '#E0E7FF', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>{level}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDUCATION PREVIEW */}
          {type === 'education' && (
            <div className="retro-preview-panel">
              <div className="retro-header-plate">
                <span className="plate-tag">ACADEMIC_RECORD // {data.duration || "TIMELINE"}</span>
                <span className={`plate-badge ${data.published ? 'badge-pub' : 'badge-draft'}`}>
                  {data.published ? "● PUBLISHED RECORD" : "○ DRAFT RECORD"}
                </span>
              </div>
              <div className="retro-panel-inner">
                <div style={{ borderBottom: '2px dashed #17191C', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                  <span className="mono" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 'bold' }}>
                    TIMELINE: {data.duration} ─── STATUS: {data.status || 'IN PROGRESS'}
                  </span>
                  <h2 className="preview-project-title" style={{ margin: '0.4rem 0' }}>{data.degree}</h2>
                  <div style={{ fontSize: '1rem', color: '#4B5563', fontWeight: 600 }}>
                    {data.institution} {data.location && `· 📍 ${data.location}`}
                  </div>
                </div>

                {data.description && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">01 // CURRICULUM SYNOPSIS:</span>
                    <p className="preview-project-desc">{data.description}</p>
                  </div>
                )}

                {data.relevant_courses && data.relevant_courses.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">02 // VERIFIED COURSEWORK:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {data.relevant_courses.map((c, i) => (
                        <span key={i} className="preview-tag tag-blue">✓ {c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.media?.public_url && (
                  <div style={{ margin: '1rem 0', border: '2px solid #17191C', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={data.media.public_url} alt="Diploma Document" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FIELD EXPERIENCE PREVIEW */}
          {type === 'experience' && (
            <div className="retro-preview-panel">
              <div className="retro-header-plate">
                <span className="plate-tag">FIELD_RECORD // {data.company?.toUpperCase() || 'ORGANIZATION'}</span>
                <span className={`plate-badge ${data.published ? 'badge-pub' : 'badge-draft'}`}>
                  {data.published ? "● PUBLISHED RECORD" : "○ DRAFT RECORD"}
                </span>
              </div>
              <div className="retro-panel-inner">
                <div style={{ borderBottom: '2px dashed #17191C', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                  <span className="mono" style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 'bold' }}>
                    DURATION: [{data.duration}] {data.location && `· 📍 ${data.location}`}
                  </span>
                  <h2 className="preview-project-title" style={{ margin: '0.4rem 0' }}>{data.role}</h2>
                  <div style={{ fontSize: '1rem', color: '#2563EB', fontWeight: 600 }}>
                    {data.company}
                  </div>
                </div>

                {data.description && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">01 // ENGAGEMENT OVERVIEW:</span>
                    <p className="preview-project-desc">{data.description}</p>
                  </div>
                )}

                {data.responsibilities && data.responsibilities.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">02 // RESPONSIBILITIES & DIRECTIVES:</span>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#374151', lineHeight: '1.6' }}>
                      {data.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.work_performed && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">03 // TECHNICAL WORK PERFORMED:</span>
                    <p className="preview-project-desc">{data.work_performed}</p>
                  </div>
                )}

                {data.results && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">04 // MEASURED RESULTS & BENCHMARKS:</span>
                    <p className="preview-project-desc">{data.results}</p>
                  </div>
                )}

                {data.technologies && data.technologies.length > 0 && (
                  <div className="preview-section-block">
                    <span className="preview-section-label">05 // DEPLOYED TOOLCHAIN:</span>
                    <div className="tech-pills">
                      {data.technologies.map((t, i) => (
                        <span key={i} className="preview-tag tag-yellow">◆ {t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
