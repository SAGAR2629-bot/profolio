import React, { useState, useEffect, useMemo } from 'react';
import { api, resolveMediaUrl } from '../services/api';
import RetroPreviewModal from '../components/RetroPreviewModal';
import './ProjectsManager.css';

export default function AchievementsManager() {
  const [achievements, setAchievements] = useState([]);
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
  const [activeTab, setActiveTab] = useState('identity'); // identity, content, evidence, relationships, settings
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    year: '2026',
    title: '',
    description: '',
    badge: '🏆',
    category: 'Milestone',
    status: 'COMPLETED',
    organization: '',
    published: true,
    featured: false,
    archived: false,
    accomplishment: '',
    contribution: '',
    result: '',
    related_project_slug: '',
    verification_url: '',
    event_date: '',
    display_order: 0,
  });

  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const fetchAllData = async () => {
    try {
      const [achData, projData, mediaData] = await Promise.all([
        api.getAchievements(),
        api.getProjects().catch(() => []),
        api.getMedia().catch(() => [])
      ]);
      setAchievements(achData);
      setProjectsList(projData);
      setMediaAssets(mediaData);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to load achievement data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute KPI Stats
  const stats = useMemo(() => {
    const total = achievements.length;
    const published = achievements.filter(a => a.published && !a.archived).length;
    const drafts = achievements.filter(a => !a.published && !a.archived).length;
    const featured = achievements.filter(a => a.featured && !a.archived).length;
    const archived = achievements.filter(a => a.archived).length;
    return { total, published, drafts, featured, archived };
  }, [achievements]);

  // Distinct categories
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
      if (filterCategory !== 'ALL' && (item.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
      if (filterStatus === 'PUBLISHED' && (!item.published || item.archived)) return false;
      if (filterStatus === 'DRAFT' && (item.published || item.archived)) return false;
      if (filterStatus === 'FEATURED' && (!item.featured || item.archived)) return false;
      if (filterStatus === 'ARCHIVED' && !item.archived) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchOrg = (item.organization || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      return matchTitle || matchOrg || matchDesc || matchCat;
    });
  }, [achievements, filterCategory, filterStatus, searchQuery]);

  const openCreateModal = () => {
    setEditingItem(null);
    setActiveTab('identity');
    setFormData({
      year: '2026',
      title: '',
      description: '',
      badge: '🏆',
      category: 'Milestone',
      status: 'COMPLETED',
      organization: '',
      published: true,
      featured: false,
      archived: false,
      accomplishment: '',
      contribution: '',
      result: '',
      related_project_slug: '',
      verification_url: '',
      event_date: '',
      display_order: achievements.length,
    });
    setGalleryImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (ach) => {
    setEditingItem(ach);
    setActiveTab('identity');
    setFormData({
      year: ach.year || '2026',
      title: ach.title,
      description: ach.description || '',
      badge: ach.badge || '🏆',
      category: ach.category || 'Milestone',
      status: ach.status || 'COMPLETED',
      organization: ach.organization || '',
      published: ach.published,
      featured: ach.featured || false,
      archived: ach.archived || false,
      accomplishment: ach.accomplishment || '',
      contribution: ach.contribution || '',
      result: ach.result || '',
      related_project_slug: ach.related_project_slug || '',
      verification_url: ach.verification_url || '',
      event_date: ach.event_date || '',
      display_order: ach.display_order || 0,
    });
    setGalleryImages(ach.images || []);
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
      if (editingItem) {
        await api.updateAchievement(editingItem.id, formData);
        setStatus({ type: 'success', text: `Achievement "${formData.title}" updated successfully.` });
      } else {
        const created = await api.createAchievement(formData);
        setStatus({ type: 'success', text: `Achievement "${created.title}" logged successfully.` });
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to save achievement.' });
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const dup = await api.duplicateAchievement(id);
      setStatus({ type: 'success', text: `Duplicated as draft: "${dup.title}".` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to duplicate achievement.' });
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      const updated = await api.archiveAchievement(id);
      setStatus({ type: 'success', text: `Achievement ${updated.archived ? 'archived' : 'restored'}.` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to toggle archive status.' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteAchievement(id);
      setStatus({ type: 'success', text: 'Achievement removed from archive.' });
      setDeleteConfirmId(null);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to delete achievement.' });
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= achievements.length) return;

    const reordered = [...achievements];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setAchievements(reordered);

    // Save display orders
    try {
      await Promise.all(
        reordered.map((a, i) => api.updateAchievement(a.id, { display_order: i }))
      );
      setStatus({ type: 'success', text: 'Display order updated.' });
    } catch {
      setStatus({ type: 'error', text: 'Failed to persist order.' });
      fetchAllData();
    }
  };

  const handleAddImage = async () => {
    if (!selectedMediaId || !editingItem) return;
    try {
      await api.addAchievementImage(editingItem.id, {
        media_id: parseInt(selectedMediaId, 10),
        caption: newImageCaption,
        is_cover: galleryImages.length === 0,
      });
      setSelectedMediaId('');
      setNewImageCaption('');
      const updated = await api.getAchievement(editingItem.id);
      setGalleryImages(updated.images || []);
      setStatus({ type: 'success', text: 'Evidence image attached.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to attach evidence image.' });
    }
  };

  const handleRemoveImage = async (imageId) => {
    if (!editingItem) return;
    try {
      await api.removeAchievementImage(editingItem.id, imageId);
      const updated = await api.getAchievement(editingItem.id);
      setGalleryImages(updated.images || []);
      setStatus({ type: 'success', text: 'Evidence image removed.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to remove image.' });
    }
  };

  const handlePreview = (ach) => {
    setPreviewData(ach);
    setPreviewOpen(true);
  };

  if (loading) {
    return <div className="admin-loading-state">Connecting to Achievements Registry...</div>;
  }

  return (
    <div className="projects-manager-root">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span className="badge badge-published">REGISTRY_02 // ACHIEVEMENTS</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8B949E' }}>VERIFIED LOG SYSTEM</span>
          </div>
          <h1 className="page-title">Achievements & Milestones Manager</h1>
          <p className="page-subtitle">Curate verified competition awards, publication citations, research breakthroughs, and external evidence.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + Log New Achievement
          </button>
        </div>
      </div>

      {/* Status banner */}
      {status.text && (
        <div className={`status-banner status-${status.type}`} style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '4px', border: '1px solid', background: status.type === 'error' ? '#3B1A1A' : '#1A3B24', borderColor: status.type === 'error' ? '#F85149' : '#3FB950' }}>
          {status.text}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="project-stats-grid">
        <div className="stat-card">
          <span className="stat-label">TOTAL RECORDS</span>
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
              placeholder="Search milestone title, organization, description..."
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
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#8B949E', marginRight: '4px' }}>CATEGORY:</span>
            <button
              type="button"
              className={`filter-pill ${filterCategory === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setFilterCategory('ALL')}
            >
              ALL ({achievements.length})
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

      {/* Records Table / Ledger */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'monospace' }}>
          <thead>
            <tr style={{ background: '#161B22', borderBottom: '2px solid #30363D', color: '#8B949E', fontSize: '0.75rem' }}>
              <th style={{ padding: '10px 14px' }}>ORDER</th>
              <th style={{ padding: '10px 14px' }}>BADGE</th>
              <th style={{ padding: '10px 14px' }}>TITLE & ENTITY</th>
              <th style={{ padding: '10px 14px' }}>YEAR / DATE</th>
              <th style={{ padding: '10px 14px' }}>CATEGORY</th>
              <th style={{ padding: '10px 14px' }}>STATUS</th>
              <th style={{ padding: '10px 14px' }}>EVIDENCE</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAchievements.map((item, idx) => (
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
                      disabled={idx === achievements.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      style={{ background: '#21262D', border: '1px solid #30363D', color: '#C9D1D9', cursor: 'pointer', padding: '2px 5px', borderRadius: '3px' }}
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '1.4rem' }}>
                  {item.badge}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 'bold', color: '#E6EDF3', fontSize: '0.9rem' }}>
                    {item.title}
                    {item.featured && <span style={{ color: '#E3B341', marginLeft: '6px' }}>★</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '2px' }}>
                    {item.organization || "Independent Milestone"}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#E6EDF3', fontSize: '0.85rem' }}>
                  {item.event_date || item.year}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="badge badge-published" style={{ background: '#1F2937', color: '#58A6FF', border: '1px solid #388BFD33' }}>
                    {item.category}
                  </span>
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
                <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#8B949E' }}>
                  {item.images?.length || 0} photo(s)
                  {item.verification_url && <span style={{ marginLeft: '4px', color: '#3FB950' }}>[Link ✓]</span>}
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

            {filteredAchievements.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#8B949E' }}>
                  No achievement records match the current filter selection.
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
              <p>Are you sure you want to permanently delete this achievement log entry? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteConfirmId)}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Structured Authoring Workspace Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '850px', width: '95%' }}>
            <div className="admin-modal-header">
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#58A6FF' }}>
                  {editingItem ? `EDITING_ACHIEVEMENT // ID_${editingItem.id}` : "NEW_ACHIEVEMENT // AUTHORING"}
                </span>
                <h2 className="admin-modal-title">
                  {editingItem ? `Edit: ${editingItem.title}` : "Log New Engineering Achievement"}
                </h2>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* Modal Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #30363D', background: '#161B22', padding: '0 1rem' }}>
              {[
                { id: 'identity', label: '1. Identity & Classification' },
                { id: 'content', label: '2. Detailed Content & Contribution' },
                { id: 'evidence', label: '3. Evidence & Gallery' },
                { id: 'relationships', label: '4. Linked Projects' },
                { id: 'settings', label: '5. Publishing Settings' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #58A6FF' : '2px solid transparent',
                    color: activeTab === tab.id ? '#58A6FF' : '#8B949E',
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
                      <label className="form-label">Achievement Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g. National Robotics Competition — 1st Place"
                        className="form-input"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Year *</label>
                        <input
                          type="text"
                          name="year"
                          value={formData.year}
                          onChange={handleFormChange}
                          required
                          placeholder="2026"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Exact Date (Optional)</label>
                        <input
                          type="text"
                          name="event_date"
                          value={formData.event_date}
                          onChange={handleFormChange}
                          placeholder="e.g. September 2026"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Badge Emoji *</label>
                        <input
                          type="text"
                          name="badge"
                          value={formData.badge}
                          onChange={handleFormChange}
                          required
                          placeholder="🏆"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Issuing Organization / Event</label>
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleFormChange}
                          placeholder="e.g. IEEE / Smart India Hackathon / University"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          placeholder="e.g. Milestone, Competition, Publication"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Operational Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="FINALIST">FINALIST</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTENT */}
                {activeTab === 'content' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Summary / Description</label>
                      <textarea
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Concise overview of what occurred..."
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">What Was Accomplished</label>
                      <textarea
                        name="accomplishment"
                        rows="3"
                        value={formData.accomplishment}
                        onChange={handleFormChange}
                        placeholder="Detailed engineering scope of the achievement..."
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Role & Technical Contribution</label>
                      <textarea
                        name="contribution"
                        rows="3"
                        value={formData.contribution}
                        onChange={handleFormChange}
                        placeholder="What did Anand specifically engineer or contribute?..."
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Result & Impact</label>
                      <textarea
                        name="result"
                        rows="3"
                        value={formData.result}
                        onChange={handleFormChange}
                        placeholder="Measurable outcomes, team rankings, benchmark metrics..."
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: EVIDENCE */}
                {activeTab === 'evidence' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">External Verification URL</label>
                      <input
                        type="url"
                        name="verification_url"
                        value={formData.verification_url}
                        onChange={handleFormChange}
                        placeholder="https://example.com/certificate or https://ieeexplore.ieee.org/..."
                        className="form-input"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '4px', display: 'block' }}>
                        Direct verification link shown on public inspection view.
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #30363D', paddingTop: '1rem' }}>
                      <h3 style={{ fontSize: '0.9rem', color: '#E6EDF3', marginBottom: '0.75rem' }}>
                        Attached Evidence Images ({galleryImages.length})
                      </h3>

                      {!editingItem ? (
                        <div style={{ padding: '1rem', background: '#161B22', border: '1px dashed #30363D', color: '#8B949E', fontSize: '0.85rem' }}>
                          Save this achievement record first to attach evidence images from the Media Library.
                        </div>
                      ) : (
                        <div>
                          {/* Attach image form */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Select Media Asset</label>
                              <select
                                value={selectedMediaId}
                                onChange={(e) => setSelectedMediaId(e.target.value)}
                                className="form-input"
                              >
                                <option value="">-- Choose from Media Library --</option>
                                {mediaAssets.map(m => (
                                  <option key={m.id} value={m.id}>{m.filename} ({m.title || "No Title"})</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Caption / Description</label>
                              <input
                                type="text"
                                value={newImageCaption}
                                onChange={(e) => setNewImageCaption(e.target.value)}
                                placeholder="Caption for evidence image..."
                                className="form-input"
                              />
                            </div>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleAddImage}
                              disabled={!selectedMediaId}
                            >
                              + Attach Image
                            </button>
                          </div>

                          {/* Existing Attached Images */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                            {galleryImages.map((img) => (
                              <div key={img.id} style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '4px', padding: '6px', position: 'relative' }}>
                                <img
                                  src={resolveMediaUrl(img.media?.public_url || img.url)}
                                  alt={img.caption || "Evidence"}
                                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '2px', display: 'block' }}
                                />
                                <div style={{ fontSize: '0.72rem', color: '#C9D1D9', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {img.caption || img.media?.filename}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  {img.is_cover ? (
                                    <span style={{ fontSize: '0.65rem', color: '#3FB950', fontWeight: 'bold' }}>COVER</span>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', color: '#8B949E' }}>DOC</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(img.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#F85149', cursor: 'pointer', fontSize: '0.75rem' }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: RELATIONSHIPS */}
                {activeTab === 'relationships' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Related Project Slug</label>
                      <select
                        name="related_project_slug"
                        value={formData.related_project_slug}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="">-- No Related Project Linked --</option>
                        {projectsList.map(p => (
                          <option key={p.id} value={p.slug}>
                            {p.title} ({p.slug})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', marginTop: '4px', display: 'block' }}>
                        Links this achievement directly to the Project Archive dossier.
                      </span>
                    </div>

                    {formData.related_project_slug && (
                      <div style={{ padding: '10px 14px', background: '#161B22', border: '1px solid #30363D', borderRadius: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#3FB950' }}>✓ LINK ACTIVE: </span>
                        <span style={{ fontSize: '0.85rem', color: '#E6EDF3' }}>
                          Visitors inspecting this achievement will be able to navigate directly to "{formData.related_project_slug}".
                        </span>
                      </div>
                    )}
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
                          Publish to Public Website
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                          When unchecked, this record is stored as a draft and is completely hidden from the public portfolio.
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
                          Mark as Featured Milestone
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                          Highlighted prominently across the mission logs.
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
                          Archive Record
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>
                          Archived records are preserved in Admin CMS but omitted from the public website.
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
                  {editingItem ? "Save Changes" : "Create Milestone Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Retro Preview Modal */}
      <RetroPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="achievement"
        data={previewData}
      />
    </div>
  );
}
