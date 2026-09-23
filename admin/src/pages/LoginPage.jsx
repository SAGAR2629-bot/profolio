import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">⚡</div>
          <h1 className="login-title">ANAND SAGAR ARCHIVE</h1>
          <p className="login-subtitle">Private Administrator CMS Terminal</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Admin Username</label>
            <input
              id="username"
              type="text"
              required
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Admin Password</label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary login-submit-btn"
          >
            {loading ? 'Authenticating...' : 'Authenticate & Enter CMS →'}
          </button>
        </form>

        <div className="login-footer-hint">
          <div className="hint-pill">
            <span className="hint-label">LOCAL DEV:</span>
            <code>admin / admin123</code>
          </div>
          <p className="hint-security">
            Production instances require dedicated environment credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
