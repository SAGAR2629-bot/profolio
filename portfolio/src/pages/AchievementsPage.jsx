import { useState, useMemo } from 'react';
import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import RetroImageSlider from '../components/RetroImageSlider';
import RelatedRecords from '../components/RelatedRecords';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/Achievements.css';
import './AchievementsPage.css';

export default function AchievementsPage() {
  const { achievements } = usePortfolioData();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Derive available categories
  const categories = useMemo(() => {
    const set = new Set();
    achievements.forEach(a => {
      if (a.category && a.category.trim()) set.add(a.category.trim());
    });
    return Array.from(set);
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter(item => {
      const matchCat = selectedCategory === 'ALL' || (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchOrg = (item.organization || '').toLowerCase().includes(q);
      const matchAccomplish = (item.accomplishment || '').toLowerCase().includes(q);
      const matchContrib = (item.contribution || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchOrg || matchAccomplish || matchContrib;
    });
  }, [achievements, selectedCategory, searchQuery]);

  return (
    <div className="achievements-page">
      <ConsoleHeaderStrip modeTitle="MISSION LOG // ACHIEVEMENTS" codeId="MOD_04" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-orange)', color: '#FFFFFF' }}>
            REGISTRY 02 // ACHIEVEMENTS & LOGS
          </div>
          <h1 className="section-title">Engineering Achievement Logs</h1>
          <p className="section-subtitle">
            Documented chronological log of competition victories, academic milestones, research papers, and technical contributions.
          </p>
        </div>

        {/* Filter & Search Bar Deck */}
        <div className="archive-controls-deck retro-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <div className="controls-deck-top" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="search-box-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '220px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 'bold' }}>SEARCH_LOG:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones, competitions, papers..."
                className="retro-search-input"
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

            <div className="category-filter-group" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className={`retro-btn retro-btn--sm ${selectedCategory === 'ALL' ? 'retro-btn--orange is-active' : ''}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                <span>ALL</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`retro-btn retro-btn--sm ${selectedCategory === cat ? 'retro-btn--orange is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Log Spine Layout */}
        <div className="mission-log">
          <div className="mission-log__header-strip">
            <span>// ARCHIVE REGISTRY: {filteredAchievements.length} OF {achievements.length} ENTRIES LOADED</span>
            <span>TIMELINE: 2024 - 2026 // ENGINEERING LOG</span>
          </div>
          <div className="mission-log__spine" aria-hidden="true" />

          <div className="mission-log__entries">
            {filteredAchievements.map((item, idx) => {
              const missionCode = `ACH_${String(item.id || idx + 1).padStart(3, '0')}`;
              return (
                <div key={item.id || idx} className="mission-entry">
                  {/* Year Stamp */}
                  <div className="mission-entry__marker-col">
                    <span className="mission-entry__year-stamp">{item.year}</span>
                    <span className="mission-entry__bullet" aria-hidden="true" />
                  </div>

                  {/* Card */}
                  <div className="mission-entry__card">
                    <div className="mission-entry__meta-row">
                      <div className="mission-entry__tags">
                        <span className="retro-tag retro-tag--yellow">{missionCode}</span>
                        {item.category && <span className="retro-tag retro-tag--blue">{item.category}</span>}
                        {item.featured && <span className="retro-tag retro-tag--green">FEATURED</span>}
                      </div>
                      <span className="mission-entry__status-indicator">
                        <span className="mission-entry__status-dot" aria-hidden="true" />
                        STATUS: {item.status || "COMPLETED"}
                      </span>
                    </div>

                    <div className="mission-entry__header" style={{ marginTop: '8px' }}>
                      <span className="mission-entry__badge">{item.badge}</span>
                      <h2 className="mission-entry__title">{item.title}</h2>
                    </div>

                    {item.organization && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>
                        ENTITY: {item.organization}
                      </div>
                    )}

                    <p className="mission-entry__desc">{item.description}</p>

                    {/* Highlights strip if contribution or accomplishment exist */}
                    {(item.contribution || item.result) && (
                      <div className="mission-highlights-strip" style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--ink)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                        {item.contribution && (
                          <div style={{ marginBottom: item.result ? '4px' : '0' }}>
                            <strong style={{ color: 'var(--retro-orange)' }}>ROLE:</strong> {item.contribution}
                          </div>
                        )}
                        {item.result && (
                          <div>
                            <strong style={{ color: 'var(--retro-green)' }}>RESULT:</strong> {item.result}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mission-entry__footer" style={{ marginTop: '12px' }}>
                      <span className="mission-entry__verified">
                        <span className="mission-entry__verified-dot" aria-hidden="true" />
                        LOGGED IN OFFICIAL ARCHIVE
                      </span>
                      <button 
                        type="button" 
                        className="retro-btn retro-btn--sm"
                        onClick={() => setSelectedRecord(item)}
                      >
                        <span>[ INSPECT RECORD ➔ ]</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAchievements.length === 0 && (
              <div className="retro-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)' }}>NO ACHIEVEMENT LOGS MATCHING ACTIVE FILTER CRITERIA.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Inspection Modal / Detailed Dossier */}
      {selectedRecord && (
        <div 
          className="cert-inspection-overlay" 
          onClick={() => setSelectedRecord(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="cert-inspection-modal retro-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '90%' }}>
            <div className="retro-panel__header">
              <span className="retro-panel__tag">ACHIEVEMENT_DOSSIER // {`ACH_${String(selectedRecord.id || 1).padStart(3, '0')}`}</span>
              <button 
                className="cert-inspection-close retro-btn retro-btn--sm"
                onClick={() => setSelectedRecord(null)}
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="cert-inspection-body">
              <div className="cert-inspection-frame">
                <span className="cert-inspection-seal">OFFICIAL ENTRY</span>
                <div className="cert-inspection-icon">{selectedRecord.badge}</div>
                <h3 className="cert-inspection-title">{selectedRecord.title}</h3>
                
                {/* Meta ledger strip */}
                <div className="cert-inspection-ledger">
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">YEAR / DATE:</span>
                    <span className="cert-ledger-val">{selectedRecord.event_date || selectedRecord.year}</span>
                  </div>
                  {selectedRecord.organization && (
                    <div className="cert-ledger-row">
                      <span className="cert-ledger-label">ORGANIZATION:</span>
                      <span className="cert-ledger-val">{selectedRecord.organization}</span>
                    </div>
                  )}
                  {selectedRecord.category && (
                    <div className="cert-ledger-row">
                      <span className="cert-ledger-label">CATEGORY:</span>
                      <span className="cert-ledger-val">{selectedRecord.category}</span>
                    </div>
                  )}
                  <div className="cert-ledger-row">
                    <span className="cert-ledger-label">STATUS:</span>
                    <span className="cert-ledger-val cert-ledger-val--verified">● {selectedRecord.status || "VERIFIED"}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedRecord.description && (
                  <div className="dossier-section" style={{ marginTop: '1.25rem' }}>
                    <div className="dossier-section-header" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '6px' }}>
                      // LOG SUMMARY
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedRecord.description}</p>
                  </div>
                )}

                {/* Accomplishment */}
                {selectedRecord.accomplishment && (
                  <div className="dossier-section" style={{ marginTop: '1rem' }}>
                    <div className="dossier-section-header" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '6px' }}>
                      // WHAT WAS ACCOMPLISHED
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedRecord.accomplishment}</p>
                  </div>
                )}

                {/* Contribution */}
                {selectedRecord.contribution && (
                  <div className="dossier-section" style={{ marginTop: '1rem' }}>
                    <div className="dossier-section-header" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '6px' }}>
                      // ROLE & TECHNICAL CONTRIBUTION
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedRecord.contribution}</p>
                  </div>
                )}

                {/* Result */}
                {selectedRecord.result && (
                  <div className="dossier-section" style={{ marginTop: '1rem' }}>
                    <div className="dossier-section-header" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '6px' }}>
                      // RESULT & IMPACT
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedRecord.result}</p>
                  </div>
                )}

                {/* Evidence Images */}
                {selectedRecord.images && selectedRecord.images.length > 0 && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <RetroImageSlider images={selectedRecord.images} title="VERIFIED EVIDENCE & DOCUMENTATION" />
                  </div>
                )}

                {/* Related Project or External Verification Button */}
                {(selectedRecord.verification_url || selectedRecord.related_project_slug) && (
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    {selectedRecord.verification_url && (
                      <a
                        href={selectedRecord.verification_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="retro-btn retro-btn--green"
                        style={{ textDecoration: 'none' }}
                      >
                        <span>[ VIEW VERIFICATION LINK ➔ ]</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Cross Registry Connected Records */}
                <RelatedRecords
                  projects={selectedRecord.related_project_slug ? [selectedRecord.related_project_slug] : []}
                  title="ASSOCIATED ARCHIVE DOSSIERS"
                />
              </div>

              <div className="cert-inspection-actions">
                <button 
                  type="button" 
                  className="retro-btn retro-btn--blue" 
                  onClick={() => setSelectedRecord(null)}
                >
                  [ RETURN TO LOGS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
