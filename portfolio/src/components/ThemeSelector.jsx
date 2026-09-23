import { useState, useEffect, useRef } from 'react';
import { THEMES } from '../data/themes';
import './ThemeSelector.css';

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      return localStorage.getItem('portfolio-theme') || 'warm-archive';
    } catch {
      return 'warm-archive';
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio-theme') || 'warm-archive';
      document.documentElement.setAttribute('data-theme', saved);
    } catch {
      document.documentElement.setAttribute('data-theme', 'warm-archive');
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem('portfolio-theme', themeId);
    } catch (e) {
      console.warn('Could not persist theme to localStorage', e);
    }
    window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { themeId } }));
    setIsOpen(false);
  };

  return (
    <div className="retro-theme-control" ref={containerRef}>
      {/* Small Hardware Setting Dial Icon Button */}
      <button 
        type="button" 
        className="retro-theme-dial-btn"
        aria-label="Theme settings calibration"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="retro-theme-dial-icon">☌</span>
      </button>

      {/* Main Theme Selector Button [ ☼ THEME ▼ ] */}
      <button
        type="button"
        className={`retro-theme-btn ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Choose theme appearance"
      >
        <span className="retro-theme-btn__icon" aria-hidden="true">☼</span>
        <span className="retro-theme-btn__text">THEME</span>
        <span className="retro-theme-btn__arrow" aria-hidden="true">▼</span>
      </button>

      {/* Dropdown Popover matching Reference Image */}
      {isOpen && (
        <div 
          className="retro-theme-menu" 
          role="listbox" 
          aria-label="Choose visual theme"
        >
          <div className="retro-theme-menu__header">
            <span className="retro-theme-menu__title">CHOOSE THEME</span>
          </div>

          <div className="retro-theme-menu__list">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`retro-theme-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelectTheme(theme.id)}
                >
                  <div className="retro-theme-option__left">
                    <span className="retro-theme-option__radio" aria-hidden="true">
                      {isSelected ? '◉' : '○'}
                    </span>
                    <span className="retro-theme-option__name">{theme.name}</span>
                  </div>

                  {/* 5-Swatch Horizontal Color Bar */}
                  <div className="retro-theme-option__swatches" aria-hidden="true">
                    {theme.previewSwatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="retro-theme-option__swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
