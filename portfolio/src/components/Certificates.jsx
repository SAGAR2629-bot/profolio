import { useState, useEffect } from 'react';
import { certificates, certCategories } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Certificates.css';

export default function Certificates() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const ref = useScrollReveal();

  const filtered = activeFilter === 'All'
    ? certificates
    : certificates.filter((c) => c.category === activeFilter);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCert(null);
    };
    if (selectedCert) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedCert]);

  return (
    <section className="section" id="certificates">
      <div className="container">
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-green)', color: '#FFFFFF' }}>
            VAULT REGISTRY // 006
          </div>
          <h2 className="section-title">Certifications & Credentials</h2>
          <p className="section-subtitle">
            Verified technical specializations, university certificates, and robotics coursework.
          </p>
        </div>

        {/* Physical Category Selector Switch Deck */}
        <div className="certs__deck scroll-reveal" ref={ref}>
          <div className="certs__selector-label">CATEGORY SELECTOR:</div>
          <div className="certs__switch-group" role="tablist" aria-label="Certificate Categories">
            {certCategories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeFilter === cat}
                className={`retro-btn retro-btn--sm ${activeFilter === cat ? 'retro-btn--green is-active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                <span>[ {cat.toUpperCase()} ]</span>
              </button>
            ))}
          </div>
        </div>

        {/* Archive Cards Grid */}
        <div className="certs__grid">
          {filtered.map((cert, idx) => {
            const certIndex = String(idx + 1).padStart(3, '0');
            return (
              <article
                key={`${cert.title}-${idx}`}
                className="cert-vault-card retro-panel"
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedCert(cert)}
                aria-label={`Open certificate file for ${cert.title}`}
              >
                {/* Physical Top Notch / Stamp */}
                <div className="cert-vault-card__header">
                  <span className="cert-vault-card__id">CERT_{certIndex}</span>
                  <span className="retro-tag retro-tag--green">{cert.category}</span>
                </div>

                <div className="cert-vault-card__body">
                  <div className="cert-vault-card__emblem" aria-hidden="true">
                    📜
                  </div>
                  <h3 className="cert-vault-card__title">{cert.title}</h3>
                  <p className="cert-vault-card__issuer">{cert.issuer}</p>
                </div>

                <div className="cert-vault-card__footer">
                  <span className="cert-vault-card__year">YEAR: {cert.date}</span>
                  <span className="cert-vault-card__action">
                    [ INSPECT ➔ ]
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="certs__empty retro-panel">
            <p>NO CREDENTIAL RECORDS FOUND IN THIS SPECIFIED CATEGORY.</p>
          </div>
        )}
      </div>

      {/* Accessible Physical Credential Inspection Modal */}
      {selectedCert && (
        <div 
          className="cert-inspection-overlay" 
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-inspection-title"
        >
          <div className="cert-inspection-modal retro-panel" onClick={(e) => e.stopPropagation()}>
            <div className="retro-panel__header">
              <div className="retro-panel__tag">
                <span className="cert-modal__lamp" aria-hidden="true" />
                <span>CREDENTIAL_INSPECTION_TERMINAL</span>
              </div>
              <button 
                className="cert-inspection-close retro-btn retro-btn--sm"
                onClick={() => setSelectedCert(null)}
                aria-label="Close Inspection Modal"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="cert-inspection-body">
              <div className="cert-inspection-frame">
                <div className="cert-inspection-seal">VERIFIED CREDENTIAL</div>
                <div className="cert-inspection-icon" aria-hidden="true">🎓</div>
                <h3 id="cert-inspection-title" className="cert-inspection-title">{selectedCert.title}</h3>
                
                <div className="cert-inspection-ledger">
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">ISSUING ENTITY:</span>
                    <span className="cert-ledger-val">{selectedCert.issuer}</span>
                  </div>
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">COMPLETION YEAR:</span>
                    <span className="cert-ledger-val">{selectedCert.date}</span>
                  </div>
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">TECHNICAL DISCIPLINE:</span>
                    <span className="cert-ledger-val">{selectedCert.category}</span>
                  </div>
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">STATUS:</span>
                    <span className="cert-ledger-val cert-ledger-val--verified">● ARCHIVED & VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="cert-inspection-actions">
                <button 
                  type="button" 
                  className="retro-btn retro-btn--blue" 
                  onClick={() => setSelectedCert(null)}
                >
                  [ RETURN TO ARCHIVE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
