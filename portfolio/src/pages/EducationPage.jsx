import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import RelatedRecords from '../components/RelatedRecords';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/Education.css';

export default function EducationPage() {
  const { education } = usePortfolioData();

  return (
    <div className="education-page">
      <ConsoleHeaderStrip modeTitle="ACADEMIC RECORD // EDUCATION" codeId="MOD_06" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-yellow)', color: 'var(--ink)' }}>
            REGISTRY 05 // ACADEMIC RECORD
          </div>
          <h1 className="section-title">Academic Engineering Background</h1>
          <p className="section-subtitle">
            Formal university degree coursework, specialized engineering foundations, and verified academic credentials.
          </p>
        </div>

        {/* Telemetry bar */}
        <div className="retro-panel" style={{ padding: '10px 18px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <span>// ACADEMIC REGISTRY: {education.length} VERIFIED DEGREE PROGRAM(S)</span>
          <span>CURRICULUM: RIGOROUS COMPUTER SCIENCE & ROBOTICS</span>
        </div>

        <div className="education__ledger">
          {education.map((edu, idx) => {
            const recordCode = `ACADEMIC_RECORD_${String(edu.id || idx + 1).padStart(2, '0')}`;
            return (
              <article key={edu.id || idx} className="edu-record-card retro-panel" style={{ border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)' }}>
                {/* Timeline banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed var(--ink)', paddingBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{recordCode}</span>
                  <span style={{ letterSpacing: '0.15em', fontWeight: 'bold', color: 'var(--ink-secondary)' }}>
                    {edu.duration ? `${edu.duration.replace('—', '─────────')}` : 'CHRONOLOGY'}
                  </span>
                </div>

                <div className="edu-record-card__header">
                  <div>
                    <span className="edu-record-card__stamp">OFFICIAL DEGREE RECORD</span>
                    <h2 className="edu-record-card__degree">{edu.degree}</h2>
                    <p className="edu-record-card__institution">{edu.institution}</p>
                    {edu.location && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                        LOCATION: {edu.location}
                      </div>
                    )}
                  </div>
                  <div className="edu-record-card__dates" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span className="edu-record-card__date-pill">{edu.duration}</span>
                    <span className="retro-tag retro-tag--green" style={{ fontSize: '0.7rem' }}>
                      STATUS: {edu.status || "COMPLETED"}
                    </span>
                  </div>
                </div>

                {edu.description && (
                  <p className="edu-record-card__desc">{edu.description}</p>
                )}

                {/* Supporting Document / Evidence Image if attached */}
                {edu.image && (
                  <div style={{ margin: '1rem 0', border: '2px solid var(--ink)', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '4px 10px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink)' }}>
                      ACADEMIC_EVIDENCE // DEGREE TRANSCRIPT / VERIFICATION
                    </div>
                    <img
                      src={edu.image}
                      alt={edu.degree}
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}

                {/* Relevant Coursework */}
                {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                  <div className="edu-record-card__courses">
                    <span className="edu-record-card__courses-label">VERIFIED COURSEWORK MODULES:</span>
                    <div className="edu-record-card__course-chips">
                      {edu.relevantCourses.map((course, cIdx) => (
                        <span key={cIdx} className="retro-tag retro-tag--yellow">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Cross-Registry Records */}
                <RelatedRecords
                  projects={edu.relatedProjects || []}
                  skills={edu.relatedSkills || []}
                  achievements={edu.achievements || []}
                  title="CONNECTED ACADEMIC PORTFOLIO RECORDS"
                />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
