import { useEffect, useRef } from 'react';
import './RetroBackground.css';

// SVG coordinate space for side margin circuits
const SVG_WIDTH = 160;
const SVG_HEIGHT = 1000;

// LEFT MARGIN CIRCUIT DEFINITIONS
const LEFT_CIRCUITS = {
  paths: [
    {
      id: 'L1',
      // Main outer trunk running top to bottom with 45° chamfers & 90° bends
      d: 'M 130 20 L 130 110 L 85 155 L 85 300 L 45 340 L 45 540 L 95 590 L 95 760 L 135 800 L 135 980',
      nodes: [
        { x: 130, y: 20 },
        { x: 130, y: 110 },
        { x: 85, y: 155 },
        { x: 85, y: 300 },
        { x: 45, y: 340 },
        { x: 45, y: 540 },
        { x: 95, y: 590 },
        { x: 95, y: 760 },
        { x: 135, y: 800 },
        { x: 135, y: 980 },
      ],
    },
    {
      id: 'L2',
      // Middle branch tapping off L1 junction
      d: 'M 85 300 L 135 300 L 135 430 L 105 460 L 105 570 L 65 610',
      nodes: [
        { x: 135, y: 300 },
        { x: 135, y: 430 },
        { x: 105, y: 460 },
        { x: 105, y: 570 },
        { x: 65, y: 610 },
      ],
    },
    {
      id: 'L3',
      // Top outer auxiliary circuit
      d: 'M 30 70 L 30 210 L 65 245 L 65 320',
      nodes: [
        { x: 30, y: 70 },
        { x: 30, y: 210 },
        { x: 65, y: 245 },
        { x: 65, y: 320 },
      ],
    },
    {
      id: 'L4',
      // Bottom return loop
      d: 'M 45 680 L 45 860 L 80 895 L 80 970',
      nodes: [
        { x: 45, y: 680 },
        { x: 45, y: 860 },
        { x: 80, y: 895 },
        { x: 80, y: 970 },
      ],
    },
  ],
  signals: [
    { pathId: 'L1', speed: 52, dir: 1, startDist: 0 },
    { pathId: 'L1', speed: 52, dir: 1, startDist: 550 },
    { pathId: 'L2', speed: 42, dir: 1, startDist: 100 },
    { pathId: 'L4', speed: 46, dir: -1, startDist: 40 },
  ],
};

// RIGHT MARGIN CIRCUIT DEFINITIONS (Asymmetric PCB layout)
const RIGHT_CIRCUITS = {
  paths: [
    {
      id: 'R1',
      // Main inner trunk
      d: 'M 30 30 L 30 150 L 75 195 L 75 360 L 115 400 L 115 600 L 65 650 L 65 820 L 25 860 L 25 970',
      nodes: [
        { x: 30, y: 30 },
        { x: 30, y: 150 },
        { x: 75, y: 195 },
        { x: 75, y: 360 },
        { x: 115, y: 400 },
        { x: 115, y: 600 },
        { x: 65, y: 650 },
        { x: 65, y: 820 },
        { x: 25, y: 860 },
        { x: 25, y: 970 },
      ],
    },
    {
      id: 'R2',
      // Upper outer parallel branch
      d: 'M 115 50 L 115 170 L 70 215 L 70 300 L 30 340 L 30 500',
      nodes: [
        { x: 115, y: 50 },
        { x: 115, y: 170 },
        { x: 70, y: 215 },
        { x: 70, y: 300 },
        { x: 30, y: 340 },
        { x: 30, y: 500 },
      ],
    },
    {
      id: 'R3',
      // Lower lateral branch
      d: 'M 125 540 L 125 710 L 90 745 L 90 910 L 50 950',
      nodes: [
        { x: 125, y: 540 },
        { x: 125, y: 710 },
        { x: 90, y: 745 },
        { x: 90, y: 910 },
        { x: 50, y: 950 },
      ],
    },
  ],
  signals: [
    { pathId: 'R1', speed: 50, dir: 1, startDist: 150 },
    { pathId: 'R1', speed: 50, dir: 1, startDist: 700 },
    { pathId: 'R2', speed: 44, dir: 1, startDist: 220 },
    { pathId: 'R3', speed: 48, dir: -1, startDist: 80 },
  ],
};

