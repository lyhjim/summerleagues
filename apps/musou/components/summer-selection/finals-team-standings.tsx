"use client"

import { useEffect, useState } from "react"
import { summerTeams } from "@/lib/summer-selection/teams"

interface FinalTeam {
  id: string
  chineseName: string
  englishName?: string
  startingScore: number
  points: number
  first: number
  second: number
  third: number
  fourth: number
  games: number
}

export function FinalsTeamStandings() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [finalsTeams, setFinalsTeams] = useState<FinalTeam[]>([])
  const [loading, setLoading] = useState(true)

  // Starting scores from preliminaries
  const startingScores: Record<string, number> = {
    "鬼點子": 211.2,
    "層層疊": 69.4,
    "雙狙人": 13.3,
    "疾風勁草": 9.6,
  }

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await fetch("/api/summer-selection/finals-standings", { cache: "no-store" })
        const data = await res.json()
        
        if (data.teams) {
          const teams: FinalTeam[] = data.teams.map((team: any) => ({
            id: team.teamName,
            chineseName: team.teamName,
            englishName: summerTeams.find(t => t.chineseName === team.teamName)?.englishName,
            startingScore: startingScores[team.teamName] || 0,
            points: (startingScores[team.teamName] || 0) + team.points,
            first: team.first,
            second: team.second,
            third: team.third,
            fourth: team.fourth,
            games: team.games,
          }))
          setFinalsTeams(teams)
        }
      } catch (error) {
        console.error("[v0] Error fetching finals standings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
    const interval = setInterval(fetchStandings, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Sort by points desc
  const sortedTeams = [...finalsTeams].sort((a, b) => (b.points || 0) - (a.points || 0))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-emerald-400"></span>
          決賽隊伍排名
        </h2>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {sortedTeams.map((team, index) => (
          <div key={team.id} className="space-y-2">
            <div
              onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              className={`rounded-lg border border-emerald-400/50 bg-emerald-400/5 px-6 py-4 hover:bg-emerald-400/10 transition-all cursor-pointer ${
                expandedTeam === team.id ? "border-emerald-400/60 ring-1 ring-emerald-400/30" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Rank and Team Name */}
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl font-bold text-emerald-300 w-10 shrink-0">{index + 1}</span>
                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                      <span className="text-lg font-bold text-white">{team.chineseName}</span>
                      {team.englishName && (
                        <span className="text-xs text-emerald-200/60">{team.englishName}</span>
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
                  <div className="text-right text-xs text-emerald-200/60 font-mono space-y-1">
                    <div>{team.first || 0}/{team.second || 0}/{team.third || 0}/{team.fourth || 0}</div>
                    <div>{team.games || 0} / 4</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Team Details */}
            {expandedTeam === team.id && (
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3">初賽帶分</h4>
                  <div className="text-lg font-bold text-white">{team.startingScore > 0 ? "+" : ""}{team.startingScore.toFixed(1)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3">隊伍成員</h4>
                  <div className="space-y-2">
                    {(() => {
                      const foundTeam = summerTeams.find(t => t.chineseName === team.chineseName)
                      if (!foundTeam) return null
                      return foundTeam.players.map((player, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-emerald-400/10 px-3 py-2 text-sm"
                        >
                          <span className="text-white">{player.name}</span>
                          <span className="text-xs text-emerald-200/70">
                            {player.isSupervisor ? "監督/選手" : "選手"}
                          </span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="text-xs text-emerald-200/60 mt-6 pt-4 border-t border-emerald-300/15 space-y-2">
        <p>決賽將進行4個半莊，起分為初賽前4名的積分折半，決賽同分時以初賽排名較前佔優</p>
      </div>
    </div>
  )
}
