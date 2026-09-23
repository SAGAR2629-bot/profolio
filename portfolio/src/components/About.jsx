import { aboutText, interests } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './About.css';

export default function About() {
  const ref = useScrollReveal();

  const engineeringPillars = [
    { label: '01 / PHYSICAL EMBODIMENT', desc: 'Translating algorithmic policies onto real mechanical actuators and legged robots.' },
    { label: '02 / SIM-TO-REAL ACCURACY', desc: 'Domain randomization and system identification in MuJoCo and Isaac environments.' },
    { label: '03 / VISUAL SENSORY LOOPS', desc: 'Low-latency spatial awareness, optical tracking, and edge computer vision inference.' },
  ];

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">DOSSIER FILE // 002</div>
          <h2 className="section-title">About Anand Sagar</h2>
          <p className="section-subtitle">
            Background, technical engineering philosophy, and active focus areas.
          </p>
        </div>

        {/* Engineering Folder / Document Dossier */}
        <div className="about__folder retro-panel scroll-reveal" ref={ref}>
          <div className="about__tabs-strip">
            <div className="about__tab is-active">
              <span>ABOUT_ANAND.TXT</span>
            </div>
            <div className="about__tab-meta">
              <span>RECORD_ID: AS-ENG-2026</span>
              <span className="about__status-badge">UNLOCKED</span>
            </div>
          </div>

          <div className="about__content-grid">
            {/* Primary Narrative */}
            <div className="about__narrative">
              <h3 className="about__prose-title">Building Autonomous Systems from the Ground Up</h3>
              <div className="about__prose">
                {aboutText.split('\n\n').map((para, i) => (
                  <p key={i} className="about__paragraph">{para.trim()}</p>
                ))}
              </div>

              {/* Research Interests Tags */}
              <div className="about__interests-deck">
                <span className="about__deck-label">PRIMARY INTERESTS & DOMAINS:</span>
                <div className="about__tags-list">
                  {interests.map((interest) => (
                    <span key={interest} className="retro-tag retro-tag--cyan">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Engineering Specifications Sheet */}
            <aside className="about__spec-sheet">
              <div className="about__spec-header">
                <span className="about__spec-tag">CORE PILLARS</span>
              </div>
              <div className="about__pillars">
                {engineeringPillars.map((pillar) => (
                  <div key={pillar.label} className="about__pillar-card">
                    <span className="about__pillar-title">{pillar.label}</span>
                    <p className="about__pillar-desc">{pillar.desc}</p>
                  </div>
                ))}
              </div>

              <div className="about__stamp-box">
                <span className="about__stamp">VERIFIED ENGINEER</span>
                <span className="about__stamp-date">SERIAL: 2026-AS-01</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
