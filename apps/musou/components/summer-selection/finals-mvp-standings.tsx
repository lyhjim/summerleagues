"use client"

import { useEffect, useState } from "react"

interface MVPPlayer {
  name: string
  teamName: string
  points: number
  first: number
  second: number
  third: number
  fourth: number
  games: number
}

export function FinalsMVPStandings() {
  const [players, setPlayers] = useState<MVPPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await fetch("/api/summer-selection/finals-standings", { cache: "no-store" })
        const data = await res.json()
        
        if (data.players && data.players.length > 0) {
          setPlayers(data.players)
        }
      } catch (error) {
        console.error("[v0] Error fetching MVP standings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
    const interval = setInterval(fetchStandings, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-emerald-400"></span>
          決賽個人 MVP 排名
        </h2>
      </div>

      {/* MVP List */}
      {players.length === 0 ? (
        <div className="rounded-lg border border-emerald-300/15 bg-emerald-500/5 px-6 py-12 text-center">
          <p className="text-emerald-200/60">決賽進行中，敬請期待...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player, index) => (
            <div
              key={`${player.teamName}-${player.name}`}
              className="rounded-lg border border-emerald-400/50 bg-emerald-400/5 px-6 py-4 hover:bg-emerald-400/10 transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Left: Rank and Player Name */}
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl font-bold text-emerald-300 w-10 shrink-0">{index + 1}</span>
                  <div className="min-w-0">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-white">{player.name}</span>
                      <span className="text-xs text-emerald-200/60">{player.teamName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Points and Stats */}
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${player.points >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {player.points > 0 ? "+" : ""}{parseFloat(player.points.toFixed(1))}
                    </span>
                  </div>
                  <div className="text-right text-xs text-emerald-200/60 font-mono space-y-1">
                    <div>{player.first}/{player.second}/{player.third}/{player.fourth}</div>
                    <div>{player.games} / 4</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
