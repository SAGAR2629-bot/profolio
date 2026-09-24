import React, { useState, useEffect, useMemo } from 'react';
import { api, resolveMediaUrl } from '../services/api';
import ProjectAuthoringModal from '../components/ProjectAuthoringModal';
import RetroPreviewModal from '../components/RetroPreviewModal';
import './ProjectsManager.css';

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, PUBLISHED, DRAFT, ARCHIVED, FEATURED

  // Authoring Modal
  const [isAuthoringOpen, setIsAuthoringOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to fetch projects.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Compute Dashboard Stats
  const stats = useMemo(() => {
    const total = projects.length;
    const published = projects.filter((p) => p.published && !p.archived).length;
    const drafts = projects.filter((p) => !p.published && !p.archived).length;
    const archived = projects.filter((p) => p.archived).length;
    const featured = projects.filter((p) => p.featured).length;
    return { total, published, drafts, archived, featured };
  }, [projects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Status filter
      if (filterTab === 'PUBLISHED' && (!proj.published || proj.archived)) return false;
      if (filterTab === 'DRAFT' && (proj.published || proj.archived)) return false;
      if (filterTab === 'ARCHIVED' && !proj.archived) return false;
      if (filterTab === 'FEATURED' && !proj.featured) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (proj.title || '').toLowerCase().includes(q);
        const slugMatch = (proj.slug || '').toLowerCase().includes(q);
        const catMatch = (proj.category || '').toLowerCase().includes(q);
        const techMatch = (proj.technologies || []).some((t) => t.toLowerCase().includes(q));
        return titleMatch || slugMatch || catMatch || techMatch;
      }
      return true;
    });
  }, [projects, filterTab, searchQuery]);

  const openCreateModal = () => {
    setEditingProject(null);
    setIsAuthoringOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setIsAuthoringOpen(true);
  };

  const handleDuplicate = async (proj) => {
    try {
      setStatus({ type: 'info', text: `Duplicating "${proj.title}"...` });
      const duplicated = await api.duplicateProject(proj.id);
      setStatus({ type: 'success', text: `Project duplicated as draft: "${duplicated.title}".` });
      fetchProjects();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to duplicate project.' });
    }
  };

  const handleArchiveToggle = async (proj) => {
    try {
      const res = await api.archiveProject(proj.id);
      const isNowArchived = res.archived;
      setStatus({
        type: 'success',
        text: `Project "${proj.title}" is now ${isNowArchived ? 'ARCHIVED' : 'RESTORED'}.`
      });
      fetchProjects();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to update archive state.' });
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Permanently delete project "${proj.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteProject(proj.id);
      setStatus({ type: 'success', text: `Project "${proj.title}" deleted.` });
      fetchProjects();
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to delete project.' });
    }
  };

  const triggerPreview = (proj) => {
    setPreviewData(proj);
    setPreviewOpen(true);
  };

  if (loading) return <div className="admin-loading-state">Loading project registry...</div>;

  return (
    <div className="projects-manager-page">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">PROJECT MANAGEMENT</h1>
          <p className="page-subtitle">
            Manage engineering projects, technical case studies, media and publication status.
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + New Project Case
          </button>
        </div>
      </div>

      {status.text && (
        <div
          className={status.type === 'error' ? 'admin-error-banner' : 'badge badge-published'}
          style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', width: '100%' }}
        >
          {status.text}
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="project-stats-grid">
        <div className="stat-card" onClick={() => setFilterTab('ALL')} style={{ cursor: 'pointer' }}>
          <span className="stat-label">TOTAL PROJECTS</span>
          <span className="stat-val">{stats.total}</span>
        </div>
        <div className="stat-card" onClick={() => setFilterTab('PUBLISHED')} style={{ cursor: 'pointer' }}>
          <span className="stat-label">PUBLISHED</span>
          <span className="stat-val stat-green">{stats.published}</span>
        </div>
        <div className="stat-card" onClick={() => setFilterTab('DRAFT')} style={{ cursor: 'pointer' }}>
          <span className="stat-label">DRAFTS</span>
          <span className="stat-val stat-yellow">{stats.drafts}</span>
        </div>
        <div className="stat-card" onClick={() => setFilterTab('ARCHIVED')} style={{ cursor: 'pointer' }}>
          <span className="stat-label">ARCHIVED</span>
          <span className="stat-val stat-muted">{stats.archived}</span>
        </div>
        <div className="stat-card" onClick={() => setFilterTab('FEATURED')} style={{ cursor: 'pointer' }}>
          <span className="stat-label">FEATURED</span>
          <span className="stat-val stat-blue">{stats.featured}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="project-control-bar">
        <div className="project-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="SEARCH PROJECTS (TITLE, SLUG, CATEGORY, STACK)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="project-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="project-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-tabs-row" role="tablist">
          {[
            { id: 'ALL', label: `ALL (${stats.total})` },
            { id: 'PUBLISHED', label: `PUBLISHED (${stats.published})` },
            { id: 'DRAFT', label: `DRAFTS (${stats.drafts})` },
            { id: 'ARCHIVED', label: `ARCHIVED (${stats.archived})` },
            { id: 'FEATURED', label: `FEATURED (${stats.featured})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filterTab === tab.id}
              className={`filter-pill ${filterTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setFilterTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table & Registry List */}
      <div className="table-container">
        {filteredProjects.length === 0 ? (
          <div className="admin-empty-table">
            <span style={{ fontSize: '1.8rem' }}>📡</span>
            <p style={{ margin: '0.5rem 0 0', color: '#8B949E' }}>
              No project records found matching your filter or query.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '48px' }}>#</th>
                <th>Thumbnail</th>
                <th>Project Title & Slug</th>
                <th>Category</th>
                <th>Year</th>
                <th>Status</th>
                <th>Content Items</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj, idx) => {
                const cover = proj.images?.find((img) => img.is_cover) || proj.images?.[0];
                const thumbUrl = resolveMediaUrl(cover?.url || cover?.media?.public_url);
                const projNum = String(idx + 1).padStart(2, '0');

                return (
                  <tr key={proj.id} className={proj.archived ? 'row-archived' : ''}>
                    <td className="mono" style={{ color: '#8B949E' }}>{projNum}</td>
                    <td>
                      <div className="project-table-thumb">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt="" />
                        ) : (
                          <span className="no-thumb-glyph">⊞</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="project-title-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#FFFFFF' }}>{proj.title}</strong>
                          {proj.featured && <span className="featured-pill">★ FEATURED</span>}
                        </div>
                        <span className="mono project-slug-sub">{proj.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{proj.category}</span>
                    </td>
                    <td className="mono">{proj.year}</td>
                    <td>
                      {proj.archived ? (
                        <span className="badge badge-archived">⊘ ARCHIVED</span>
                      ) : proj.published ? (
                        <span className="badge badge-published">● LIVE</span>
                      ) : (
                        <span className="badge badge-draft">○ DRAFT</span>
                      )}
                    </td>
                    <td>
                      <div className="content-meta-chips">
                        <span className="meta-chip">📷 {proj.images?.length || 0} Media</span>
                        <span className="meta-chip">⚙ {proj.technologies?.length || 0} Tech</span>
                        {(proj.metrics?.length > 0) && (
                          <span className="meta-chip">📊 {proj.metrics.length} Metrics</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-row">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => triggerPreview(proj)}
                          title="Preview public dossier view"
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(proj)}
                          title="Edit case study"
                        >
                          ✏ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDuplicate(proj)}
                          title="Duplicate into new draft"
                        >
                          📋 Clone
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleArchiveToggle(proj)}
                          title={proj.archived ? "Restore to active" : "Archive project"}
                        >
                          {proj.archived ? "↺ Restore" : "⊘ Archive"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(proj)}
                          title="Delete permanently"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 9-Tab Dedicated Authoring Modal */}
      <ProjectAuthoringModal
        isOpen={isAuthoringOpen}
        onClose={() => setIsAuthoringOpen(false)}
        project={editingProject}
        onSaved={() => {
          fetchProjects();
          setStatus({
            type: 'success',
            text: editingProject ? 'Project case study updated.' : 'New project case study created.'
          });
        }}
        onPreview={(data) => triggerPreview(data)}
      />

      {/* Live Preview Modal */}
      <RetroPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="project"
        data={previewData}
      />
    </div>
  );
}
