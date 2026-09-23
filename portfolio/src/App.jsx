import { Routes, Route, Navigate } from 'react-router-dom';
import RetroBackground from './components/RetroBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScreenTransition from './components/ScreenTransition';
import ErrorBoundary from './components/ErrorBoundary';
import { PortfolioDataProvider } from './context/PortfolioDataContext';

// Dedicated Retro Console Screens
import HomeTerminal from './pages/HomeTerminal';
import AboutPage from './pages/AboutPage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import AchievementsPage from './pages/AchievementsPage';
import CertificatesPage from './pages/CertificatesPage';
import EducationPage from './pages/EducationPage';
import ExperiencePage from './pages/ExperiencePage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <PortfolioDataProvider>
      <ErrorBoundary>
        <RetroBackground />
        <div className="console-outer">
          {/* Top Hardware Chassis Plate */}
          <header className="console-plate" aria-label="Console Information">
            <div className="console-plate__left">
              <span className="console-plate__diamond" style={{ color: 'var(--retro-yellow)', fontSize: '0.85rem' }}>◆</span>
              <span className="console-plate__title">ANAND SAGAR // ENGINEERING ARCHIVE</span>
            </div>
            <div className="console-plate__right">
              <span>TERMINAL UNIT-08</span>
              <span className="console-led" title="Console status: Operational" />
              <div className="console-arcade-dots" aria-hidden="true">
                <span className="console-arcade-dot console-arcade-dot--red" />
                <span className="console-arcade-dot console-arcade-dot--yellow" />
                <span className="console-arcade-dot console-arcade-dot--green" />
              </div>
            </div>
          </header>

          {/* Physical Control Deck Mode Navigation */}
          <Navbar />

          {/* Console Screen Viewport with Tactile Route Transitions */}
          <main className="console-screen" id="main-content">
            <ScreenTransition>
              <Routes>
                <Route path="/" element={<HomeTerminal />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ScreenTransition>
          </main>

          {/* Console Baseplate */}
          <Footer />
        </div>
      </ErrorBoundary>
    </PortfolioDataProvider>
  );
}
