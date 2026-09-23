import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeSelector from './ThemeSelector';
import './Navbar.css';

const navRoutes = [
  { path: '/', label: 'HOME' },
  { path: '/about', label: 'ABOUT' },
  { path: '/skills', label: 'SKILLS' },
  { path: '/projects', label: 'PROJECTS' },
  { path: '/achievements', label: 'ACHIEVEMENTS' },
  { path: '/certificates', label: 'CERTIFICATES' },
  { path: '/education', label: 'EDUCATION' },
  { path: '/experience', label: 'EXPERIENCE' },
  { path: '/contact', label: 'CONTACT' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="retro-navbar" aria-label="Console Mode Selector">
      <div className="retro-navbar__deck container">
        <div className="retro-navbar__brand-group">
          <span className="retro-navbar__badge">AS-01</span>
          <NavLink 
            to="/" 
            className="retro-navbar__brand"
            onClick={() => setMenuOpen(false)}
          >
            <span className="retro-navbar__status-dot" aria-hidden="true" />
            <span className="retro-navbar__name">ANAND.SAGAR</span>
          </NavLink>
        </div>

        {/* Cartridge Route Selectors */}
        <div className={`retro-navbar__menu ${menuOpen ? 'is-open' : ''}`}>
          <ul className="retro-navbar__links">
            {navRoutes.map((route) => (
              <li key={route.path} className="retro-navbar__item">
                <NavLink
                  to={route.path}
                  end={route.path === '/'}
                  className={({ isActive }) => `retro-nav-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Header Setting Controls & Mobile Menu Toggle */}
        <div className="retro-navbar__actions">
          <ThemeSelector />
          <button
            className={`retro-navbar__toggle ${menuOpen ? 'is-active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Mode Menu"
            aria-expanded={menuOpen}
          >
            <span className="retro-navbar__toggle-text">{menuOpen ? 'CLOSE ▲' : 'MODES ▼'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
