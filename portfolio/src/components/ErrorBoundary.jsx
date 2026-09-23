import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log exception safely for developer debugging
    if (typeof window !== 'undefined' && window.console) {
      console.error('[System Exception Intercepted]:', error, errorInfo);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0D1117',
          padding: '2rem',
          fontFamily: "'Space Mono', monospace"
        }}>
          <div style={{
            maxWidth: '620px',
            width: '100%',
            background: '#FDFBF7',
            border: '3px solid #17191C',
            boxShadow: '6px 6px 0px #17191C',
            padding: '2rem',
            color: '#17191C'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #17191C',
              paddingBottom: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <span style={{
                fontFamily: "'Pixelify Sans', monospace",
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#EF4444'
              }}>
                ⚠ SYSTEM FAULT // RECOVERY MODE
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>TERMINAL SAFE-STATE</span>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              An unexpected execution fault occurred during telemetry rendering. The terminal safe-mode has intercepted the crash to prevent unhandled system failure.
            </p>

            {this.state.error && (
              <div style={{
                background: '#17191C',
                color: '#10B981',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #EF4444'
              }}>
                <code>{this.state.error.toString()}</code>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  padding: '0.6rem 1.25rem',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: '2px solid #17191C',
                  boxShadow: '3px 3px 0px #17191C',
                  cursor: 'pointer'
                }}
              >
                [ ⟳ REBOOT TERMINAL ]
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
