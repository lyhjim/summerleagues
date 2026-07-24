import { LeagueBanner } from "@/components/league-banner"
import { Navigation } from "@/components/navigation"
import { FeaturedGames } from "@/components/featured-games"
import { TeamRankings } from "@/components/team-rankings"
import { MvpRankings } from "@/components/mvp-rankings"
import { schedule } from "@/components/schedule-data"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16">
        <LeagueBanner />
        
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 text-primary text-xs font-mono px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              夏季賽 進行中
            </div>
            <p className="text-xl md:text-2xl text-foreground/80 mb-4 text-pretty font-bold">
              8支隊伍 · 共32名選手 · 爭奪冠軍寶座
            </p>
            <p className="text-base text-muted-foreground mb-10 font-mono">
              <span className="block mb-2">2026.07.27 — 10.29</span>
              逢星期一及四 19:30 森麻 Youtube 直播
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="https://www.youtube.com/@summermjhk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 font-bold px-6 py-3 rounded-full transition-colors text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                森麻 Summer
              </a>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 border border-white/20 text-foreground hover:bg-white/10 font-bold px-6 py-3 rounded-lg transition-colors text-base"
              >
                賽程表
              </Link>
            </div>

          </div>
        </section>

        <FeaturedGames schedule={schedule} />
        <TeamRankings />
        <MvpRankings />
        <Footer />
      </div>
    </main>
  )
}
