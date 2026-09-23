import { useState, useEffect } from 'react';
import './BootLoader.css';

const bootLines = [
  "INITIALIZING PORTFOLIO // SYSTEM v2.0...",
  "BITCOUNT & SILKSCREEN PIXEL ENGINES: ENGAGED [OK]",
  "CALIBRATING ROS2 & SIM-TO-REAL TELEMETRY [OK]",
  "WARMING SIGHTING CACHE & NEON GRIDS [OK]",
  "AUTHENTICATING CERTIFICATES & PAPERS [OK]",
  "DEPLOYING QUADRUPED RL AGENT STACK [OK]",
  "ALL SYSTEMS NOMINAL — HUD ONLINE",
];

export default function BootLoader({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]]);
        i++;
        setProgress(Math.round((i / bootLines.length) * 100));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setFading(true);
          setTimeout(() => onComplete(), 500);
        }, 300);
      }
    }, 110);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => onComplete(), 200);
  };

  const filledBlocks = Math.round((progress / 100) * 16);
  const emptyBlocks = 16 - filledBlocks;
  const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className={`bootloader ${fading ? 'bootloader--fading' : ''}`}>
      <div className="bootloader__scanline" />
      <div className="bootloader__box neon-card green">
        <span className="card-corners-tr-bl" aria-hidden="true" />
        
        <div className="bootloader__header">
          <span className="bootloader__title">[SPIDEY-TRACKER // BOOT SEQ]</span>
          <button className="bootloader__skip btn btn-sm btn-green" onClick={handleSkip}>
            SKIP ⏭
          </button>
        </div>

        <div className="bootloader__terminal">
          {lines.map((line, idx) => (
            <div key={idx} className="bootloader__line">
              <span className="bootloader__prefix">&gt; </span>
              {line}
            </div>
          ))}
          <div className="bootloader__cursor">_</div>
        </div>

        <div className="bootloader__progress">
          <span className="bootloader__bar">[{bar}]</span>
          <span className="bootloader__percent">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
