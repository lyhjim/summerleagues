"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { summerSchedule } from "@/lib/summer-selection/schedule"
import { calculateFinalPoints, getRankings } from "@/lib/summer-selection/score-calculator"

interface PlayerPhoto {
  game_number: number
  seat: string
  team_name: string
  player_name?: string
  photo_url?: string
}

interface GameScores {
  [gameNumber: number]: {
    e: number
    s: number
    w: number
    n: number
  }
}

interface LineupData {
  [key: string]: { player1: string; player2: string }
}

const windMarks = {
  E: "東",
  S: "南",
  W: "西",
  N: "北",
}

const seatOrder = ["E", "S", "W", "N"] as const
const seatColors: Record<string, string> = {
  E: "bg-red-500/20 border-red-500/50",
  S: "bg-green-500/20 border-green-500/50",
  W: "bg-white/20 border-white/50",
  N: "bg-black/30 border-black/50",
}

const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-slate-300 text-black",
  3: "bg-orange-500 text-white",
  4: "bg-gray-600 text-white",
}

export function FinalsResultsDisplay() {
  const [lineups, setLineups] = useState<LineupData>({})
  const [scores, setScores] = useState<GameScores>({})
  const [photos, setPhotos] = useState<PlayerPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lineupsRes, scoresRes, photosRes] = await Promise.all([
          fetch("/api/summer-selection/lineups-display"),
          fetch("/api/admin/game-scores"),
          fetch("/api/admin/finals-photos"),
        ])

        if (lineupsRes.ok) {
          const data = await lineupsRes.json()
          setLineups(data)
        }

        if (scoresRes.ok) {
          const data = await scoresRes.json()
          setScores(data.scores)
        }

        if (photosRes.ok) {
          const data = await photosRes.json()
          setPhotos(data.photos || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching finals data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="text-muted-foreground text-center py-8">載入中...</div>
  }

  return (
    <div className="space-y-12">
      {summerSchedule
        .filter((game) => game.gameNumber >= 37 && game.gameNumber <= 40)
        .map((match) => {
          const gameScore = scores[match.gameNumber]
          const hasScores = gameScore && Object.values(gameScore).some((v) => v !== undefined && v !== null)

          if (!hasScores) {
            return null // Skip games without scores
          }

          const wind = getRankings(gameScore)

          return (
            <div key={match.gameNumber} className="rounded-xl overflow-hidden bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-400/30">
              {/* Header with game number */}
              <div className="bg-emerald-400/20 px-6 py-3 border-b border-emerald-400/30">
                <h3 className="text-xl font-bold text-emerald-300">Game {match.gameNumber}</h3>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                {seatOrder.map((seat, idx) => {
                  const teamData = match.teams[idx]
                  const rawScore = gameScore[seat.toLowerCase() as keyof typeof gameScore]
                  const rank = wind[seat]
                  const finalPoints = rank ? calculateFinalPoints(rawScore, rank) : undefined
                  const lineupKey = `${teamData.teamName}_${match.gameNumber}_${teamData.playerNum}`
                  const playerName = lineups[lineupKey]?.player1
                  const photo = photos.find((p) => p.game_number === match.gameNumber && p.seat === seat)
                  const photoUrl = photo?.photo_url

                  return (
                    <div
                      key={seat}
                      className={`relative flex flex-col items-center justify-between p-4 border-l border-b border-emerald-400/20 ${seatColors[seat]} overflow-hidden group`}
                    >
                      {/* Background image */}
                      {photoUrl && (
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                          <Image
                            src={photoUrl}
                            alt={teamData.teamName}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                        {/* Rank badge */}
                        {rank && (
                          <div className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm ${rankColors[rank]}`}>
                            {rank}位
                          </div>
                        )}

                        {/* Player photo (if portrait mode) */}
                        {photoUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                            <Image
                              src={photoUrl}
                              alt={playerName || teamData.teamName}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}

                        {/* Player name */}
                        <div className="text-center">
                          {playerName && <p className="text-sm font-bold text-white">{playerName}</p>}
                          <p className="text-xs text-emerald-200/80">{teamData.teamName}</p>
                        </div>

                        {/* Wind mark */}
                        <div className="text-xs font-bold px-2 py-1 bg-white/20 rounded text-white">
                          {windMarks[seat as keyof typeof windMarks]}位
                        </div>
                      </div>

                      {/* Score section */}
                      <div className="relative z-10 flex flex-col items-center gap-1 mt-4 pt-4 border-t border-white/20 w-full">
                        <div className={`text-lg font-bold ${finalPoints && finalPoints >= 0 ? "text-emerald-300" : "text-red-400"}`}>
                          {finalPoints ? (finalPoints > 0 ? "+" : "") + finalPoints.toFixed(1) : "-"}
                        </div>
                        <div className="text-sm text-white/80">{rawScore}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
    </div>
  )
}
