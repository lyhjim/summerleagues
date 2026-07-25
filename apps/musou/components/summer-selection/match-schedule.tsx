"use client"

import { useEffect, useState } from "react"
import { summerSchedule } from "@/lib/summer-selection/schedule"
import { archivedLineupsData } from "@/lib/summer-selection/archived-lineups"
import { archivedScores } from "@/lib/summer-selection/archived-scores"
import { calculateFinalPoints, getRankings, formatScore } from "@/lib/summer-selection/score-calculator"

const windMarks = {
  E: "東",
  S: "南",
  W: "西",
  N: "北",
}

const windOrder = ["E", "S", "W", "N"] as const

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

export function MatchSchedule() {
  const [lineups, setLineups] = useState<LineupData>({})
  const [scores, setScores] = useState<GameScores>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all lineups and scores
    const fetchData = async () => {
      try {
        const [lineupsRes, scoresRes] = await Promise.all([
          fetch("/api/summer-selection/lineups-display").catch(() => null),
          fetch("/api/admin/game-scores").catch(() => null),
        ])

        const lineupsData = lineupsRes?.ok ? await lineupsRes.json() : null
        const scoresData = scoresRes?.ok ? await scoresRes.json() : null

        // Fall back to the archived snapshot for whichever endpoint is unavailable.
        setLineups(lineupsData && Object.keys(lineupsData).length ? lineupsData : archivedLineupsData)
        setScores(scoresData?.scores && Object.keys(scoresData.scores).length ? scoresData.scores : archivedScores)
      } catch {
        setLineups(archivedLineupsData)
        setScores(archivedScores)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every minute to check for new submissions
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const groupedByDay = summerSchedule
    .filter((match) => match.gameNumber <= 36) // Only show preliminary games (1-36), exclude finals
    .reduce(
      (acc, match) => {
        const key = `Day ${match.day}`
        if (!acc[key]) acc[key] = []
        acc[key].push(match)
        return acc
      },
      {} as Record<string, typeof summerSchedule>
    )

  const dayLabels: Record<string, string> = {
    "Day 1": "初賽 第1日",
    "Day 2": "初賽 第2日",
    "Day 3": "初賽 第3日",
    "Day 4": "初賽 第4日",
    "Day 5": "決賽",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-blue-400"></span>
          賽程表
        </h2>
      </div>

      {Object.entries(groupedByDay).map(([dayKey, matches]) => (
        <div key={dayKey} className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-blue-300/15 pb-3">
            {dayLabels[dayKey] || dayKey}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => {
              const isFinal = dayKey === "Day 5"

              return (
                <div
                  key={match.gameNumber}
                  className="rounded-lg border border-blue-300/15 bg-blue-500/5 overflow-hidden hover:bg-blue-400/10 transition-colors"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500/30 to-blue-400/15 px-4 py-3 border-b border-blue-300/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        Game {match.gameNumber} {match.location}
                      </span>
                      <span className="text-xs text-blue-200/60 font-mono">{match.date}</span>
                    </div>
                  </div>

                  {/* Teams List */}
                  <div className="p-4 space-y-2">
                    {match.teams.map((teamData, idx) => {
                      const wind = windOrder[idx]
                      const windLabel = windMarks[wind]

                      // Get submitted lineup if available
                      const lineupKey = `${teamData.teamName}_${match.gameNumber}_${teamData.playerNum}`
                      const submittedPlayer = lineups[lineupKey]?.player1

                      // For finals, display team name as is (第一名, 第二名, etc.)
                      // For prelims, display team name with submitted player or generic player number
                      let displayName: string
                      if (isFinal) {
                        displayName = teamData.teamName
                      } else if (submittedPlayer) {
                        displayName = `${teamData.teamName} ${submittedPlayer}`
                      } else {
                        displayName = `${teamData.teamName} ${teamData.playerNum}`
                      }

                      // Get game scores if available (score object keys are lowercase e/s/w/n)
                      const windKey = wind.toLowerCase() as "e" | "s" | "w" | "n"
                      const gameScore = scores[match.gameNumber]
                      const hasScores = gameScore && gameScore[windKey] !== undefined && gameScore[windKey] !== null

                      if (hasScores && gameScore) {
                        const rankings = getRankings(gameScore)
                        const ranking = rankings[wind]
                        const finalPoints = calculateFinalPoints(gameScore[windKey], ranking)
                        const formattedScore = formatScore(gameScore[windKey])

                        return (
                          <div
                            key={idx}
                            className="rounded bg-blue-400/10 p-2 flex items-center justify-between text-xs"
                          >
                            <div className="flex-1">
                              <div className="text-white font-semibold">
                                {displayName}
                              </div>
                              <div className="text-blue-200/60">
                                {formattedScore} · {['1st', '2nd', '3rd', '4th'][ranking - 1]}
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div className={finalPoints >= 0 ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                                {finalPoints > 0 ? '+' : ''}{finalPoints.toFixed(1)}
                              </div>
                              <div className="text-xs font-bold px-1.5 py-0.5 bg-blue-400/20 rounded text-blue-100">
                                {windLabel}
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-white flex-1">{displayName}</span>
                          <span className="text-xs font-bold px-2 py-0.5 bg-blue-400/20 rounded text-blue-100">
                            {windLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
