import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ProfileEditor() {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    short_intro: '',
    biography: '',
    interests: [],
    focus_areas: [],
    social_links: {
      email: '',
      github: '',
      linkedin: '',
      twitter: '',
      resumeUrl: ''
    }
  });

  const [interestsText, setInterestsText] = useState('');
  const [focusAreasText, setFocusAreasText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        setProfile(data);
        if (data.interests) setInterestsText(data.interests.join('\n'));
        if (data.focus_areas) setFocusAreasText(data.focus_areas.join('\n'));
      } catch (err) {
        setStatus({ type: 'error', text: err.message || 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', text: '' });

    const payload = {
      ...profile,
      interests: interestsText.split('\n').map((s) => s.trim()).filter(Boolean),
      focus_areas: focusAreasText.split('\n').map((s) => s.trim()).filter(Boolean)
    };

    try {
      const updated = await api.updateProfile(payload);
      setProfile(updated);
      setStatus({ type: 'success', text: 'Profile information updated successfully!' });
      setTimeout(() => setStatus({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading-state">Loading engineer profile...</div>;

  return (
    <div className="profile-editor-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Engineer Dossier & Profile Editor</h1>
          <p className="page-subtitle">Manage bio narrative, interests, research pillars, and public communication links</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>

      {status.text && (
        <div className={status.type === 'error' ? 'admin-error-banner' : 'badge badge-published'} style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', width: '100%' }}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Core Identity</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof_name">Full Name</label>
            <input
              id="prof_name"
              name="name"
              type="text"
              required
              className="form-input"
              value={profile.name || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof_title">Title / Headline</label>
            <input
              id="prof_title"
              name="title"
              type="text"
              className="form-input"
              value={profile.title || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="prof_intro">Short Introductory Thesis</label>
          <input
            id="prof_intro"
            name="short_intro"
            type="text"
            className="form-input"
            value={profile.short_intro || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="prof_bio">Full Dossier Biography (About Section)</label>
          <textarea
            id="prof_bio"
            name="biography"
            rows={6}
            className="form-textarea"
            value={profile.biography || ''}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof_interests">Interests (One per line)</label>
            <textarea
              id="prof_interests"
              rows={4}
              className="form-textarea"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof_focus">Focus Areas / Research (One per line)</label>
            <textarea
              id="prof_focus"
              rows={4}
              className="form-textarea"
              value={focusAreasText}
              onChange={(e) => setFocusAreasText(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-card-header" style={{ marginTop: '1.5rem' }}>
          <h2 className="admin-card-title">Social & Communication Channels</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="soc_email">Contact Email</label>
            <input
              id="soc_email"
              name="email"
              type="email"
              className="form-input"
              value={profile.social_links?.email || ''}
              onChange={handleSocialChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="soc_github">GitHub Profile URL</label>
            <input
              id="soc_github"
              name="github"
              type="url"
              className="form-input"
              value={profile.social_links?.github || ''}
              onChange={handleSocialChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="soc_linkedin">LinkedIn URL</label>
            <input
              id="soc_linkedin"
              name="linkedin"
              type="url"
              className="form-input"
              value={profile.social_links?.linkedin || ''}
              onChange={handleSocialChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="soc_twitter">Twitter / X URL</label>
            <input
              id="soc_twitter"
              name="twitter"
              type="url"
              className="form-input"
              value={profile.social_links?.twitter || ''}
              onChange={handleSocialChange}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
