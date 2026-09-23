import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import HomeEditor from './pages/HomeEditor';
import ProfileEditor from './pages/ProfileEditor';
import ProjectsManager from './pages/ProjectsManager';
import AchievementsManager from './pages/AchievementsManager';
import CertificatesManager from './pages/CertificatesManager';
import SkillsManager from './pages/SkillsManager';
import EducationManager from './pages/EducationManager';
import ExperienceManager from './pages/ExperienceManager';
import MediaLibrary from './pages/MediaLibrary';
import AccountPage from './pages/AccountPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F17', color: '#9CA3AF' }}>
        Verifying Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="content/home" element={<HomeEditor />} />
        <Route path="content/profile" element={<ProfileEditor />} />
        <Route path="projects" element={<ProjectsManager />} />
        <Route path="achievements" element={<AchievementsManager />} />
        <Route path="certificates" element={<CertificatesManager />} />
        <Route path="skills" element={<SkillsManager />} />
        <Route path="education" element={<EducationManager />} />
        <Route path="experience" element={<ExperienceManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="account" element={<AccountPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
