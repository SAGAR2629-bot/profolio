import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import RetroPreviewModal from '../components/RetroPreviewModal';

export default function ExperienceManager() {
  const [expList, setExpList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PUBLISHED, DRAFT, FEATURED, ARCHIVED

  // Authoring Workspace Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('role'); // role, log, tech, evidence, settings
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    location: '',
    duration: '',
    description: '',
    work_performed: '',
    results: '',
    responsibilities: [],
    technologies: [],
    related_projects: [],
    related_skills: [],
    external_url: '',
    media_id: null,
    display_order: 0,
    published: true,
    featured: false,
    archived: false,
  });

  // String helpers for list fields
  const [respText, setRespText] = useState('');
  const [techText, setTechText] = useState('');
  const [skillsText, setSkillsText] = useState('');

  // Media picker modal
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Preview modal
  const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });

  const fetchAllData = async () => {
    try {
      const [expData, projData, mediaData] = await Promise.all([
        api.getExperience(),
        api.getProjects().catch(() => []),
        api.getMedia().catch(() => [])
      ]);
      setExpList(expData);
      setProjectsList(projData);
      setMediaAssets(mediaData);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to load experience telemetry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute KPI Telemetry
  const stats = useMemo(() => {
    const total = expList.length;
    const published = expList.filter(e => e.published && !e.archived).length;
    const drafts = expList.filter(e => !e.published && !e.archived).length;
    const featured = expList.filter(e => e.featured && !e.archived).length;
    const archived = expList.filter(e => e.archived).length;
    return { total, published, drafts, featured, archived };
  }, [expList]);

  // Filtered list
  const filteredExp = useMemo(() => {
    return expList.filter(item => {
      if (filterStatus === 'PUBLISHED' && (!item.published || item.archived)) return false;
      if (filterStatus === 'DRAFT' && (item.published || item.archived)) return false;
      if (filterStatus === 'FEATURED' && (!item.featured || item.archived)) return false;
      if (filterStatus === 'ARCHIVED' && !item.archived) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchRole = (item.role || '').toLowerCase().includes(q);
      const matchComp = (item.company || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchTech = Array.isArray(item.technologies) && item.technologies.some(t => t.toLowerCase().includes(q));
      return matchRole || matchComp || matchDesc || matchTech;
    });
  }, [expList, filterStatus, searchQuery]);

  const openCreateModal = () => {
    setEditingItem(null);
    setActiveTab('role');
    setFormData({
      role: '',
      company: '',
      location: '',
      duration: '',
      description: '',
      work_performed: '',
      results: '',
      responsibilities: [],
      technologies: [],
      related_projects: [],
      related_skills: [],
      external_url: '',
      media_id: null,
      display_order: expList.length,
      published: true,
      featured: false,
      archived: false,
    });
    setRespText('');
    setTechText('');
    setSkillsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setActiveTab('role');
    setFormData({
      role: item.role || '',
      company: item.company || '',
      location: item.location || '',
      duration: item.duration || '',
      description: item.description || '',
      work_performed: item.work_performed || '',
      results: item.results || '',
      responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      related_projects: Array.isArray(item.related_projects) ? item.related_projects : [],
      related_skills: Array.isArray(item.related_skills) ? item.related_skills : [],
      external_url: item.external_url || '',
      media_id: item.media_id || null,
      display_order: item.display_order ?? 0,
      published: item.published !== false,
      featured: !!item.featured,
      archived: !!item.archived,
    });
    setRespText((item.responsibilities || []).join('\n'));
    setTechText((item.technologies || []).join(', '));
    setSkillsText((item.related_skills || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.role.trim() || !formData.company.trim()) {
      setStatus({ type: 'error', text: 'Role and Organization/Company are required fields.' });
      return;
    }

    try {
      const payload = {
        ...formData,
        role: formData.role.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        duration: formData.duration.trim(),
        description: formData.description.trim(),
        work_performed: formData.work_performed.trim(),
        results: formData.results.trim(),
        external_url: formData.external_url.trim(),
        display_order: parseInt(formData.display_order, 10) || 0,
        responsibilities: respText.split('\n').map(s => s.trim()).filter(Boolean),
        technologies: techText.split(',').map(s => s.trim()).filter(Boolean),
        related_skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingItem) {
        await api.updateExperience(editingItem.id, payload);
        setStatus({ type: 'success', text: `Field record "${formData.role}" updated.` });
      } else {
        const created = await api.createExperience(payload);
        setStatus({ type: 'success', text: `Field record "${created.role}" created.` });
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to save experience record.' });
    }
  };

  const handleDuplicate = async (item) => {
    try {
      const dup = await api.duplicateExperience(item.id);
      setStatus({ type: 'success', text: `Record duplicated: "${dup.role}".` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to duplicate record.' });
    }
  };

  const handleToggleArchive = async (item) => {
    try {
      const updated = await api.archiveExperience(item.id);
      setStatus({
        type: 'success',
        text: `Record "${item.role}" ${updated.archived ? 'archived' : 'restored to active'}.`
      });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to toggle archive status.' });
    }
  };

  const handleMoveOrder = async (item, direction) => {
    const currentIndex = expList.findIndex(e => e.id === item.id);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= expList.length) return;

    const targetItem = expList[targetIndex];
    try {
      await Promise.all([
        api.updateExperience(item.id, { ...item, display_order: targetIndex }),
        api.updateExperience(targetItem.id, { ...targetItem, display_order: currentIndex })
      ]);
      fetchAllData();
    } catch {
      setStatus({ type: 'error', text: 'Failed to reorder records.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await api.deleteExperience(deleteModal.item.id);
      setStatus({ type: 'success', text: `Record "${deleteModal.item.role}" deleted.` });
      setDeleteModal({ isOpen: false, item: null });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to delete record.' });
    }
  };

  const selectedMedia = useMemo(() => {
    if (!formData.media_id) return null;
    return mediaAssets.find(m => m.id === formData.media_id) || editingItem?.media || null;
  }, [formData.media_id, mediaAssets, editingItem]);

  if (loading) return <div className="admin-loading-state">Accessing Field Experience Telemetry...</div>;

  return (
    <div className="experience-manager-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">💼 Field Experience Record</h1>
          <p className="page-subtitle">Document engineering roles, deployed responsibilities, measured results, and toolchains</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + Add Field Record
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="kpi-stats-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Total Records</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-cyan)' }}>{stats.total}</div>
        </div>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Published</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-success)' }}>{stats.published}</div>
        </div>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Drafts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-warning)' }}>{stats.drafts}</div>
        </div>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Featured</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>{stats.featured}</div>
        </div>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Archived</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-text-dim)' }}>{stats.archived}</div>
        </div>
      </div>

      {/* Status Messages */}
      {status.text && (
        <div
          className={status.type === 'error' ? 'admin-error-banner' : 'badge badge-published'}
          style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{status.text}</span>
          <button type="button" onClick={() => setStatus({ type: '', text: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Filter:</span>
            {['ALL', 'PUBLISHED', 'DRAFT', 'FEATURED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ flex: '1', minWidth: '220px', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search role, company, technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Experience Records List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredExp.map((item, idx) => {
          const techs = item.technologies || [];
          const resps = item.responsibilities || [];
          return (
            <div key={item.id} className="admin-card" style={{ opacity: item.archived ? 0.65 : 1 }}>
              <div className="admin-card-header" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h3 className="admin-card-title">{item.role}</h3>
                    {item.featured && <span className="badge badge-published" style={{ fontSize: '0.65rem' }}>★ FEATURED</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--admin-cyan)', fontWeight: '500' }}>
                      {item.company}
                    </span>
                    {item.location && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                        📍 {item.location}
                      </span>
                    )}
                    {item.duration && (
                      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--admin-warning)' }}>
                        [{item.duration}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Move order & badges */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge ${item.published && !item.archived ? 'badge-published' : 'badge-draft'}`}>
                    {item.archived ? 'ARCHIVED' : item.published ? '● PUBLISHED' : '○ DRAFT'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button
                      type="button"
                      title="Move Up"
                      disabled={idx === 0}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem' }}
                      onClick={() => handleMoveOrder(item, 'up')}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      title="Move Down"
                      disabled={idx === filteredExp.length - 1}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem' }}
                      onClick={() => handleMoveOrder(item, 'down')}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-main)', margin: '0.85rem 0 0.5rem', lineHeight: '1.5' }}>
                  {item.description}
                </p>
              )}

              {/* Responsibilities */}
              {resps.length > 0 && (
                <div style={{ margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Key Engineering Contributions:
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', lineHeight: '1.5' }}>
                    {resps.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                    {resps.length > 3 && <li>+ {resps.length - 3} more items...</li>}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {techs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                  {techs.map((t, i) => (
                    <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--admin-border)', paddingTop: '0.85rem', marginTop: '0.85rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewModal({ isOpen: true, item })}
                >
                  👁 Preview
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDuplicate(item)}
                  title="Duplicate record"
                >
                  📑 Duplicate
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleArchive(item)}
                >
                  {item.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openEditModal(item)}
                >
                  ✏ Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteModal({ isOpen: true, item })}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Authoring Workspace Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '840px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="admin-card-title">{editingItem ? `Edit: ${editingItem.role} at ${editingItem.company}` : 'New Field Experience Record'}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Configure engineering engagement, technical execution, and measured impact</span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* Authoring Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-bg-base)', padding: '0 1rem', overflowX: 'auto' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'role' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('role')}
              >
                1. Role & Engagement
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'log' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('log')}
              >
                2. Engineering Log & Results
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'tech' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('tech')}
              >
                3. Toolchain & Architecture
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'evidence' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('evidence')}
              >
                4. Evidence & Media
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('settings')}
              >
                5. Settings
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto', padding: '1.25rem' }}>
              <form id="exp-author-form" onSubmit={handleSave}>
                {/* TAB 1: ROLE & ENGAGEMENT */}
                {activeTab === 'role' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="exp_role">Role / Position *</label>
                        <input
                          id="exp_role"
                          type="text"
                          required
                          className="form-input"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="e.g. Robotics Research Intern, Embedded Systems Lead"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="exp_comp">Organization / Company *</label>
                        <input
                          id="exp_comp"
                          type="text"
                          required
                          className="form-input"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="e.g. Autonomous Systems Laboratory"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="exp_dur">Duration Timeline</label>
                        <input
                          id="exp_dur"
                          type="text"
                          className="form-input"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="e.g. Jun 2024 — Aug 2024"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="exp_loc">Location (Optional)</label>
                        <input
                          id="exp_loc"
                          type="text"
                          className="form-input"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Bengaluru, India (On-Site)"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="exp_order">Display Order</label>
                        <input
                          id="exp_order"
                          type="number"
                          className="form-input"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_url">External Company / Project URL (Optional)</label>
                      <input
                        id="exp_url"
                        type="url"
                        className="form-input"
                        value={formData.external_url}
                        onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                        placeholder="https://company.org or https://lab.edu"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: ENGINEERING LOG & RESULTS */}
                {activeTab === 'log' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_desc">Executive Summary / Overview</label>
                      <textarea
                        id="exp_desc"
                        rows={3}
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Concise summary of Anand's core charter, domain focus, and operational scope..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_resp">Core Responsibilities & Milestones (One per line)</label>
                      <textarea
                        id="exp_resp"
                        rows={4}
                        className="form-textarea"
                        value={respText}
                        onChange={(e) => setRespText(e.target.value)}
                        placeholder="Architected ROS2 node interfaces for real-time sensor fusion&#10;Configured CAN-bus motor driver communication at 1kHz&#10;Engineered automated hardware-in-the-loop validation testbeds"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_work">Work Performed / Technical Deep Dive</label>
                      <textarea
                        id="exp_work"
                        rows={3}
                        className="form-textarea"
                        value={formData.work_performed}
                        onChange={(e) => setFormData({ ...formData, work_performed: e.target.value })}
                        placeholder="Detailed technical execution: algorithms implemented, hardware designed, protocols written..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_results">Measured Results & Impact</label>
                      <textarea
                        id="exp_results"
                        rows={3}
                        className="form-textarea"
                        value={formData.results}
                        onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                        placeholder="Tangible benchmarks, speedups, production deployments, or hardware flight-ready milestones..."
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: TOOLCHAIN & ARCHITECTURE */}
                {activeTab === 'tech' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_techs">Technologies & Frameworks Deployed (Comma-separated)</label>
                      <input
                        id="exp_techs"
                        type="text"
                        className="form-input"
                        value={techText}
                        onChange={(e) => setTechText(e.target.value)}
                        placeholder="ROS2, C++, Python, Gazebo, CAN-bus, FreeRTOS, STM32"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '0.35rem' }}>
                        Rendered as technical tags in the Field Experience dossier.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="exp_skills">Skills Demonstrated & Developed (Comma-separated)</label>
                      <input
                        id="exp_skills"
                        type="text"
                        className="form-input"
                        value={skillsText}
                        onChange={(e) => setSkillsText(e.target.value)}
                        placeholder="Embedded Systems, Motor Control, Simulation, Real-Time OS"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Related Projects Connected</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', padding: '0.5rem', background: 'var(--admin-bg-base)', border: '1px solid var(--admin-border)', borderRadius: '6px' }}>
                        {projectsList.map(p => {
                          const isSelected = formData.related_projects.includes(p.slug);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => {
                                const next = isSelected
                                  ? formData.related_projects.filter(s => s !== p.slug)
                                  : [...formData.related_projects, p.slug];
                                setFormData({ ...formData, related_projects: next });
                              }}
                            >
                              {isSelected ? '✓ ' : '+ '} {p.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: EVIDENCE & MEDIA */}
                {activeTab === 'evidence' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="admin-card" style={{ padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                        Attach Supporting Evidence / Certification of Completion / Letter
                      </span>

                      {selectedMedia ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--admin-bg-base)', padding: '0.75rem', border: '1px solid var(--admin-border)', borderRadius: '6px' }}>
                          <img
                            src={selectedMedia.public_url}
                            alt=""
                            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--admin-border)' }}
                          />
                          <div style={{ flex: '1' }}>
                            <div style={{ fontWeight: '600', color: 'var(--admin-text-main)' }}>{selectedMedia.filename}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                              {selectedMedia.media_type} · {(selectedMedia.size_bytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowMediaPicker(true)}
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setFormData({ ...formData, media_id: null })}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--admin-bg-base)', border: '1px dashed var(--admin-border)', borderRadius: '6px' }}>
                          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '0.75rem' }}>No document or image attached.</p>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowMediaPicker(true)}
                          >
                            Select from Media Library
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: SETTINGS */}
                {activeTab === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--admin-text-main)' }}>Live Public Visibility</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Published records appear on the public Field Experience Record page.
                          </div>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--admin-text-main)' }}>Featured Experience</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Highlight this role in high-priority archive positions.
                          </div>
                        </div>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.archived}
                          onChange={(e) => setFormData({ ...formData, archived: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--admin-text-main)' }}>Archived Record</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Retained in database archives but excluded from visitor responses.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewModal({ isOpen: true, item: { ...formData, technologies: techText.split(',').map(s => s.trim()).filter(Boolean), responsibilities: respText.split('\n').map(s => s.trim()).filter(Boolean) } })}
                >
                  👁 Preview Entry
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" form="exp-author-form" className="btn btn-success">
                  Save Experience Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="modal-overlay" onClick={() => setShowMediaPicker(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="admin-card-title">Select Evidence Asset</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMediaPicker(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setFormData({ ...formData, media_id: asset.id });
                      setShowMediaPicker(false);
                    }}
                    style={{
                      border: formData.media_id === asset.id ? '2px solid var(--admin-cyan)' : '1px solid var(--admin-border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      background: 'var(--admin-bg-base)',
                      textAlign: 'center'
                    }}
                  >
                    <img
                      src={asset.public_url}
                      alt=""
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.35rem' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.filename}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ isOpen: false, item: null })}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="admin-card-title" style={{ color: 'var(--admin-danger)' }}>Confirm Deletion</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeleteModal({ isOpen: false, item: null })}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ color: 'var(--admin-text-main)', marginBottom: '0.5rem' }}>
                Are you sure you want to delete <strong>"{deleteModal.item?.role} at {deleteModal.item?.company}"</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                This will permanently delete this field experience record from the database.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteModal({ isOpen: false, item: null })}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retro Preview Modal */}
      <RetroPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, item: null })}
        type="experience"
        data={previewModal.item}
      />
    </div>
  );
}
