import { achievements } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Achievements.css';

export default function Achievements() {
  const ref = useScrollReveal();

  return (
    <section className="section" id="achievements">
      <div className="container">
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-orange)', color: '#FFFFFF' }}>
            MISSION LOG // 005
          </div>
          <h2 className="section-title">Milestones & Achievements</h2>
          <p className="section-subtitle">
            Chronological engineering milestones, competition awards, and research entries.
          </p>
        </div>

        {/* Printed Technical Mission Log */}
        <div className="mission-log scroll-reveal" ref={ref}>
          <div className="mission-log__spine" aria-hidden="true" />

          <div className="mission-log__entries">
            {achievements.map((item, idx) => (
              <div key={idx} className="mission-entry">
                {/* Year Marker */}
                <div className="mission-entry__stamp-box">
                  <span className="mission-entry__year-stamp">{item.year}</span>
                  <span className="mission-entry__bullet" aria-hidden="true" />
                </div>

                {/* Entry Card */}
                <div className="mission-entry__card retro-panel">
                  <div className="mission-entry__header">
                    <span className="mission-entry__badge">{item.badge}</span>
                    <h3 className="mission-entry__title">{item.title}</h3>
                  </div>

                  <p className="mission-entry__desc">{item.description}</p>

                  <div className="mission-entry__footer">
                    <span className="mission-entry__verified">
                      <span className="mission-entry__verified-dot" aria-hidden="true" />
                      LOGGED & RECORDED
                    </span>
                    <span className="mission-entry__index">ENTRY #{String(idx + 1).padStart(3, '0')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
