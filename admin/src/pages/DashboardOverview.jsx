import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './DashboardOverview.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="admin-loading-state">Connecting to Content Database...</div>;
  }

  if (error) {
    return <div className="admin-error-banner">⚠ {error}</div>;
  }

  const statCards = [
    {
      title: "Projects Archive",
      total: stats?.total_projects || 0,
      published: stats?.published_projects || 0,
      drafts: stats?.draft_projects || 0,
      icon: "🚀",
      link: "/projects",
      color: "var(--admin-cyan)"
    },
    {
      title: "Achievements & Logs",
      total: stats?.total_achievements || 0,
      published: stats?.published_achievements || 0,
      drafts: stats?.draft_achievements || 0,
      icon: "🏆",
      link: "/achievements",
      color: "var(--admin-warning)"
    },
    {
      title: "Certificates Vault",
      total: stats?.total_certificates || 0,
      published: stats?.published_certificates ?? stats?.total_certificates ?? 0,
      drafts: stats?.draft_certificates || 0,
      icon: "📜",
      link: "/certificates",
      color: "var(--admin-success)"
    },
    {
      title: "Technical Skills",
      total: stats?.total_skills || 0,
      published: stats?.published_skills ?? stats?.total_skills ?? 0,
      drafts: stats?.draft_skills || 0,
      icon: "⚙️",
      link: "/skills",
      color: "var(--admin-cyan)"
    },
    {
      title: "Education Record",
      total: stats?.total_education || 0,
      published: stats?.published_education ?? stats?.total_education ?? 0,
      drafts: stats?.draft_education || 0,
      icon: "🎓",
      link: "/education",
      color: "var(--admin-primary)"
    },
    {
      title: "Field Experience",
      total: stats?.total_experience || 0,
      published: stats?.published_experience ?? stats?.total_experience ?? 0,
      drafts: stats?.draft_experience || 0,
      icon: "💼",
      link: "/experience",
      color: "var(--admin-warning)"
    },
    {
      title: "Media Assets",
      total: stats?.total_media_assets || 0,
      published: stats?.total_media_assets || 0,
      drafts: 0,
      icon: "🖼️",
      link: "/media",
      color: "var(--admin-purple)"
    }
  ];

  const publicUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

  return (
    <div className="dashboard-overview">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Archive Telemetry</h1>
          <p className="page-subtitle">Real-time status of content registries and assets from FastAPI & Database</p>
        </div>
        <div className="page-header-actions">
          <Link to="/content/home" className="btn btn-primary">
            ✏ Edit Homepage Subtitle
          </Link>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            ↗ Public Website
          </a>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.title} className="admin-card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">{card.title}</span>
              <span className="stat-card-icon" style={{ borderColor: card.color }}>{card.icon}</span>
            </div>
            <div className="stat-card-value">{card.total}</div>
            <div className="stat-card-footer">
              <div className="stat-pill-row">
                <span className="badge badge-published">
                  ● {card.published} Live
                </span>
                {card.drafts > 0 && (
                  <span className="badge badge-draft">
                    ○ {card.drafts} Draft
                  </span>
                )}
              </div>
              <Link to={card.link} className="stat-card-link">Manage →</Link>
            </div>
          </div>
        ))}
      </div>

      {/* System Quick Links */}
      <div className="dashboard-sections-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Content Publishing Workflows</h2>
          </div>
          <div className="quick-actions-list">
            <Link to="/content/home" className="quick-action-item">
              <span className="quick-action-icon">🏠</span>
              <div>
                <span className="quick-action-name">Homepage Hero & Subtitle</span>
                <span className="quick-action-desc">Change hero title, subtitles, statement, and call-to-actions</span>
              </div>
              <span className="quick-action-arrow">→</span>
            </Link>

            <Link to="/projects" className="quick-action-item">
              <span className="quick-action-icon">🔬</span>
              <div>
                <span className="quick-action-name">Projects & Gallery Manager</span>
                <span className="quick-action-desc">Upload multiple project images, reorder telemetry, set cover image</span>
              </div>
              <span className="quick-action-arrow">→</span>
            </Link>

            <Link to="/media" className="quick-action-item">
              <span className="quick-action-icon">🖼️</span>
              <div>
                <span className="quick-action-name">Centralized Media Library</span>
                <span className="quick-action-desc">Pillow-optimized uploads, MIME validation & reference protection</span>
              </div>
              <span className="quick-action-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Archive System Specifications</h2>
          </div>
          <div className="system-specs-list">
            <div className="spec-row">
              <span className="spec-label">Database Engine:</span>
              <span className="spec-value mono">SQLite (Dev) / PostgreSQL (Prod)</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Content Hydration:</span>
              <span className="spec-value mono">Dynamic with Offline Local Fallback</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Image Optimization:</span>
              <span className="spec-value mono">Pillow (PIL) Max 2560px & Lanczos</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Security Protocol:</span>
              <span className="spec-value mono">Bcrypt Hashing + JWT Token Auth</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Public Interface:</span>
              <span className="spec-value mono">{import.meta.env.VITE_PUBLIC_URL || ':5173 (Dev)'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Admin CMS:</span>
              <span className="spec-value mono">:5174 (Dev)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
