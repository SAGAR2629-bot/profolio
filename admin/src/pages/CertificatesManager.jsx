import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import RetroPreviewModal from '../components/RetroPreviewModal';
import './ProjectsManager.css';

export default function CertificatesManager() {
  const [certs, setCerts] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal & Tabs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [editingCert, setEditingCert] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '2025',
    category: 'AI/ML',
    url: '',
    description: '',
    color: 'cyan',
    credential_id: '',
    verification_url: '',
    related_skills_str: '',
    related_project_slug: '',
    media_id: '',
    published: true,
    featured: false,
    archived: false,
    display_order: 0,
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const fetchAllData = async () => {
    try {
      const [certData, projData, mediaData] = await Promise.all([
        api.getCertificates(),
        api.getProjects().catch(() => []),
        api.getMedia().catch(() => [])
      ]);
      setCerts(certData);
      setProjectsList(projData);
      setMediaAssets(mediaData);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to load credentials.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const stats = useMemo(() => {
    const total = certs.length;
    const published = certs.filter(c => c.published && !c.archived).length;
    const drafts = certs.filter(c => !c.published && !c.archived).length;
    const featured = certs.filter(c => c.featured && !c.archived).length;
    const archived = certs.filter(c => c.archived).length;
    return { total, published, drafts, featured, archived };
  }, [certs]);

  const categories = useMemo(() => {
    const set = new Set();
    certs.forEach(c => {
      if (c.category && c.category.trim()) set.add(c.category.trim());
    });
    return Array.from(set);
  }, [certs]);

  const filteredCerts = useMemo(() => {
    return certs.filter(c => {
      if (filterCategory !== 'ALL' && (c.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
      if (filterStatus === 'PUBLISHED' && (!c.published || c.archived)) return false;
      if (filterStatus === 'DRAFT' && (c.published || c.archived)) return false;
      if (filterStatus === 'FEATURED' && (!c.featured || c.archived)) return false;
      if (filterStatus === 'ARCHIVED' && !c.archived) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchIssuer = (c.issuer || '').toLowerCase().includes(q);
      const matchId = (c.credential_id || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      return matchTitle || matchIssuer || matchId || matchDesc;
    });
  }, [certs, filterCategory, filterStatus, searchQuery]);

  const openCreateModal = () => {
    setEditingCert(null);
    setActiveTab('identity');
    setFormData({
      title: '',
      issuer: '',
      date: '2025',
      category: 'AI/ML',
      url: '',
      description: '',
      color: 'cyan',
      credential_id: '',
      verification_url: '',
      related_skills_str: '',
      related_project_slug: '',
      media_id: '',
      published: true,
      featured: false,
      archived: false,
      display_order: certs.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCert(c);
    setActiveTab('identity');
    setFormData({
      title: c.title,
      issuer: c.issuer,
      date: c.date || '',
      category: c.category || 'AI/ML',
      url: c.url || '',
      description: c.description || '',
      color: c.color || 'cyan',
      credential_id: c.credential_id || '',
      verification_url: c.verification_url || c.url || '',
      related_skills_str: (c.related_skills || []).join(', '),
      related_project_slug: c.related_project_slug || '',
      media_id: c.media_id ? String(c.media_id) : '',
      published: c.published,
      featured: c.featured || false,
      archived: c.archived || false,
      display_order: c.display_order || 0,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.related_skills_str
        ? formData.related_skills_str.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        issuer: formData.issuer,
        date: formData.date,
        category: formData.category,
        url: formData.url,
        description: formData.description,
        color: formData.color,
        credential_id: formData.credential_id,
        verification_url: formData.verification_url,
        related_skills: skillsArray,
        related_project_slug: formData.related_project_slug,
        media_id: formData.media_id ? parseInt(formData.media_id, 10) : null,
        published: formData.published,
        featured: formData.featured,
        archived: formData.archived,
        display_order: parseInt(formData.display_order, 10) || 0,
      };

      if (editingCert) {
        await api.updateCertificate(editingCert.id, payload);
        setStatus({ type: 'success', text: `Certificate "${formData.title}" updated successfully.` });
      } else {
        const created = await api.createCertificate(payload);
        setStatus({ type: 'success', text: `Certificate "${created.title}" added to vault.` });
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to save certificate.' });
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const dup = await api.duplicateCertificate(id);
      setStatus({ type: 'success', text: `Duplicated as draft: "${dup.title}".` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to duplicate certificate.' });
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      const updated = await api.archiveCertificate(id);
      setStatus({ type: 'success', text: `Certificate ${updated.archived ? 'archived' : 'restored'}.` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to toggle archive status.' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCertificate(id);
      setStatus({ type: 'success', text: 'Certificate removed from vault.' });
      setDeleteConfirmId(null);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to delete certificate.' });
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= certs.length) return;

    const reordered = [...certs];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setCerts(reordered);

    try {
      await Promise.all(
        reordered.map((c, i) => api.updateCertificate(c.id, { display_order: i }))
      );
      setStatus({ type: 'success', text: 'Display order updated.' });
    } catch {
      setStatus({ type: 'error', text: 'Failed to persist order.' });
      fetchAllData();
    }
  };

  const handlePreview = (cert) => {
    setPreviewData({
      ...cert,
      type: 'certificate'
    });
    setPreviewOpen(true);
  };

  if (loading) {
    return <div className="admin-loading-state">Connecting to Certificates Vault...</div>;
  }

  return (
    <div className="projects-manager-root">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span className="badge badge-published">REGISTRY_03 // CERTIFICATES</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8B949E' }}>CREDENTIAL VAULT SYSTEM</span>
          </div>
          <h1 className="page-title">Certificates & Credentials Vault</h1>
          <p className="page-subtitle">Manage verified professional specializations, course completions, credential IDs, and evidence assets.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + Add New Certificate
          </button>
        </div>
      </div>

      {status.text && (
        <div className={`status-banner status-${status.type}`} style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '4px', border: '1px solid', background: status.type === 'error' ? '#3B1A1A' : '#1A3B24', borderColor: status.type === 'error' ? '#F85149' : '#3FB950' }}>
          {status.text}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="project-stats-grid">
        <div className="stat-card">
          <span className="stat-label">TOTAL CREDENTIALS</span>
          <span className="stat-val">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">LIVE PUBLISHED</span>
          <span className="stat-val stat-green">{stats.published}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">DRAFTS</span>
          <span className="stat-val stat-yellow">{stats.drafts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">FEATURED</span>
          <span className="stat-val stat-blue">{stats.featured}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ARCHIVED</span>
          <span className="stat-val stat-muted">{stats.archived}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="project-control-bar">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="project-search-wrap" style={{ flex: '1', minWidth: '240px' }}>
            <span style={{ color: '#8B949E' }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search credential title, issuer, credential ID..."
              className="project-search-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'PUBLISHED', 'DRAFT', 'FEATURED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-pill ${filterStatus === st ? 'is-active' : ''}`}
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #2D333B', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#8B949E', marginRight: '4px' }}>DISCIPLINE:</span>
            <button
              type="button"
              className={`filter-pill ${filterCategory === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setFilterCategory('ALL')}
            >
              ALL ({certs.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-pill ${filterCategory === c ? 'is-active' : ''}`}
                onClick={() => setFilterCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Ledger */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'monospace' }}>
          <thead>
            <tr style={{ background: '#161B22', borderBottom: '2px solid #30363D', color: '#8B949E', fontSize: '0.75rem' }}>
              <th style={{ padding: '10px 14px' }}>ORDER</th>
              <th style={{ padding: '10px 14px' }}>CREDENTIAL TITLE & ISSUER</th>
              <th style={{ padding: '10px 14px' }}>YEAR</th>
              <th style={{ padding: '10px 14px' }}>DISCIPLINE</th>
              <th style={{ padding: '10px 14px' }}>ID / VERIFICATION</th>
              <th style={{ padding: '10px 14px' }}>MEDIA</th>
              <th style={{ padding: '10px 14px' }}>STATUS</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCerts.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #21262D', background: item.archived ? '#16191E' : 'transparent' }}>
                <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      style={{ background: '#21262D', border: '1px solid #30363D', color: '#C9D1D9', cursor: 'pointer', padding: '2px 5px', borderRadius: '3px' }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === certs.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      style={{ background: '#21262D', border: '1px solid #30363D', color: '#C9D1D9', cursor: 'pointer', padding: '2px 5px', borderRadius: '3px' }}
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 'bold', color: '#E6EDF3', fontSize: '0.9rem' }}>
                    📜 {item.title}
                    {item.featured && <span style={{ color: '#E3B341', marginLeft: '6px' }}>★</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '2px' }}>
                    {item.issuer}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#E6EDF3' }}>
                  {item.date}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="badge badge-published" style={{ background: '#1F2937', color: '#3FB950', border: '1px solid #23863633' }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '0.75rem' }}>
                  {item.credential_id ? (
                    <div style={{ color: '#58A6FF' }}>ID: {item.credential_id}</div>
                  ) : (
                    <div style={{ color: '#8B949E' }}>None</div>
                  )}
                  {(item.verification_url || item.url) && (
                    <span style={{ color: '#3FB950' }}>[Verified ✓]</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px', fontSize: '0.75rem' }}>
                  {item.media ? (
                    <span style={{ color: '#3FB950' }}>🖼 Attached</span>
                  ) : (
                    <span style={{ color: '#8B949E' }}>Text Only</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {item.archived ? (
                    <span className="badge badge-draft" style={{ background: '#21262D', color: '#8B949E' }}>ARCHIVED</span>
                  ) : item.published ? (
                    <span className="badge badge-published">● LIVE</span>
                  ) : (
                    <span className="badge badge-draft">○ DRAFT</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={() => handlePreview(item)}
                    >
                      👁 Preview
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={() => openEditModal(item)}
                    >
                      ✏ Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleDuplicate(item.id)}
                    >
                      📋 Copy
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleToggleArchive(item.id)}
                    >
                      {item.archived ? '↻ Restore' : '📦 Archive'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={() => setDeleteConfirmId(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCerts.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#8B949E' }}>
                  No certificates match the current filter selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Confirm Deletion</h2>
              <button type="button" className="btn-close" onClick={() => setDeleteConfirmId(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>Permanently remove this certificate record from the vault? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteConfirmId)}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Editor Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px', width: '95%' }}>
            <div className="admin-modal-header">
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#3FB950' }}>
                  {editingCert ? `EDITING_CREDENTIAL // ID_${editingCert.id}` : "NEW_CREDENTIAL // VAULT"}
                </span>
                <h2 className="admin-modal-title">
                  {editingCert ? `Edit: ${editingCert.title}` : "Add Verified Certificate"}
                </h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* Modal Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #30363D', background: '#161B22', padding: '0 1rem' }}>
              {[
                { id: 'identity', label: '1. Identity & Issuer' },
                { id: 'content', label: '2. Scope & Description' },
                { id: 'evidence', label: '3. Evidence & Document Image' },
                { id: 'relationships', label: '4. Related Skills & Projects' },
                { id: 'settings', label: '5. Settings & Order' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #3FB950' : '2px solid transparent',
                    color: activeTab === tab.id ? '#3FB950' : '#8B949E',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '1.25rem' }}>
                {/* TAB 1: IDENTITY */}
                {activeTab === 'identity' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Certificate Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g. Deep Learning Specialization"
                        className="form-input"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Issuing Organization *</label>
                        <input
                          type="text"
                          name="issuer"
                          value={formData.issuer}
                          onChange={handleFormChange}
                          required
                          placeholder="e.g. Coursera / DeepLearning.AI / NVIDIA"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Completion Year / Date *</label>
                        <input
                          type="text"
                          name="date"
                          value={formData.date}
                          onChange={handleFormChange}
                          required
                          placeholder="2025"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Category / Discipline</label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          placeholder="e.g. AI/ML, Robotics, Programming, Cloud"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Credential ID (Optional)</label>
                        <input
                          type="text"
                          name="credential_id"
                          value={formData.credential_id}
                          onChange={handleFormChange}
                          placeholder="e.g. DLI-9823471 or Coursera verification ID"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTENT */}
                {activeTab === 'content' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Credential Description & Scope</label>
                      <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Topics mastered, key assignments completed, practical labs..."
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Accent Color Theme</label>
                      <select
                        name="color"
                        value={formData.color}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="cyan">Cyan</option>
                        <option value="green">Green</option>
                        <option value="orange">Orange</option>
                        <option value="purple">Purple</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TAB 3: EVIDENCE */}
                {activeTab === 'evidence' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Online Verification URL</label>
                      <input
                        type="url"
                        name="verification_url"
                        value={formData.verification_url}
                        onChange={handleFormChange}
                        placeholder="https://coursera.org/verify/... or https://credential.net/..."
                        className="form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '4px', display: 'block' }}>
                        Powers the public [ VERIFY CREDENTIAL ONLINE ➔ ] button.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Attach Certificate Document / Image</label>
                      <select
                        name="media_id"
                        value={formData.media_id}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="">-- No Image Attached (Text Record) --</option>
                        {mediaAssets.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.filename} ({m.title || "No Title"})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '4px', display: 'block' }}>
                        Attached image displays as the official scanned certificate document on public inspection.
                      </span>
                    </div>

                    {formData.media_id && (
                      <div style={{ padding: '10px 14px', background: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }}>
                        <span style={{ color: '#3FB950', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ EVIDENCE ATTACHED: </span>
                        <span style={{ color: '#E6EDF3', fontSize: '0.85rem' }}>
                          Media ID #{formData.media_id} will be rendered in the inspection dossier.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: RELATIONSHIPS */}
                {activeTab === 'relationships' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Related Skills (Comma Separated)</label>
                      <input
                        type="text"
                        name="related_skills_str"
                        value={formData.related_skills_str}
                        onChange={handleFormChange}
                        placeholder="e.g. PyTorch, CNNs, Transformers, Optimization"
                        className="form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '4px', display: 'block' }}>
                        Links this certificate to technical skills in the Technical Skills Registry.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Related Project Slug</label>
                      <select
                        name="related_project_slug"
                        value={formData.related_project_slug}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="">-- No Project Linked --</option>
                        {projectsList.map(p => (
                          <option key={p.id} value={p.slug}>
                            {p.title} ({p.slug})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '4px', display: 'block' }}>
                        Directly links this credential to an engineering project case study.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 5: SETTINGS */}
                {activeTab === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }}>
                      <input
                        type="checkbox"
                        id="published"
                        name="published"
                        checked={formData.published}
                        onChange={handleFormChange}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div>
                        <label htmlFor="published" style={{ fontWeight: 'bold', color: '#E6EDF3', cursor: 'pointer' }}>
                          Publish to Credential Vault
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                          When unchecked, this certificate is preserved as a draft and hidden from visitors.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }}>
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleFormChange}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div>
                        <label htmlFor="featured" style={{ fontWeight: 'bold', color: '#E6EDF3', cursor: 'pointer' }}>
                          Featured Credential
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                          Starred and prioritized in the vault grid.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }}>
                      <input
                        type="checkbox"
                        id="archived"
                        name="archived"
                        checked={formData.archived}
                        onChange={handleFormChange}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div>
                        <label htmlFor="archived" style={{ fontWeight: 'bold', color: '#E6EDF3', cursor: 'pointer' }}>
                          Archive Credential
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                          Safely stored in admin database but omitted from the public vault.
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Display Order</label>
                      <input
                        type="number"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleFormChange}
                        className="form-input"
                        style={{ maxWidth: '120px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCert ? "Save Changes" : "Deposit Certificate to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retro Preview Modal */}
      <RetroPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="certificate"
        data={previewData}
      />
    </div>
  );
}
