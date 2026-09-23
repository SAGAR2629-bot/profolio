import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import './AdminLayout.css';

export default function AdminLayout() {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();
  const publicUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      group: "MAIN",
      items: [
        { path: "/dashboard", label: "Dashboard Overview", icon: "📊" },
      ]
    },
    {
      group: "CONTENT & IDENTITY",
      items: [
        { path: "/content/home", label: "Homepage Editor", icon: "🏠" },
        { path: "/content/profile", label: "Profile & Bio", icon: "👤" },
      ]
    },
    {
      group: "PORTFOLIO REGISTRIES",
      items: [
        { path: "/projects", label: "Projects & Galleries", icon: "🚀" },
        { path: "/achievements", label: "Achievements & Logs", icon: "🏆" },
        { path: "/certificates", label: "Certificates Vault", icon: "📜" },
        { path: "/skills", label: "Technical Skills", icon: "⚙️" },
        { path: "/education", label: "Education Record", icon: "🎓" },
        { path: "/experience", label: "Field Experience", icon: "💼" },
      ]
    },
    {
      group: "SYSTEM ASSETS",
      items: [
        { path: "/media", label: "Media Library", icon: "🖼️" },
        { path: "/account", label: "Admin Security", icon: "🔒" },
      ]
    }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="brand-dot" />
          <div className="brand-text">
            <span className="brand-title">ENGINEERING ARCHIVE</span>
            <span className="brand-sub">CONTROL CMS v1.0</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navSections.map((sec) => (
            <div key={sec.group} className="nav-group">
              <span className="nav-group-title">{sec.group}</span>
              {sec.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  <span className="nav-link-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm sidebar-view-site"
          >
            <span>↗ View Public Portfolio</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <span className="topbar-status-dot" />
            <span className="topbar-badge">SYSTEM CONNECTED: {API_BASE_URL.replace(/^https?:\/\//, '').toUpperCase()}</span>
          </div>

          <div className="topbar-right">
            <div className="user-pill">
              <span className="user-icon">👤</span>
              <span className="user-name">{adminUser?.username || 'admin'}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              title="Sign Out"
            >
              Sign Out ⎋
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="admin-content-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
