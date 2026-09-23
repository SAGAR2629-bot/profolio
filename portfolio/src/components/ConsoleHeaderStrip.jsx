import { Link } from 'react-router-dom';
import './ConsoleHeaderStrip.css';

export default function ConsoleHeaderStrip({ modeTitle, codeId }) {
  return (
    <div className="console-strip">
      <div className="container console-strip__inner">
        <Link to="/" className="retro-btn retro-btn--sm console-strip__back">
          <span>← [ RETURN TO TERMINAL ]</span>
        </Link>

        <div className="console-strip__meta">
          <span className="console-strip__code">{codeId}</span>
          <span className="console-strip__title">{modeTitle}</span>
          <span className="console-strip__status">
            <span className="console-strip__led" aria-hidden="true" />
            OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
}
