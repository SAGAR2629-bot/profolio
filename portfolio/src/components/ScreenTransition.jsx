import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ScreenTransition.css';

export default function ScreenTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="screen-viewport">
      {/* Subtle CRT raster refresh sweep line */}
      <div className="screen-sweep" aria-hidden="true" />
      <div className="screen-content">
        {children}
      </div>
    </div>
  );
}
