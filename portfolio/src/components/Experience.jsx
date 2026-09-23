import { experience } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Experience.css';

export default function Experience() {
  const ref = useScrollReveal();

  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-cyan)', color: 'var(--ink)' }}>
            FIELD RECORD // 008
          </div>
          <h2 className="section-title">Experience & Internships</h2>
          <p className="section-subtitle">
            Professional engineering positions, research roles, and technical project leadership.
          </p>
        </div>

        <div className="experience__log scroll-reveal" ref={ref}>
          {experience.map((exp, idx) => (
            <article key={idx} className="exp-log-card retro-panel">
              <div className="exp-log-card__header">
                <div>
                  <h3 className="exp-log-card__role">{exp.role}</h3>
                  <p className="exp-log-card__company">{exp.company}</p>
                </div>
                <div className="exp-log-card__badge">
                  <span className="exp-log-card__date">{exp.duration}</span>
                </div>
              </div>

              <p className="exp-log-card__desc">{exp.description}</p>

              {exp.tech && exp.tech.length > 0 && (
                <div className="exp-log-card__tech">
                  <span className="exp-log-card__tech-label">DEPLOYED TECHNOLOGIES:</span>
                  <div className="exp-log-card__tech-chips">
                    {exp.tech.map((t) => (
                      <span key={t} className="retro-tag retro-tag--cyan">{t}</span>
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
