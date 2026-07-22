// Decorative circuit-board background — PCB trace lines with animated glowing pulses
// Rendered as an absolutely-positioned SVG behind all page content

export function CircuitBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.28 }}
      >
        <defs>
          {/* Cyan glow filter */}
          <filter id="glow-c" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Gold glow filter */}
          <filter id="glow-g" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Static trace style */}
          <style>{`
            .trace       { fill: none; stroke-linecap: square; }
            .trace-c     { stroke: oklch(0.80 0.18 195); }
            .trace-g     { stroke: oklch(0.84 0.17 85); }
            .trace-dim   { stroke: oklch(0.40 0.01 220); }
            .node        { }
            .node-c      { fill: oklch(0.80 0.18 195); }
            .node-g      { fill: oklch(0.84 0.17 85); }
            .node-dim    { fill: oklch(0.30 0.01 220); }
            /* Animated pulse lines */
            .pulse-c { stroke: oklch(0.85 0.20 195); stroke-dasharray: 40 160; }
            .pulse-g { stroke: oklch(0.88 0.18 85);  stroke-dasharray: 30 170; }
          `}</style>
        </defs>

        {/* ── LEFT EDGE CLUSTER ── */}
        {/* Vertical trunk */}
        <line className="trace trace-dim" x1="60" y1="0"   x2="60" y2="100%" strokeWidth="1" />
        <line className="trace trace-dim" x1="80" y1="0"   x2="80" y2="100%" strokeWidth="0.5" />
        {/* Horizontal branches left */}
        <line className="trace trace-dim" x1="0"  y1="120" x2="60" y2="120" strokeWidth="1" />
        <line className="trace trace-dim" x1="0"  y1="200" x2="80" y2="200" strokeWidth="0.5" />
        <line className="trace trace-dim" x1="60" y1="300" x2="160" y2="300" strokeWidth="1" />
        <line className="trace trace-dim" x1="80" y1="420" x2="180" y2="420" strokeWidth="0.5" />
        <line className="trace trace-dim" x1="0"  y1="560" x2="60" y2="560" strokeWidth="1" />
        <line className="trace trace-dim" x1="60" y1="680" x2="160" y2="680" strokeWidth="0.5" />
        {/* Angled connector */}
        <polyline className="trace trace-dim" points="60,300 90,330 90,420 80,420" strokeWidth="0.75" fill="none" />

        {/* Cyan accent traces left */}
        <line className="trace trace-c" x1="0"  y1="160" x2="60" y2="160" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="60" y1="160" x2="60" y2="260" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="60" y1="260" x2="140" y2="260" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="60" y1="500" x2="60" y2="580" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="60" y1="580" x2="160" y2="580" strokeWidth="1.5" filter="url(#glow-c)" />

        {/* Gold accent left */}
        <line className="trace trace-g" x1="80" y1="380" x2="180" y2="380" strokeWidth="1.5" filter="url(#glow-g)" />

        {/* Solder nodes left */}
        <circle className="node node-c animate-node-ping" cx="60"  cy="160" r="3" filter="url(#glow-c)" style={{ animationDelay: "0s" }} />
        <circle className="node node-c animate-node-ping" cx="60"  cy="260" r="3" filter="url(#glow-c)" style={{ animationDelay: "0.6s" }} />
        <circle className="node node-c animate-node-ping" cx="140" cy="260" r="3" filter="url(#glow-c)" style={{ animationDelay: "1.2s" }} />
        <circle className="node node-c animate-node-ping" cx="60"  cy="580" r="3" filter="url(#glow-c)" style={{ animationDelay: "0.9s" }} />
        <circle className="node node-g animate-node-ping" cx="80"  cy="380" r="3" filter="url(#glow-g)" style={{ animationDelay: "0.4s" }} />
        <circle className="node node-g animate-node-ping" cx="180" cy="380" r="3" filter="url(#glow-g)" style={{ animationDelay: "1.4s" }} />
        <circle className="node node-dim" cx="60"  cy="120" r="2.5" />
        <circle className="node node-dim" cx="60"  cy="300" r="2.5" />
        <circle className="node node-dim" cx="60"  cy="560" r="2.5" />
        <circle className="node node-dim" cx="80"  cy="420" r="2.5" />
        <circle className="node node-dim" cx="80"  cy="200" r="2.5" />

        {/* Animated pulse left (cyan, flowing right along y=160) */}
        <line
          className="trace pulse-c animate-trace-flow"
          x1="0" y1="160" x2="140" y2="160"
          strokeWidth="2"
          filter="url(#glow-c)"
          style={{ animationDelay: "0s", animationDuration: "3.4s" }}
        />
        <line
          className="trace pulse-c animate-trace-flow"
          x1="60" y1="160" x2="60" y2="260"
          strokeWidth="2"
          filter="url(#glow-c)"
          style={{ animationDelay: "1.7s", animationDuration: "2.2s" }}
        />
        <line
          className="trace pulse-g animate-trace-flow"
          x1="0" y1="380" x2="180" y2="380"
          strokeWidth="2"
          filter="url(#glow-g)"
          style={{ animationDelay: "0.8s", animationDuration: "4.0s" }}
        />

        {/* ── RIGHT EDGE CLUSTER ── */}
        <line className="trace trace-dim" x1="calc(100% - 60px)" y1="0"   x2="calc(100% - 60px)" y2="100%" strokeWidth="1" />
        <line className="trace trace-dim" x1="calc(100% - 90px)" y1="0"   x2="calc(100% - 90px)" y2="100%" strokeWidth="0.5" />
        <line className="trace trace-dim" x1="calc(100% - 60px)" y1="180" x2="100%" y2="180" strokeWidth="1" />
        <line className="trace trace-dim" x1="calc(100% - 90px)" y1="320" x2="100%" y2="320" strokeWidth="0.5" />
        <line className="trace trace-dim" x1="calc(100% - 200px)" y1="240" x2="calc(100% - 60px)" y2="240" strokeWidth="1" />
        <line className="trace trace-dim" x1="calc(100% - 180px)" y1="440" x2="calc(100% - 60px)" y2="440" strokeWidth="0.5" />
        <line className="trace trace-dim" x1="calc(100% - 90px)" y1="600" x2="100%" y2="600" strokeWidth="1" />

        {/* Cyan accent right */}
        <line className="trace trace-c" x1="calc(100% - 200px)" y1="140" x2="calc(100% - 60px)" y2="140" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="calc(100% - 60px)"  y1="140" x2="calc(100% - 60px)"  y2="240" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="calc(100% - 60px)"  y1="480" x2="calc(100% - 60px)"  y2="560" strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-c" x1="calc(100% - 180px)" y1="560" x2="calc(100% - 60px)"  y2="560" strokeWidth="1.5" filter="url(#glow-c)" />



        {/* Gold accent right */}
        <line className="trace trace-g" x1="calc(100% - 90px)"  y1="360" x2="100%" y2="360" strokeWidth="1.5" filter="url(#glow-g)" />

        {/* Solder nodes right */}
        <circle className="node node-c animate-node-ping" cx="calc(100% - 60px)"  cy="140" r="3" filter="url(#glow-c)" style={{ animationDelay: "0.3s" }} />
        <circle className="node node-c animate-node-ping" cx="calc(100% - 200px)" cy="140" r="3" filter="url(#glow-c)" style={{ animationDelay: "1.1s" }} />
        <circle className="node node-c animate-node-ping" cx="calc(100% - 60px)"  cy="560" r="3" filter="url(#glow-c)" style={{ animationDelay: "0.7s" }} />
        <circle className="node node-g animate-node-ping" cx="calc(100% - 90px)"  cy="360" r="3" filter="url(#glow-g)" style={{ animationDelay: "1.6s" }} />
        <circle className="node node-dim" cx="calc(100% - 60px)"  cy="180" r="2.5" />
        <circle className="node node-dim" cx="calc(100% - 60px)"  cy="440" r="2.5" />
        <circle className="node node-dim" cx="calc(100% - 90px)"  cy="320" r="2.5" />
        <circle className="node node-dim" cx="calc(100% - 60px)"  cy="600" r="2.5" />

        {/* Animated pulses right */}
        <line
          className="trace pulse-c animate-trace-flow-rev"
          x1="calc(100% - 200px)" y1="140" x2="100%" y2="140"
          strokeWidth="2"
          filter="url(#glow-c)"
          style={{ animationDelay: "1.2s", animationDuration: "3.8s" }}
        />


        {/* ── BOTTOM HORIZONTAL CLUSTER ── */}
        <line className="trace trace-dim" x1="0"   y1="calc(100% - 60px)"  x2="100%" y2="calc(100% - 60px)"  strokeWidth="0.75" />
        <line className="trace trace-dim" x1="0"   y1="calc(100% - 100px)" x2="40%"  y2="calc(100% - 100px)" strokeWidth="0.5" />
        <line className="trace trace-dim" x1="60%" y1="calc(100% - 100px)" x2="100%" y2="calc(100% - 100px)" strokeWidth="0.5" />
        <line className="trace trace-c"   x1="20%" y1="calc(100% - 60px)"  x2="20%"  y2="100%"               strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-g"   x1="75%" y1="calc(100% - 60px)"  x2="75%"  y2="100%"               strokeWidth="1.5" filter="url(#glow-g)" />

        {/* Bottom nodes */}
        <circle className="node node-c animate-node-ping" cx="20%" cy="calc(100% - 60px)" r="3" filter="url(#glow-c)" style={{ animationDelay: "0.2s" }} />
        <circle className="node node-g animate-node-ping" cx="75%" cy="calc(100% - 60px)" r="3" filter="url(#glow-g)" style={{ animationDelay: "1.0s" }} />

        {/* Bottom pulse */}
        <line
          className="trace pulse-c animate-trace-flow"
          x1="0" y1="calc(100% - 60px)" x2="100%" y2="calc(100% - 60px)"
          strokeWidth="1.5"
          filter="url(#glow-c)"
          style={{ animationDelay: "2.0s", animationDuration: "5.5s" }}
        />

        {/* ── TOP HORIZONTAL CLUSTER ── */}
        <line className="trace trace-dim" x1="0"   y1="60"  x2="100%" y2="60"  strokeWidth="0.5" />
        <line className="trace trace-c"   x1="30%" y1="0"   x2="30%"  y2="80"  strokeWidth="1.5" filter="url(#glow-c)" />
        <line className="trace trace-g"   x1="70%" y1="0"   x2="70%"  y2="80"  strokeWidth="1.5" filter="url(#glow-g)" />
        <circle className="node node-c animate-node-ping" cx="30%" cy="60" r="3" filter="url(#glow-c)" style={{ animationDelay: "0.5s" }} />
        <circle className="node node-g animate-node-ping" cx="70%" cy="60" r="3" filter="url(#glow-g)" style={{ animationDelay: "1.3s" }} />
      </svg>
    </div>
  )
}
