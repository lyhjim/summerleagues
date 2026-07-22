'use client'

import { useState } from "react"
import Image from "next/image"
import { TeamDetailModal } from "./team-detail-modal"

export type Team = {
  rank: number
  name: string
  nameEn: string
  points: number
  matches: number
  first: number
  second: number
  third: number
  fourth: number
  logo: string | null
}

const rankColors = [
  "text-yellow-300",
  "text-slate-200",
  "text-orange-400",
  "text-muted-foreground",
]

const rankBgColors = [
  "border-l-yellow-400 bg-slate-900/30",
  "border-l-slate-300 bg-slate-900/30",
  "border-l-amber-600 bg-slate-900/30",
  "border-l-transparent",
]

// Team accent colors based on team members' photo background colors
const teamAccentColors: Record<string, string> = {
  "牌道": "bg-yellow-900/20 border-l-yellow-500", // Yellow/Gold
  "愚形上等": "bg-green-900/20 border-l-green-500", // Green
  "易和團": "bg-orange-900/20 border-l-orange-500", // Orange
  "壞拍子": "bg-yellow-800/20 border-l-yellow-600", // Yellow
  "錦鯉咪好勁": "bg-red-900/20 border-l-red-600", // Red
  "狂戰士": "bg-red-800/20 border-l-red-700", // Dark Red
  "天月麻雀": "bg-blue-900/20 border-l-blue-500", // Blue
  "御無礼": "bg-purple-800/20 border-l-purple-600", // Purple
}

const getTeamIdFromName = (name: string): string => {
  const idMap: Record<string, string> = {
    "天月麻雀": "amatsuki",
    "狂戰士": "berserker",
    "壞拍子": "badbeat",
    "Bad Beat": "badbeat",
    "牌道": "paidao",
    "易和團": "eronmust",
    "愚形上等": "guxing",
    "錦鯉咪好勁": "nishikigoi",
    "御無礼": "gobure",
  }
  return idMap[name] || ""
}

export function TeamRankingsClient({ teams }: { teams: Team[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  return (
    <section className="py-16 px-4" id="rankings">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-foreground">
            隊伍排名
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <span className="text-xs text-muted-foreground border border-primary/30 px-3 py-1 rounded-full font-mono">
            春季賽
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase w-12">名次</th>
                <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase">隊伍</th>
                <th className="text-center py-4 px-3 text-xs font-bold text-muted-foreground tracking-widest uppercase">戰績 · 場數</th>
                <th className="text-right py-4 px-5 text-xs font-bold text-primary tracking-widest uppercase">積分</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.name}
                  className={`border-b border-white/5 border-l-4 hover:bg-white/5 transition-all duration-200 cursor-pointer ${
                    teamAccentColors[team.name] || "border-l-transparent"
                  }`}
                  onClick={() => setSelectedTeamId(getTeamIdFromName(team.name))}
                >
                  <td className="py-4 px-5">
                    <span className={`text-2xl font-black ${rankColors[Math.min(index, 3)]}`}>
                      {index < 3 ? ["①", "②", "③"][index] : team.rank}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {team.logo ? (
                        <div className="w-15 h-15 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={team.logo}
                            alt={team.name}
                            width={60}
                            height={60}
                            className="team-logo object-contain w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-15 h-15 flex-shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-lg font-bold">
                          {team.name[0]}
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => setSelectedTeamId(getTeamIdFromName(team.name))}
                          className="font-bold text-base leading-tight text-white hover:text-primary transition-colors text-left bg-none border-none cursor-pointer p-0"
                        >
                          {team.name === "壞拍子" ? "Bad Beat" : team.name}
                        </button>
                        {team.name === "壞拍子" ? (
                          <div className="text-xs text-muted-foreground">壞拍子</div>
                        ) : (
                          team.nameEn && <div className="text-xs text-muted-foreground">{team.nameEn}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center font-bold font-mono text-white">
                    {team.first}/{team.second}/{team.third}/{team.fourth} · {team.matches} / 28
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className={`text-xl font-black font-mono ${team.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {team.points > 0 ? '+' : ''}{team.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {teams.map((team, index) => (
            <div
              key={team.name}
              onClick={() => setSelectedTeamId(getTeamIdFromName(team.name))}
              className={`flex items-center gap-3 p-3 rounded-xl border border-l-4 border-white/10 bg-card/60 backdrop-blur-sm cursor-pointer hover:bg-card/80 transition-colors ${
                teamAccentColors[team.name] || "border-l-transparent"
              }`}
            >
              <span className={`text-xl font-black w-8 text-center flex-shrink-0 ${rankColors[Math.min(index, 3)]}`}>
                {team.rank}
              </span>
              {team.logo ? (
                <div className="w-15 h-15 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={team.logo}
                    alt={team.name}
                    width={60}
                    height={60}
                    className="team-logo object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-15 h-15 flex-shrink-0 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">
                  {team.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setSelectedTeamId(getTeamIdFromName(team.name))}
                  className="font-bold truncate text-white hover:text-primary transition-colors block text-left bg-none border-none cursor-pointer p-0 w-full"
                >
                  {team.name === "壞拍子" ? "Bad Beat" : team.name}
                </button>
                {team.name === "壞拍子" ? (
                  <div className="text-xs text-muted-foreground truncate">壞拍子</div>
                ) : (
                  team.nameEn && <div className="text-xs text-muted-foreground truncate">{team.nameEn}</div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-black font-mono ${team.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {team.points > 0 ? '+' : ''}{team.points}
                </div>
                <div className="text-xs text-muted-foreground font-mono">{team.first}/{team.second}/{team.third}/{team.fourth} · {team.matches} / 28</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <a
            href="#schedule"
            className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1"
          >
            查看完整賽程表 →
          </a>
        </div>
      </div>

      {/* Team Detail Modal */}
      <TeamDetailModal teamId={selectedTeamId} onClose={() => setSelectedTeamId(null)} />
    </section>
  )
}
