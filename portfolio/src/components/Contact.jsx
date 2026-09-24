import { useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Contact.css';

export default function Contact() {
  const ref = useScrollReveal();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
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
          _subject: `[Engineering Archive] Transmission from ${formData.name}`,
          message: formData.message,
          _template: 'table',
          _captcha: 'false'
        })
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        setStatus('success');
        setFeedback('TRANSMISSION CONFIRMED // Message payload delivered to Anand Sagar.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.message || 'Dispatch refused by server');
      }
    } catch (err) {
      console.warn('Contact dispatch warning:', err);
      setStatus('error');
      setFeedback('TRANSMISSION NOTICE // Network channel interrupted. Direct mail: ' + targetEmail);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-badge" style={{ background: 'var(--retro-red)', color: '#FFFFFF' }}>
            TRANSMISSION TERMINAL // 009
          </div>
          <h2 className="section-title">Contact & Communication</h2>
          <p className="section-subtitle">
            If you're interested in AI, robotics, intelligent systems, or discussing engineering opportunities, transmit a message.
          </p>
        </div>

        <div className="contact__layout scroll-reveal" ref={ref}>
          {/* Physical Form Console */}
          <form className="contact__form retro-panel" onSubmit={handleSubmit}>
            <div className="retro-panel__header">
              <span className="retro-panel__tag">DISPATCH_CONSOLE</span>
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
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="contact__field">
                <label className="contact__label" htmlFor="contact-message">
                  <span>MESSAGE CONTENT</span>
                  <span className="contact__required">*</span>
                </label>
                <textarea
                  id="contact-message"
                  className="contact__input contact__textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your project, role, or collaboration..."
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
                  {status === 'idle' && '[ SEND MESSAGE ➔ ]'}
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
                  Direct connections for engineering inquiries, research collaborations, or technical opportunities:
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
    </section>
  );
}
