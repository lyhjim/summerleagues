"use client"

import Link from "next/link"

export function AboutLeague() {
  return (
    <section className="relative py-16 sm:py-20">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Title */}
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
          {"What is "}
          <span className="text-primary text-glow-cyan">{"雲龍盃"}</span>
          {"?"}
        </h2>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-foreground/90 font-medium mb-6">
          {"雲龍盃 — 四人四隊，智慧與策略的巔峰對決。"}
        </p>

        {/* Description */}
        <p className="text-base text-foreground/70 leading-relaxed mb-8 text-pretty">
          {"雲龍盃（Cloud Dragon Cup）匯聚頂尖麻雀選手，以團隊形式展開六輪激烈對戰。每支隊伍由三位選手組成，在台灣麻雀規則下，以智慧、策略與冷靜的判斷力爭奪最終冠軍。本賽事的規則引用HKPM TWMJ GCoC。"}
        </p>

        {/* Learn more button */}
        <Link
          href="/information"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-mono text-sm tracking-wider transition-colors group"
        >
          <span>{"了解更多"}</span>
          <span className="text-xs group-hover:translate-x-1 transition-transform">{"// LEARN MORE"}</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Registration section - yellow highlight box */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <div className="border-2 border-yellow-400 bg-yellow-400/10 rounded-md px-6 py-5 inline-block">
            <p className="text-base text-yellow-300 font-medium mb-4">
              {"想為下一季組隊參賽？請填寫報名表格！"}
            </p>
            <a
              href="https://forms.gle/mh4B3ZZYJ3kacnyy9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-md text-black font-mono text-sm font-bold tracking-wider transition-colors"
            >
              <span>{"報名參賽"}</span>
              <span className="text-xs">{"// REGISTER"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
