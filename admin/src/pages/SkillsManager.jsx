import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import RetroPreviewModal from '../components/RetroPreviewModal';

export default function SkillsManager() {
  const [categories, setCategories] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PUBLISHED, DRAFT, FEATURED, ARCHIVED

  // Authoring Workspace Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('identity'); // identity, items, settings
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    color: 'cyan',
    icon: '⚙️',
    description: '',
    items: [],
    display_order: 0,
    published: true,
    featured: false,
    archived: false,
  });

  // Fast Bulk Skills Text
  const [bulkText, setBulkText] = useState('');
  const [skillEditMode, setSkillEditMode] = useState('structured'); // structured or bulk

  // Sub-item creation state within the modal
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillProject, setNewSkillProject] = useState('');

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });

  const fetchAllData = async () => {
    try {
      const [catsData, projsData] = await Promise.all([
        api.getSkills(),
        api.getProjects().catch(() => [])
      ]);
      setCategories(catsData);
      setProjectsList(projsData);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to load technical skills registry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute KPI Telemetry
  const stats = useMemo(() => {
    const total = categories.length;
    const published = categories.filter(c => c.published && !c.archived).length;
    const drafts = categories.filter(c => !c.published && !c.archived).length;
    const featured = categories.filter(c => c.featured && !c.archived).length;
    const archived = categories.filter(c => c.archived).length;
    let totalItems = 0;
    categories.forEach(c => {
      if (Array.isArray(c.items)) totalItems += c.items.length;
    });
    return { total, published, drafts, featured, archived, totalItems };
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      if (filterStatus === 'PUBLISHED' && (!cat.published || cat.archived)) return false;
      if (filterStatus === 'DRAFT' && (cat.published || cat.archived)) return false;
      if (filterStatus === 'FEATURED' && (!cat.featured || cat.archived)) return false;
      if (filterStatus === 'ARCHIVED' && !cat.archived) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchCat = (cat.category || '').toLowerCase().includes(q);
      const matchDesc = (cat.description || '').toLowerCase().includes(q);
      const matchItems = Array.isArray(cat.items) && cat.items.some(it => {
        if (typeof it === 'string') return it.toLowerCase().includes(q);
        return (it.name || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q);
      });
      return matchCat || matchDesc || matchItems;
    });
  }, [categories, filterStatus, searchQuery]);

  // Normalize items array for editing
  const normalizeItems = (rawItems) => {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.map(item => {
      if (typeof item === 'string') {
        return { name: item, level: '', description: '', related_projects: [], related_certificates: [] };
      }
      return {
        name: item.name || '',
        level: item.level || item.proficiency || '',
        description: item.description || '',
        related_projects: item.related_projects || (item.relatedProjects ? [item.relatedProjects] : []),
        related_certificates: item.related_certificates || [],
      };
    });
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setActiveTab('identity');
    setFormData({
      category: '',
      color: 'cyan',
      icon: '⚙️',
      description: '',
      items: [],
      display_order: categories.length,
      published: true,
      featured: false,
      archived: false,
    });
    setBulkText('');
    setSkillEditMode('structured');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingItem(cat);
    setActiveTab('identity');
    const normItems = normalizeItems(cat.items);
    setFormData({
      category: cat.category || '',
      color: cat.color || 'cyan',
      icon: cat.icon || '⚙️',
      description: cat.description || '',
      items: normItems,
      display_order: cat.display_order ?? 0,
      published: cat.published !== false,
      featured: !!cat.featured,
      archived: !!cat.archived,
    });
    setBulkText(normItems.map(i => i.name).join(', '));
    setSkillEditMode('structured');
    setIsModalOpen(true);
  };

  const handleAddSkillItem = () => {
    if (!newSkillName.trim()) return;
    const newItem = {
      name: newSkillName.trim(),
      level: newSkillLevel.trim(),
      description: newSkillDesc.trim(),
      related_projects: newSkillProject ? [newSkillProject] : [],
      related_certificates: [],
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setNewSkillName('');
    setNewSkillLevel('');
    setNewSkillDesc('');
    setNewSkillProject('');
  };

  const handleRemoveSkillItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleApplyBulkSkills = () => {
    const names = bulkText.split(',').map(s => s.trim()).filter(Boolean);
    const newItems = names.map(name => {
      const existing = formData.items.find(it => it.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing;
      return { name, level: '', description: '', related_projects: [], related_certificates: [] };
    });
    setFormData(prev => ({ ...prev, items: newItems }));
    setStatus({ type: 'success', text: `Loaded ${newItems.length} skills from text.` });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.category.trim()) {
      setStatus({ type: 'error', text: 'Category Title is required.' });
      return;
    }

    try {
      const payload = {
        ...formData,
        category: formData.category.trim(),
        display_order: parseInt(formData.display_order, 10) || 0,
      };

      if (editingItem) {
        await api.updateSkill(editingItem.id, payload);
        setStatus({ type: 'success', text: `Category "${formData.category}" updated successfully.` });
      } else {
        const created = await api.createSkill(payload);
        setStatus({ type: 'success', text: `Category "${created.category}" created successfully.` });
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to save skill category.' });
    }
  };

  const handleDuplicate = async (cat) => {
    try {
      const dup = await api.duplicateSkill(cat.id);
      setStatus({ type: 'success', text: `Category duplicated: "${dup.category}".` });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to duplicate category.' });
    }
  };

  const handleToggleArchive = async (cat) => {
    try {
      const updated = await api.archiveSkill(cat.id);
      setStatus({
        type: 'success',
        text: `Category "${cat.category}" ${updated.archived ? 'archived' : 'restored to active'}.`
      });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to toggle archive status.' });
    }
  };

  const handleMoveOrder = async (cat, direction) => {
    const currentIndex = categories.findIndex(c => c.id === cat.id);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCat = categories[targetIndex];
    try {
      await Promise.all([
        api.updateSkill(cat.id, { ...cat, display_order: targetIndex }),
        api.updateSkill(targetCat.id, { ...targetCat, display_order: currentIndex })
      ]);
      fetchAllData();
    } catch {
      setStatus({ type: 'error', text: 'Failed to reorder categories.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await api.deleteSkill(deleteModal.item.id);
      setStatus({ type: 'success', text: `Category "${deleteModal.item.category}" deleted.` });
      setDeleteModal({ isOpen: false, item: null });
      fetchAllData();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to delete category.' });
    }
  };

  if (loading) return <div className="admin-loading-state">Accessing Technical Skills Telemetry...</div>;

  return (
    <div className="skills-manager-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Technical Skills Registry</h1>
          <p className="page-subtitle">Configure engineering modules, hardware interfaces, competencies, and cross-references</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + Add Skill Category
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="kpi-stats-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Categories</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-cyan)' }}>{stats.total}</div>
        </div>
        <div className="admin-card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Total Skills</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>{stats.totalItems}</div>
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
              placeholder="Search category or skill name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredCategories.map((cat, idx) => {
          const itemsList = normalizeItems(cat.items);
          return (
            <div key={cat.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', opacity: cat.archived ? 0.65 : 1 }}>
              <div className="admin-card-header" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.6rem', padding: '0.35rem 0.6rem', background: 'var(--admin-bg-base)', border: '1px solid var(--admin-border)', borderRadius: '6px' }}>
                    {cat.icon || '⚙️'}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 className="admin-card-title">{cat.category}</h3>
                      {cat.featured && <span className="badge badge-published" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>★ FEATURED</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                      <span className={`badge ${cat.published && !cat.archived ? 'badge-published' : 'badge-draft'}`}>
                        {cat.archived ? 'ARCHIVED' : cat.published ? '● PUBLISHED' : '○ DRAFT'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        {itemsList.length} skills listed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Move order & quick actions */}
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    title="Move Up"
                    disabled={idx === 0}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem' }}
                    onClick={() => handleMoveOrder(cat, 'up')}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    title="Move Down"
                    disabled={idx === filteredCategories.length - 1}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem' }}
                    onClick={() => handleMoveOrder(cat, 'down')}
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Description */}
              {cat.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', margin: '0.85rem 0 0.5rem', lineHeight: '1.4' }}>
                  {cat.description}
                </p>
              )}

              {/* Skills Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.75rem 0', flex: '1' }}>
                {itemsList.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--admin-bg-base)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.55rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    <span style={{ color: 'var(--admin-text-main)', fontWeight: '500' }}>{item.name}</span>
                    {item.level && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                        {item.level}
                      </span>
                    )}
                  </div>
                ))}
                {itemsList.length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)', fontStyle: 'italic' }}>
                    No competencies added yet.
                  </span>
                )}
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--admin-border)', paddingTop: '0.85rem', marginTop: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewModal({ isOpen: true, item: cat })}
                >
                  👁 Preview
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDuplicate(cat)}
                  title="Duplicate category"
                >
                  📑 Duplicate
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleArchive(cat)}
                >
                  {cat.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openEditModal(cat)}
                >
                  ✏ Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteModal({ isOpen: true, item: cat })}
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
          <div className="modal-content" style={{ maxWidth: '780px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="admin-card-title">{editingItem ? `Edit Category: ${editingItem.category}` : 'New Technical Skill Category'}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Configure technical domain specifications and related nodes</span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {/* Authoring Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-bg-base)', padding: '0 1rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'identity' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('identity')}
              >
                1. Category Identity
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('items')}
              >
                2. Competencies & Cross-Links ({formData.items.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '0', borderBottom: 'none' }}
                onClick={() => setActiveTab('settings')}
              >
                3. Publishing & Settings
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto', padding: '1.25rem' }}>
              <form id="skill-category-form" onSubmit={handleSave}>
                {/* TAB 1: IDENTITY */}
                {activeTab === 'identity' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat_icon">Icon (Emoji)</label>
                        <input
                          id="cat_icon"
                          type="text"
                          className="form-input"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="⚙️, 🤖, ⚡"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat_title">Category Title *</label>
                        <input
                          id="cat_title"
                          type="text"
                          required
                          className="form-input"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g. Robotics & Controls, AI / Machine Learning"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat_color">Accent Color</label>
                        <select
                          id="cat_color"
                          className="form-input"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        >
                          <option value="cyan">Cyan (#06B6D4)</option>
                          <option value="green">Green (#10B981)</option>
                          <option value="yellow">Yellow (#F59E0B)</option>
                          <option value="purple">Purple (#8B5CF6)</option>
                          <option value="blue">Blue (#2563EB)</option>
                          <option value="red">Red (#EF4444)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cat_order">Display Order Index</label>
                        <input
                          id="cat_order"
                          type="number"
                          className="form-input"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cat_desc">Category Description (Optional)</label>
                      <textarea
                        id="cat_desc"
                        rows={3}
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Contextual summary of these tools, hardware architectures, and methodologies..."
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: COMPETENCIES & ITEMS */}
                {activeTab === 'items' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                        Add detailed skills with optional proficiency labels (no fake numeric % bars) or use fast bulk paste.
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${skillEditMode === 'structured' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setSkillEditMode('structured')}
                        >
                          Structured View
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${skillEditMode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setSkillEditMode('bulk')}
                        >
                          Bulk Fast-Edit
                        </button>
                      </div>
                    </div>

                    {skillEditMode === 'bulk' ? (
                      <div className="admin-card" style={{ padding: '1rem' }}>
                        <label className="form-label" htmlFor="bulk_skills_input">
                          Comma-Separated Skills List
                        </label>
                        <textarea
                          id="bulk_skills_input"
                          rows={4}
                          className="form-textarea"
                          value={bulkText}
                          onChange={(e) => setBulkText(e.target.value)}
                          placeholder="Python, PyTorch, ROS2, MuJoCo, Gazebo, C++"
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '0.75rem' }}
                          onClick={handleApplyBulkSkills}
                        >
                          ⚡ Sync Comma-Separated Skills into List
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* New Item Inserter */}
                        <div className="admin-card" style={{ padding: '1rem', background: 'var(--admin-bg-base)', border: '1px dashed var(--admin-border)' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--admin-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
                            + Register Competency Node
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Skill Name *</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. PyTorch, MuJoCo, ROS2"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Level (Optional)</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Advanced / 3+ Years"
                                value={newSkillLevel}
                                onChange={(e) => setNewSkillLevel(e.target.value)}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Description / Focus (Optional)</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Quadruped kinematics, RL reward engineering"
                                value={newSkillDesc}
                                onChange={(e) => setNewSkillDesc(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Related Project Slug</label>
                              <select
                                className="form-input"
                                value={newSkillProject}
                                onChange={(e) => setNewSkillProject(e.target.value)}
                              >
                                <option value="">None / Global</option>
                                {projectsList.map(p => (
                                  <option key={p.id} value={p.slug}>{p.title}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleAddSkillItem}
                          >
                            + Add Skill Node
                          </button>
                        </div>

                        {/* List of current skills */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                          {formData.items.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--admin-bg-base)',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '6px',
                                padding: '0.5rem 0.75rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '600', color: 'var(--admin-text-main)' }}>{item.name}</span>
                                {item.level && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                                    {item.level}
                                  </span>
                                )}
                                {item.description && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                    — {item.description}
                                  </span>
                                )}
                                {item.related_projects && item.related_projects.length > 0 && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                                    ⎋ {item.related_projects[0]}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.2rem 0.45rem' }}
                                onClick={() => handleRemoveSkillItem(idx)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {formData.items.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--admin-text-dim)', fontStyle: 'italic' }}>
                              No competencies registered yet. Add one above.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 3: SETTINGS */}
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
                            Published categories appear on the public Skills Registry page.
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
                          <strong style={{ color: 'var(--admin-text-main)' }}>Featured Category</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Highlight this category at the top of the engineering matrix.
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
                            Archived categories are retained in the database but hidden from public visitor queries.
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
                  onClick={() => setPreviewModal({ isOpen: true, item: formData })}
                >
                  👁 Preview Entry
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" form="skill-category-form" className="btn btn-success">
                  Save Skill Category
                </button>
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
                Are you sure you want to delete category <strong>"{deleteModal.item?.category}"</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                This will remove all associated skill chips from this category. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteModal({ isOpen: false, item: null })}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retro Preview Modal */}
      <RetroPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, item: null })}
        type="skill"
        data={previewModal.item}
      />
    </div>
  );
}
