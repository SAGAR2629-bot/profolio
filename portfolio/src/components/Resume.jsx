import { personalInfo } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Resume.css';

export default function Resume() {
  const ref = useScrollReveal();

  return (
    <section className="section resume-section" id="resume">
      <div className="container">
        <div className="resume__console-box retro-panel scroll-reveal" ref={ref}>
          <div className="retro-panel__header">
            <div className="retro-panel__tag">
              <span className="resume__indicator" aria-hidden="true" />
              <span>DISPATCH_TERMINAL // CURRICULUM_VITAE</span>
            </div>
            <span className="resume__file-tag">FORMAT: PDF_DOCUMENT</span>
          </div>

          <div className="resume__body">
            <h2 className="resume__heading">Technical Resume & Experience Dossier</h2>
            <p className="resume__text">
              Comprehensive technical record encompassing full academic background, open-source repositories,
              applied robotics simulations, and complete skill proficiencies.
            </p>

            <div className="resume__actions">
              <a href={personalInfo.resumeUrl} className="retro-btn retro-btn--blue" download>
                <span>[ DOWNLOAD PDF ↓ ]</span>
              </a>
              <a href={personalInfo.resumeUrl} className="retro-btn retro-btn--yellow" target="_blank" rel="noopener noreferrer">
                <span>[ INSPECT ONLINE ↗ ]</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
