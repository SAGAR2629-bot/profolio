import { useState, useEffect, useRef } from 'react';
import { personalInfo, stats } from '../data/portfolioData';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        {/* Terminal Screen Frame */}
        <div className="hero__display-panel retro-panel">
          {/* Machine Header Tape */}
          <div className="retro-panel__header">
            <div className="retro-panel__tag">
              <span className="hero__lamp" aria-hidden="true" />
              <span>TERMINAL_01 // CHASSIS_ACTIVE</span>
            </div>
            <div className="retro-panel__dots">
              <span className="retro-panel__dot retro-panel__dot--red" />
              <span className="retro-panel__dot retro-panel__dot--yellow" />
              <span className="retro-panel__dot retro-panel__dot--green" />
            </div>
          </div>

          <div className="hero__body">
            {/* Corner Decorative Screws */}
            <span className="hero__screw hero__screw--tl" aria-hidden="true" />
            <span className="hero__screw hero__screw--tr" aria-hidden="true" />
            <span className="hero__screw hero__screw--bl" aria-hidden="true" />
            <span className="hero__screw hero__screw--br" aria-hidden="true" />

            <div className="hero__main">
              <div className="hero__identity">
                <span className="hero__tagline-badge">ROBOTICS & EMBODIED AI</span>
                <h1 className="hero__title">{personalInfo.name}</h1>
                <div className="hero__disciplines">
                  <span>AI/ML</span>
                  <span className="hero__bullet">◆</span>
                  <span>ROBOTICS</span>
                  <span className="hero__bullet">◆</span>
                  <span>COMPUTER VISION</span>
                  <span className="hero__bullet">◆</span>
                  <span>REINFORCEMENT LEARNING</span>
                </div>
              </div>

              <p className="hero__intro-text">
                {personalInfo.heroSubtitle}
              </p>

              {/* Physical Tactile Push Buttons */}
              <div className="hero__controls">
                <a href="#projects" className="retro-btn retro-btn--blue">
                  <span>[ VIEW PROJECTS ]</span>
                  <span aria-hidden="true">→</span>
                </a>
                <a href="#about" className="retro-btn retro-btn--yellow">
                  <span>[ ABOUT ME ]</span>
                </a>
                <a href="#contact" className="retro-btn retro-btn--cyan">
                  <span>[ TRANSMIT MESSAGE ]</span>
                </a>
              </div>
            </div>

            {/* Instrument Gauge Counters */}
            <div className="hero__gauges-strip">
              <div className="hero__gauges-label">ARCHIVE REGISTRY TOTALS:</div>
              <div className="hero__gauges-grid">
                {stats.map((stat, idx) => (
                  <GaugeCounter key={stat.label} stat={stat} index={idx} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GaugeCounter({ stat, index }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200;
          const startTime = performance.now();

          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * stat.value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [stat.value]);

  const colorVariants = ['gauge--blue', 'gauge--orange', 'gauge--green', 'gauge--yellow'];
  const variant = colorVariants[index % colorVariants.length];

  return (
    <div className={`hero__gauge ${variant}`} ref={ref}>
      <span className="hero__gauge-number">{count}+</span>
      <span className="hero__gauge-name">{stat.label}</span>
    </div>
  );
}
