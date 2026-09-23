import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const { adminUser } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setStatus({ type: 'success', text: 'Password updated successfully! Keep your credentials secure.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Account & Security</h1>
          <p className="page-subtitle">Manage administrator credentials, tokens, and system authentication</p>
        </div>
      </div>

      {status.text && (
        <div className={status.type === 'error' ? 'admin-error-banner' : 'badge badge-published'} style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', width: '100%' }}>
          {status.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <form onSubmit={handleSubmit} className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Change Password</h2>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="old_pwd">Current Password</label>
            <input
              id="old_pwd"
              type="password"
              required
              className="form-input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new_pwd">New Password</label>
            <input
              id="new_pwd"
              type="password"
              required
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="conf_pwd">Confirm New Password</label>
            <input
              id="conf_pwd"
              type="password"
              required
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ marginTop: '0.5rem' }}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Security Session Audit</h2>
          </div>
          <div className="system-specs-list">
            <div className="spec-row">
              <span className="spec-label">Admin Username:</span>
              <span className="spec-value mono">{adminUser?.username || 'admin'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Token Format:</span>
              <span className="spec-value mono">JWT (HS256)</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Hash Algorithm:</span>
              <span className="spec-value mono">Bcrypt (Salted)</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Token Expiration:</span>
              <span className="spec-value mono">24 Hours</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Access Boundary:</span>
              <span className="spec-value mono">Port 5174 Isolated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
