"use client"

import { CircuitBg } from "@/components/circuit-bg"
import { SiteHeader } from "@/components/site-header"
import { NextMatchHero } from "@/components/next-match-hero"
import { HeroSection } from "@/components/hero-section"
import { AboutLeague } from "@/components/about-league"
import { LeaderboardSection } from "@/components/leaderboard-section"
import { PlayerScoreboards } from "@/components/player-scoreboards"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { SiteFooter } from "@/components/site-footer"

export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <CircuitBg />
      <SiteHeader />
      <NextMatchHero />
      <main className="relative z-10">
        <HeroSection />
        <AboutLeague />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 py-12">
          <section id="standings" className="scroll-mt-20">
            <LeaderboardSection />
          </section>
          <section id="players" className="scroll-mt-20">
            <PlayerScoreboards />
          </section>
          <section id="schedule" className="scroll-mt-20">
            <WeeklySchedule />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
