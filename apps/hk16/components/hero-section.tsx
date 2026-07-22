"use client"

export function HeroSection() {
  return (
    <section className="relative border-b border-border">
      <div className="scanlines absolute inset-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.35em] text-primary/80 uppercase">
                {"SYS // 雲龍盃 SEASON 0"}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-none mb-3">
              <span className="text-metallic block">{"雲龍盃"}</span>
              <span className="text-primary text-glow-cyan">CLOUD DRAGON CUP</span>
            </h1>
            <div className="mt-4 flex flex-col gap-0.5 text-sm font-mono text-muted-foreground">
              <span>// TAIWAN MAHJONG LEAGUE</span>
              <span>// 4 TEAMS // 6 ROUNDS</span>
            </div>
          </div>

          <div className="flex shrink-0 border border-border">
            {[
              { label: "TEAMS", value: "04" },
              { label: "ROUNDS", value: "06" },
              { label: "SEASON", value: "00" },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className={i < 2 ? "px-5 py-4 text-center border-r border-border" : "px-5 py-4 text-center"}
              >
                <p className="text-3xl font-mono font-bold text-primary text-glow-cyan tabular-nums">
                  {value}
                </p>
                <p className="text-[10px] font-mono tracking-widest text-primary/60 mt-0.5 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
