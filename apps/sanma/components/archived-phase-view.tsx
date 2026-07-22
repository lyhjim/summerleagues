"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Archive } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { teams } from "@/lib/team-data"
import { getArchivedPhaseTeamStats, getTopNineTeamsForSemiFinals } from "@/lib/archived-phase-data"

interface ArchivedPhaseViewProps {
  compact?: boolean
}

export function ArchivedPhaseView({ compact = false }: ArchivedPhaseViewProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(!compact)
  const archivedStats = getArchivedPhaseTeamStats()
  const qualifiedTeamNames = new Set(getTopNineTeamsForSemiFinals().map((t) => t.name))

  const getRankBoxColor = (rank: number, teamName: string) => {
    if (!qualifiedTeamNames.has(teamName)) return "bg-gray-500 text-white"
    if (rank === 1) return "bg-red-500 text-white"
    return "bg-green-600 text-white"
  }

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader 
        className="cursor-pointer hover:bg-card/70 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg font-bold">{t.archivedPhase || "已封存階段"}</CardTitle>
              <CardDescription className="text-xs">{t.preliminaryPhase || "初賽"} - {t.viewScores || "查看成績"}</CardDescription>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Team Leaderboard Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{t.teamStandings || "隊伍排名"}</h3>
            <div className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[45px_minmax(120px,1fr)_65px_60px_70px_45px_45px_45px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              <div>{t.rank}</div>
              <div>{t.team}</div>
              <div className="text-right">{t.maisuu}</div>
              <div className="text-right hidden sm:block">{t.qualificationGap}</div>
              <div className="text-right hidden sm:block">{t.hanChan}</div>
              <div className="text-right hidden sm:block">{t.first}</div>
              <div className="text-right hidden sm:block">{t.second}</div>
              <div className="text-right hidden sm:block">{t.third}</div>
            </div>

            {archivedStats.map((stat, index) => {
              const team = teams.find((t) => t.name === stat.name)
              if (!team) return null

              const rank = index + 1
              const qualified = qualifiedTeamNames.has(stat.name)

              return (
                <div
                  key={stat.name}
                  className={`grid grid-cols-[40px_1fr_60px] sm:grid-cols-[45px_minmax(120px,1fr)_65px_60px_70px_45px_45px_45px] gap-2 px-3 py-2.5 rounded-lg ${
                    qualified ? "bg-primary/5 border-l-4 border-primary" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getRankBoxColor(rank, stat.name)}`}>
                      {rank}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    {team.logo ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-background border-2 border-border">
                        <img
                          src={team.logo || "/placeholder.svg"}
                          alt={team.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: team.color + "33" }}
                      >
                        <span className="text-xs sm:text-sm font-bold" style={{ color: team.color }}>
                          {team.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{team.name}</p>
                      {qualified && (
                        <span className="text-[10px] text-green-600 font-medium">晉級準決賽</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className={`text-xs sm:text-sm font-bold ${stat.maisuu >= 0 ? "text-chart-2" : "text-destructive"}`}>
                      {stat.maisuu > 0 ? "+" : ""}{stat.maisuu}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-muted-foreground">—</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm text-foreground">{stat.hanChanPlayed}/126</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm font-medium text-foreground">{stat.firstPlaces}</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm font-medium text-foreground">{stat.secondPlaces}</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm font-medium text-foreground">{stat.thirdPlaces}</span>
                  </div>
                </div>
              )
            })}
          </div>

        </CardContent>
      )}
    </Card>
  )
}
