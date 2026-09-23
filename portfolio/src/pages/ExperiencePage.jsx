import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import RelatedRecords from '../components/RelatedRecords';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/Experience.css';

export default function ExperiencePage() {
  const { experience } = usePortfolioData();

  return (
    <div className="experience-page">
      <ConsoleHeaderStrip modeTitle="FIELD RECORDS // EXPERIENCE" codeId="MOD_07" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-cyan)', color: 'var(--ink)' }}>
            REGISTRY 06 // FIELD EXPERIENCE
          </div>
          <h1 className="section-title">Engineering Field Records</h1>
          <p className="section-subtitle">
            Chronological engineering roles, laboratory research posts, open-source maintainership, and applied robotic systems development.
          </p>
        </div>

        {/* Telemetry bar */}
        <div className="retro-panel" style={{ padding: '10px 18px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <span>// FIELD LOG: {experience.length} ACTIVE & ARCHIVED ASSIGNMENT(S)</span>
          <span>DISCIPLINE: APPLIED RESEARCH & SOFTWARE ENGINEERING</span>
        </div>

        <div className="experience__log">
          {experience.map((exp, idx) => {
            const recordCode = `FIELD_LOG_${String(exp.id || idx + 1).padStart(2, '0')}`;
            return (
              <article key={exp.id || idx} className="exp-log-card retro-panel" style={{ border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)' }}>
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed var(--ink)', paddingBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{recordCode}</span>
                    <span className="retro-tag retro-tag--blue" style={{ fontSize: '0.65rem' }}>OFFICIAL RECORD</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--ink-secondary)' }}>{exp.duration}</span>
                </div>

                <div className="exp-log-card__header">
                  <div>
                    <h2 className="exp-log-card__role">{exp.role}</h2>
                    <p className="exp-log-card__company">{exp.company}</p>
                    {exp.location && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                        LOCATION: {exp.location}
                      </div>
                    )}
                  </div>
                  <div className="exp-log-card__badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span className="exp-log-card__date">{exp.duration}</span>
                    {exp.externalUrl && (
                      <a
                        href={exp.externalUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="retro-btn retro-btn--sm"
                        style={{ textDecoration: 'none', fontSize: '0.7rem' }}
                      >
                        [ ORG LINK ➔ ]
                      </a>
                    )}
                  </div>
                </div>

                {exp.description && (
                  <p className="exp-log-card__desc">{exp.description}</p>
                )}

                {/* Work performed or results if provided */}
                {(exp.workPerformed || exp.results) && (
                  <div style={{ margin: '1rem 0', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    {exp.workPerformed && (
                      <div style={{ marginBottom: exp.results ? '6px' : '0' }}>
                        <strong style={{ color: 'var(--retro-blue)' }}>// WORK PERFORMED: </strong>
                        <span>{exp.workPerformed}</span>
                      </div>
                    )}
                    {exp.results && (
                      <div>
                        <strong style={{ color: 'var(--retro-green)' }}>// RESULTS & IMPACT: </strong>
                        <span>{exp.results}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Responsibilities list if provided */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div style={{ margin: '1rem 0' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '6px' }}>
                      KEY RESPONSIBILITIES:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Supporting image if provided */}
                {exp.image && (
                  <div style={{ margin: '1rem 0', border: '2px solid var(--ink)', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '4px 10px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink)' }}>
                      FIELD_EVIDENCE // ATTACHED MEDIA
                    </div>
                    <img
                      src={exp.image}
                      alt={exp.role}
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}

                {/* Technologies */}
                {(exp.technologies || exp.tech) && (exp.technologies || exp.tech).length > 0 && (
                  <div className="exp-log-card__tech">
                    <span className="exp-log-card__tech-label">DEPLOYED TECHNOLOGIES & TOOLCHAINS:</span>
                    <div className="exp-log-card__tech-chips">
                      {(exp.technologies || exp.tech).map((t, tIdx) => (
                        <span key={tIdx} className="retro-tag retro-tag--cyan">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Records */}
                <RelatedRecords
                  projects={exp.relatedProjects || []}
                  skills={exp.relatedSkills || []}
                  title="CONNECTED FIELD RECORDS"
                />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
