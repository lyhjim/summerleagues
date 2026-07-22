"use client"

import { useState } from "react"
import { summerTeams } from "@/lib/summer-selection/teams"
import { useSummerStandings } from "@/lib/summer-selection/standings"

export function TeamStandings() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const { teams: computed } = useSummerStandings()

  // Merge live computed stats (from admin-entered scores) onto each team's metadata
  const statsByTeam = Object.fromEntries(computed.map((t) => [t.teamName, t]))
  const teamsWithStats = summerTeams.map((team) => {
    const s = statsByTeam[team.chineseName]
    return {
      ...team,
      points: s?.points ?? 0,
      first: s?.first ?? 0,
      second: s?.second ?? 0,
      third: s?.third ?? 0,
      fourth: s?.fourth ?? 0,
      games: s?.games ?? 0,
    }
  })

  // Sort by points desc, then 1st-place count, then fewer low placements
  const sortedTeams = [...teamsWithStats].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0)
    if ((b.first || 0) !== (a.first || 0)) return (b.first || 0) - (a.first || 0)
    return (a.second + a.third + a.fourth) - (b.second + b.third + b.fourth)
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-blue-400"></span>
          初賽隊伍排名
        </h2>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {sortedTeams.map((team, index) => {
          const isAdvancing = index < 4
          const borderColor = isAdvancing ? "border-emerald-400/50" : "border-blue-300/15"
          const bgColor = isAdvancing ? "bg-emerald-400/5" : "bg-blue-500/5"

          return (
            <div key={team.id} className="space-y-2">
              <div
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                className={`rounded-lg border ${borderColor} ${bgColor} px-6 py-4 hover:bg-blue-400/10 transition-all cursor-pointer ${
                  expandedTeam === team.id ? "border-blue-400/60 ring-1 ring-blue-400/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Rank and Team Name */}
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-3xl font-bold text-blue-300 w-10 shrink-0">{index + 1}</span>
                    <div className="min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                        <span className="text-lg font-bold text-white">{team.chineseName}</span>
                        {team.englishName && (
                          <span className="text-xs text-blue-200/60">{team.englishName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Points and Stats */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${(team.points || 0) >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                        {(team.points || 0) > 0 ? "+" : ""}{(team.points || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="text-right text-xs text-blue-200/60 font-mono space-y-1">
                      <div>{team.first || 0}/{team.second || 0}/{team.third || 0}/{team.fourth || 0}</div>
                      <div>{team.games || 0} / 24</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Team Details */}
              {expandedTeam === team.id && (
                <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-3">隊伍成員</h4>
                    <div className="space-y-2">
                      {team.players.map((player, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-blue-400/10 px-3 py-2 text-sm"
                        >
                          <span className="text-white">{player.name}</span>
                          <span className="text-xs text-blue-200/70">
                            {player.isSupervisor ? "監督/選手" : "選手"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="text-xs text-blue-200/60 mt-6 pt-4 border-t border-blue-300/15 space-y-2">
        <p>綠色背景代表予定晉級決賽隊伍 (前4名)</p>
        <p className="text-[11px]">同分時, 先比較隊伍1位數量, 再比較最高得點對局, 第2高得點對局, 如此類推</p>
      </div>
    </div>
  )
}