export default function RetroBackground() {
  const leftSvgRef = useRef(null);
  const rightSvgRef = useRef(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId;
    let lastTime = performance.now();

    // Helper to initialize and bind circuit runtime
    const setupSideCircuit = (svgElement, circuitDef) => {
      if (!svgElement) return null;

      const pathMap = {};
      circuitDef.paths.forEach((p) => {
        const el = svgElement.querySelector(`[data-path-id="${p.id}"]`);
        if (el) {
          const len = el.getTotalLength();
          pathMap[p.id] = { el, length: len, nodes: p.nodes };
        }
      });

      // Prepare signal state objects
      const signals = circuitDef.signals.map((sig, idx) => {
        const pathData = pathMap[sig.pathId];
        const initialDist = pathData ? (sig.startDist % pathData.length) : 0;
        const groupEl = svgElement.querySelector(`[data-signal-id="${sig.pathId}-${idx}"]`);
        const coreEl = groupEl?.querySelector('.circuit-pulse__core');
        const haloEl = groupEl?.querySelector('.circuit-pulse__halo');
        const trail1El = groupEl?.querySelector('.circuit-pulse__trail-1');
        const trail2El = groupEl?.querySelector('.circuit-pulse__trail-2');

        return {
          ...sig,
          currentDist: initialDist,
          groupEl,
          coreEl,
          haloEl,
          trail1El,
          trail2El,
        };
      });

      // Collect node glow elements & state
      const nodeStates = [];
      circuitDef.paths.forEach((p) => {
        p.nodes.forEach((node, nodeIdx) => {
          const haloEl = svgElement.querySelector(`[data-node-halo="${p.id}-${nodeIdx}"]`);
          if (haloEl) {
            nodeStates.push({
              x: node.x,
              y: node.y,
              haloEl,
              glow: 0,
            });
          }
        });
      });

      return { pathMap, signals, nodeStates };
    };

    const leftRuntime = setupSideCircuit(leftSvgRef.current, LEFT_CIRCUITS);
    const rightRuntime = setupSideCircuit(rightSvgRef.current, RIGHT_CIRCUITS);

    const updateSide = (runtime, dt) => {
      if (!runtime) return;
      const { pathMap, signals, nodeStates } = runtime;

      // Update signal positions
      signals.forEach((sig) => {
        const pathData = pathMap[sig.pathId];
        if (!pathData || !sig.groupEl) return;

        const totalLen = pathData.length;
        sig.currentDist += sig.speed * dt * sig.dir;
        if (sig.currentDist > totalLen) sig.currentDist -= totalLen;
        if (sig.currentDist < 0) sig.currentDist += totalLen;

        const pt = pathData.el.getPointAtLength(sig.currentDist);

        // Update core & halo positions
        if (sig.coreEl) {
          sig.coreEl.setAttribute('cx', pt.x.toFixed(1));
          sig.coreEl.setAttribute('cy', pt.y.toFixed(1));
        }
        if (sig.haloEl) {
          sig.haloEl.setAttribute('cx', pt.x.toFixed(1));
          sig.haloEl.setAttribute('cy', pt.y.toFixed(1));
        }

        // Trailing comets
        if (sig.trail1El) {
          const t1Dist = (sig.currentDist - sig.dir * 9 + totalLen) % totalLen;
          const t1Pt = pathData.el.getPointAtLength(t1Dist);
          sig.trail1El.setAttribute('cx', t1Pt.x.toFixed(1));
          sig.trail1El.setAttribute('cy', t1Pt.y.toFixed(1));
        }
        if (sig.trail2El) {
          const t2Dist = (sig.currentDist - sig.dir * 18 + totalLen) % totalLen;
          const t2Pt = pathData.el.getPointAtLength(t2Dist);
          sig.trail2El.setAttribute('cx', t2Pt.x.toFixed(1));
          sig.trail2El.setAttribute('cy', t2Pt.y.toFixed(1));
        }

        // Test proximity to nodes along this circuit
        const REACH_RADIUS = 20;
        nodeStates.forEach((nState) => {
          const dx = pt.x - nState.x;
          const dy = pt.y - nState.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < REACH_RADIUS * REACH_RADIUS) {
            const dist = Math.sqrt(distSq);
            const intensity = 1 - dist / REACH_RADIUS;
            if (intensity > nState.glow) {
              nState.glow = intensity;
            }
          }
        });
      });

      // Decay and render node glow
      nodeStates.forEach((nState) => {
        nState.glow *= 0.92; // smooth decay
        if (nState.glow < 0.01) nState.glow = 0;

        nState.haloEl.setAttribute('opacity', (nState.glow * 0.95).toFixed(3));
        const r = 5 + nState.glow * 7;
        nState.haloEl.setAttribute('r', r.toFixed(1));
      });
    };

    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // clamp to max 100ms
      lastTime = time;

      updateSide(leftRuntime, dt);
      updateSide(rightRuntime, dt);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="retro-world-bg" aria-hidden="true">
      {/* ============================================================
          LEFT MARGIN INTERACTIVE CIRCUIT & DATA TRANSMISSION SYSTEM
          ============================================================ */}
      <div className="retro-bg-margin retro-bg-margin--left">
        {/* SVG Circuit Canvas */}
        <svg
          ref={leftSvgRef}
          className="retro-circuit-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMaxYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Diffused Glow Filter for Pulses and Active Nodes (Left) */}
            <filter id="circuit-pulse-glow-l" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="circuit-node-bloom-l" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5.5" result="bloom" />
              <feMerge>
                <feMergeNode in="bloom" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* PCB Traces */}
          <g className="circuit-traces">
            {LEFT_CIRCUITS.paths.map((p) => (
              <path
                key={p.id}
                data-path-id={p.id}
                d={p.d}
                className="circuit-trace-line"
              />
            ))}
          </g>

          {/* Solder Pad Junction Nodes */}
          <g className="circuit-nodes">
            {LEFT_CIRCUITS.paths.map((p) =>
              p.nodes.map((node, idx) => (
                <g key={`${p.id}-${idx}`} className="circuit-node-group">
                  {/* Dynamic Bloom Halo when signal passes */}
                  <circle
                    data-node-halo={`${p.id}-${idx}`}
                    cx={node.x}
                    cy={node.y}
                    r="5"
                    className="circuit-node__halo"
                    opacity="0"
                    filter="url(#circuit-node-bloom-l)"
                  />
                  {/* Outer Solder Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="4.5"
                    className="circuit-node__ring"
                  />
                  {/* Center Node Core */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="2"
                    className="circuit-node__core"
                  />
                </g>
              ))
            )}
          </g>

          {/* Moving Signal Pulses */}
          <g className="circuit-signals">
            {LEFT_CIRCUITS.signals.map((sig, idx) => (
              <g
                key={`sig-L-${sig.pathId}-${idx}`}
                data-signal-id={`${sig.pathId}-${idx}`}
                className="circuit-pulse-group"
              >
                {/* Secondary trailing comet dot */}
                <circle cx="-100" cy="-100" r="1.8" className="circuit-pulse__trail-2" />
                {/* Primary trailing comet dot */}
                <circle cx="-100" cy="-100" r="2.6" className="circuit-pulse__trail-1" />
                {/* Outer luminous bloom halo */}
                <circle
                  cx="-100"
                  cy="-100"
                  r="9"
                  className="circuit-pulse__halo"
                  filter="url(#circuit-pulse-glow-l)"
                />
                {/* Core bright spark */}
                <circle cx="-100" cy="-100" r="3.2" className="circuit-pulse__core" />
              </g>
            ))}
          </g>
        </svg>

        {/* Floating Handcrafted Vector Elements (Subtle Secondary Layer) */}
        <div className="retro-mark retro-mark--sq-orange" style={{ top: '8%', left: '35%' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <rect x="2" y="2" width="14" height="14" fill="none" stroke="var(--accent-warning)" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="retro-mark retro-mark--cross-1" style={{ top: '15%', left: '18%' }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <line x1="7" y1="1" x2="7" y2="13" stroke="var(--accent-warning)" strokeWidth="2" strokeLinecap="square" />
            <line x1="1" y1="7" x2="13" y2="7" stroke="var(--accent-warning)" strokeWidth="2" strokeLinecap="square" />
          </svg>
        </div>

        <div className="retro-mark retro-mark--diamond" style={{ top: '28%', left: '12%' }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect
              x="8"
              y="1"
              width="10"
              height="10"
              transform="rotate(45 8 1)"
              fill="none"
              stroke="var(--accent-secondary)"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="retro-mark retro-mark--cross-2" style={{ top: '48%', left: '22%' }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="8" y1="2" x2="8" y2="14" stroke="var(--ink-muted)" strokeWidth="2" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="var(--ink-muted)" strokeWidth="2" />
          </svg>
        </div>

        {/* Vertical Spaced Motto Text: BUILD LEARN ITERATE REPEAT */}
        <div className="retro-bg-motto retro-bg-motto--left" style={{ top: '64%', left: '15%' }}>
          <span>BUILD</span>
          <span>LEARN</span>
          <span>ITERATE</span>
          <span>REPEAT</span>
        </div>

        <div className="retro-mark retro-mark--cross-3" style={{ top: '83%', left: '18%' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <line x1="9" y1="1" x2="9" y2="17" stroke="var(--accent-warning)" strokeWidth="2.5" />
            <line x1="1" y1="9" x2="17" y2="9" stroke="var(--accent-warning)" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* ============================================================
          RIGHT MARGIN INTERACTIVE CIRCUIT & DATA TRANSMISSION SYSTEM
          ============================================================ */}
      <div className="retro-bg-margin retro-bg-margin--right">
        {/* SVG Circuit Canvas */}
        <svg
          ref={rightSvgRef}
          className="retro-circuit-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Diffused Glow Filter for Pulses and Active Nodes (Right) */}
            <filter id="circuit-pulse-glow-r" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="circuit-node-bloom-r" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5.5" result="bloom" />
              <feMerge>
                <feMergeNode in="bloom" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* PCB Traces */}
          <g className="circuit-traces">
            {RIGHT_CIRCUITS.paths.map((p) => (
              <path
                key={p.id}
                data-path-id={p.id}
                d={p.d}
                className="circuit-trace-line"
              />
            ))}
          </g>

          {/* Solder Pad Junction Nodes */}
          <g className="circuit-nodes">
            {RIGHT_CIRCUITS.paths.map((p) =>
              p.nodes.map((node, idx) => (
                <g key={`${p.id}-${idx}`} className="circuit-node-group">
                  {/* Dynamic Bloom Halo when signal passes */}
                  <circle
                    data-node-halo={`${p.id}-${idx}`}
                    cx={node.x}
                    cy={node.y}
                    r="5"
                    className="circuit-node__halo"
                    opacity="0"
                    filter="url(#circuit-node-bloom-r)"
                  />
                  {/* Outer Solder Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="4.5"
                    className="circuit-node__ring"
                  />
                  {/* Center Node Core */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="2"
                    className="circuit-node__core"
                  />
                </g>
              ))
            )}
          </g>

          {/* Moving Signal Pulses */}
          <g className="circuit-signals">
            {RIGHT_CIRCUITS.signals.map((sig, idx) => (
              <g
                key={`sig-R-${sig.pathId}-${idx}`}
                data-signal-id={`${sig.pathId}-${idx}`}
                className="circuit-pulse-group"
              >
                {/* Secondary trailing comet dot */}
                <circle cx="-100" cy="-100" r="1.8" className="circuit-pulse__trail-2" />
                {/* Primary trailing comet dot */}
                <circle cx="-100" cy="-100" r="2.6" className="circuit-pulse__trail-1" />
                {/* Outer luminous bloom halo */}
                <circle
                  cx="-100"
                  cy="-100"
                  r="9"
                  className="circuit-pulse__halo"
                  filter="url(#circuit-pulse-glow-r)"
                />
                {/* Core bright spark */}
                <circle cx="-100" cy="-100" r="3.2" className="circuit-pulse__core" />
              </g>
            ))}
          </g>
        </svg>

        {/* Floating Handcrafted Vector Elements (Subtle Secondary Layer) */}
        <div className="retro-mark retro-mark--r-cross-1" style={{ top: '8%', right: '28%' }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="8" y1="1" x2="8" y2="15" stroke="var(--accent-warning)" strokeWidth="2" />
            <line x1="1" y1="8" x2="15" y2="8" stroke="var(--accent-warning)" strokeWidth="2" />
          </svg>
        </div>

        <div className="retro-mark retro-mark--r-sq-cyan" style={{ top: '16%', right: '16%' }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="2" y="2" width="12" height="12" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" />
          </svg>
        </div>

        <div className="retro-mark retro-mark--r-cross-2" style={{ top: '38%', right: '14%' }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="8" y1="2" x2="8" y2="14" stroke="var(--accent-secondary)" strokeWidth="2" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="var(--accent-secondary)" strokeWidth="2" />
          </svg>
        </div>

        <div className="retro-mark retro-mark--r-sq-orange" style={{ top: '53%', right: '35%' }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="2" y="2" width="12" height="12" fill="none" stroke="var(--accent-warning)" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Vertical Spaced Motto Text: IDEAS SYSTEMS IMPACT */}
        <div className="retro-bg-motto retro-bg-motto--right" style={{ top: '64%', right: '22%' }}>
          <span>IDEAS</span>
          <span>SYSTEMS</span>
          <span>IMPACT</span>
        </div>

        {/* Bottom 4-Point Sparkle Star */}
        <div className="retro-mark retro-mark--r-star" style={{ top: '84%', right: '30%' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2 C12 8, 16 12, 22 12 C16 12, 12 16, 12 22 C12 16, 8 12, 2 12 C8 12, 12 8, 12 2 Z"
              fill="none"
              stroke="var(--accent-warning)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
