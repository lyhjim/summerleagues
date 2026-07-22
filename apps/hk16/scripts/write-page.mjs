import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const content = `"use client"

import { SiteHeader } from "@/components/site-header"
import { NextMatchHero } from "@/components/next-match-hero"
import { HeroSection } from "@/components/hero-section"
import { LeaderboardSection } from "@/components/leaderboard-section"
import { PlayerScoreboards } from "@/components/player-scoreboards"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { CircuitBg } from "@/components/circuit-bg"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative">
      <CircuitBg />
      <SiteHeader />
      <NextMatchHero />
      <main className="relative z-10">
        <HeroSection />
        <section id="standings">
          <LeaderboardSection />
        </section>
        <PlayerScoreboards />
        <section id="schedule">
          <WeeklySchedule />
        </section>
      </main>
      <footer className="relative z-10 border-t border-border mt-16 py-8 text-center">
        <p className="text-xs font-mono tracking-widest text-muted-foreground/40">
          {"TAIWAN MAHJONG TOURNAMENT // ALL RIGHTS RESERVED"}
        </p>
      </footer>
    </div>
  )
}
`

writeFileSync(join(root, "app", "page.tsx"), content, "utf8")
console.log("page.tsx written successfully")
