const { writeFileSync } = require("fs")

const root = "/vercel/share/v0-project"

const content = [
  '"use client"',
  '',
  'import { SiteHeader } from "@/components/site-header"',
  'import { NextMatchHero } from "@/components/next-match-hero"',
  'import { HeroSection } from "@/components/hero-section"',
  'import { LeaderboardSection } from "@/components/leaderboard-section"',
  'import { PlayerScoreboards } from "@/components/player-scoreboards"',
  'import { WeeklySchedule } from "@/components/weekly-schedule"',
  'import { CircuitBg } from "@/components/circuit-bg"',
  '',
  'export default function TournamentPage() {',
  '  return (',
  '    <div className="min-h-screen bg-background relative">',
  '      <CircuitBg />',
  '      <SiteHeader />',
  '      <NextMatchHero />',
  '      <main className="relative z-10">',
  '        <HeroSection />',
  '        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 py-12">',
  '          <section id="standings" className="scroll-mt-20">',
  '            <LeaderboardSection />',
  '          </section>',
  '          <section id="players" className="scroll-mt-20">',
  '            <PlayerScoreboards />',
  '          </section>',
  '          <section id="schedule" className="scroll-mt-20">',
  '            <WeeklySchedule />',
  '          </section>',
  '        </div>',
  '      </main>',
  '      <footer className="relative z-10 border-t border-border mt-4 py-8 text-center">',
  '        <div className="max-w-7xl mx-auto px-4">',
  '          <p className="text-xs font-mono tracking-widest text-muted-foreground/40">',
  '            {"TAIWAN MAHJONG TOURNAMENT // ALL RIGHTS RESERVED"}',
  '          </p>',
  '        </div>',
  '      </footer>',
  '    </div>',
  '  )',
  '}',
].join('\n')

writeFileSync(root + "/app/page.tsx", content, { encoding: "utf8", flag: "w" })
console.log("[v0] page.tsx written successfully — " + content.length + " bytes")
