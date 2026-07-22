"use client"

import { useState, useEffect } from "react"
import { summerTeams } from "@/lib/summer-selection/teams"
import { summerSchedule } from "@/lib/summer-selection/schedule"
import { Button } from "@/components/ui/button"

interface LineupFormProps {
  teamName: string
  token: string
}

export function LineupForm({ teamName, token }: LineupFormProps) {
  const team = summerTeams.find((t) => t.chineseName === teamName)
  const gamesByTeam = summerSchedule.filter((game) =>
    game.teams.some((t) => t.teamName === teamName)
  )

  // Finals teams eligible for games 37-40
  const FINALS_TEAMS = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]
  const isFinalTeam = FINALS_TEAMS.includes(teamName)

  // Determine which games to show based on current time
  const [visibleGames, setVisibleGames] = useState<typeof gamesByTeam>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [canSubmit, setCanSubmit] = useState(true)
  const [timeUntilDeadline, setTimeUntilDeadline] = useState<string>("")
  const [playerPhotos, setPlayerPhotos] = useState<Record<string, File | null>>({})

  // Track table groups for auto-selection
  // Table 1: Games 1-3, Table 2: Games 4-6, etc.
  const getTableNumber = (gameNumber: number) => Math.floor((gameNumber - 1) / 3) + 1
  const getGamesForTable = (gameNumber: number) => {
    const table = getTableNumber(gameNumber)
    return [(table - 1) * 3 + 1, (table - 1) * 3 + 2, (table - 1) * 3 + 3]
  }

  const [lineups, setLineups] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const updateGameVisibility = () => {
      // Hong Kong Time (UTC+8): 23:59 HK = 15:59 UTC
      const round1Deadline = new Date("2026-06-13T15:59:00Z") // 6月13日 (六) 23:59 HK
      const round2Deadline = new Date("2026-06-20T15:59:00Z") // 6月20日 (六) 23:59 HK
      const round3Deadline = new Date("2026-06-27T15:59:00Z") // 6月27日 (六) 23:59 HK (Finals)

      const now = new Date()

      if (now < round1Deadline) {
        setCurrentRound(1)
        setVisibleGames(gamesByTeam.filter((g) => g.gameNumber <= 18))
        const msUntil = round1Deadline.getTime() - now.getTime()
        const hours = Math.floor(msUntil / (1000 * 60 * 60))
        const minutes = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60))
        setTimeUntilDeadline(`${hours}小時 ${minutes}分鐘`)
        setCanSubmit(true)
      } else if (now < round2Deadline) {
        setCurrentRound(2)
        setVisibleGames(gamesByTeam.filter((g) => g.gameNumber >= 19 && g.gameNumber <= 36))
        const msUntil = round2Deadline.getTime() - now.getTime()
        const hours = Math.floor(msUntil / (1000 * 60 * 60))
        const minutes = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60))
        setTimeUntilDeadline(`${hours}小時 ${minutes}分鐘`)
        setCanSubmit(true)
      } else if (isFinalTeam && now < round3Deadline) {
        setCurrentRound(3)
        setVisibleGames(gamesByTeam.filter((g) => g.gameNumber >= 37 && g.gameNumber <= 40))
        const msUntil = round3Deadline.getTime() - now.getTime()
        const hours = Math.floor(msUntil / (1000 * 60 * 60))
        const minutes = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60))
        setTimeUntilDeadline(`${hours}小時 ${minutes}分鐘`)
        setCanSubmit(true)
      } else {
        setCurrentRound(4)
        setCanSubmit(false)
        setTimeUntilDeadline("已結束")
      }
    }

    updateGameVisibility()
    const interval = setInterval(updateGameVisibility, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [gamesByTeam, isFinalTeam])

  if (!team) {
    return <div className="text-red-400">隊伍未找到</div>
  }

  const handlePlayerChange = (gameNumber: number, playerName: string) => {
    setLineups((prev) => {
      const newLineups = { ...prev, [gameNumber]: playerName }

      // Auto-select same player for same table (only for prelims, not finals)
      if (playerName && gameNumber <= 36) {
        const tableGames = getGamesForTable(gameNumber)
        tableGames.forEach((g) => {
          if (!submitted.has(g) && newLineups[g] === undefined) {
            newLineups[g] = playerName
          }
        })
      }

      return newLineups
    })
  }

  const handlePhotoChange = (playerName: string, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "照片大小不能超過 5MB" })
      return
    }
    setPlayerPhotos((prev) => ({ ...prev, [playerName]: file }))
  }

  // Get unique players from selected lineups
  const getSelectedPlayers = () => {
    const players = new Set<string>()
    Object.values(lineups).forEach((playerName) => {
      if (playerName) players.add(playerName)
    })
    return Array.from(players).sort()
  }

  const handleSubmitRound = async () => {
    // Check if all visible games have players selected
    const emptyGames = visibleGames.filter((game) => !lineups[game.gameNumber])
    if (emptyGames.length > 0) {
      setMessage({ type: "error", text: `請選擇所有比賽的選手 (缺少 ${emptyGames.length} 場)` })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/summer-selection/lineups-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          teamName,
          lineups: visibleGames.reduce(
            (acc, game) => ({
              ...acc,
              [game.gameNumber]: lineups[game.gameNumber],
            }),
            {}
          ),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Submit player photos for finals
        if (currentRound === 3) {
          const photoSubmissions = Object.entries(playerPhotos)
            .filter(([_, file]) => file !== null)
            .map(([playerName, file]) => {
              const formData = new FormData()
              formData.append("team_name", teamName)
              formData.append("player_name", playerName)
              formData.append("photo", file!)
              return fetch("/api/summer-selection/finals-player-photos-upload", {
                method: "POST",
                body: formData,
              })
            })
          
          if (photoSubmissions.length > 0) {
            await Promise.all(photoSubmissions)
          }
        }

        // Mark all visible games as submitted
        const newSubmitted = new Set(submitted)
        visibleGames.forEach((game) => newSubmitted.add(game.gameNumber))
        setSubmitted(newSubmitted)
        setMessage({ 
          type: "success", 
          text: `第${currentRound}輪已提交 (${visibleGames.length}場比賽)` 
        })
      } else {
        setMessage({ type: "error", text: data.error || "提交失敗" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "網絡錯誤，請重試" })
    } finally {
      setLoading(false)
    }
  }

  // Check if all visible games are filled
  const allGamesFilled = visibleGames.every((game) => lineups[game.gameNumber])
  const allGamesSubmitted = visibleGames.every((game) => submitted.has(game.gameNumber))

  // Helper function to format date with day of week
  const formatDateWithDay = (dateStr: string) => {
    // Parse date like "6月15日"
    if (!dateStr) return dateStr
    
    // Map of dates to day of week for Round 1 and 2 (corrected)
    const dateMap: Record<string, string> = {
      "6月13日": "6月13日 (六)",
      "6月14日": "6月14日 (日)",
      "6月15日": "6月15日 (一)",
      "6月16日": "6月16日 (二)",
      "6月17日": "6月17日 (三)",
      "6月18日": "6月18日 (四)",
      "6月20日": "6月20日 (六)",
      "6月21日": "6月21日 (五)",
      "6月22日": "6月22日 (六)",
      "6月23日": "6月23日 (日)",
      "6月24日": "6月24日 (一)",
      "6月25日": "6月25日 (二)",
    }
    
    return dateMap[dateStr] || dateStr
  }

  return (
    <div className="space-y-8">
      {/* Deadline Information */}
      <div className="rounded-lg border border-blue-400/30 bg-blue-400/10 p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-300">
            {currentRound === 1 && "第一輪申報"}
            {currentRound === 2 && "第二輪申報"}
            {currentRound === 3 && "決賽申報"}
            {currentRound === 4 && "申報已結束"}
          </p>
          <p className="text-xs text-blue-300/80">
            {currentRound === 1 && "截止時間: 6月13日 (六) 23:59 (香港時間)"}
            {currentRound === 2 && "截止時間: 6月20日 (六) 23:59 (香港時間)"}
            {currentRound === 3 && "截止時間: 6月27日 (六) 23:59 (香港時間)"}
            {currentRound === 4 && "所有輪次已結束，只有管理員可修改"}
          </p>
          <p className="text-xs text-blue-300/60">距離截止: {timeUntilDeadline}</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-400/10 text-green-300 border border-green-400/30"
              : "bg-red-400/10 text-red-300 border border-red-400/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {!canSubmit && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4">
          <p className="text-sm text-red-300">申報期限已過，只有管理員可修改</p>
        </div>
      )}

      <div className="grid gap-4">
        {visibleGames.map((game) => {
          const gameLineup = lineups[game.gameNumber] || ""
          const isSubmitted = submitted.has(game.gameNumber)

          return (
            <div
              key={game.gameNumber}
              className={`rounded-lg border overflow-hidden transition-colors ${
                isSubmitted
                  ? "border-green-400/30 bg-green-400/5"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Game Info & Seating */}
                <div className="border-r border-white/10 p-6 bg-black/20">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Game {game.gameNumber} {game.location}
                      </h3>
                      <p className="text-sm text-muted-foreground">{formatDateWithDay(game.date)}</p>
                    </div>

                    {/* Teams and seating */}
                    <div className="space-y-2">
                      {game.teams.map((teamData, idx) => {
                        const winds = ["東", "南", "西", "北"]
                        const wind = winds[idx]
                        const isMyTeam = teamData.teamName === teamName

                        return (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className={`flex-1 ${isMyTeam ? "text-yellow-300 font-bold" : "text-foreground"}`}>
                              {teamData.teamName}
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded text-muted-foreground">
                              {wind}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {isSubmitted && (
                      <div className="text-sm font-semibold text-green-400">✓ 已提交</div>
                    )}
                  </div>
                </div>

                {/* Right: Selection Form (no individual submit button) */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">選手</label>
                    <select
                      value={gameLineup}
                      onChange={(e) => handlePlayerChange(game.gameNumber, e.target.value)}
                      disabled={allGamesSubmitted || !canSubmit}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-black disabled:opacity-50"
                      style={{
                        color: "black",
                        backgroundColor: gameLineup ? "#e5e7eb" : "#f3f4f6",
                      }}
                    >
                      <option value="">-- 請選擇 --</option>
                      {team.players.map((player) => (
                        <option key={player.name} value={player.name} style={{ color: "black" }}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>


                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Player Photos Section for Finals */}
      {currentRound === 3 && isFinalTeam && visibleGames.some(g => g.gameNumber >= 37) && (
        <div className="rounded-lg border border-emerald-300/15 bg-emerald-500/5 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-400"></span>
              選手照片上傳 (可選)
            </h3>
            <p className="text-xs text-emerald-300/70 mb-4">如不上傳照片，則默認使用之前紫荊盃的照片</p>
          </div>

          {getSelectedPlayers().length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              請先選擇選手，即可在此上傳照片
            </div>
          ) : (
            <div className="space-y-4">
              {getSelectedPlayers().map((playerName) => (
                <div key={playerName} className="rounded-lg bg-emerald-400/5 border border-emerald-300/20 p-4">
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    {playerName} 的照片
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(playerName, e.target.files?.[0] || null)}
                      disabled={allGamesSubmitted || !canSubmit}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground disabled:opacity-50 file:mr-2 file:py-1 file:px-2 file:rounded file:bg-emerald-500 file:text-white file:text-xs file:cursor-pointer hover:file:bg-emerald-600"
                    />
                    {playerPhotos[playerName] && (
                      <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <span>✓ {playerPhotos[playerName]?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single Submit Button for Round */}
      {!allGamesSubmitted && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmitRound}
            disabled={!allGamesFilled || loading || !canSubmit || allGamesSubmitted}
            size="lg"
            className="px-12 text-lg"
          >
            {loading ? "提交中..." : `提交選手 (${currentRound === 1 ? "第一輪" : currentRound === 2 ? "第二輪" : "決賽"})`}
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="font-semibold mb-2">提示：</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>每場比賽需選擇 1 名選手</li>
          <li>同一張桌會自動選擇相同選手（可手動修改，僅限初賽）</li>
          <li>第一輪: 6月13日 (六) 23:59 前可提交/修改</li>
          <li>第二輪: 6月20日 (六) 23:59 前可提交/修改</li>
          {isFinalTeam && <li>決賽: 6月27日 (六) 23:59 前可提交/修改（包含選手照片）</li>}
          <li>截止後僅管理員可修改</li>
        </ul>
      </div>
    </div>
  )
}
