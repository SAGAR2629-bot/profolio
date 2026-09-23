import './PixelTicker.css';

const tickerItems = [
  { label: 'STATUS', value: 'SYS.ONLINE [READY]', color: 'green' },
  { label: 'SIGHTINGS', value: '12+ CONFIRMED PROJECTS', color: 'cyan' },
  { label: 'TELEMETRY', value: 'ROS2 // MUJOCO // SIM2REAL', color: 'orange' },
  { label: 'CREDENTIALS', value: '25+ CERTIFICATIONS VERIFIED', color: 'purple' },
  { label: 'AGENT FLEET', value: 'QUADRUPED RL LOCATED & DEPLOYED', color: 'cyan' },
  { label: 'RADAR', value: 'SCANNING FOR NEW OPPORTUNITIES', color: 'green' },
];

export default function PixelTicker() {
  return (
    <div className="pixel-ticker" aria-hidden="true">
      <div className="pixel-ticker__track">
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="pixel-ticker__item">
            <span className={`pixel-ticker__tag text-${item.color}`}>[{item.label}]</span>
            <span className="pixel-ticker__val">{item.value}</span>
            <span className="pixel-ticker__sep text-dim">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
