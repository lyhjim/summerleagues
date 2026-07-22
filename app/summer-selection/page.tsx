import { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { TeamStandings } from "@/components/summer-selection/team-standings"
import { MVPStandings } from "@/components/summer-selection/mvp-standings"
import { MatchSchedule } from "@/components/summer-selection/match-schedule"
import { FinalsTeamStandings } from "@/components/summer-selection/finals-team-standings"
import { FinalsMVPStandings } from "@/components/summer-selection/finals-mvp-standings"
import { FinalsMatchSchedule } from "@/components/summer-selection/finals-match-schedule"

export const metadata: Metadata = {
  title: "夏季選拔賽 | 香港立直無雙聯賽",
  description: "2026 夏季賽將會在七月下旬開始，其中一隊替補隊伍將會由此隊際選拔賽產生。",
}

export default function SummerSelectionPage() {
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #051036 0%, #0a1a4a 50%, #06102e 100%)" }}>
      {/* Navigation */}
      <div className="border-b border-blue-300/20 backdrop-blur-sm bg-[#0a1a4a]/40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-blue-200/70 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">夏季選拔賽</h1>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Banner Image */}
            <div className="flex justify-center md:justify-start">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50 ring-1 ring-blue-300/30 max-w-sm w-full">
                <img
                  src="/images/lrc-banner.jpg"
                  alt="香港立直無雙聯賽 LRC 夏季選拔賽主視覺"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Title & Info */}
            <div className="space-y-6 text-center md:text-left">
              <div className="space-y-3">
                <span className="inline-block px-4 py-1.5 bg-blue-400/20 text-blue-100 text-sm font-semibold rounded-full ring-1 ring-blue-300/40">
                  2026 夏季賽
                </span>
                <p className="text-lg md:text-xl font-semibold text-blue-100/90 tracking-wide">
                  香港立直無雙聯賽 2026
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-white text-balance leading-tight">
                  夏季選拔賽
                </h2>
                <p className="text-blue-100/80 leading-relaxed text-pretty">
                  2026 夏季賽將會在七月下旬開始，其中一隊替補隊伍將會由此隊際選拔賽產生。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 justify-center md:justify-start">
                <span className="inline-block px-3 py-1 bg-emerald-400/20 text-emerald-200 text-sm font-semibold rounded-full ring-1 ring-emerald-300/40">
                  進行中
                </span>
                <p className="text-sm text-blue-100/70">
                  初賽每隊打 24 個半莊。最高分 4 隊晉級決賽，分數折半。決賽將會進行 4 個直播半莊，冠軍將正式成為香港立直無雙聯賽 2026 夏季賽隊伍。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-16">
          {/* Finals Team Standings */}
          <div>
            <FinalsTeamStandings />
          </div>

          {/* Finals MVP Standings */}
          <div>
            <FinalsMVPStandings />
          </div>

          {/* Finals Match Schedule */}
          <div>
            <FinalsMatchSchedule />
          </div>

          {/* Preliminary Team Standings */}
          <div>
            <TeamStandings />
          </div>

          {/* Preliminary MVP Standings */}
          <div>
            <MVPStandings />
          </div>

          {/* Preliminary Match Schedule */}
          <div>
            <MatchSchedule />
          </div>
        </div>
      </section>
    </main>
  )
}
