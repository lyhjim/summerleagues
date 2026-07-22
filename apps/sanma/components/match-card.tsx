"use client"

import { useState, useEffect } from "react"
import type { Match } from "@/lib/match-data"
import { getTeamByName } from "@/lib/team-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tv } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface MatchCardProps {
  match: Match
  preloadedResults?: any[] // Changed from single object to array
}

function calculateTeamChips(results: any): Record<string, number> {
  const teamChips: Record<string, number> = {}

  if (!results) return teamChips

  const processGame = (game: any[]) => {
    if (!game) return
    game.forEach((player) => {
      const teamName = player.teamName
      const chips = player.finalChips || 0
      teamChips[teamName] = (teamChips[teamName] || 0) + chips
    })
  }

  // Process all games
  processGame(results.game1)
  processGame(results.game2)
  processGame(results.game3)

  return teamChips
}

function getMatchResults(matchId: string, preloadedResults?: any[]) {
  const results: { round1?: any; round2?: any } = {}

  // Use preloaded results if available
  if (preloadedResults && preloadedResults.length > 0) {
    preloadedResults.forEach((result) => {
      if (result.match_id === matchId || result.matchId === matchId) {
        const round = result.round
        const resultsData = result.results
        if (round === "round1") {
          results.round1 = resultsData
        } else if (round === "round2") {
          results.round2 = resultsData
        }
      }
    })
    return results
  }

  // Fall back to localStorage
  if (typeof window === "undefined") return results

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(`results-${matchId}`)) continue

    try {
      const data = JSON.parse(localStorage.getItem(key) || "{}")
      if (data.round === "round1") {
        results.round1 = data.results
      } else if (data.round === "round2") {
        results.round2 = data.results
      }
    } catch (e) {
      console.error("[v0] Error reading match result:", e)
    }
  }

  return results
}

