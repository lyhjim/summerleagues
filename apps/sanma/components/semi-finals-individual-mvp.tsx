"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { teams } from "@/lib/team-data"
import { useFinalsResults } from "@/lib/finals-results-context"
import { useLanguage } from "@/lib/language-context"

interface PlayerStat {
  playerName: string
  teamName: string
  totalChips: number
  teamColor: string
  teamLogo: string
}

export function SemiFinalsIndividualMVP() {
  const { t } = useLanguage()
  const { results: blobData } = useFinalsResults()
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([])

  useEffect(() => {
    const playerChips: Record<string, PlayerStat> = {}
    const processedGames = new Set<string>()

    Object.entries(blobData).forEach(([matchKey, match]: [string, any]) => {
      if (!match?.results) return
      Object.entries(match.results).forEach(([gameKey, gamePlayers]: [string, any]) => {
        if (!Array.isArray(gamePlayers)) return
        gamePlayers.forEach((player: any) => {
          if (!player?.playerName || typeof player.rawScore !== "number") return
          const gameId = `${matchKey}-${gameKey}-${player.playerName}`
          if (processedGames.has(gameId)) return
          processedGames.add(gameId)

          const key = `${player.teamName}|${player.playerName}`
          const team = teams.find((t) => t.name === player.teamName)
          if (!playerChips[key]) {
            playerChips[key] = {
              playerName: player.playerName,
              teamName: player.teamName,
              totalChips: 0,
              teamColor: team?.color || "#888",
              teamLogo: team?.logo || "",
            }
          }
          playerChips[key].totalChips += player.finalChips || 0
        })
      })
    })

    const sorted = Object.values(playerChips)
      .sort((a, b) => b.totalChips - a.totalChips)
      .slice(0, 5)

    setTopPlayers(sorted)
  }, [blobData])

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-bold">個人枚數 MVP (決賽)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[36px_1fr_64px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border mb-2">
          <div>{t.rank || "名次"}</div>
          <div>{t.player || "選手"}</div>
          <div className="text-right">{t.maisuu || "枚數"}</div>
        </div>

        {topPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">尚無記錄 No records yet</p>
        ) : (
          <div className="space-y-1">
            {topPlayers.map((player, index) => {
              const rank = index + 1
              const rankColor =
                rank === 1 ? "bg-yellow-500 text-white" :
                rank === 2 ? "bg-gray-400 text-white" :
                rank === 3 ? "bg-amber-600 text-white" :
                "bg-muted text-muted-foreground"

              return (
                <div
                  key={`${player.teamName}-${player.playerName}`}
                  className="grid grid-cols-[36px_1fr_64px] gap-2 px-3 py-2 rounded-lg bg-muted/30 items-center"
                >
                  <div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${rankColor}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    {player.teamLogo ? (
                      <img
                        src={player.teamLogo}
                        alt={player.teamName}
                        className="w-5 h-5 rounded-full object-contain shrink-0"
                      />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: player.teamColor }}
                      >
                        {player.teamName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{player.playerName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{player.teamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${player.totalChips > 0 ? "text-chart-2" : player.totalChips < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {player.totalChips > 0 ? "+" : ""}{player.totalChips}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
