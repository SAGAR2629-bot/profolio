import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/About.css';

export default function AboutPage() {
  const { aboutText, interests } = usePortfolioData();
  const engineeringPillars = [
    { label: '01 / PHYSICAL EMBODIMENT', desc: 'Translating algorithmic policies onto real mechanical actuators and quadruped robots.' },
    { label: '02 / SIM-TO-REAL ACCURACY', desc: 'Domain randomization and system identification in MuJoCo and Isaac Gym physics environments.' },
    { label: '03 / VISUAL SENSORY LOOPS', desc: 'Low-latency spatial awareness, optical tracking, and edge computer vision inference.' },
  ];

  return (
    <div className="about-page">
      <ConsoleHeaderStrip modeTitle="ABOUT ARCHIVE" codeId="MOD_01" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge">DOSSIER FILE // 001</div>
          <h1 className="section-title">Engineer Dossier: Anand Sagar</h1>
          <p className="section-subtitle">
            Background, technical engineering philosophy, and active research directions.
          </p>
        </div>

        {/* Engineering Folder / Document Dossier */}
        <div className="about__folder retro-panel">
          <div className="about__tabs-strip">
            <div className="about__tab is-active">
              <span>ABOUT_ANAND.DAT</span>
            </div>
            <div className="about__tab-meta">
              <span>RECORD_ID: AS-ENG-2026</span>
              <span className="about__status-badge">ARCHIVED & VERIFIED</span>
            </div>
          </div>

          <div className="about__content-grid">
            {/* Primary Narrative */}
            <div className="about__narrative">
              <h2 className="about__prose-title">Building Autonomous Systems from the Ground Up</h2>
              <div className="about__prose">
                {aboutText.split('\n\n').map((para, i) => (
                  <p key={i} className="about__paragraph">{para.trim()}</p>
                ))}
              </div>

              {/* Research Interests Tags */}
              <div className="about__interests-deck">
                <span className="about__deck-label">PRIMARY RESEARCH & ENGINEERING DOMAINS:</span>
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
                <span className="about__spec-tag">CORE ENGINEERING PILLARS</span>
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
    </div>
  );
}
