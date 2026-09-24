import { useState } from 'react';
import ConsoleHeaderStrip from '../components/ConsoleHeaderStrip';
import { usePortfolioData } from '../context/PortfolioDataContext';
import '../components/Contact.css';

export default function ContactPage() {
  const { personalInfo } = usePortfolioData();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'transmitting' | 'success' | 'error'
  const [feedback, setFeedback] = useState('');

  const targetEmail = personalInfo?.email || 'anndsagar19759@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('transmitting');
    setFeedback('');

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _subject: `[Engineering Archive] ${formData.subject ? formData.subject : 'Transmission from ' + formData.name}`,
          message: formData.message,
          _template: 'table',
          _captcha: 'false'
        })
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        setStatus('success');
        setFeedback('TRANSMISSION CONFIRMED // Message payload delivered to Anand Sagar.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(data.message || 'Dispatch refused by server');
      }
    } catch (err) {
      console.warn('Contact dispatch warning:', err);
      // Fallback: If FormSubmit returns network issue, offer direct mail link
      setStatus('error');
      setFeedback('TRANSMISSION NOTICE // Network channel interrupted. You can also mail directly at ' + targetEmail);
    }
  };

  return (
    <div className="contact-page">
      <ConsoleHeaderStrip modeTitle="COMMUNICATION TERMINAL" codeId="MOD_08" />

      <div className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-red)', color: '#FFFFFF' }}>
            TRANSMISSION CONSOLE // 008
          </div>
          <h1 className="section-title">Communication Terminal</h1>
          <p className="section-subtitle">
            Transmit an engineering inquiry, collaboration request, or discussion topic directly to Anand Sagar.
          </p>
        </div>

        <div className="contact__layout">
          {/* Physical Form Console */}
          <form className="contact__form retro-panel" onSubmit={handleSubmit}>
            <div className="retro-panel__header">
              <span className="retro-panel__tag">DISPATCH_UNIT // RECIPIENT: ANAND_SAGAR</span>
              <div className="retro-panel__dots">
                <span className="retro-panel__dot retro-panel__dot--red" />
                <span className="retro-panel__dot retro-panel__dot--yellow" />
                <span className="retro-panel__dot retro-panel__dot--green" />
              </div>
            </div>

            <div className="contact__form-body">
              <div className="contact__field">
                <label className="contact__label" htmlFor="contact-name">
                  <span>NAME / IDENTIFIER</span>
                  <span className="contact__required">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="contact__input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="contact__field">
                <label className="contact__label" htmlFor="contact-email">
                  <span>EMAIL ADDRESS</span>
                  <span className="contact__required">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="contact__input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="contact__field">
                <label className="contact__label" htmlFor="contact-subject">
                  <span>TRANSMISSION SUBJECT</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  className="contact__input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Robotics / AI Inquiry or Role"
                />
              </div>

              <div className="contact__field">
                <label className="contact__label" htmlFor="contact-message">
                  <span>MESSAGE PAYLOAD</span>
                  <span className="contact__required">*</span>
                </label>
                <textarea
                  id="contact-message"
                  className="contact__input contact__textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your inquiry, project proposal, or topic..."
                  rows={5}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={status === 'transmitting'}
                className={`retro-btn ${status === 'success' ? 'retro-btn--green' : 'retro-btn--blue'} contact__submit`}
                style={{ opacity: status === 'transmitting' ? 0.75 : 1, cursor: status === 'transmitting' ? 'wait' : 'pointer' }}
              >
                <span>
                  {status === 'transmitting' && '[ TRANSMITTING TELEMETRY... ⏳ ]'}
                  {status === 'success' && '[ TRANSMISSION DELIVERED ✓ ]'}
                  {status === 'error' && '[ RETRY TRANSMISSION ➔ ]'}
                  {status === 'idle' && '[ TRANSMIT MESSAGE ➔ ]'}
                </span>
              </button>

              {feedback && (
                <div 
                  className={`contact__status-banner ${status === 'success' ? 'contact__status-banner--success' : 'contact__status-banner--error'}`}
                  style={{
                    marginTop: '1rem',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-thick)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: status === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: status === 'success' ? '#065F46' : '#991B1B',
                    boxShadow: '2px 2px 0px var(--ink)',
                    lineHeight: '1.4'
                  }}
                >
                  <span>{status === 'success' ? '● ' : '▲ '} {feedback}</span>
                </div>
              )}
            </div>
          </form>

          {/* Direct Physical Channel Plugs */}
          <aside className="contact__channels-deck">
            <div className="contact__channels-panel retro-panel">
              <div className="retro-panel__header">
                <span className="retro-panel__tag">DIRECT_CHANNELS</span>
                <span className="contact__status-pill">AVAILABLE</span>
              </div>

              <div className="contact__channels-body">
                <p className="contact__channels-intro">
                  Direct hardware communication lines for engineering discussions, research collaborations, or full-time opportunities:
                </p>

                <div className="contact__plug-list">
                  <a href={`mailto:${personalInfo.email}`} className="contact__plug-card">
                    <div className="contact__plug-icon">✉</div>
                    <div className="contact__plug-info">
                      <span className="contact__plug-title">EMAIL CHANNEL</span>
                      <span className="contact__plug-val">{personalInfo.email}</span>
                    </div>
                    <span className="contact__plug-arrow">↗</span>
                  </a>

                  <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="contact__plug-card">
                    <div className="contact__plug-icon">⟨/⟩</div>
                    <div className="contact__plug-info">
                      <span className="contact__plug-title">GITHUB PROFILE</span>
                      <span className="contact__plug-val">github.com/anand</span>
                    </div>
                    <span className="contact__plug-arrow">↗</span>
                  </a>

                  <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="contact__plug-card">
                    <div className="contact__plug-icon">in</div>
                    <div className="contact__plug-info">
                      <span className="contact__plug-title">LINKEDIN NETWORK</span>
                      <span className="contact__plug-val">linkedin.com/in/anand</span>
                    </div>
                    <span className="contact__plug-arrow">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
