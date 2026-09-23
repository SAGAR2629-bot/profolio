import { education } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Education.css';

export default function Education() {
  const ref = useScrollReveal();

  return (
    <section className="section" id="education">
      <div className="container">
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-yellow)', color: 'var(--ink)' }}>
            ACADEMIC RECORD // 007
          </div>
          <h2 className="section-title">Education & Foundation</h2>
          <p className="section-subtitle">
            Formal university degree coursework, engineering prerequisites, and academic honors.
          </p>
        </div>

        <div className="education__ledger scroll-reveal" ref={ref}>
          {education.map((edu, idx) => (
            <article key={idx} className="edu-record-card retro-panel">
              <div className="edu-record-card__header">
                <div>
                  <span className="edu-record-card__stamp">OFFICIAL DEGREE RECORD</span>
                  <h3 className="edu-record-card__degree">{edu.degree}</h3>
                  <p className="edu-record-card__institution">{edu.institution}</p>
                </div>
                <div className="edu-record-card__dates">
                  <span className="edu-record-card__date-pill">{edu.duration}</span>
                </div>
              </div>

              {edu.description && (
                <p className="edu-record-card__desc">{edu.description}</p>
              )}

              {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                <div className="edu-record-card__courses">
                  <span className="edu-record-card__courses-label">VERIFIED COURSEWORK MODULES:</span>
                  <div className="edu-record-card__course-chips">
                    {edu.relevantCourses.map((course) => (
                      <span key={course} className="retro-tag retro-tag--yellow">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
