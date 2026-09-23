import { useState, useEffect, useMemo } from 'react';
import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import RelatedRecords from '../components/RelatedRecords';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/Certificates.css';

export default function CertificatesPage() {
  const { certificates } = usePortfolioData();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  // Derive ONLY real categories from data
  const availableCategories = useMemo(() => {
    const set = new Set();
    certificates.forEach((c) => {
      if (c.category && c.category.trim()) set.add(c.category.trim());
    });
    return Array.from(set);
  }, [certificates]);

  // Derive distinct years
  const availableYears = useMemo(() => {
    const set = new Set();
    certificates.forEach((c) => {
      if (c.date && c.date.trim()) set.add(c.date.trim());
    });
    return Array.from(set).sort().reverse();
  }, [certificates]);

  // Filtered certificates
  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      const matchCat = activeFilter === 'ALL' || (c.category || '').toLowerCase() === activeFilter.toLowerCase();
      const matchYear = yearFilter === 'ALL' || (c.date || '').toLowerCase() === yearFilter.toLowerCase();
      if (!matchCat || !matchYear) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchIssuer = (c.issuer || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      const matchId = (c.credential_id || '').toLowerCase().includes(q);
      const matchSkills = (c.related_skills || []).some(s => s.toLowerCase().includes(q));
      return matchTitle || matchIssuer || matchDesc || matchId || matchSkills;
    });
  }, [certificates, activeFilter, yearFilter, searchQuery]);

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
    <div className="certificates-page">
      <ConsoleHeaderStrip modeTitle="CREDENTIAL VAULT // CERTIFICATES" codeId="MOD_05" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-green)', color: '#FFFFFF' }}>
            REGISTRY 03 // CERTIFICATES VAULT
          </div>
          <h1 className="section-title">Verified Credential Vault</h1>
          <p className="section-subtitle">
            Formal engineering accreditations, verified courseware, and professional specializations across robotics, AI/ML, and cloud.
          </p>
        </div>

        {/* Filter, Search & Year Controls Deck */}
        <div className="certs__deck retro-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
              <span className="certs__selector-label">SEARCH_VAULT:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search credential title, issuer, skill..."
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  background: 'var(--bg-paper)',
                  border: '2px solid var(--ink)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="certs__selector-label">YEAR:</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={{
                  padding: '5px 10px',
                  background: 'var(--bg-paper)',
                  border: '2px solid var(--ink)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  outline: 'none'
                }}
              >
                <option value="ALL">ALL YEARS</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="certs__selector-label">DISCIPLINE:</span>
            <div className="certs__switch-group" role="tablist" aria-label="Certificate Categories">
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'ALL'}
                className={`retro-btn retro-btn--sm ${activeFilter === 'ALL' ? 'retro-btn--green is-active' : ''}`}
                onClick={() => setActiveFilter('ALL')}
              >
                <span>[ ALL ({certificates.length}) ]</span>
              </button>
              {availableCategories.map((cat) => (
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
        </div>

        {/* Telemetry Summary Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
          <span>// RECORDS ACTIVE: {filtered.length} OF {certificates.length} VERIFIED CREDENTIALS</span>
          <span>DOCUMENT FORMAT: DIGITAL / VERIFIED SPEC</span>
        </div>

        {/* Archive Cards Grid */}
        <div className="certs__grid">
          {filtered.map((cert, idx) => {
            const certIndex = String(cert.id || idx + 1).padStart(3, '0');
            return (
              <article
                key={cert.id || `${cert.title}-${idx}`}
                className="cert-vault-card retro-panel"
                onClick={() => setSelectedCert(cert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedCert(cert)}
                aria-label={`Open certificate file for ${cert.title}`}
              >
                <div className="cert-vault-card__header">
                  <span className="cert-vault-card__id">CERT_{certIndex}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className="retro-tag retro-tag--green">{cert.category}</span>
                    {cert.featured && <span className="retro-tag retro-tag--yellow">★</span>}
                  </div>
                </div>

                <div className="cert-vault-card__body">
                  <div className="cert-vault-card__emblem" aria-hidden="true">📜</div>
                  <h2 className="cert-vault-card__title">{cert.title}</h2>
                  <p className="cert-vault-card__issuer">{cert.issuer}</p>

                  {cert.credential_id && (
                    <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>
                      ID: <strong>{cert.credential_id}</strong>
                    </div>
                  )}

                  {cert.related_skills && cert.related_skills.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {cert.related_skills.slice(0, 3).map((s, sIdx) => (
                        <span key={sIdx} className="retro-tag retro-tag--cyan" style={{ fontSize: '0.65rem' }}>
                          {s}
                        </span>
                      ))}
                      {cert.related_skills.length > 3 && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-secondary)' }}>
                          +{cert.related_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="cert-vault-card__footer">
                  <span className="cert-vault-card__year">YEAR: {cert.date}</span>
                  <span className="cert-vault-card__action">[ INSPECT ➔ ]</span>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="certs__empty retro-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)' }}>NO CREDENTIAL RECORDS FOUND MATCHING YOUR SPECIFIED FILTERS.</p>
          </div>
        )}
      </div>

      {/* Accessible Inspection Modal / Dossier */}
      {selectedCert && (
        <div 
          className="cert-inspection-overlay" 
          onClick={() => setSelectedCert(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-inspection-title"
        >
          <div className="cert-inspection-modal retro-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '92%' }}>
            <div className="retro-panel__header">
              <div className="retro-panel__tag">
                <span className="cert-modal__lamp" aria-hidden="true" />
                <span>CREDENTIAL_VAULT // RECORD_{String(selectedCert.id || 1).padStart(3, '0')}</span>
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
                <div className="cert-inspection-icon" aria-hidden="true">📜</div>
                <h3 id="cert-inspection-title" className="cert-inspection-title">{selectedCert.title}</h3>
                
                {/* Ledger metadata */}
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
                  {selectedCert.credential_id && (
                    <div className="cert-ledger-row">
                      <span className="cert-ledger-label">CREDENTIAL ID:</span>
                      <span className="cert-ledger-val" style={{ fontFamily: 'var(--font-mono)' }}>{selectedCert.credential_id}</span>
                    </div>
                  )}
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">ARCHIVE STATUS:</span>
                    <span className="cert-ledger-val cert-ledger-val--verified">● OFFICIAL VERIFIED RECORD</span>
                  </div>
                </div>

                {/* Optional Certificate Document / Image Preview */}
                {selectedCert.image && (
                  <div style={{ marginTop: '1.25rem', border: '2px solid var(--ink)', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink)' }}>
                      EVIDENCE_DOCUMENT_PREVIEW // ATTACHED MEDIA
                    </div>
                    <img
                      src={selectedCert.image}
                      alt={selectedCert.title}
                      style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}

                {/* Description */}
                {selectedCert.description && (
                  <div style={{ marginTop: '1.25rem', textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '6px' }}>
                      // CREDENTIAL SCOPE & DESCRIPTION
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedCert.description}</p>
                  </div>
                )}

                {/* Verification Button */}
                {(selectedCert.verification_url || selectedCert.url) && (
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <a
                      href={selectedCert.verification_url || selectedCert.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="retro-btn retro-btn--green"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>[ VERIFY CREDENTIAL ONLINE ➔ ]</span>
                    </a>
                  </div>
                )}

                {/* Connected Records */}
                <RelatedRecords
                  skills={selectedCert.related_skills || []}
                  projects={selectedCert.related_project_slug ? [selectedCert.related_project_slug] : []}
                  title="CONNECTED ARCHIVE RECORDS"
                />
              </div>

              <div className="cert-inspection-actions">
                <button 
                  type="button" 
                  className="retro-btn retro-btn--blue" 
                  onClick={() => setSelectedCert(null)}
                >
                  [ RETURN TO VAULT ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
