import React, { useState, useEffect } from 'react';
import { api, resolveMediaUrl } from '../services/api';
import './ProjectAuthoringModal.css';

export default function ProjectAuthoringModal({
  isOpen,
  onClose,
  project,
  onSaved,
  onPreview
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, casestudy, tech, media, results, challenges, timeline, links, settings
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    year: '2026',
    category: 'Robotics',
    status: 'COMPLETED',
    domain: 'Embodied AI',
    platform: 'Physical & Simulation',
    overview: '',
    problem: '',
    approach: '',
    implementation: '',
    architecture: '',
    engineering_notes: '',
    published: true,
    featured: false,
    archived: false,
    display_order: 0,
    technologies: [],
    metrics: [],
    challenges: [],
    milestones: [],
    links: {
      github: '',
      demo: '',
      documentation: '',
      paper: '',
      video: '',
      dataset: '',
      other: ''
    }
  });

  const [techInput, setTechInput] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize initial project data
  useEffect(() => {
    if (!isOpen) return;

    if (project) {
      const pLinks = project.links || {};
      setFormData({
        title: project.title || '',
        slug: project.slug || '',
        short_description: project.short_description || project.description || '',
        full_description: project.full_description || '',
        year: project.year || '2026',
        category: project.category || 'Robotics',
        status: project.status || 'COMPLETED',
        domain: project.domain || 'Embodied AI',
        platform: project.platform || 'Physical & Simulation',
        overview: project.overview || project.full_description || '',
        problem: project.problem || '',
        approach: project.approach || '',
        implementation: project.implementation || '',
        architecture: project.architecture || '',
        engineering_notes: project.engineering_notes || '',
        published: project.published !== undefined ? project.published : true,
        featured: !!project.featured,
        archived: !!project.archived,
        display_order: project.display_order || 0,
        technologies: project.technologies || project.tech || [],
        metrics: project.metrics || [],
        challenges: project.challenges || [],
        milestones: project.milestones || [],
        links: {
          github: project.github_url || project.github || pLinks.github || '',
          demo: project.demo_url || project.live || project.demo || pLinks.demo || '',
          documentation: pLinks.documentation || pLinks.docs || '',
          paper: pLinks.paper || '',
          video: pLinks.video || '',
          dataset: pLinks.dataset || '',
          other: pLinks.other || ''
        }
      });
      setGalleryImages(project.images || []);
    } else {
      setFormData({
        title: '',
        slug: '',
        short_description: '',
        full_description: '',
        year: '2026',
        category: 'Robotics',
        status: 'COMPLETED',
        domain: 'Embodied AI',
        platform: 'Physical & Simulation',
        overview: '',
        problem: '',
        approach: '',
        implementation: '',
        architecture: '',
        engineering_notes: '',
        published: false, // new projects default to draft
        featured: false,
        archived: false,
        display_order: 0,
        technologies: [],
        metrics: [],
        challenges: [],
        milestones: [],
        links: {
          github: '',
          demo: '',
          documentation: '',
          paper: '',
          video: '',
          dataset: '',
          other: ''
        }
      });
      setGalleryImages([]);
    }
    setActiveTab('overview');
    setErrorMessage('');
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'title' && !project) {
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  };

  const handleLinkChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [key]: value
      },
      // Keep legacy root fields in sync
      ...(key === 'github' ? { github_url: value } : {}),
      ...(key === 'demo' ? { demo_url: value } : {})
    }));
  };

  // Technologies Chip Management
  const handleAddTech = () => {
    if (!techInput.trim()) return;
    const items = techInput.split(',').map((t) => t.trim()).filter(Boolean);
    const updated = Array.from(new Set([...formData.technologies, ...items]));
    setFormData((prev) => ({ ...prev, technologies: updated }));
    setTechInput('');
  };

  const handleRemoveTech = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== techToRemove)
    }));
  };

  const handleMoveTech = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= formData.technologies.length) return;
    const copy = [...formData.technologies];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, technologies: copy }));
  };

  // Metrics Builder
  const handleAddMetric = () => {
    const newMetric = {
      label: 'Success Rate',
      value: '95%',
      description: 'Tested across evaluation trials',
      display_order: formData.metrics.length
    };
    setFormData((prev) => ({ ...prev, metrics: [...prev.metrics, newMetric] }));
  };

  const handleUpdateMetric = (index, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.metrics];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, metrics: copy };
    });
  };

  const handleRemoveMetric = (index) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
  };

  // Challenges Builder
  const handleAddChallenge = () => {
    const newChallenge = {
      challenge: 'Unstable policy convergence in simulation.',
      solution: 'Applied domain randomization and reward shaping.',
      display_order: formData.challenges.length
    };
    setFormData((prev) => ({ ...prev, challenges: [...prev.challenges, newChallenge] }));
  };

  const handleUpdateChallenge = (index, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.challenges];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, challenges: copy };
    });
  };

  const handleRemoveChallenge = (index) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.filter((_, i) => i !== index)
    }));
  };

  // Milestones Builder
  const handleAddMilestone = () => {
    const newMilestone = {
      date: '2026',
      title: 'Physical Prototype Assembly',
      description: 'Fabricated chassis and integrated actuators.',
      display_order: formData.milestones.length
    };
    setFormData((prev) => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
  };

  const handleUpdateMilestone = (index, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.milestones];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, milestones: copy };
    });
  };

  const handleRemoveMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  // Media Manager Actions
  const handleUploadImageFile = async (file) => {
    if (!file) return;
    if (!project) {
      alert("Please save the project first before uploading media files.");
      return;
    }

    setUploadingImage(true);
    try {
      const media = await api.uploadMedia(file, `${formData.title} Image`, formData.title);
      await api.addProjectImage(project.id, {
        media_id: media.id,
        caption: file.name,
        media_type: 'SCREENSHOT',
        display_order: galleryImages.length,
        is_cover: galleryImages.length === 0
      });
      const updated = await api.getProject(project.id);
      setGalleryImages(updated.images || []);
    } catch (err) {
      alert(`Media upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUploadImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadImageFile(file);
  };

  const handleSetCover = async (imgId) => {
    if (!project) return;
    const reordered = galleryImages.map((img) => ({
      image_id: img.id,
      display_order: img.display_order,
      media_type: img.media_type,
      caption: img.caption,
      is_cover: img.id === imgId
    }));
    try {
      await api.reorderProjectImages(project.id, reordered);
      const updated = await api.getProject(project.id);
      setGalleryImages(updated.images || []);
    } catch (err) {
      alert(`Cover update failed: ${err.message}`);
    }
  };

  const handleUpdateMediaType = async (imgId, newType) => {
    if (!project) return;
    const reordered = galleryImages.map((img) => ({
      image_id: img.id,
      display_order: img.display_order,
      media_type: img.id === imgId ? newType : img.media_type,
      caption: img.caption,
      is_cover: img.is_cover
    }));
    try {
      await api.reorderProjectImages(project.id, reordered);
      const updated = await api.getProject(project.id);
      setGalleryImages(updated.images || []);
    } catch (err) {
      alert(`Failed to update media type: ${err.message}`);
    }
  };

  const handleUpdateImageCaption = async (imgId, newCaption) => {
    if (!project) return;
    const reordered = galleryImages.map((img) => ({
      image_id: img.id,
      display_order: img.display_order,
      media_type: img.media_type,
      caption: img.id === imgId ? newCaption : img.caption,
      is_cover: img.is_cover
    }));
    try {
      await api.reorderProjectImages(project.id, reordered);
      const updated = await api.getProject(project.id);
      setGalleryImages(updated.images || []);
    } catch (err) {
      console.warn("Caption update error:", err);
    }
  };

  const handleMoveImage = async (idx, direction) => {
    if (!project) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= galleryImages.length) return;

    const copy = [...galleryImages];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reordered = copy.map((img, i) => ({
      image_id: img.id,
      display_order: i,
      media_type: img.media_type,
      caption: img.caption,
      is_cover: img.is_cover
    }));

    try {
      await api.reorderProjectImages(project.id, reordered);
      const updated = await api.getProject(project.id);
      setGalleryImages(updated.images || []);
    } catch (err) {
      alert(`Reorder failed: ${err.message}`);
    }
  };

  const handleRemoveImage = async (imgId) => {
    if (!project) return;
    if (!window.confirm("Remove this image from project dossier?")) return;
    try {
      await api.removeProjectImage(project.id, imgId);
      const updated = await api.getProject(project.id);
      setGalleryImages(updated.images || []);
    } catch (err) {
      alert(`Remove image failed: ${err.message}`);
    }
  };

  // Submit Handler
  const handleSave = async (overridePublished = null) => {
    setSaving(true);
    setErrorMessage('');

    const payload = {
      ...formData,
      published: overridePublished !== null ? overridePublished : formData.published,
      github_url: formData.links?.github || formData.github_url || '',
      demo_url: formData.links?.demo || formData.demo_url || ''
    };

    try {
      let saved;
      if (project) {
        saved = await api.updateProject(project.id, payload);
      } else {
        saved = await api.createProject(payload);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save project case file.');
    } finally {
      setSaving(false);
    }
  };

  const coverImage = galleryImages.find((img) => img.is_cover) || galleryImages[0];

  return (
    <div className="authoring-modal-overlay" onClick={onClose}>
      <div className="authoring-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Workspace Header */}
        <header className="authoring-modal-header">
          <div className="authoring-header-info">
            <span className="authoring-tag">ENGINEERING DOSSIER AUTHORING</span>
            <h2 className="authoring-title">
              {project ? `Case File: ${formData.title || project.title}` : 'New Engineering Project Case'}
            </h2>
          </div>
          <div className="authoring-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPreview({ ...formData, images: galleryImages })}
            >
              👁 Live Preview
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="admin-error-banner" style={{ margin: '0.75rem 1.5rem 0' }}>
            {errorMessage}
          </div>
        )}

        {/* Tab Navigation Ribbon */}
        <nav className="authoring-tab-ribbon" role="tablist">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'casestudy', label: 'Case Study' },
            { id: 'tech', label: `Technologies (${formData.technologies.length})` },
            { id: 'media', label: `Media (${galleryImages.length})` },
            { id: 'results', label: `Results (${formData.metrics.length})` },
            { id: 'challenges', label: `Challenges (${formData.challenges.length})` },
            { id: 'timeline', label: `Timeline (${formData.milestones.length})` },
            { id: 'links', label: 'Links' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`authoring-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Panes Body */}
        <div className="authoring-modal-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <div className="pane-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="f_title">Project Title *</label>
                  <input
                    id="f_title"
                    name="title"
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={handleFieldChange}
                    placeholder="e.g. Quadruped RL Locomotion Controller"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f_slug">Slug / Dossier Segment *</label>
                  <input
                    id="f_slug"
                    name="slug"
                    type="text"
                    required
                    className="form-input mono"
                    value={formData.slug}
                    onChange={handleFieldChange}
                    placeholder="quadruped-rl-controller"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f_short_desc">Short Synopsis (Archive Card Summary)</label>
                <textarea
                  id="f_short_desc"
                  name="short_description"
                  rows={2}
                  className="form-textarea"
                  value={formData.short_description}
                  onChange={handleFieldChange}
                  placeholder="Concise 1-2 sentence engineering summary displayed on archive cards..."
                />
              </div>

              <div className="pane-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="f_year">Year</label>
                  <input
                    id="f_year"
                    name="year"
                    type="text"
                    className="form-input"
                    value={formData.year}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f_category">Category</label>
                  <input
                    id="f_category"
                    name="category"
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={handleFieldChange}
                    placeholder="Robotics / AI / ML"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f_status">Project Status</label>
                  <select
                    id="f_status"
                    name="status"
                    className="form-input"
                    value={formData.status}
                    onChange={handleFieldChange}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESEARCH">RESEARCH</option>
                    <option value="PROTOTYPE">PROTOTYPE</option>
                  </select>
                </div>
              </div>

              <div className="pane-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="f_domain">Engineering Domain</label>
                  <input
                    id="f_domain"
                    name="domain"
                    type="text"
                    className="form-input"
                    value={formData.domain}
                    onChange={handleFieldChange}
                    placeholder="e.g. Embodied AI / Perception"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f_platform">Target Platform & Environment</label>
                  <input
                    id="f_platform"
                    name="platform"
                    type="text"
                    className="form-input"
                    value={formData.platform}
                    onChange={handleFieldChange}
                    placeholder="e.g. Unitree Go2 & Isaac Gym"
                  />
                </div>
              </div>

              {/* Cover Preview Card */}
              <div className="cover-preview-deck">
                <span className="cover-deck-label">PRIMARY DOSSIER COVER:</span>
                {coverImage ? (
                  <div className="cover-deck-item">
                    <img src={resolveMediaUrl(coverImage.url || coverImage.media?.public_url)} alt="Cover" />
                    <div>
                      <strong>★ COVER IMAGE SET</strong>
                      <p>{coverImage.caption || 'Telemetry asset'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="cover-deck-empty">
                    <span>No cover image selected. Upload media in the "Media" tab to assign a cover.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CASE STUDY */}
          {activeTab === 'casestudy' && (
            <div className="tab-pane">
              <p className="tab-help-text">
                Author technical case-study sections. Empty sections will be cleanly omitted on the public portfolio.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="f_overview">01 // Detailed Overview</label>
                <textarea
                  id="f_overview"
                  name="overview"
                  rows={4}
                  className="form-textarea"
                  value={formData.overview}
                  onChange={handleFieldChange}
                  placeholder="Comprehensive technical summary of what was engineered..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f_problem">02 // The Engineering Problem</label>
                <textarea
                  id="f_problem"
                  name="problem"
                  rows={3}
                  className="form-textarea"
                  value={formData.problem}
                  onChange={handleFieldChange}
                  placeholder="What technical problem or constraint was being solved?"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f_approach">03 // Methodological Approach</label>
                <textarea
                  id="f_approach"
                  name="approach"
                  rows={3}
                  className="form-textarea"
                  value={formData.approach}
                  onChange={handleFieldChange}
                  placeholder="Explain the theoretical or algorithmic approach used..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f_implementation">04 // System Implementation</label>
                <textarea
                  id="f_implementation"
                  name="implementation"
                  rows={3}
                  className="form-textarea"
                  value={formData.implementation}
                  onChange={handleFieldChange}
                  placeholder="Details on hardware integration, control loop frequency, software pipeline..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f_architecture">05 // Pipeline & Architecture</label>
                <textarea
                  id="f_architecture"
                  name="architecture"
                  rows={3}
                  className="form-textarea"
                  value={formData.architecture}
                  onChange={handleFieldChange}
                  placeholder="Architecture description or breakdown..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f_notes">09 // Engineering Notes & Observations</label>
                <textarea
                  id="f_notes"
                  name="engineering_notes"
                  rows={3}
                  className="form-textarea"
                  value={formData.engineering_notes}
                  onChange={handleFieldChange}
                  placeholder="Trade-offs, lessons learned, unexpected bugs, experimental discoveries..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: TECHNOLOGIES */}
          {activeTab === 'tech' && (
            <div className="tab-pane">
              <p className="tab-help-text">
                Manage the toolchain and hardware tags for this project case file. Reorder tags as needed.
              </p>

              <div className="tech-input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a technology (e.g. PyTorch, ROS2, MuJoCo) and press Add..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                />
                <button type="button" className="btn btn-primary" onClick={handleAddTech}>
                  + Add
                </button>
              </div>

              <div className="tech-chips-manager">
                {formData.technologies.length === 0 ? (
                  <p className="empty-subtext">No technologies added yet.</p>
                ) : (
                  formData.technologies.map((tech, idx) => (
                    <div key={tech} className="tech-manager-chip">
                      <button
                        type="button"
                        className="chip-arrow-btn"
                        disabled={idx === 0}
                        onClick={() => handleMoveTech(idx, -1)}
                        title="Move left"
                      >
                        ◀
                      </button>
                      <span className="chip-name">{tech}</span>
                      <button
                        type="button"
                        className="chip-arrow-btn"
                        disabled={idx === formData.technologies.length - 1}
                        onClick={() => handleMoveTech(idx, 1)}
                        title="Move right"
                      >
                        ▶
                      </button>
                      <button
                        type="button"
                        className="chip-del-btn"
                        onClick={() => handleRemoveTech(tech)}
                        title="Remove tag"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA MANAGER */}
          {activeTab === 'media' && (
            <div className="tab-pane">
              {!project ? (
                <div className="admin-alert-banner">
                  Please save the project first before uploading telemetry media items.
                </div>
              ) : (
                <>
                  <div
                    className="media-dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <span className="dropzone-icon">📷</span>
                    <span className="dropzone-text">
                      {uploadingImage ? 'OPTIMIZING AND UPLOADING...' : 'DRAG & DROP IMAGE FILE HERE OR'}
                    </span>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                      Browse Files
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="media-empty-state">
                      <span className="media-empty-icon">📡</span>
                      <h4>NO PROJECT MEDIA</h4>
                      <p>Add screenshots, robot photos, architecture diagrams or training curves.</p>
                    </div>
                  ) : (
                    <div className="media-cards-grid">
                      {galleryImages.map((img, idx) => (
                        <div key={img.id} className={`media-card-item ${img.is_cover ? 'is-cover' : ''}`}>
                          <div className="media-card-thumb">
                            <img src={resolveMediaUrl(img.url || img.media?.public_url)} alt={img.caption} />
                            {img.is_cover && <span className="media-cover-tag">★ COVER</span>}
                          </div>

                          <div className="media-card-details">
                            <div className="media-field-row">
                              <label>TYPE:</label>
                              <select
                                className="form-input form-input-sm"
                                value={img.media_type || 'OTHER'}
                                onChange={(e) => handleUpdateMediaType(img.id, e.target.value)}
                              >
                                <option value="SCREENSHOT">SCREENSHOT</option>
                                <option value="ROBOT PHOTO">ROBOT PHOTO</option>
                                <option value="ARCHITECTURE">ARCHITECTURE</option>
                                <option value="DIAGRAM">DIAGRAM</option>
                                <option value="TRAINING GRAPH">TRAINING GRAPH</option>
                                <option value="RESULT">RESULT</option>
                                <option value="VIDEO">VIDEO</option>
                                <option value="OTHER">OTHER</option>
                              </select>
                            </div>

                            <div className="media-field-row">
                              <label>CAPTION:</label>
                              <input
                                type="text"
                                className="form-input form-input-sm"
                                defaultValue={img.caption || ''}
                                onBlur={(e) => handleUpdateImageCaption(img.id, e.target.value)}
                                placeholder="Caption description..."
                              />
                            </div>
                          </div>

                          <div className="media-card-controls">
                            {!img.is_cover && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleSetCover(img.id)}
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, -1)}
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={idx === galleryImages.length - 1}
                              onClick={() => handleMoveImage(idx, 1)}
                            >
                              ▶
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveImage(img.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 5: RESULTS & METRICS */}
          {activeTab === 'results' && (
            <div className="tab-pane">
              <div className="pane-header-actions">
                <div>
                  <h4 style={{ margin: 0 }}>Benchmarked Results & Metrics</h4>
                  <p className="tab-help-text" style={{ margin: '4px 0 0' }}>
                    Only real metrics entered here will be rendered. If none exist, the section is omitted.
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddMetric}>
                  + Add Metric
                </button>
              </div>

              {formData.metrics.length === 0 ? (
                <p className="empty-subtext">No metrics logged for this project yet.</p>
              ) : (
                <div className="builder-list">
                  {formData.metrics.map((m, idx) => (
                    <div key={idx} className="builder-item-card">
                      <div className="builder-item-row">
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Metric Label</label>
                          <input
                            type="text"
                            className="form-input"
                            value={m.label}
                            onChange={(e) => handleUpdateMetric(idx, 'label', e.target.value)}
                            placeholder="e.g. Success Rate, Control Frequency"
                          />
                        </div>
                        <div style={{ width: '180px' }}>
                          <label className="form-label">Value</label>
                          <input
                            type="text"
                            className="form-input"
                            value={m.value}
                            onChange={(e) => handleUpdateMetric(idx, 'value', e.target.value)}
                            placeholder="e.g. 94.2%, 50 Hz"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ alignSelf: 'flex-end', height: '38px' }}
                          onClick={() => handleRemoveMetric(idx)}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">Verification Description</label>
                        <input
                          type="text"
                          className="form-input"
                          value={m.description || ''}
                          onChange={(e) => handleUpdateMetric(idx, 'description', e.target.value)}
                          placeholder="e.g. Evaluated over 100 random rough terrain trials"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CHALLENGES */}
          {activeTab === 'challenges' && (
            <div className="tab-pane">
              <div className="pane-header-actions">
                <div>
                  <h4 style={{ margin: 0 }}>Challenges & Engineered Solutions</h4>
                  <p className="tab-help-text" style={{ margin: '4px 0 0' }}>
                    Document technical obstacles encountered and how they were solved.
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddChallenge}>
                  + Add Challenge
                </button>
              </div>

              {formData.challenges.length === 0 ? (
                <p className="empty-subtext">No challenge entries logged yet.</p>
              ) : (
                <div className="builder-list">
                  {formData.challenges.map((c, idx) => (
                    <div key={idx} className="builder-item-card">
                      <div className="builder-card-top">
                        <span className="builder-badge">CHALLENGE #{idx + 1}</span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveChallenge(idx)}
                        >
                          ✕ Delete
                        </button>
                      </div>
                      <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">Technical Challenge</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={c.challenge}
                          onChange={(e) => handleUpdateChallenge(idx, 'challenge', e.target.value)}
                          placeholder="Describe the failure mode or limitation..."
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Engineered Solution</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={c.solution}
                          onChange={(e) => handleUpdateChallenge(idx, 'solution', e.target.value)}
                          placeholder="Describe the algorithm, filter, or hardware fix applied..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="tab-pane">
              <div className="pane-header-actions">
                <div>
                  <h4 style={{ margin: 0 }}>Project Development Milestones</h4>
                  <p className="tab-help-text" style={{ margin: '4px 0 0' }}>
                    Optional timeline milestones tracing the project's evolution.
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddMilestone}>
                  + Add Milestone
                </button>
              </div>

              {formData.milestones.length === 0 ? (
                <p className="empty-subtext">No milestones defined yet.</p>
              ) : (
                <div className="builder-list">
                  {formData.milestones.map((m, idx) => (
                    <div key={idx} className="builder-item-card">
                      <div className="builder-item-row">
                        <div style={{ width: '140px' }}>
                          <label className="form-label">Date / Phase</label>
                          <input
                            type="text"
                            className="form-input"
                            value={m.date}
                            onChange={(e) => handleUpdateMilestone(idx, 'date', e.target.value)}
                            placeholder="e.g. 2025-Q2"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Milestone Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={m.title}
                            onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                            placeholder="e.g. Hardware-in-the-loop Test"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ alignSelf: 'flex-end', height: '38px' }}
                          onClick={() => handleRemoveMilestone(idx)}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">Milestone Summary</label>
                        <input
                          type="text"
                          className="form-input"
                          value={m.description || ''}
                          onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                          placeholder="Brief technical achievement during this phase..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: LINKS */}
          {activeTab === 'links' && (
            <div className="tab-pane">
              <p className="tab-help-text">
                External resource URLs. Only populated links will appear as action buttons on the public case study.
              </p>

              <div className="pane-grid-2">
                <div className="form-group">
                  <label className="form-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.github || ''}
                    onChange={(e) => handleLinkChange('github', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Live Demo Interface URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.demo || ''}
                    onChange={(e) => handleLinkChange('demo', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pane-grid-2">
                <div className="form-group">
                  <label className="form-label">Documentation URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.documentation || ''}
                    onChange={(e) => handleLinkChange('documentation', e.target.value)}
                    placeholder="https://docs...."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Research Paper URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.paper || ''}
                    onChange={(e) => handleLinkChange('paper', e.target.value)}
                    placeholder="https://arxiv.org/..."
                  />
                </div>
              </div>

              <div className="pane-grid-3">
                <div className="form-group">
                  <label className="form-label">Video Stream / Demo URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.video || ''}
                    onChange={(e) => handleLinkChange('video', e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dataset URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.dataset || ''}
                    onChange={(e) => handleLinkChange('dataset', e.target.value)}
                    placeholder="https://huggingface.co/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Other Resource URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.links?.other || ''}
                    onChange={(e) => handleLinkChange('other', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-pane">
              <div className="settings-panel">
                <div className="settings-toggle-row">
                  <div>
                    <strong>Published Record</strong>
                    <p className="tab-help-text">Visible to public visitors in the project archive.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleFieldChange}
                    style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-toggle-row">
                  <div>
                    <strong>Featured System Highlight</strong>
                    <p className="tab-help-text">Displays with a prominent banner and wider card in the catalog.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleFieldChange}
                    style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                <div className="settings-toggle-row">
                  <div>
                    <strong>Archived Case File</strong>
                    <p className="tab-help-text">Hides from public visitors but preserves all records in the admin workspace.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="archived"
                    checked={formData.archived}
                    onChange={handleFieldChange}
                    style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                <div className="form-group" style={{ maxWidth: '240px', marginTop: '1rem' }}>
                  <label className="form-label" htmlFor="f_disp_order">Display Priority Order</label>
                  <input
                    id="f_disp_order"
                    name="display_order"
                    type="number"
                    className="form-input mono"
                    value={formData.display_order}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <footer className="authoring-modal-footer">
          <div className="footer-left">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onPreview({ ...formData, images: galleryImages })}
            >
              👁 Preview Dossier
            </button>
          </div>
          <div className="footer-right">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Publish Project'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
