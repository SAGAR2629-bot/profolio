import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import RetroPreviewModal from '../components/RetroPreviewModal';

export default function EducationManager() {
  const [eduList, setEduList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PUBLISHED, DRAFT, FEATURED, ARCHIVED

  // Authoring Workspace Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('program'); // program, coursework, media, relationships, settings
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    location: '',
    duration: '',
    status: 'IN PROGRESS',
    description: '',
    relevant_courses: [],
    related_projects: [],
    related_skills: [],
    achievements: [],
    media_id: null,
    display_order: 0,
    published: true,
    featured: false,
    archived: false,
  });

  // String helpers for list fields
  const [coursesText, setCoursesText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [achievementsText, setAchievementsText] = useState('');

  // Media picker modal
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Preview modal
  const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });

  const fetchAllData = async () => {
    try {
      const [eduData, projData, mediaData] = await Promise.all([
        api.getEducation(),
        api.getProjects().catch(() => []),
        api.getMedia().catch(() => [])
      ]);
      setEduList(eduData);
      setProjectsList(projData);
      setMediaAssets(mediaData);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to load academic records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute KPI Telemetry
  const stats = useMemo(() => {
    const total = eduList.length;
    const published = eduList.filter(e => e.published && !e.archived).length;
    const drafts = eduList.filter(e => !e.published && !e.archived).length;
    const featured = eduList.filter(e => e.featured && !e.archived).length;
    const archived = eduList.filter(e => e.archived).length;
    return { total, published, drafts, featured, archived };
  }, [eduList]);

  // Filtered list
  const filteredEdu = useMemo(() => {
    return eduList.filter(item => {
      if (filterStatus === 'PUBLISHED' && (!item.published || item.archived)) return false;
      if (filterStatus === 'DRAFT' && (item.published || item.archived)) return false;
      if (filterStatus === 'FEATURED' && (!item.featured || item.archived)) return false;
      if (filterStatus === 'ARCHIVED' && !item.archived) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchDegree = (item.degree || '').toLowerCase().includes(q);
      const matchInst = (item.institution || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCourses = Array.isArray(item.relevant_courses) && item.relevant_courses.some(c => c.toLowerCase().includes(q));
      return matchDegree || matchInst || matchDesc || matchCourses;
    });
  }, [eduList, filterStatus, searchQuery]);

  const openCreateModal = () => {
    setEditingItem(null);
    setActiveTab('program');
    setFormData({
      degree: '',
      institution: '',
      location: '',
      duration: '',
      status: 'IN PROGRESS',
      description: '',
      relevant_courses: [],
      related_projects: [],
      related_skills: [],
      achievements: [],
      media_id: null,
      display_order: eduList.length,
      published: true,
      featured: false,
      archived: false,
    });
    setCoursesText('');
    setSkillsText('');
    setAchievementsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setActiveTab('program');
    setFormData({
      degree: item.degree || '',
      institution: item.institution || '',
      location: item.location || '',
      duration: item.duration || '',
      status: item.status || 'IN PROGRESS',
      description: item.description || '',
      relevant_courses: Array.isArray(item.relevant_courses) ? item.relevant_courses : [],
      related_projects: Array.isArray(item.related_projects) ? item.related_projects : [],
      related_skills: Array.isArray(item.related_skills) ? item.related_skills : [],
      achievements: Array.isArray(item.achievements) ? item.achievements : [],
      media_id: item.media_id || null,
      display_order: item.display_order ?? 0,
      published: item.published !== false,
      featured: !!item.featured,
      archived: !!item.archived,
    });
    setCoursesText((item.relevant_courses || []).join(', '));
    setSkillsText((item.related_skills || []).join(', '));
    setAchievementsText((item.achievements || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.degree.trim() || !formData.institution.trim()) {
      setStatus({ type: 'error', text: 'Degree and Institution are required fields.' });
      return;
    }

    try {
      const payload = {
        ...formData,
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        location: formData.location.trim(),
        duration: formData.duration.trim(),
        description: formData.description.trim(),
        display_order: parseInt(formData.display_order, 10) || 0,
        relevant_courses: coursesText.split(',').map(s => s.trim()).filter(Boolean),
        related_skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
        achievements: achievementsText.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingItem) {
        await api.updateEducation(editingItem.id, payload);
        setStatus({ type: 'success', text: `Academic record "${formData.degree}" updated.` });
      } else {
        const created = await api.createEducation(payload);
        setStatus({ type: 'success', text: `Academic record "${created.degree}" created.` });
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to save academic record.' });
    }
  };

  const handleDuplicate = async (item) => {
    try {
      const dup = await api.duplicateEducation(item.id);
      setStatus({ type: 'success', text: `Record duplicated: "${dup.degree}".` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to duplicate record.' });
    }
  };

  const handleToggleArchive = async (item) => {
    try {
      const updated = await api.archiveEducation(item.id);
      setStatus({
        type: 'success',
        text: `Record "${item.degree}" ${updated.archived ? 'archived' : 'restored to active'}.`
      });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to toggle archive status.' });
    }
  };

  const handleMoveOrder = async (item, direction) => {
    const currentIndex = eduList.findIndex(e => e.id === item.id);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= eduList.length) return;

    const targetItem = eduList[targetIndex];
    try {
      await Promise.all([
        api.updateEducation(item.id, { ...item, display_order: targetIndex }),
        api.updateEducation(targetItem.id, { ...targetItem, display_order: currentIndex })
      ]);
      fetchAllData();
    } catch {
      setStatus({ type: 'error', text: 'Failed to reorder records.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await api.deleteEducation(deleteModal.item.id);
      setStatus({ type: 'success', text: `Record "${deleteModal.item.degree}" deleted.` });
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

  if (loading) return <div className="admin-loading-state">Accessing Academic Records Archive...</div>;

  return (
    <div className="education-manager-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 Education & Academic Record</h1>
          <p className="page-subtitle">Manage degrees, universities, verified coursework modules, and supporting academic telemetry</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + Add Academic Record
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
              placeholder="Search degree, institution, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Academic Records List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredEdu.map((item, idx) => {
          const courses = item.relevant_courses || [];
          const projects = item.related_projects || [];
          const skills = item.related_skills || [];
          return (
            <div key={item.id} className="admin-card" style={{ opacity: item.archived ? 0.65 : 1 }}>
              <div className="admin-card-header" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h3 className="admin-card-title">{item.degree}</h3>
                    {item.featured && <span className="badge badge-published" style={{ fontSize: '0.65rem' }}>★ FEATURED</span>}
                    <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', fontSize: '0.7rem' }}>
                      {item.status || 'IN PROGRESS'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--admin-cyan)', fontWeight: '500' }}>
                      {item.institution}
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
                      disabled={idx === filteredEdu.length - 1}
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
                <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-main)', margin: '0.85rem 0', lineHeight: '1.5' }}>
                  {item.description}
                </p>
              )}

              {/* Coursework Modules */}
              {courses.length > 0 && (
                <div style={{ margin: '0.6rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Relevant Coursework:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {courses.map((c, i) => (
                      <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross references & media status */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                {projects.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--admin-cyan)' }}>Projects:</span> {projects.join(', ')}
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--admin-warning)' }}>Skills Developed:</span> {skills.join(', ')}
                  </div>
                )}
                {item.media && (
                  <div style={{ color: 'var(--admin-success)' }}>
                    ✓ Supporting Document Attached ({item.media.filename})
                  </div>
                )}
              </div>

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
          <div className="modal-content" style={{ maxWidth: '820px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="admin-card-title">{editingItem ? `Edit: ${editingItem.degree}` : 'New Academic Record'}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Configure degree timeline, verified coursework, and cross-references</span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* Authoring Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-bg-base)', padding: '0 1rem', overflowX: 'auto' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'program' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('program')}
              >
                1. Program & Institution
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'coursework' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('coursework')}
              >
                2. Coursework & Focus
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'media' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('media')}
              >
                3. Verification & Media
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'relationships' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('relationships')}
              >
                4. Related Records
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
              <form id="edu-author-form" onSubmit={handleSave}>
                {/* TAB 1: PROGRAM & INSTITUTION */}
                {activeTab === 'program' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="edu_degree">Degree Program *</label>
                      <input
                        id="edu_degree"
                        type="text"
                        required
                        className="form-input"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g. B.Tech in Electronics & Communication Engineering"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edu_inst">Institution / University *</label>
                        <input
                          id="edu_inst"
                          type="text"
                          required
                          className="form-input"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          placeholder="e.g. SRM Institute of Science and Technology"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edu_loc">Location (Optional)</label>
                        <input
                          id="edu_loc"
                          type="text"
                          className="form-input"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Chennai, India"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edu_dur">Duration Timeline</label>
                        <input
                          id="edu_dur"
                          type="text"
                          className="form-input"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="e.g. 2022 — 2026"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edu_status">Status</label>
                        <select
                          id="edu_status"
                          className="form-input"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="IN PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CONFERRED">CONFERRED</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="edu_order">Display Order</label>
                        <input
                          id="edu_order"
                          type="number"
                          className="form-input"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: COURSEWORK & FOCUS */}
                {activeTab === 'coursework' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="edu_desc">Academic Focus / Synopsis</label>
                      <textarea
                        id="edu_desc"
                        rows={4}
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Comprehensive summary of engineering curriculum, specialized electives, thesis research, or laboratory concentrations..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="edu_courses">Relevant Coursework (Comma-separated)</label>
                      <textarea
                        id="edu_courses"
                        rows={3}
                        className="form-textarea"
                        value={coursesText}
                        onChange={(e) => setCoursesText(e.target.value)}
                        placeholder="Control Systems, Robotics, Embedded Systems, Signal Processing, Computer Architecture"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '0.35rem' }}>
                        Each comma-separated item renders as a verified course chip on the Academic Record.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="edu_ach">Academic Achievements / Honors (Comma-separated)</label>
                      <input
                        id="edu_ach"
                        type="text"
                        className="form-input"
                        value={achievementsText}
                        onChange={(e) => setAchievementsText(e.target.value)}
                        placeholder="Dean's List, Meritorious Academic Scholarship, Robotics Society Lead"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: MEDIA & VERIFICATION */}
                {activeTab === 'media' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="admin-card" style={{ padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                        Attach Supporting Evidence / Diploma / Transcript
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

                {/* TAB 4: RELATIONSHIPS */}
                {activeTab === 'relationships' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Related Projects Undertaken</label>
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

                    <div className="form-group">
                      <label className="form-label" htmlFor="edu_skills_tag">Skills Developed During Program (Comma-separated)</label>
                      <input
                        id="edu_skills_tag"
                        type="text"
                        className="form-input"
                        value={skillsText}
                        onChange={(e) => setSkillsText(e.target.value)}
                        placeholder="C++, Embedded C, MATLAB, Simulink, PCB Design"
                      />
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
                            Published records appear on the public Academic Record timeline.
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
                          <strong style={{ color: 'var(--admin-text-main)' }}>Featured Degree</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Highlight this academic milestone with priority callout tags.
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
                  onClick={() => setPreviewModal({ isOpen: true, item: { ...formData, relevant_courses: coursesText.split(',').map(s => s.trim()).filter(Boolean) } })}
                >
                  👁 Preview Entry
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" form="edu-author-form" className="btn btn-success">
                  Save Academic Record
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
                Are you sure you want to delete <strong>"{deleteModal.item?.degree}"</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                This will permanently delete this academic record from the database.
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
        type="education"
        data={previewModal.item}
      />
    </div>
  );
}
