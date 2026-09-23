import { Link } from 'react-router-dom';
import { usePortfolioData } from '../context/PortfolioDataContext';
import './HomeTerminal.css';

export default function HomeTerminal() {
  const { personalInfo, stats } = usePortfolioData();
  const terminalModules = [
    {
      title: 'ABOUT ARCHIVE',
      path: '/about',
      code: 'MOD_01',
      desc: 'Personal engineering dossier, background & focus.',
      color: 'btn--blue',
      icon: '📂',
    },
    {
      title: 'SKILLS CONSOLE',
      path: '/skills',
      code: 'MOD_02',
      desc: 'Hardware control, algorithms, vision & toolchain.',
      color: 'btn--green',
      icon: '⚙️',
    },
    {
      title: 'PROJECT REGISTRY',
      path: '/projects',
      code: 'MOD_03',
      desc: 'Robotics policies, navigation stacks, inspection views.',
      color: 'btn--yellow',
      icon: '🔬',
    },
    {
      title: 'MISSION LOGS',
      path: '/achievements',
      code: 'MOD_04',
      desc: 'Competitions, publications, and milestone records.',
      color: 'btn--orange',
      icon: '🏆',
    },
    {
      title: 'CREDENTIAL VAULT',
      path: '/certificates',
      code: 'MOD_05',
      desc: 'Verified certifications, deep learning & robotics credentials.',
      color: 'btn--green',
      icon: '📜',
    },
    {
      title: 'ACADEMIC RECORD',
      path: '/education',
      code: 'MOD_06',
      desc: 'Formal university engineering education & coursework.',
      color: 'btn--yellow',
      icon: '🎓',
    },
    {
      title: 'FIELD ASSIGNMENTS',
      path: '/experience',
      code: 'MOD_07',
      desc: 'Professional engineering history, internships & roles.',
      color: 'btn--cyan',
      icon: '⚡',
    },
    {
      title: 'TRANSMISSION',
      path: '/contact',
      code: 'MOD_08',
      desc: 'Transmit an inquiry or connect across direct channels.',
      color: 'btn--red',
      icon: '📡',
    },
  ];

  return (
    <div className="home-terminal container">
      {/* Central Terminal Console Box */}
      <div className="terminal-screen retro-panel">
        {/* Machine Status Bar */}
        <div className="terminal-screen__header">
          <div className="terminal-screen__meta">
            <span className="terminal-screen__screw-slot" aria-hidden="true">⊘</span>
            <span className="terminal-screen__status-lamp" aria-hidden="true" />
            <span className="terminal-screen__status-text">SYSTEM ONLINE</span>
          </div>

          <div className="terminal-screen__version">
            <span>v1.0.0</span>
            <span className="terminal-screen__screw-slot" aria-hidden="true">⊘</span>
          </div>
        </div>

        {/* Main Display Unit */}
        <div className="terminal-screen__body">
          <div className="terminal-screen__hero">
            <div className="terminal-screen__badge">
              <span>ROBOTICS & EMBODIED AI</span>
            </div>

            <h1 className="terminal-screen__title">{personalInfo.name}</h1>

            <p className="terminal-screen__disciplines">
              <span>AI/ML</span>
              <span className="terminal-screen__sep">◆</span>
              <span>ROBOTICS</span>
              <span className="terminal-screen__sep">◆</span>
              <span>COMPUTER VISION</span>
              <span className="terminal-screen__sep">◆</span>
              <span>REINFORCEMENT LEARNING</span>
            </p>

            <p className="terminal-screen__statement">
              "{personalInfo.heroSubtitle}"
            </p>

            {/* Three Tactile Action Buttons matching Reference Image */}
            <div className="terminal-screen__cta-row">
              <Link to="/projects" className="retro-btn retro-btn--blue">
                <span>[ VIEW PROJECTS ]</span>
              </Link>
              <Link to="/about" className="retro-btn retro-btn--yellow">
                <span>[ ABOUT ME ]</span>
              </Link>
              <Link to="/contact" className="retro-btn retro-btn--cyan">
                <span>[ CONTACT ]</span>
              </Link>
            </div>
          </div>

          {/* System Telemetry Gauges matching Reference Image */}
          <div className="terminal-screen__gauges-section">
            <div className="terminal-screen__gauges-bar">
              <span className="terminal-screen__gauges-title">ARCHIVE TELEMETRY</span>
              <span className="terminal-screen__gauges-clock">
                STATUS: ACTIVE <span className="terminal-screen__status-lamp" aria-hidden="true" />
              </span>
            </div>

            <div className="terminal-screen__gauges-row">
              {stats.map((stat, idx) => (
                <div key={stat.label} className={`terminal-gauge terminal-gauge--${idx}`}>
                  <span className="terminal-gauge__number">{stat.value}+</span>
                  <span className="terminal-gauge__label">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Corner Screw Slots */}
            <div className="terminal-screen__bottom-screws" aria-hidden="true">
              <span className="terminal-screen__screw-slot">⊘</span>
              <span className="terminal-screen__screw-slot">⊘</span>
            </div>
          </div>

          {/* Module Selector Deck */}
          <div className="terminal-screen__deck">
            <div className="terminal-screen__deck-bar">
              <span className="terminal-screen__deck-title">MODULE SELECTOR // CHOOSE DESTINATION SCREEN</span>
              <span className="terminal-screen__deck-count">8 REPOSITORIES LOADED</span>
            </div>

            <div className="terminal-screen__modules-grid">
              {terminalModules.map((mod) => (
                <Link 
                  key={mod.path} 
                  to={mod.path} 
                  className={`terminal-module-btn retro-panel ${mod.color}`}
                >
                  <div className="terminal-module-btn__top">
                    <span className="terminal-module-btn__code">{mod.code}</span>
                    <span className="terminal-module-btn__icon" aria-hidden="true">{mod.icon}</span>
                  </div>
                  <h2 className="terminal-module-btn__title">{mod.title}</h2>
                  <p className="terminal-module-btn__desc">{mod.desc}</p>
                  <div className="terminal-module-btn__footer">
                    <span className="terminal-module-btn__action">LAUNCH SCREEN ➔</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
