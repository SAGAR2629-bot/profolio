import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import RetroPreviewModal from '../components/RetroPreviewModal';

export default function HomeEditor() {
  const [content, setContent] = useState({
    hero_badge: 'ROBOTICS & EMBODIED AI',
    hero_name: 'Anand Sagar',
    hero_subtitle: 'Building intelligent systems that connect AI with the real world.',
    hero_disciplines: [
      'AI/ML',
      'ROBOTICS',
      'COMPUTER VISION',
      'REINFORCEMENT LEARNING'
    ],
    cta_primary: '[ VIEW PROJECTS ]',
    cta_secondary: '[ ABOUT ME ]',
    cta_tertiary: '[ CONTACT ]',
  });
  const [disciplinesInput, setDisciplinesInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await api.getContent('home');
        if (res && res.data) {
          setContent((prev) => ({ ...prev, ...res.data }));
          if (res.data.hero_disciplines) {
            setDisciplinesInput(res.data.hero_disciplines.join(', '));
          }
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to load home content.' });
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  };

  const handleDisciplinesChange = (e) => {
    setDisciplinesInput(e.target.value);
    const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
    setContent((prev) => ({ ...prev, hero_disciplines: parsed }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await api.updateContent('home', content);
      setStatusMessage({ type: 'success', text: 'Homepage content successfully published to database & live API!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save content.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading-state">Loading homepage parameters...</div>;
  }

  return (
    <div className="home-editor-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Homepage Content Editor</h1>
          <p className="page-subtitle">Configure hero display titles, statement quotes, and call-to-action buttons</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPreviewOpen(true)}
          >
            👁 [ PREVIEW RETRO RENDER ]
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Publishing...' : '💾 Publish Changes'}
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div className={statusMessage.type === 'error' ? 'admin-error-banner' : 'badge badge-published'} style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', width: '100%' }}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSave} className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Terminal Hero Parameters</h2>
          <span className="badge badge-primary">PUBLIC SECTION: /</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="hero_badge">Hardware Chassis Badge</label>
          <input
            id="hero_badge"
            name="hero_badge"
            type="text"
            className="form-input"
            value={content.hero_badge || ''}
            onChange={handleChange}
            placeholder="e.g. ROBOTICS & EMBODIED AI"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="hero_name">Engineer Name</label>
          <input
            id="hero_name"
            name="hero_name"
            type="text"
            className="form-input"
            value={content.hero_name || ''}
            onChange={handleChange}
            placeholder="e.g. Anand Sagar"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="hero_subtitle">
            Homepage Hero Statement / Subtitle
            <span style={{ color: '#F59E0B', marginLeft: '0.5rem' }}>* Targeted by End-to-End Test</span>
          </label>
          <textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={3}
            className="form-textarea"
            value={content.hero_subtitle || ''}
            onChange={handleChange}
            placeholder='e.g. Building intelligent systems that connect AI with the real world.'
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="disciplines">Disciplines Ribbon (Comma-Separated)</label>
          <input
            id="disciplines"
            type="text"
            className="form-input"
            value={disciplinesInput}
            onChange={handleDisciplinesChange}
            placeholder="AI/ML, ROBOTICS, COMPUTER VISION, REINFORCEMENT LEARNING"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="cta_primary">Primary Button Label</label>
            <input
              id="cta_primary"
              name="cta_primary"
              type="text"
              className="form-input"
              value={content.cta_primary || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cta_secondary">Secondary Button Label</label>
            <input
              id="cta_secondary"
              name="cta_secondary"
              type="text"
              className="form-input"
              value={content.cta_secondary || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cta_tertiary">Tertiary Button Label</label>
            <input
              id="cta_tertiary"
              name="cta_tertiary"
              type="text"
              className="form-input"
              value={content.cta_tertiary || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>

      {/* Retro Live Preview Modal */}
      <RetroPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="home"
        data={content}
      />
    </div>
  );
}
