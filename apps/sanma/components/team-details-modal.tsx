"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Team } from "@/lib/team-data"
import { useLanguage } from "@/lib/language-context"
import { useSemiFinalsResults } from "@/lib/semi-finals-results-context"
import { useFinalsResults } from "@/lib/finals-results-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { getStaticMatchResults } from "@/lib/static-match-results"
import { getTopNineTeamsForSemiFinals } from "@/lib/archived-phase-data"
import { createClient } from "@/lib/supabase-client"

interface TeamDetailsModalProps {
  team: Team | null
  isOpen: boolean
  onClose: () => void
}

type PlayerStats = {
  games: number
  totalPoints: number
  highestSingleRound: number
  firstPlace: number
  secondPlace: number
  thirdPlace: number
  yakumanCount: number
  yakumans: Array<{ types: string[]; photo?: string }>
}

function emptyStats(): PlayerStats {
  return {
    games: 0,
    totalPoints: 0,
    highestSingleRound: 0,
    firstPlace: 0,
    secondPlace: 0,
    thirdPlace: 0,
    yakumanCount: 0,
    yakumans: [],
  }
}

function calculatePlayerStatsFromResults(
  teamName: string,
  playerName: string,
  allResults: any[]
): PlayerStats {
  const stats: PlayerStats = {
    games: 0,
    totalPoints: 0,
    highestSingleRound: 0,
    firstPlace: 0,
    secondPlace: 0,
    thirdPlace: 0,
    yakumanCount: 0,
    yakumans: [],
  }

  const roundChips: Record<string, number> = {}

  allResults.forEach((result) => {
    try {
      const matchId = result.match_id || result.matchId
      const round = result.round
      const roundKey = `${matchId}-${round}`
      const games = [result.results?.game1, result.results?.game2, result.results?.game3].filter(Boolean)

      games.forEach((game: any[]) => {
        if (!game) return
        game.forEach((player) => {
          if (player.teamName === teamName && player.playerName === playerName) {
            stats.games += 1
            stats.totalPoints += player.finalChips || 0
            roundChips[roundKey] = (roundChips[roundKey] || 0) + (player.finalChips || 0)

            const seatOrder = { 東: 0, 南: 1, 西: 2 }
            const sortedPlayers = [...game].sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score
              return (seatOrder[a.seat as keyof typeof seatOrder] ?? 99) - (seatOrder[b.seat as keyof typeof seatOrder] ?? 99)
            })
            const rank = sortedPlayers.findIndex((p) => p.playerName === playerName && p.teamName === teamName) + 1
            if (rank === 1) stats.firstPlace += 1
            else if (rank === 2) stats.secondPlace += 1
            else if (rank === 3) stats.thirdPlace += 1

            if (player.yakumans && Array.isArray(player.yakumans)) {
              player.yakumans.forEach((y: any) => {
                if (y.types && y.types.length > 0) {
                  stats.yakumanCount += 1
                  stats.yakumans.push({ types: y.types, photo: y.photoUrl || y.photo })
                }
              })
            }
          }
        })
      })
    } catch (e) {
      console.error("[v0] Error calculating player stats:", e)
    }
  })

  const roundChipsValues = Object.values(roundChips)
  stats.highestSingleRound = roundChipsValues.length > 0 ? Math.max(...roundChipsValues) : 0
  return stats
}

