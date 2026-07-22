"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { teams } from "@/lib/team-data"
import { getStaticMatchResults } from "@/lib/static-match-results"

export function SemiFinalsMVPRanking() {
  const { t } = useLanguage()

  const playerStats = calculateSemiFinalsStats()

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          準決賽 MVP Individual Ranking
        </CardTitle>
        <CardDescription>
          Top players in semi-finals (準決賽) matches only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {playerStats
            .sort((a, b) => b.totalChips - a.totalChips)
            .slice(0, 15)
            .map((player, index) => {
              const team = teams.find((t) => t.name === player.teamName)
              return (
                <div
                  key={`${player.teamName}-${player.playerName}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary w-6 text-center shrink-0">
                      {index + 1}
                    </span>
                    {team?.logo && (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-5 h-5 rounded-full object-contain shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{player.playerName}</p>
                      <p className="text-[10px] text-muted-foreground">{player.teamName}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      player.totalChips >= 0 ? "text-chart-2" : "text-destructive"
                    }`}
                  >
                    {player.totalChips > 0 ? "+" : ""}
                    {player.totalChips}
                  </span>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}

function calculateSemiFinalsStats() {
  const playerStats: Record<
    string,
    {
      playerName: string
      teamName: string
      totalChips: number
    }
  > = {}

  const allResults = getStaticMatchResults()

  // For now, all semi-finals are at 0 since they haven't started
  // This will be populated once semi-finals matches are played
  // The data structure is ready to track semi-finals only

  return Object.values(playerStats)
}
