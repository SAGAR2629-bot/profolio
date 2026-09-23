import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/Skills.css';

export default function SkillsPage() {
  const { skills, projects, certificates, experience } = usePortfolioData();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Map category color accents
  const categoryAccents = {
    'AI / Machine Learning': 'mod--blue',
    'Robotics & Simulation': 'mod--green',
    'Development & Languages': 'mod--yellow',
    'Tools & Platforms': 'mod--orange',
  };

  // Filter skills by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    const q = searchQuery.toLowerCase().trim();
    return skills.map(group => {
      const matchingItems = (group.items || []).filter(item => {
        const name = typeof item === 'string' ? item : (item.name || '');
        const desc = typeof item === 'object' ? (item.description || '') : '';
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      });
      return {
        ...group,
        items: matchingItems
      };
    }).filter(group => group.items && group.items.length > 0);
  }, [skills, searchQuery]);

  // Find cross-references when a skill is selected
  const activeCrossReferences = useMemo(() => {
    if (!selectedSkill) return { projects: [], certificates: [], experience: [] };
    const skillName = (typeof selectedSkill === 'string' ? selectedSkill : selectedSkill.name || '').toLowerCase();

    // 1. Projects where tech contains skillName or matches slug
    const matchedProjects = (projects || []).filter(p => {
      const techList = (p.technologies || p.tech || []).map(t => t.toLowerCase());
      return techList.some(t => t.includes(skillName) || skillName.includes(t));
    });

    // 2. Certificates where related_skills contains skillName
    const matchedCerts = (certificates || []).filter(c => {
      const list = (c.related_skills || []).map(s => s.toLowerCase());
      const titleMatch = (c.title || '').toLowerCase().includes(skillName);
      return list.some(s => s.includes(skillName) || skillName.includes(s)) || titleMatch;
    });

    // 3. Experience where tech contains skillName
    const matchedExp = (experience || []).filter(e => {
      const techList = (e.technologies || e.tech || []).map(t => t.toLowerCase());
      return techList.some(t => t.includes(skillName) || skillName.includes(t));
    });

    return {
      projects: matchedProjects,
      certificates: matchedCerts,
      experience: matchedExp
    };
  }, [selectedSkill, projects, certificates, experience]);

  return (
    <div className="skills-page">
      <ConsoleHeaderStrip modeTitle="SKILLS CONTROL PANEL" codeId="MOD_02" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-cyan)', color: 'var(--ink)' }}>
            REGISTRY 04 // TECHNICAL SKILLS
          </div>
          <h1 className="section-title">Technical Capabilities & Toolchains</h1>
          <p className="section-subtitle">
            Curated engineering toolchains across machine learning, robotics simulation, languages, and hardware control.
          </p>
        </div>

        {/* Search & Telemetry Bar */}
        <div className="retro-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1', minWidth: '220px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 'bold' }}>SEARCH_CAPABILITY:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill (e.g. PyTorch, ROS2, CUDA, MuJoCo)..."
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
            // INTERACTIVE: CLICK ANY CHIP TO INSPECT APPLIED PROJECTS & CERTIFICATES
          </div>
        </div>

        {/* Active Selected Skill Inspection Dock */}
        {selectedSkill && (
          <div className="active-skill-inspector retro-panel" style={{ marginBottom: '2rem', padding: '1.25rem', border: '3px solid var(--ink)', background: 'var(--bg-paper)', boxShadow: '4px 4px 0 var(--ink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="skills__chip-dot" style={{ width: '10px', height: '10px' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--ink)' }}>
                  INSPECTING_CAPABILITY // {typeof selectedSkill === 'string' ? selectedSkill : selectedSkill.name}
                </span>
              </div>
              <button
                type="button"
                className="retro-btn retro-btn--sm"
                onClick={() => setSelectedSkill(null)}
              >
                ✕ CLOSE DOSSIER
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 6px 0', color: 'var(--ink)' }}>
                  {typeof selectedSkill === 'string' ? selectedSkill : selectedSkill.name}
                </h3>
                {typeof selectedSkill === 'object' && selectedSkill.level && (
                  <div style={{ display: 'inline-block', marginBottom: '8px', padding: '3px 8px', background: 'var(--retro-cyan)', border: '1px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 'bold' }}>
                    EXPERIENCE LEVEL: {selectedSkill.level}
                  </div>
                )}
                {typeof selectedSkill === 'object' && selectedSkill.description && (
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {selectedSkill.description}
                  </p>
                )}
              </div>

              {/* Connected Records */}
              <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', border: '1px solid var(--ink)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  // DEMONSTRATED IN APPLIED ARCHIVE RECORDS:
                </div>
                {activeCrossReferences.projects.length === 0 && activeCrossReferences.certificates.length === 0 && activeCrossReferences.experience.length === 0 && (
                  <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)' }}>
                    Core foundation toolchain actively applied in engineering research and development.
                  </p>
                )}

                {activeCrossReferences.projects.length > 0 && (
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>🚀 PROJECTS: </span>
                    {activeCrossReferences.projects.map((p, pIdx) => (
                      <Link key={pIdx} to="/projects" className="retro-tag retro-tag--yellow" style={{ textDecoration: 'none', marginRight: '4px', fontSize: '0.7rem' }}>
                        {p.title} ➔
                      </Link>
                    ))}
                  </div>
                )}

                {activeCrossReferences.certificates.length > 0 && (
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>📜 CREDENTIALS: </span>
                    {activeCrossReferences.certificates.map((c, cIdx) => (
                      <Link key={cIdx} to="/certificates" className="retro-tag retro-tag--green" style={{ textDecoration: 'none', marginRight: '4px', fontSize: '0.7rem' }}>
                        {c.title} ➔
                      </Link>
                    ))}
                  </div>
                )}

                {activeCrossReferences.experience.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>💼 FIELD EXPERIENCE: </span>
                    {activeCrossReferences.experience.map((e, eIdx) => (
                      <Link key={eIdx} to="/experience" className="retro-tag retro-tag--purple" style={{ textDecoration: 'none', marginRight: '4px', fontSize: '0.7rem' }}>
                        {e.role} @ {e.company} ➔
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="skills__grid">
          {filteredCategories.map((group) => {
            const modifier = categoryAccents[group.category] || 'mod--blue';
            return (
              <div key={group.id || group.category} className={`skills__module retro-panel ${modifier}`}>
                {/* Module Header Bar */}
                <div className="skills__module-header">
                  <div className="skills__module-title-box">
                    <span className="skills__module-icon" aria-hidden="true">{group.icon || "⚙️"}</span>
                    <h2 className="skills__module-category">{group.category}</h2>
                  </div>
                  <span className="skills__module-status">STATUS: ONLINE</span>
                </div>

                {group.description && (
                  <p style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--ink-secondary)', margin: '6px 0 0 0' }}>
                    {group.description}
                  </p>
                )}

                {/* Chips Grid */}
                <div className="skills__chips-container">
                  {(group.items || []).map((item, iIdx) => {
                    const skillName = typeof item === 'string' ? item : item.name;
                    const isSelected = selectedSkill && (
                      (typeof selectedSkill === 'string' && selectedSkill === skillName) ||
                      (typeof selectedSkill === 'object' && selectedSkill.name === skillName)
                    );
                    return (
                      <button
                        key={iIdx}
                        type="button"
                        onClick={() => setSelectedSkill(item)}
                        className={`skills__stamped-chip ${isSelected ? 'is-selected' : ''}`}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'var(--retro-yellow)' : undefined,
                          border: isSelected ? '2px solid var(--ink)' : undefined,
                          textAlign: 'left'
                        }}
                      >
                        <span className="skills__chip-dot" aria-hidden="true" />
                        <span>{skillName}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="skills__module-footer">
                  <span className="skills__circuit-line" aria-hidden="true" />
                  <span className="skills__pin-count">{(group.items || []).length} COMPILED TOOLCHAINS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