// Compute global chip rankings across ALL players from all results
function computeGlobalRankings(allResults: any[]) {
  const totalChips: Record<string, number> = {}
  const roundChips: Record<string, Record<string, number>> = {}

  allResults.forEach((result) => {
    try {
      const matchId = result.match_id || result.matchId
      const round = result.round
      const games = [result.results?.game1, result.results?.game2, result.results?.game3].filter(Boolean)
      games.forEach((game: any[]) => {
        if (!game) return
        game.forEach((player) => {
          const key = `${player.teamName}|${player.playerName}`
          totalChips[key] = (totalChips[key] || 0) + (player.finalChips || 0)
          const roundKey = `${matchId}-${round}`
          if (!roundChips[key]) roundChips[key] = {}
          roundChips[key][roundKey] = (roundChips[key][roundKey] || 0) + (player.finalChips || 0)
        })
      })
    } catch (e) {
      // ignore
    }
  })

  // Rank by total chips
  const totalEntries = Object.entries(totalChips).sort((a, b) => b[1] - a[1])
  const totalRankMap: Record<string, number> = {}
  totalEntries.forEach(([key, val], idx, arr) => {
    if (idx === 0) totalRankMap[key] = 1
    else if (val === arr[idx - 1][1]) totalRankMap[key] = totalRankMap[arr[idx - 1][0]]
    else totalRankMap[key] = idx + 1
  })

  // Rank by highest single round
  const highestRoundEntries = Object.entries(roundChips)
    .map(([key, rounds]) => ({ key, value: Math.max(...Object.values(rounds), 0) }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
  const highestRoundRankMap: Record<string, number> = {}
  highestRoundEntries.forEach((entry, idx, arr) => {
    if (idx === 0) highestRoundRankMap[entry.key] = 1
    else if (entry.value === arr[idx - 1].value) highestRoundRankMap[entry.key] = highestRoundRankMap[arr[idx - 1].key]
    else highestRoundRankMap[entry.key] = idx + 1
  })

  return { totalRankMap, highestRoundRankMap }
}

export function TeamDetailsModal({ team, isOpen, onClose }: TeamDetailsModalProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [memberPrelimStats, setMemberPrelimStats] = useState<Record<string, PlayerStats>>({})
  const [memberSemiStats, setMemberSemiStats] = useState<Record<string, PlayerStats>>({})
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ url: string; types: string[] } | null>(null)
  const [globalRankings, setGlobalRankings] = useState<{
    totalRankMap: Record<string, number>
    highestRoundRankMap: Record<string, number>
  }>({ totalRankMap: {}, highestRoundRankMap: {} })

  const [semiGlobalRankings, setSemiGlobalRankings] = useState<{
    totalRankMap: Record<string, number>
    highestSingleRankMap: Record<string, number>
  }>({ totalRankMap: {}, highestSingleRankMap: {} })

  const [memberFinalsStats, setMemberFinalsStats] = useState<Record<string, PlayerStats>>({})
  const [finalsGlobalRankings, setFinalsGlobalRankings] = useState<{
    totalRankMap: Record<string, number>
    highestSingleRankMap: Record<string, number>
  }>({ totalRankMap: {}, highestSingleRankMap: {} })

  const FINALS_TEAMS = new Set(["缺五五番", "剛滿20歲", "大西北3兄弟"])

  const topNineNames = new Set(getTopNineTeamsForSemiFinals().map((t) => t.name))
  const isInSemiFinals = team ? topNineNames.has(team.name) : false
  const isInFinals = team ? FINALS_TEAMS.has(team.name) : false
  const { results: semiFinalsBlob } = useSemiFinalsResults()
  const { results: finalsBlob } = useFinalsResults()

  useEffect(() => {
    if (isOpen && team) {
      setIsLoading(true)

      const load = async () => {
        // Preliminary stats from static file
        const prelimResults = getStaticMatchResults()
        setGlobalRankings(computeGlobalRankings(prelimResults))

        const prelim: Record<string, PlayerStats> = {}
        const semi: Record<string, PlayerStats> = {}

        for (const player of team.players) {
          prelim[player.name] = calculatePlayerStatsFromResults(team.name, player.name, prelimResults)
          semi[player.name] = emptyStats()
        }

        // Use semi-finals results from shared context
        const processedGames = new Set<string>()
        Object.entries(semiFinalsBlob).forEach(([matchKey, match]: [string, any]) => {
          if (!match?.results) return
          Object.entries(match.results).forEach(([gameKey, gamePlayers]: [string, any]) => {
            if (!Array.isArray(gamePlayers)) return
            gamePlayers.forEach((player: any) => {
              if (player.teamName !== team.name) return
              const pName = player.playerName
              if (!pName || !semi[pName]) return
              if (typeof player.rawScore !== "number") return

              const gameId = `${matchKey}-${gameKey}-${pName}`
              if (processedGames.has(gameId)) return
              processedGames.add(gameId)

              semi[pName].totalPoints += player.finalChips || 0
              if (player.finalChips > semi[pName].highestSingleRound) {
                semi[pName].highestSingleRound = player.finalChips
              }
              if (player.rank === 1) semi[pName].firstPlace += 1
              else if (player.rank === 2) semi[pName].secondPlace += 1
              else if (player.rank === 3) semi[pName].thirdPlace += 1

              if (Array.isArray(player.yakumans)) {
                player.yakumans.forEach((y: any) => {
                  if (y.types && y.types.length > 0) {
                    semi[pName].yakumanCount += 1
                    semi[pName].yakumans.push({ types: y.types, photo: y.photoUrl || y.photo })
                  }
                })
              }
            })
          })
        })

        // Derive games played from placements
        for (const pName of Object.keys(semi)) {
          const s = semi[pName]
          s.games = s.firstPlace + s.secondPlace + s.thirdPlace
        }

        // Compute semi-finals global rankings across ALL teams from Blob
        const semiTotalChips: Record<string, number> = {}
        const semiHighestSingle: Record<string, number> = {}
        const processedGames2 = new Set<string>()

        Object.entries(semiFinalsBlob).forEach(([matchKey, match]: [string, any]) => {
          if (!match?.results) return
          Object.entries(match.results).forEach(([gameKey, gamePlayers]: [string, any]) => {
            if (!Array.isArray(gamePlayers)) return
            gamePlayers.forEach((player: any) => {
              if (!player?.playerName || typeof player.rawScore !== "number") return
              const gameId = `${matchKey}-${gameKey}-${player.playerName}`
              if (processedGames2.has(gameId)) return
              processedGames2.add(gameId)
              const key = `${player.teamName}|${player.playerName}`
              semiTotalChips[key] = (semiTotalChips[key] || 0) + (player.finalChips || 0)
              if ((player.finalChips || 0) > (semiHighestSingle[key] || 0)) {
                semiHighestSingle[key] = player.finalChips || 0
              }
            })
          })
        })

        // Rank by total chips
        const totalEntries = Object.entries(semiTotalChips).sort((a, b) => b[1] - a[1])
        const semiTotalRankMap: Record<string, number> = {}
        totalEntries.forEach(([key, val], idx, arr) => {
          if (idx === 0) semiTotalRankMap[key] = 1
          else if (val === arr[idx - 1][1]) semiTotalRankMap[key] = semiTotalRankMap[arr[idx - 1][0]]
          else semiTotalRankMap[key] = idx + 1
        })

        // Rank by highest single game
        const highestEntries = Object.entries(semiHighestSingle).sort((a, b) => b[1] - a[1])
        const semiHighestRankMap: Record<string, number> = {}
        highestEntries.forEach(([key, val], idx, arr) => {
          if (idx === 0) semiHighestRankMap[key] = 1
          else if (val === arr[idx - 1][1]) semiHighestRankMap[key] = semiHighestRankMap[arr[idx - 1][0]]
          else semiHighestRankMap[key] = idx + 1
        })

        setSemiGlobalRankings({ totalRankMap: semiTotalRankMap, highestSingleRankMap: semiHighestRankMap })

        // Finals stats - same pattern as semi-finals
        const finals: Record<string, PlayerStats> = {}
        for (const player of team.players) {
          finals[player.name] = emptyStats()
        }

        const processedGames3 = new Set<string>()
        const finalsTotalChips: Record<string, number> = {}
        const finalsHighestSingle: Record<string, number> = {}

        Object.entries(finalsBlob).forEach(([matchKey, match]: [string, any]) => {
          if (!match?.results) return
          Object.entries(match.results).forEach(([gameKey, gamePlayers]: [string, any]) => {
            if (!Array.isArray(gamePlayers)) return
            gamePlayers.forEach((player: any) => {
              if (!player?.playerName || typeof player.rawScore !== "number") return
              const gameId = `${matchKey}-${gameKey}-${player.playerName}`

              // Global rankings across all finals teams
              if (!processedGames3.has(gameId)) {
                processedGames3.add(gameId)
                const key = `${player.teamName}|${player.playerName}`
                finalsTotalChips[key] = (finalsTotalChips[key] || 0) + (player.finalChips || 0)
                if ((player.finalChips || 0) > (finalsHighestSingle[key] || 0)) {
                  finalsHighestSingle[key] = player.finalChips || 0
                }
              }

              // Per-player stats for this team
              if (player.teamName !== team.name) return
              const pName = player.playerName
              if (!pName || !finals[pName]) return

              finals[pName].totalPoints += player.finalChips || 0
              if (player.finalChips > finals[pName].highestSingleRound) {
                finals[pName].highestSingleRound = player.finalChips
              }
              if (player.rank === 1) finals[pName].firstPlace += 1
              else if (player.rank === 2) finals[pName].secondPlace += 1
              else if (player.rank === 3) finals[pName].thirdPlace += 1

              if (Array.isArray(player.yakumans)) {
                player.yakumans.forEach((y: any) => {
                  if (y.types && y.types.length > 0) {
                    finals[pName].yakumanCount += 1
                    finals[pName].yakumans.push({ types: y.types, photo: y.photoUrl || y.photo })
                  }
                })
              }
            })
          })
        })

        for (const pName of Object.keys(finals)) {
          const s = finals[pName]
          s.games = s.firstPlace + s.secondPlace + s.thirdPlace
        }

        // Finals global rankings
        const finalsTotalEntries = Object.entries(finalsTotalChips).sort((a, b) => b[1] - a[1])
        const finalsTotalRankMap: Record<string, number> = {}
        finalsTotalEntries.forEach(([key, val], idx, arr) => {
          if (idx === 0) finalsTotalRankMap[key] = 1
          else if (val === arr[idx - 1][1]) finalsTotalRankMap[key] = finalsTotalRankMap[arr[idx - 1][0]]
          else finalsTotalRankMap[key] = idx + 1
        })
        const finalsHighestEntries = Object.entries(finalsHighestSingle).sort((a, b) => b[1] - a[1])
        const finalsHighestRankMap: Record<string, number> = {}
        finalsHighestEntries.forEach(([key, val], idx, arr) => {
          if (idx === 0) finalsHighestRankMap[key] = 1
          else if (val === arr[idx - 1][1]) finalsHighestRankMap[key] = finalsHighestRankMap[arr[idx - 1][0]]
          else finalsHighestRankMap[key] = idx + 1
        })

        setFinalsGlobalRankings({ totalRankMap: finalsTotalRankMap, highestSingleRankMap: finalsHighestRankMap })
        setMemberFinalsStats(finals)
        setMemberPrelimStats(prelim)
        setMemberSemiStats(semi)
        setIsLoading(false)
      }

      load()
    }
  }, [isOpen, team, semiFinalsBlob, finalsBlob])

  if (!team) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {enlargedPhoto && (
          <Dialog open={!!enlargedPhoto} onOpenChange={() => setEnlargedPhoto(null)}>
            <DialogContent className="max-w-3xl p-2 z-[100]">
              <div className="flex flex-col items-center">
                <img
                  src={enlargedPhoto.url || "/placeholder.svg"}
                  alt="Yakuman"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                <p className="text-sm font-medium mt-2">{enlargedPhoto.types.join(", ")}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {team && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {team.logo ? (
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden border-2 flex items-center justify-center"
                    style={{ borderColor: team.color }}
                  >
                    <img
                      src={team.logo || "/placeholder.svg"}
                      alt={team.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: team.color + "33",
                      border: `2px solid ${team.color}`,
                    }}
                  >
                    <span className="text-xl font-bold" style={{ color: team.color }}>
                      {team.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground">{team.name}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            {/* Team Photo Section */}
            {team.teamPhoto && (
              <div className="mb-6 rounded-lg overflow-hidden border border-border">
                <img
                  src={team.teamPhoto || "/placeholder.svg"}
                  alt={`${team.name} team photo`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Team Members */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" />
                {t.teamMembers}
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                team.players.map((player, index) => {
                  const prelimStats = memberPrelimStats[player.name] || {
                    games: 0,
                    totalPoints: 0,
                    highestSingleRound: 0,
                    firstPlace: 0,
                    secondPlace: 0,
                    thirdPlace: 0,
                    yakumanCount: 0,
                    yakumans: [],
                  }

                  const semiStats = memberSemiStats[player.name] || {
                    games: 0,
                    totalPoints: 0,
                    highestSingleRound: 0,
                    firstPlace: 0,
                    secondPlace: 0,
                    thirdPlace: 0,
                    yakumanCount: 0,
                    yakumans: [],
                  }

                  const finalsStats = memberFinalsStats[player.name] || {
                    games: 0,
                    totalPoints: 0,
                    highestSingleRound: 0,
                    firstPlace: 0,
                    secondPlace: 0,
                    thirdPlace: 0,
                    yakumanCount: 0,
                    yakumans: [],
                  }

                  return (
                    <div
                      key={index}
                      className="rounded-lg bg-secondary/50 hover:bg-secondary transition-colors overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="w-16 h-16">
                          {player.photo && (
                            <AvatarImage
                              src={player.photo || "/placeholder.svg"}
                              alt={player.name}
                              className="object-cover object-[center_20%]"
                            />
                          )}
                          <AvatarFallback style={{ backgroundColor: team.color + "33", color: team.color }}>
                            {player.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                          {player.role && <p className="text-xs text-muted-foreground">{player.role}</p>}
                        </div>
                      </div>

                      <div className="px-3 pb-3 pt-1 border-t border-border/50">
                        {/* Preliminary Phase Stats */}
                        <div className="mb-4">
                          <Badge variant="outline" className="mb-2">初賽</Badge>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div className="text-center p-2 rounded bg-background/50">
                              <p className="text-lg font-bold text-foreground">{prelimStats.games}</p>
                              <p className="text-xs text-muted-foreground">{t.games}</p>
                            </div>
                            <div className="text-center p-2 rounded bg-background/50 relative">
                              <p
                                className={`text-lg font-bold ${prelimStats.totalPoints >= 0 ? "text-chart-2" : "text-destructive"}`}
                              >
                                {prelimStats.totalPoints > 0 ? "+" : ""}
                                {prelimStats.totalPoints}
                              </p>
                              <p className="text-xs text-muted-foreground">{t.totalPoints}</p>
                              {(() => {
                                const key = `${team.name}|${player.name}`
                                const rank = globalRankings.totalRankMap[key]
                                return rank ? (
                                  <span className="absolute top-1 right-1 text-[10px] font-bold text-primary leading-none">
                                    {rank}名
                                  </span>
                                ) : null
                              })()}
                            </div>
                            <div className="text-center p-2 rounded bg-background/50 relative">
                              <p
                                className={`text-lg font-bold ${prelimStats.highestSingleRound >= 0 ? "text-chart-2" : "text-destructive"}`}
                              >
                                {prelimStats.highestSingleRound > 0 ? "+" : ""}
                                {prelimStats.highestSingleRound}
                              </p>
                              <p className="text-xs text-muted-foreground">{t.highestRound}</p>
                              {(() => {
                                const key = `${team.name}|${player.name}`
                                const rank = globalRankings.highestRoundRankMap[key]
                                return rank ? (
                                  <span className="absolute top-1 right-1 text-[10px] font-bold text-primary leading-none">
                                    {rank}名
                                  </span>
                                ) : null
                              })()}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center p-2 rounded bg-background/50">
                              <p className="text-base font-bold text-primary">{prelimStats.firstPlace}</p>
                              <p className="text-xs text-muted-foreground">{t.first}</p>
                            </div>
                            <div className="text-center p-2 rounded bg-background/50">
                              <p className="text-base font-bold text-chart-2">{prelimStats.secondPlace}</p>
                              <p className="text-xs text-muted-foreground">{t.second}</p>
                            </div>
                            <div className="text-center p-2 rounded bg-background/50">
                              <p className="text-base font-bold text-chart-3">{prelimStats.thirdPlace}</p>
                              <p className="text-xs text-muted-foreground">{t.third}</p>
                            </div>
                            <div className="text-center p-2 rounded bg-background/50">
                              <p className="text-base font-bold text-accent-foreground">{prelimStats.yakumanCount}</p>
                              <p className="text-xs text-muted-foreground">{t.yakumanCount}</p>
                            </div>
                          </div>
                          {prelimStats.yakumans.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                              {prelimStats.yakumans.map((yakuman, idx) => (
                                <div key={idx} className="text-center p-2 rounded bg-background/50">
                                  {yakuman.photo && (
                                    <img
                                      src={yakuman.photo || "/placeholder.svg"}
                                      alt={`Yakuman ${idx + 1}`}
                                      className="w-full h-auto object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                      onDoubleClick={() =>
                                        setEnlargedPhoto({ url: yakuman.photo!, types: yakuman.types })
                                      }
                                      title="雙擊放大"
                                    />
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">{yakuman.types.join(", ")}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Semi-Finals Phase Stats (only for 9 teams) */}
                        {isInSemiFinals && (
                          <div>
                            <Badge variant="outline" className="mb-2">準決賽</Badge>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-lg font-bold text-foreground">{semiStats.games}</p>
                                <p className="text-xs text-muted-foreground">{t.games}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50 relative">
                                <p
                                  className={`text-lg font-bold ${semiStats.totalPoints >= 0 ? "text-chart-2" : "text-destructive"}`}
                                >
                                  {semiStats.totalPoints > 0 ? "+" : ""}
                                  {semiStats.totalPoints}
                                </p>
                                <p className="text-xs text-muted-foreground">{t.totalPoints}</p>
                                {(() => {
                                  const key = `${team.name}|${player.name}`
                                  const rank = semiGlobalRankings.totalRankMap[key]
                                  return rank ? (
                                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary leading-none">
                                      {rank}名
                                    </span>
                                  ) : null
                                })()}
                              </div>
                              <div className="text-center p-2 rounded bg-background/50 relative">
                                <p
                                  className={`text-lg font-bold ${semiStats.highestSingleRound >= 0 ? "text-chart-2" : "text-destructive"}`}
                                >
                                  {semiStats.highestSingleRound > 0 ? "+" : ""}
                                  {semiStats.highestSingleRound}
                                </p>
                                <p className="text-xs text-muted-foreground">{t.highestRound}</p>
                                {(() => {
                                  const key = `${team.name}|${player.name}`
                                  const rank = semiGlobalRankings.highestSingleRankMap[key]
                                  return rank ? (
                                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary leading-none">
                                      {rank}名
                                    </span>
                                  ) : null
                                })()}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-primary">{semiStats.firstPlace}</p>
                                <p className="text-xs text-muted-foreground">{t.first}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-chart-2">{semiStats.secondPlace}</p>
                                <p className="text-xs text-muted-foreground">{t.second}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-chart-3">{semiStats.thirdPlace}</p>
                                <p className="text-xs text-muted-foreground">{t.third}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-accent-foreground">{semiStats.yakumanCount}</p>
                                <p className="text-xs text-muted-foreground">{t.yakumanCount}</p>
                              </div>
                            </div>
                            {semiStats.yakumans.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-4">
                                {semiStats.yakumans.map((yakuman, idx) => (
                                  <div key={idx} className="text-center p-2 rounded bg-background/50">
                                    {yakuman.photo && (
                                      <img
                                        src={yakuman.photo || "/placeholder.svg"}
                                        alt={`Yakuman ${idx + 1}`}
                                        className="w-full h-auto object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onDoubleClick={() =>
                                          setEnlargedPhoto({ url: yakuman.photo!, types: yakuman.types })
                                        }
                                        title="雙擊放大"
                                      />
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">{yakuman.types.join(", ")}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Finals Phase Stats (only for 3 finalist teams) */}
                        {isInFinals && (
                          <div className="mt-2">
                            <Badge variant="outline" className="mb-2 border-yellow-500 text-yellow-600">決賽</Badge>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-lg font-bold text-foreground">{finalsStats.games}</p>
                                <p className="text-xs text-muted-foreground">{t.games}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50 relative">
                                <p className={`text-lg font-bold ${finalsStats.totalPoints >= 0 ? "text-chart-2" : "text-destructive"}`}>
                                  {finalsStats.totalPoints > 0 ? "+" : ""}{finalsStats.totalPoints}
                                </p>
                                <p className="text-xs text-muted-foreground">{t.totalPoints}</p>
                                {(() => {
                                  const key = `${team.name}|${player.name}`
                                  const rank = finalsGlobalRankings.totalRankMap[key]
                                  return rank ? (
                                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary leading-none">{rank}名</span>
                                  ) : null
                                })()}
                              </div>
                              <div className="text-center p-2 rounded bg-background/50 relative">
                                <p className={`text-lg font-bold ${finalsStats.highestSingleRound >= 0 ? "text-chart-2" : "text-destructive"}`}>
                                  {finalsStats.highestSingleRound > 0 ? "+" : ""}{finalsStats.highestSingleRound}
                                </p>
                                <p className="text-xs text-muted-foreground">{t.highestRound}</p>
                                {(() => {
                                  const key = `${team.name}|${player.name}`
                                  const rank = finalsGlobalRankings.highestSingleRankMap[key]
                                  return rank ? (
                                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary leading-none">{rank}名</span>
                                  ) : null
                                })()}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-primary">{finalsStats.firstPlace}</p>
                                <p className="text-xs text-muted-foreground">{t.first}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-chart-2">{finalsStats.secondPlace}</p>
                                <p className="text-xs text-muted-foreground">{t.second}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-chart-3">{finalsStats.thirdPlace}</p>
                                <p className="text-xs text-muted-foreground">{t.third}</p>
                              </div>
                              <div className="text-center p-2 rounded bg-background/50">
                                <p className="text-base font-bold text-accent-foreground">{finalsStats.yakumanCount}</p>
                                <p className="text-xs text-muted-foreground">{t.yakumanCount}</p>
                              </div>
                            </div>
                            {finalsStats.yakumans.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-4">
                                {finalsStats.yakumans.map((yakuman, idx) => (
                                  <div key={idx} className="text-center p-2 rounded bg-background/50">
                                    {yakuman.photo && (
                                      <img
                                        src={yakuman.photo || "/placeholder.svg"}
                                        alt={`Yakuman ${idx + 1}`}
                                        className="w-full h-auto object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onDoubleClick={() =>
                                          setEnlargedPhoto({ url: yakuman.photo!, types: yakuman.types })
                                        }
                                        title="雙擊放大"
                                      />
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">{yakuman.types.join(", ")}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
