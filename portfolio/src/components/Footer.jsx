import { usePortfolioData } from '../context/PortfolioDataContext';
import './Footer.css';

export default function Footer() {
  const { personalInfo } = usePortfolioData();
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="retro-footer" aria-label="Console Footer">
      <div className="container retro-footer__inner">
        <div className="retro-footer__left">
          <span className="retro-footer__brand">
            © {year} {personalInfo.name.toUpperCase()} // ENGINEERING ARCHIVE
          </span>
        </div>

        <div className="retro-footer__center" aria-hidden="true">
          <span className="retro-footer__dash">——— // ———</span>
        </div>

        <div className="retro-footer__right">
          <span className="retro-footer__motto">
            ENGINEER // RESEARCHER // PROBLEM SOLVER /
          </span>

          <nav className="retro-footer__links" aria-label="External links">
            <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" title="GitHub profile">GH ↗</a>
            <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn profile">IN ↗</a>
            <a href={`mailto:${personalInfo.email}`} title="Email transmission">MAIL ↗</a>
          </nav>

          <button 
            type="button" 
            className="retro-btn retro-btn--sm retro-btn--yellow"
            onClick={scrollToTop}
            aria-label="Scroll to top of engineering console"
          >
            <span>[ ▲ ]</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
