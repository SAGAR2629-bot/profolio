import { skills } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Skills.css';

export default function Skills() {
  const ref = useScrollReveal();

  const categoryAccents = {
    'AI / Machine Learning': 'mod--blue',
    'Robotics & Simulation': 'mod--green',
    'Development & Languages': 'mod--yellow',
    'Tools & Platforms': 'mod--orange',
  };

  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">MODULE SYSTEM // 003</div>
          <h2 className="section-title">Technical Capabilities</h2>
          <p className="section-subtitle">
            Core toolset and engineering technologies across learning systems and hardware.
          </p>
        </div>

        {/* Physical Engineering Module Console */}
        <div className="skills__console scroll-reveal" ref={ref}>
          <div className="skills__grid">
            {skills.map((group) => {
              const modifier = categoryAccents[group.category] || 'mod--blue';
              return (
                <div key={group.category} className={`skills__module retro-panel ${modifier}`}>
                  {/* Module Header Bar */}
                  <div className="skills__module-header">
                    <div className="skills__module-title-box">
                      <span className="skills__module-icon" aria-hidden="true">{group.icon}</span>
                      <h3 className="skills__module-category">{group.category}</h3>
                    </div>
                    <span className="skills__module-status">ACTIVE</span>
                  </div>

                  {/* Chips Grid */}
                  <div className="skills__chips-container">
                    {group.items.map((item) => (
                      <span key={item} className="skills__stamped-chip">
                        <span className="skills__chip-dot" aria-hidden="true" />
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="skills__module-footer">
                    <span className="skills__circuit-line" aria-hidden="true" />
                    <span className="skills__pin-count">{group.items.length} COMPILED TOOLS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
