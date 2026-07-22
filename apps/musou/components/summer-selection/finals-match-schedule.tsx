"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { summerSchedule } from "@/lib/summer-selection/schedule"
import { calculateFinalPoints, getRankings, formatScore } from "@/lib/summer-selection/score-calculator"
import { FinalsPlayerCard } from "./finals-player-card"

const windMarks = {
  E: "東",
  S: "南",
  W: "西",
  N: "北",
}

const windOrder = ["E", "S", "W", "N"] as const

// Map of placeholder names to actual finals team names
const finalsTeamNames: Record<string, string> = {
  "第一名": "鬼點子",
  "第二名": "層層疊",
  "第三名": "雙狙人",
  "第四名": "疾風勁草",
}

// Rank badge colors
const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-slate-300 text-black",
  3: "bg-orange-500 text-white",
  4: "bg-zinc-600 text-white",
}

interface LineupData {
  [key: string]: { player1: string; player2: string }
}

interface GameScores {
  [gameNumber: number]: {
    e: number
    s: number
    w: number
    n: number
  }
}

interface PlayerPhoto {
  game_number: number
  seat: string
  team_name: string
  player_name?: string
  photo_url?: string
}

interface PenaltiesMap {
  [key: string]: {
    penaltyScore: number
    reason?: string
  }
}

export function FinalsMatchSchedule() {
  const [lineups, setLineups] = useState<LineupData>({})
  const [scores, setScores] = useState<GameScores>({})
  const [photos, setPhotos] = useState<PlayerPhoto[]>([])
  const [penalties, setPenalties] = useState<PenaltiesMap>({})
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [canShowLineups, setCanShowLineups] = useState(false)

  // Update time and check lineup visibility
  useEffect(() => {
    const updateTimeAndVisibility = () => {
      const now = new Date()
      setCurrentTime(now)
      
      // Convert to HKT and check if it's Sunday 22:00 or later
      const hktTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }))
      const dayOfWeek = hktTime.getDay() // 0 = Sunday
      const hour = hktTime.getHours()
      
      // Show lineups after Sunday 22:00 HKT
      const isSunday = dayOfWeek === 0
      const isSundayAfter22 = isSunday && hour >= 22
      setCanShowLineups(isSundayAfter22)
    }
    
    updateTimeAndVisibility()
    const interval = setInterval(updateTimeAndVisibility, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Fetch all lineups, scores, photos, and penalties
    const fetchData = async () => {
      try {
        const [lineupsRes, scoresRes, photosRes, penaltiesRes] = await Promise.all([
          fetch("/api/summer-selection/lineups-display", { cache: "no-store" }),
          fetch("/api/admin/game-scores", { cache: "no-store" }),
          fetch("/api/admin/finals-photos", { cache: "no-store" }),
          fetch("/api/admin/player-penalties", { cache: "no-store" }),
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

        if (penaltiesRes.ok) {
          const data = await penaltiesRes.json()
          setPenalties(data.penalties || {})
        }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every minute to check for new submissions
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Filter finals games (37-40)
  const finalsMatches = summerSchedule.filter((match) => match.gameNumber >= 37 && match.gameNumber <= 40)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-emerald-400"></span>
          賽程表: 決賽 Game 37-40
        </h2>
      </div>

      <div className="space-y-8">
        {finalsMatches.map((match) => {
          const gameScore = scores[match.gameNumber]
          const rankings = gameScore ? getRankings(gameScore) : {}

          return (
            <div key={match.gameNumber} className="space-y-3">
              <div className="text-sm font-bold text-emerald-300 tracking-widest">
                Game {match.gameNumber} {match.location} · {match.date}
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {windOrder.map((wind, windIdx) => {
                  const windLabel = windMarks[wind]
                  const windKey = wind.toLowerCase() as "e" | "s" | "w" | "n"

                  const hasScores = gameScore && gameScore[windKey] !== undefined && gameScore[windKey] !== null
                  const rank = hasScores ? rankings[wind] : undefined

                  // Get team at this wind position from schedule order (windIdx corresponds to teams array index)
                  const teamData = match.teams[windIdx]
                  const actualTeamName = finalsTeamNames[teamData.teamName] || teamData.teamName
                  
                  // Get submitted player for this team
                  const lineupKey = `${teamData.teamName}_${match.gameNumber}_${teamData.playerNum}`
                  const submittedPlayer = lineups[lineupKey]?.player1 || ""
                  
                  // Get photo by matching game_number and team_name (not seat from photos, as photos have wrong team associations)
                  // We find ANY photo for this team at this game and use it
                  const photo = photos.find(
                    p => p.game_number === match.gameNumber && p.team_name === actualTeamName
                  )
                  const photoUrl = photo?.photo_url

                  // Calculate final points
                  let finalPoints = hasScores && rank ? calculateFinalPoints(gameScore[windKey], rank) : undefined

                  // Find and apply penalty if exists
                  const penaltyKey = `${match.gameNumber}-${actualTeamName}-${submittedPlayer}`
                  const penalty = penalties[penaltyKey]
                  if (finalPoints !== undefined && penalty) {
                    finalPoints += penalty.penaltyScore
                  }

                  return (
                    <FinalsPlayerCard
                      key={`${match.gameNumber}-${wind}`}
                      playerName={submittedPlayer || "未定"}
                      teamName={actualTeamName || "未知"}
                      windChar={windLabel}
                      rank={rank || 4}
                      points={finalPoints !== undefined ? parseFloat(finalPoints.toFixed(1)) : 0}
                      rawScore={hasScores ? gameScore[windKey] : 0}
                      photoUrl={photoUrl}
                      penalty={penalty ? { score: penalty.penaltyScore, reason: penalty.reason } : undefined}
                      isFirstGame={match.gameNumber === 37}
                      hasScores={hasScores}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