export function MatchCard({ match, preloadedResults }: MatchCardProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [matchResults, setMatchResults] = useState<{ round1?: any; round2?: any }>({})
  const [hasResultsState, setHasResultsState] = useState(false)
  const [winningTeams, setWinningTeams] = useState<string[]>([])

  const teams = match.teams.map((teamName) => getTeamByName(teamName)).filter(Boolean)

  const matchId = `${match.date}-${match.table}`

  const loadResultsAndCalculateWinners = () => {
    const results = getMatchResults(matchId, preloadedResults) // Pass full array
    setMatchResults(results)
    const hasData = !!(results.round1 || results.round2)
    setHasResultsState(hasData)

    if (hasData) {
      const totalChips: Record<string, number> = {}
      if (results.round1) {
        const round1Chips = calculateTeamChips(results.round1)
        Object.entries(round1Chips).forEach(([team, chips]) => {
          totalChips[team] = (totalChips[team] || 0) + chips
        })
      }
      if (results.round2) {
        const round2Chips = calculateTeamChips(results.round2)
        Object.entries(round2Chips).forEach(([team, chips]) => {
          totalChips[team] = (totalChips[team] || 0) + chips
        })
      }

      const maxChips = Math.max(...Object.values(totalChips))
      const winners = Object.keys(totalChips).filter((team) => totalChips[team] === maxChips)
      setWinningTeams(winners)
    }
  }

  useEffect(() => {
    loadResultsAndCalculateWinners()

    const handleUpdate = () => {
      loadResultsAndCalculateWinners()
    }

    window.addEventListener("resultsSubmitted", handleUpdate)
    window.addEventListener("resultsUpdated", handleUpdate)
    window.addEventListener("livestreamLinksUpdated", handleUpdate)

    return () => {
      window.removeEventListener("resultsSubmitted", handleUpdate)
      window.removeEventListener("resultsUpdated", handleUpdate)
      window.removeEventListener("livestreamLinksUpdated", handleUpdate)
    }
  }, [matchId, preloadedResults]) // Updated dependency

  const livestreamUrl =
    match.livestreamUrl ||
    (() => {
      if (typeof window === "undefined") return undefined
      const livestreamLinks = JSON.parse(localStorage.getItem("livestreamLinks") || "{}")
      return livestreamLinks[matchId]
    })()

  const shouldShowLivestreamBadge = match.isLivestream || livestreamUrl
  const hasLivestreamUrl = !!livestreamUrl

  const renderGameResults = (game: any[], gameIndex: number) => {
    if (!game || game.length === 0) return null

    const seatOrder = { 東: 0, 南: 1, 西: 2 }
    const sortedPlayers = [...game].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      const aSeatOrder = seatOrder[a.seat as keyof typeof seatOrder] ?? 99
      const bSeatOrder = seatOrder[b.seat as keyof typeof seatOrder] ?? 99
      return aSeatOrder - bSeatOrder
    })

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">
          {t.hanchan} {gameIndex + 1}
        </p>
        {sortedPlayers.map((player, idx) => {
          const rank = idx + 1
          const team = getTeamByName(player.teamName)
          const teamPlayer = team?.players.find((p) => p.name === player.playerName)

          const hasYakuman =
            player.yakumans &&
            player.yakumans.length > 0 &&
            player.yakumans.some((y: any) => y.types && y.types.length > 0)

          const rawChips = player.rawChips ?? 0

          return (
            <Card
              key={`${player.playerName}-${gameIndex}-${idx}`}
              className={`p-4 ${
                rank === 1
                  ? "bg-red-500/10 border-red-500/30"
                  : rank === 2
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-gray-500/10 border-gray-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded text-white font-bold text-sm ${
                      rank === 1 ? "bg-red-500" : rank === 2 ? "bg-green-500" : "bg-gray-500"
                    }`}
                  >
                    {rank}
                  </div>
                  {teamPlayer?.photo ? (
                    <img
                      src={teamPlayer.photo || "/placeholder.svg"}
                      alt={player.playerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{player.playerName.slice(0, 2)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {player.playerName}
                      {hasYakuman && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-black rounded font-bold">
                          役滿
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{player.teamName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-medium text-foreground">{(player.score * 1000).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    ({rawChips > 0 ? "+" : ""}
                    {rawChips})
                  </p>
                  <p className="text-sm mt-1">
                    {player.penalty && player.penalty !== 0 ? (
                      <span
                        className={
                          (player.calculatedChips + player.rawChips || 0) >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {(player.calculatedChips + player.rawChips || 0) > 0 ? "+" : ""}
                        {player.calculatedChips + player.rawChips || 0}
                        <span className="text-muted-foreground ml-1">
                          ({player.penalty > 0 ? "+" : ""}
                          {player.penalty} {player.penaltyReason})
                        </span>
                      </span>
                    ) : (
                      <span className={(player.finalChips || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                        {(player.finalChips || 0) > 0 ? "+" : ""}
                        {player.finalChips || 0}
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

  const calculateRoundSummary = (roundData: any) => {
    if (!roundData) return null

    const playerTotals: Record<string, number> = {}

    const processGame = (game: any[]) => {
      if (!game) return
      game.forEach((player) => {
        const name = player.playerName
        const chips = player.finalChips || 0
        playerTotals[name] = (playerTotals[name] || 0) + chips
      })
    }

    processGame(roundData.game1)
    processGame(roundData.game2)
    processGame(roundData.game3)

    // Sort players by total chips (highest to lowest)
    const sortedPlayers = Object.entries(playerTotals).sort((a, b) => b[1] - a[1])

    return (
      <div className="flex gap-3 mt-6">
        {sortedPlayers.map(([name, total], index) => (
          <div key={name} className="flex flex-col items-center gap-1 px-3 py-2 bg-muted rounded-lg relative">
            {index === 0 && <span className="absolute -top-6 text-lg">👑</span>}
            <span className="text-xs font-medium text-foreground">{name}</span>
            <span className={`text-sm font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
              {total > 0 ? "+" : ""}
              {total}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          hasResultsState ? "cursor-pointer hover:shadow-xl hover:scale-[1.02]" : ""
        }`}
        onClick={() => hasResultsState && setIsOpen(true)}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {match.table}
                </Badge>
                {hasResultsState && (
                  <Badge variant="default" className="bg-green-500/90 text-white">
                    {t.completed}
                  </Badge>
                )}
                {shouldShowLivestreamBadge &&
                  (hasLivestreamUrl ? (
                    <a
                      href={livestreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex"
                    >
                      <Badge
                        variant="secondary"
                        className="bg-red-500/90 text-white gap-1 hover:bg-red-600/90 transition-colors"
                      >
                        <Tv className="h-3 w-3" />
                        {t.livestream || "直播"}
                      </Badge>
                    </a>
                  ) : (
                    <Badge variant="secondary" className="bg-red-500/90 text-white gap-1">
                      <Tv className="h-3 w-3" />
                      {t.livestream || "直播"}
                    </Badge>
                  ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {match.date} {match.dayOfWeek}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            {teams.map((team) => {
              if (!team) return null

              const isWinner =
                winningTeams.length > 0 ? winningTeams.includes(team.name) : match.winnerTeam === team.name

              // Only apply grayscale if we have results AND team is not a winner
              const logoStyle = hasResultsState && winningTeams.length > 0 && !isWinner ? "grayscale opacity-60" : ""

              return (
                <div key={team.id} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-16 h-16 relative ${logoStyle} transition-all`}>
                    <img
                      src={team.logo || "/placeholder.svg"}
                      alt={team.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-center font-medium text-foreground">{team.name}</p>
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
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {match.table}
              </Badge>
              {match.date} {match.dayOfWeek}
              {shouldShowLivestreamBadge &&
                (hasLivestreamUrl ? (
                  <a href={livestreamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                    <Badge
                      variant="secondary"
                      className="bg-red-500/90 text-white gap-1 hover:bg-red-600/90 transition-colors"
                    >
                      <Tv className="h-3 w-3" />
                      {t.livestream || "直播"}
                    </Badge>
                  </a>
                ) : (
                  <Badge variant="secondary" className="bg-red-500/90 text-white gap-1">
                    <Tv className="h-3 w-3" />
                    {t.livestream || "直播"}
                  </Badge>
                ))}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Round 1 from preloaded/localStorage */}
            {matchResults.round1 && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-lg font-semibold text-primary">{t.round1}</h3>
                  {calculateRoundSummary(matchResults.round1)}
                </div>
                {renderGameResults(matchResults.round1.game1, 0)}
                {renderGameResults(matchResults.round1.game2, 1)}
                {renderGameResults(matchResults.round1.game3, 2)}
              </div>
            )}

            {/* Round 2 from preloaded/localStorage */}
            {matchResults.round2 && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-lg font-semibold text-primary">{t.round2}</h3>
                  {calculateRoundSummary(matchResults.round2)}
                </div>
                {renderGameResults(matchResults.round2.game1, 3)}
                {renderGameResults(matchResults.round2.game2, 4)}
                {renderGameResults(matchResults.round2.game3, 5)}
              </div>
            )}

            {/* Fallback to static data if no preloaded/localStorage results */}
            {!matchResults.round1 && !matchResults.round2 && match.rounds && (
              <>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary">{t.round1}</h3>
                  {[0, 1, 2].map((gameIndex) => (
                    <div key={gameIndex} className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        {t.hanchan} {gameIndex + 1}
                      </p>
                      {match.rounds.round1.slice(gameIndex * 3, gameIndex * 3 + 3).map((game, idx) => (
                        <Card
                          key={`${game.playerName}-${gameIndex}-${idx}`}
                          className={`p-4 ${
                            game.rank === 1
                              ? "bg-red-500/10 border-red-500/30"
                              : game.rank === 2
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-gray-500/10 border-gray-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-8 h-8 flex items-center justify-center rounded text-white font-bold text-sm ${
                                  game.rank === 1 ? "bg-red-500" : game.rank === 2 ? "bg-green-500" : "bg-gray-500"
                                }`}
                              >
                                {game.rank}
                              </div>
                              {game.playerPhoto ? (
                                <img
                                  src={game.playerPhoto || "/placeholder.svg"}
                                  alt={game.playerName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">{game.playerName.slice(0, 2)}</span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-foreground">{game.playerName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-medium text-foreground">{game.score.toLocaleString()}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {!matchResults.round1 && !matchResults.round2 && !match.rounds && (
              <div className="text-center py-8 text-muted-foreground">尚無比賽結果</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
