"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { useSemiFinalsResults } from "@/lib/semi-finals-results-context"
import { teams } from "@/lib/team-data"
import { getStaticMatchResults } from "@/lib/static-match-results"

interface PlayerRanking {
  rank: number
  playerName: string
  teamName: string
  teamId: number
  value: number
  yakumans?: Array<{
    types: string[]
    photo?: string
  }>
}

interface IndividualRankingsProps {
  preloadedResults?: any[]
  isLoading?: boolean
}

function calculateIndividualRankings() {
  const playerStats: Record<
    string,
    {
      playerName: string
      teamName: string
      teamId: number
      totalChips: number
      roundChips: Record<string, number>
      yakumans: Array<{ types: string[]; photo?: string }>
    }
  > = {}

  const allResults = getStaticMatchResults()

  allResults.forEach((result) => {
    try {
      const matchId = result.match_id || result.matchId
      const round = result.round

      const games = [result.results?.game1, result.results?.game2, result.results?.game3].filter(Boolean)

      games.forEach((game: any[]) => {
        if (!game || game.length !== 3) return

        game.forEach((player) => {
          const playerKey = `${player.teamName}-${player.playerName}`

          if (!playerStats[playerKey]) {
            const team = teams.find((t) => t.name === player.teamName)
            playerStats[playerKey] = {
              playerName: player.playerName,
              teamName: player.teamName,
              teamId: team?.id || 0,
              totalChips: 0,
              roundChips: {},
              yakumans: [],
            }
          }

          const stats = playerStats[playerKey]
          stats.totalChips += player.finalChips || 0

          const roundKey = `${matchId}-${round}`
          stats.roundChips[roundKey] = (stats.roundChips[roundKey] || 0) + (player.finalChips || 0)

          if (player.yakumans && Array.isArray(player.yakumans)) {
            player.yakumans.forEach((yakuman: any) => {
              if (yakuman.types && yakuman.types.length > 0) {
                stats.yakumans.push({
                  types: yakuman.types || [],
                  photo: yakuman.photoUrl || yakuman.photo,
                })
              }
            })
          }
        })
      })
    } catch (e) {
      console.error("[v0] Error processing individual ranking:", e)
    }
  })

  const individualChips = Object.values(playerStats)
    .map((stats) => ({
      rank: 0,
      playerName: stats.playerName,
      teamName: stats.teamName,
      teamLogo: teams.find((t) => t.id === stats.teamId)?.logo || "/placeholder.svg",
      teamId: stats.teamId,
      value: stats.totalChips,
    }))
    .sort((a, b) => b.value - a.value)
    .reduce(
      (acc, item, index, array) => {
        let rank: number
        if (index === 0) {
          rank = 1
        } else if (item.value === array[index - 1].value) {
          rank = acc[index - 1].rank
        } else {
          rank = index + 1
        }
        acc.push({ ...item, rank })
        return acc
      },
      [] as Array<{
        rank: number
        playerName: string
        teamName: string
        teamLogo: string
        teamId: number
        value: number
      }>,
    )

  const singleRoundChips = Object.values(playerStats)
    .map((stats) => ({
      rank: 0,
      playerName: stats.playerName,
      teamName: stats.teamName,
      teamLogo: teams.find((t) => t.id === stats.teamId)?.logo || "/placeholder.svg",
      teamId: stats.teamId,
      value: Math.max(...Object.values(stats.roundChips), 0),
    }))
    .filter((item) => item.value !== 0)
    .sort((a, b) => b.value - a.value)
    .reduce(
      (acc, item, index, array) => {
        let rank: number
        if (index === 0) {
          rank = 1
        } else if (item.value === array[index - 1].value) {
          rank = acc[index - 1].rank
        } else {
          rank = index + 1
        }
        acc.push({ ...item, rank })
        return acc
      },
      [] as Array<{
        rank: number
        playerName: string
        teamName: string
        teamLogo: string
        teamId: number
        value: number
      }>,
    )

  const yakumanRankings = Object.values(playerStats)
    .filter((stats) => stats.yakumans.length >= 2)
    .map((stats) => ({
      playerName: stats.playerName,
      teamName: stats.teamName,
      teamLogo: teams.find((t) => t.id === stats.teamId)?.logo || "/placeholder.svg",
      teamId: stats.teamId,
      value: stats.yakumans.length,
      yakumans: stats.yakumans,
    }))
    .sort((a, b) => b.value - a.value)
    .reduce(
      (acc, item, index, array) => {
        let rank: number
        if (index === 0) {
          rank = 1
        } else if (item.value === array[index - 1].value) {
          rank = acc[index - 1].rank
        } else {
          rank = index + 1
        }
        acc.push({ ...item, rank })
        return acc
      },
      [] as Array<{
        rank: number
        playerName: string
        teamName: string
        teamLogo: string
        teamId: number
        value: number
        yakumans: { types: string[]; photo?: string }[]
      }>,
    )

  const cumulativeYakuman = Object.values(playerStats)
    .map((stats) => ({
      playerName: stats.playerName,
      teamName: stats.teamName,
      teamLogo: teams.find((t) => t.id === stats.teamId)?.logo || "/placeholder.svg",
      teamId: stats.teamId,
      value: stats.yakumans.length,
      yakumans: stats.yakumans,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .reduce(
      (acc, item, index, array) => {
        let rank: number
        if (index === 0) {
          rank = 1
        } else if (item.value === array[index - 1].value) {
          rank = acc[index - 1].rank
        } else {
          rank = index + 1
        }
        acc.push({ ...item, rank })
        return acc
      },
      [] as Array<{
        rank: number
        playerName: string
        teamName: string
        teamLogo: string
        teamId: number
        value: number
        yakumans: { types: string[]; photo?: string }[]
      }>,
    )

  return { individualChips, singleRoundChips, yakumanRankings, cumulativeYakuman }
}

interface IndividualRankingCardProps {
  title: string
  data: {
    rank: number
    playerName: string
    teamName: string
    teamLogo: string
    value: number
    yakumans?: { types: string[]; photo?: string }[]
  }[]
  valueLabel: string
  showPlus?: boolean
  onEnlargePhoto?: (url: string, types: string[]) => void
  showAllTied?: boolean
}

function IndividualRankingCard({
  title,
  data,
  valueLabel,
  showPlus = false,
  onEnlargePhoto,
  showAllTied = false,
}: IndividualRankingCardProps) {
  const { t } = useLanguage()

  const getRankBoxColor = (rank: number) => {
    if (rank === 1) return "bg-red-500 text-white"
    if (rank >= 2 && rank <= 9) return "bg-green-600 text-white"
    return "bg-gray-500 text-white"
  }

  let displayData: typeof data
  if (showAllTied) {
    const uniqueRanks = [...new Set(data.map((item) => item.rank))].sort((a, b) => a - b)
    const fifthRank = uniqueRanks[4] || uniqueRanks[uniqueRanks.length - 1] || 5
    displayData = data.filter((item) => item.rank <= fifthRank)
  } else {
    displayData = data.slice(0, 5)
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg h-full">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div>
          <div className="grid grid-cols-[36px_1fr_60px] sm:grid-cols-[50px_1fr_100px] gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            <div>{t.rankColumn}</div>
            <div>{t.playerColumn}</div>
            <div className="text-right">{valueLabel}</div>
          </div>

          {displayData.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">{t.noDataYet || "尚無數據"}</div>
          ) : (
            displayData.map((player) => {
              const team = teams.find((t) => t.id === player.teamId)

              return (
                <div
                  key={`${player.playerName}-${player.teamName}`}
                  className="grid grid-cols-[36px_1fr_60px] sm:grid-cols-[50px_1fr_100px] gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg hover:bg-secondary/50 transition-colors group relative"
                >
                  <div className="flex items-center">
                    <span
                      className={`text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 rounded ${getRankBoxColor(player.rank)}`}
                    >
                      {player.rank}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    {player.teamLogo && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 bg-background border border-border">
                        <img
                          src={player.teamLogo || "/placeholder.svg"}
                          alt={player.teamName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        {player.playerName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis hidden sm:block">
                        {player.teamName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums ${
                        showPlus && player.value >= 0
                          ? "text-chart-2"
                          : showPlus && player.value < 0
                            ? "text-destructive"
                            : "text-foreground"
                      }`}
                    >
                      {showPlus && player.value > 0 ? "+" : ""}
                      {player.value.toLocaleString()}
                    </span>
                  </div>

                  {player.yakumans && player.yakumans.length > 0 && (
                    <div className="hidden group-hover:block absolute left-full ml-2 top-0 z-50 bg-popover border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
                      <div className="text-xs font-medium mb-2">役滿詳情 (雙擊放大)</div>
                      {player.yakumans.map((yakuman, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          {yakuman.photo && (
                            <img
                              src={yakuman.photo || "/placeholder.svg"}
                              alt="Yakuman"
                              className="w-full h-24 object-cover rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onDoubleClick={() => onEnlargePhoto?.(yakuman.photo!, yakuman.types)}
                            />
                          )}
                          <div className="text-xs text-muted-foreground">{yakuman.types.join(", ") || "役滿"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function buildRankedList(entries: { playerName: string; teamName: string; teamId: number; value: number }[]) {
  return entries
    .sort((a, b) => b.value - a.value)
    .reduce(
      (acc, item, index, array) => {
        const rank =
          index === 0 ? 1 : item.value === array[index - 1].value ? acc[index - 1].rank : index + 1
        const team = teams.find((t) => t.id === item.teamId)
        acc.push({ ...item, rank, teamLogo: team?.logo || "/placeholder.svg" })
        return acc
      },
      [] as Array<{ rank: number; playerName: string; teamName: string; teamLogo: string; teamId: number; value: number }>
    )
}

export function IndividualRankings({ preloadedResults, isLoading: parentLoading }: IndividualRankingsProps = {}) {
  const { t } = useLanguage()
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ url: string; types: string[] } | null>(null)
  const [semiChipsRanking, setSemiChipsRanking] = useState<ReturnType<typeof buildRankedList>>([])

  // Fully static — calculated synchronously from embedded data files
  const rankings = calculateIndividualRankings()

  // Use shared semi-finals results from context
  const { results: blobData } = useSemiFinalsResults()

  useEffect(() => {
    const playerChips: Record<string, { playerName: string; teamName: string; teamId: number; value: number }> = {}
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
            playerChips[key] = { playerName: player.playerName, teamName: player.teamName, teamId: team?.id ?? 0, value: 0 }
          }
          playerChips[key].value += player.finalChips || 0
        })
      })
    })

    setSemiChipsRanking(buildRankedList(Object.values(playerChips)))
  }, [blobData])

  const handleEnlargePhoto = (url: string, types: string[]) => {
    setEnlargedPhoto({ url, types })
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <Dialog open={!!enlargedPhoto} onOpenChange={() => setEnlargedPhoto(null)}>
        <DialogContent className="max-w-3xl p-2">
          {enlargedPhoto && (
            <div className="flex flex-col items-center">
              <img
                src={enlargedPhoto.url || "/placeholder.svg"}
                alt="Yakuman"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <p className="text-sm font-medium mt-2">{enlargedPhoto.types.join(", ")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <IndividualRankingCard
          title={t.individualChips}
          data={rankings.individualChips}
          valueLabel={t.chipsLabel}
          showPlus={true}
          onEnlargePhoto={handleEnlargePhoto}
          showAllTied={false}
        />
        <IndividualRankingCard
          title={t.singleRoundChips}
          data={rankings.singleRoundChips}
          valueLabel={t.chipsLabel}
          showPlus={true}
          onEnlargePhoto={handleEnlargePhoto}
          showAllTied={false}
        />
      </div>

      {semiChipsRanking.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <IndividualRankingCard
            title="個人枚數MVP (準決賽)"
            data={semiChipsRanking}
            valueLabel={t.chipsLabel}
            showPlus={true}
            onEnlargePhoto={handleEnlargePhoto}
            showAllTied={false}
          />
        </div>
      )}

      {rankings.yakumanRankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <IndividualRankingCard
            title={t.individualYakuman}
            data={rankings.yakumanRankings}
            valueLabel={t.yakumanCount || "役滿數"}
            onEnlargePhoto={handleEnlargePhoto}
            showAllTied={false}
          />
          <IndividualRankingCard
            title="累計役滿榜 Cumulative Yakuman"
            data={rankings.cumulativeYakuman}
            valueLabel={t.yakumanCount || "役滿數"}
            onEnlargePhoto={handleEnlargePhoto}
            showAllTied={false}
          />
        </div>
      )}
    </section>
  )
}
