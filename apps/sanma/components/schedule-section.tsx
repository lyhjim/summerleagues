"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tv } from "lucide-react"
import { finalsSchedule, type FinalsMatch, FINALS_GAME_KEYS } from "@/lib/finals-schedule"
import { getTeamByName } from "@/lib/team-data"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useFinalsResults } from "@/lib/finals-results-context"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function translateDayOfWeek(dayOfWeek: string, t: Record<string, string>): string {
  const dayMap: Record<string, string> = {
    星期一: t.monday,
    星期二: t.tuesday,
    星期三: t.wednesday,
    星期四: t.thursday,
    星期五: t.friday,
    星期六: t.saturday,
    星期日: t.sunday,
  }
  return dayMap[dayOfWeek] || dayOfWeek
}

interface ScheduleSectionProps {
  preloadedResults?: any[]
  isLoading?: boolean
}

// Card rendering for a single finals match (3 teams)
function FinalsMatchCard({ match, blobResults }: { match: FinalsMatch; blobResults: Record<string, any> }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const matchData = blobResults[match.id]
  const hasResults = matchData?.results && FINALS_GAME_KEYS.some((k) => {
    const g = matchData.results[k]
    return Array.isArray(g) && g.some((p: any) => typeof p.rawScore === "number")
  })

  // Calculate team totals for winner highlight
  const teamChips: Record<string, number> = {}
  if (matchData?.results) {
    Object.values(matchData.results).forEach((gamePlayers: any) => {
      if (!Array.isArray(gamePlayers)) return
      gamePlayers.forEach((p: any) => {
        if (typeof p.rawScore !== "number") return
        teamChips[p.teamName] = (teamChips[p.teamName] || 0) + (p.finalChips || 0)
      })
    })
  }
  const maxChips = teamChips && Object.keys(teamChips).length > 0 ? Math.max(...Object.values(teamChips)) : null
  const winningTeam = maxChips !== null ? Object.keys(teamChips).find((k) => teamChips[k] === maxChips) || null : null

  const teams = match.teams.map((name) => getTeamByName(name)).filter(Boolean)

  const renderGameResults = (gameKey: string, gameIndex: number) => {
    const game: any[] = matchData?.results?.[gameKey]
    if (!Array.isArray(game) || !game.some((p) => typeof p.rawScore === "number")) return null
    // Rank by rawScore — penalty does not affect rank position
    const sorted = [...game].sort((a, b) => (b.rawScore ?? 0) - (a.rawScore ?? 0))
    return (
      <div key={gameKey} className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">{t.hanchan} {gameIndex + 1}</p>
        {sorted.map((player, idx) => {
          const rank = idx + 1
          const team = getTeamByName(player.teamName)
          const teamPlayer = team?.players.find((p) => p.name === player.playerName)
          const hasYakuman = Array.isArray(player.yakumans) && player.yakumans.some((y: any) => y.types?.length > 0)
          const rawChips = player.rawChips ?? 0
          const hasPenalty = player.penalty && player.penalty !== 0
          return (
            <Card
              key={`${player.playerName}-${gameKey}-${idx}`}
              className={`p-4 ${rank === 1 ? "bg-red-500/10 border-red-500/30" : rank === 2 ? "bg-green-500/10 border-green-500/30" : "bg-gray-500/10 border-gray-500/30"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded text-white font-bold text-sm ${rank === 1 ? "bg-red-500" : rank === 2 ? "bg-green-500" : "bg-gray-500"}`}>{rank}</div>
                  {teamPlayer?.photo ? (
                    <img src={teamPlayer.photo} alt={player.playerName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{player.playerName?.slice(0, 2)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {player.playerName}
                      {hasYakuman && <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-black rounded font-bold">役滿</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{player.teamName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-medium text-foreground">{((player.rawScore ?? 0) * 1000).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    ({rawChips > 0 ? "+" : ""}{rawChips})
                  </p>
                  <p className="text-sm mt-1">
                    <span className={(player.finalChips || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                      {(player.finalChips || 0) > 0 ? "+" : ""}{player.finalChips || 0}
                    </span>
                    {hasPenalty && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({player.penalty > 0 ? "+" : ""}{player.penalty} {player.penaltyReason})
                      </span>
                    )}
                  </p>
                  {hasYakuman && (
                    <p className="text-xs text-yellow-600 font-medium">
                      {player.yakumans
                        .filter((y: any) => y.types && y.types.length > 0)
                        .map((y: any) => y.types.join(", "))
                        .join(" / ")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderRoundSummary = () => {
    const totals: Record<string, number> = {}
    FINALS_GAME_KEYS.forEach((k) => {
      const game: any[] = matchData?.results?.[k]
      if (!Array.isArray(game)) return
      game.forEach((p: any) => {
        if (typeof p.rawScore !== "number") return
        const label = p.playerName || p.teamName
        totals[label] = (totals[label] || 0) + (p.finalChips || 0)
      })
    })
    const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)
    return (
      <div className="flex gap-3 mt-4">
        {sorted.map(([name, total], i) => (
          <div key={name} className="flex flex-col items-center gap-1 px-3 py-2 bg-muted rounded-lg relative">
            {i === 0 && <span className="absolute -top-6 text-lg">👑</span>}
            <span className="text-xs font-medium">{name}</span>
            <span className={`text-sm font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
              {total > 0 ? "+" : ""}{total}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${hasResults ? "cursor-pointer hover:shadow-xl hover:scale-[1.02]" : ""} ring-2 ring-yellow-500/40`}
        onClick={() => hasResults && setIsOpen(true)}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">R{match.round}</Badge>
                {hasResults && <Badge variant="default" className="bg-green-500/90 text-white">{t.completed || "完成"}</Badge>}
                <Badge variant="secondary" className="bg-red-500/90 text-white gap-1">
                  <Tv className="h-3 w-3" />{t.livestream || "直播"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{match.timeSlot}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            {teams.map((team) => {
              if (!team) return null
              const isWinner = hasResults && winningTeam === team.name
              const logoClass = hasResults && winningTeam && !isWinner ? "grayscale opacity-50" : ""
              return (
                <div key={team.id} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 relative transition-all ${logoClass}`}>
                    <img src={team.logo || "/placeholder.svg"} alt={team.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-center font-medium leading-tight">{team.name}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">R{match.round}</Badge>
              {match.date} {match.dayOfWeek} {match.timeSlot}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {hasResults ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-primary">比賽結果</h3>
                  {renderRoundSummary()}
                </div>
                {FINALS_GAME_KEYS.map((key, i) => renderGameResults(key, i))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">尚無比賽結果</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ScheduleSection({ preloadedResults, isLoading: parentLoading }: ScheduleSectionProps = {}) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(parentLoading ?? true)
  // Use shared finals results from context
  const { results: blobResults } = useFinalsResults()

  useEffect(() => {
    if (preloadedResults !== undefined || !parentLoading) {
      setIsLoading(false)
    }
  }, [preloadedResults, parentLoading])


  function FinalsDayCard({ date, dayOfWeek, matches }: { date: string; dayOfWeek: string; matches: FinalsMatch[] }) {
    return (
      <Card className="border-yellow-500/30 shadow-xl shadow-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-yellow-600" />
            {translateDayOfWeek(dayOfWeek, t)} - {date}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <FinalsMatchCard key={match.id} match={match} blobResults={blobResults} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group finals matches by date
  const matchesByDate = finalsSchedule.reduce(
    (acc, match) => {
      if (!acc[match.date]) acc[match.date] = { dayOfWeek: match.dayOfWeek, matches: [] }
      acc[match.date].matches.push(match)
      return acc
    },
    {} as Record<string, { dayOfWeek: string; matches: FinalsMatch[] }>,
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-yellow-600">決賽 Finals</h2>
        <p className="text-muted-foreground mt-1">決賽共8輪24個半莊</p>
      </div>
      {isLoading ? (
        <Card className="border-yellow-500/20">
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(matchesByDate).map(([date, { dayOfWeek, matches }]) => (
          <FinalsDayCard key={date} date={date} dayOfWeek={dayOfWeek} matches={matches} />
        ))
      )}
      <div className="text-center">
        <Link href="/schedule" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
          {t.viewFullSchedule} →
        </Link>
      </div>
    </div>
  )
}
