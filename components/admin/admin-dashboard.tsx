"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { summerSchedule } from "@/lib/summer-selection/schedule"
import { summerTeams } from "@/lib/summer-selection/teams"

interface SubmissionStatus {
  [teamName: string]: Record<string, boolean>
}

interface GameScores {
  [gameNumber: number]: {
    e: number
    s: number
    w: number
    n: number
  }
}

// Map of "teamName_gameNumber" -> submitted player name
interface LineupNames {
  [key: string]: string
}

const TEAM_NAMES = ["層層疊", "鬼點子", "雙狙人", "影雀", "諾亞方舟", "疾風勁草"]

// All preliminary games (finals are games 37-40 and excluded here)
const PRELIM_GAMES = Array.from({ length: 36 }, (_, i) => i + 1)

// Finals games
const FINALS_GAMES = [37, 38, 39, 40]

export function AdminDashboard() {
  const [status, setStatus] = useState<SubmissionStatus>({})
  const [scores, setScores] = useState<GameScores>({})
  const [lineupNames, setLineupNames] = useState<LineupNames>({})
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState<"submissions" | "schedule" | "scores" | "edit-lineups" | "finals-photos">("submissions")
  const [finalsPhotos, setFinalsPhotos] = useState<any[]>([])
  const [editingPhoto, setEditingPhoto] = useState<{ game: number; seat: string; teamName: string } | null>(null)
  const [tempPhotoUrl, setTempPhotoUrl] = useState("")
  const [tempPlayerName, setTempPlayerName] = useState("")
  const [editingGame, setEditingGame] = useState<number | null>(null)
  const [tempScores, setTempScores] = useState({ e: 0, s: 0, w: 0, n: 0 })
  const [tempLineupPlayer, setTempLineupPlayer] = useState("")
  const [editingLineup, setEditingLineup] = useState<{ team: string; game: number } | null>(null)
  const [penalties, setPenalties] = useState<Record<string, any>>({})
  const [editingPenalty, setEditingPenalty] = useState<{ seat: string; game: number } | null>(null)
  const [tempPenaltyScore, setTempPenaltyScore] = useState(0)
  const [tempPenaltyReason, setTempPenaltyReason] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Helper function to get player name for a team in a game
  const getPlayerName = (teamName: string, gameNumber: number): string => {
    const key = `${teamName}_${gameNumber}`
    return lineupNames[key] || ""
  }

  const fetchData = async () => {
    try {
      const [statusRes, scoresRes, lineupsRes, photosRes, penaltiesRes] = await Promise.all([
        fetch("/api/admin/submission-status"),
        fetch("/api/admin/game-scores"),
        fetch("/api/summer-selection/lineups-display"),
        fetch("/api/summer-selection/finals-player-photos"),
        fetch("/api/admin/player-penalties"),
      ])

      if (statusRes.ok) {
        const data = await statusRes.json()
        setStatus(data.status)
      }

      if (scoresRes.ok) {
        const data = await scoresRes.json()
        setScores(data.scores)
      }

      if (lineupsRes.ok) {
        const data = await lineupsRes.json()
        // data keys are "TeamName_GameNumber_PlayerNum" -> { player1, player2 }
        const names: LineupNames = {}
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          // Only use the "_1" entries to avoid duplicates; extract team + game
          if (key.endsWith("_1")) {
            const withoutSuffix = key.slice(0, -2) // remove "_1"
            const lastUnderscore = withoutSuffix.lastIndexOf("_")
            const team = withoutSuffix.slice(0, lastUnderscore)
            const game = withoutSuffix.slice(lastUnderscore + 1)
            if (value?.player1) {
              names[`${team}_${game}`] = value.player1
            }
          }
        })
        setLineupNames(names)
      }

      if (photosRes.ok) {
        const data = await photosRes.json()
        setFinalsPhotos(data.photos || [])
      }

      if (penaltiesRes.ok) {
        const data = await penaltiesRes.json()
        setPenalties(data.penalties || {})
      }
    } catch (error) {
      console.error("[v0] Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveScore = async (gameNumber: number) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/game-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameNumber,
          eScore: tempScores.e,
          sScore: tempScores.s,
          wScore: tempScores.w,
          nScore: tempScores.n,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setScores((prev) => ({
          ...prev,
          [gameNumber]: { ...tempScores },
        }))
        setEditingGame(null)
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSavePenalty = async (gameNumber: number, teamName: string, playerName: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/player-penalties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameNumber,
          teamName,
          playerName,
          penaltyScore: tempPenaltyScore,
          reason: tempPenaltyReason,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        const key = `${gameNumber}-${teamName}-${playerName}`
        setPenalties((prev) => ({
          ...prev,
          [key]: { penaltyScore: tempPenaltyScore, reason: tempPenaltyReason },
        }))
        setEditingPenalty(null)
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLineup = async () => {
    if (!editingLineup || !tempLineupPlayer.trim()) {
      setMessage({ type: "error", text: "選手名稱不能為空" })
      return
    }

    try {
      const response = await fetch("/api/admin/update-lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: editingLineup.team,
          gameNumber: editingLineup.game,
          playerName: tempLineupPlayer.trim(),
        }),
      })

      if (response.ok) {
        setLineupNames((prev) => ({
          ...prev,
          [`${editingLineup.team}_${editingLineup.game}`]: tempLineupPlayer.trim(),
        }))
        setEditingLineup(null)
        setMessage({ type: "success", text: `已更新 ${editingLineup.team} Game ${editingLineup.game} 的選手` })
      } else {
        const data = await response.json()
        setMessage({ type: "error", text: data.error || "保存失敗" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "網絡錯誤" })
    }
  }

  const handleSavePhoto = async () => {
    if (!editingPhoto || !tempPhotoUrl.trim()) {
      setMessage({ type: "error", text: "照片URL不能為空" })
      return
    }

    try {
      const response = await fetch("/api/admin/finals-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_number: editingPhoto.game,
          seat: editingPhoto.seat,
          team_name: editingPhoto.teamName,
          player_name: tempPlayerName.trim() || null,
          photo_url: tempPhotoUrl.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFinalsPhotos((prev) =>
          prev.some(p => p.game_number === editingPhoto.game && p.seat === editingPhoto.seat)
            ? prev.map(p => p.game_number === editingPhoto.game && p.seat === editingPhoto.seat ? data.data : p)
            : [...prev, data.data]
        )
        setEditingPhoto(null)
        setTempPhotoUrl("")
        setTempPlayerName("")
        setMessage({ type: "success", text: `已保存 Game ${editingPhoto.game} ${editingPhoto.seat} 位的照片` })
      } else {
        const data = await response.json()
        setMessage({ type: "error", text: data.error || "保存失敗" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "網絡錯誤" })
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">載入中...</div>
  }

  return (
    <div className="space-y-6">
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

      {/* Tab Buttons */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setCurrentTab("submissions")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            currentTab === "submissions"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          申報狀態
        </button>
        <button
          onClick={() => setCurrentTab("schedule")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            currentTab === "schedule"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          完整賽程
        </button>
        <button
          onClick={() => setCurrentTab("edit-lineups")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            currentTab === "edit-lineups"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          編輯陣容
        </button>
        <button
          onClick={() => setCurrentTab("scores")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            currentTab === "scores"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          成績輸入
        </button>
        <button
          onClick={() => setCurrentTab("finals-photos")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            currentTab === "finals-photos"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          決賽照片上傳
        </button>
      </div>

      {/* Submissions Tab - Finals Only */}
      {currentTab === "submissions" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-emerald-400">決賽隊伍申報狀態</h3>
          
          {/* Table Grid - Finals Only */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-emerald-400/30 bg-emerald-400/5">
                  <th className="text-left py-2 px-3 text-emerald-400 font-semibold sticky left-0 bg-emerald-400/5 z-10">隊伍</th>
                  {FINALS_GAMES.map((game) => (
                    <th key={game} className="text-center py-2 px-2 text-xs text-emerald-300 whitespace-nowrap">
                      Game {game}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["鬼點子", "層層疊", "雙狙人", "疾風勁草"].map((teamName) => (
                  <tr key={teamName} className="border-b border-emerald-400/20 hover:bg-emerald-400/5">
                    <td className="py-3 px-3 font-semibold text-foreground sticky left-0 bg-background z-10 whitespace-nowrap">{teamName}</td>
                    {FINALS_GAMES.map((game) => {
                      const submitted = status[teamName]?.[game.toString()] ?? false
                      const playerName = getPlayerName(teamName, game)

                      return (
                        <td
                          key={game}
                          className={`text-center py-3 px-2 text-xs font-medium whitespace-nowrap ${
                            submitted
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          {submitted && playerName ? playerName : submitted ? "✓" : "未報"}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">綠色 = 已提交（顯示選手名）　未報 = 未提交</p>
        </div>
      )}

      {/* Schedule Tab */}
      {currentTab === "schedule" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground">完整賽程</h3>

          {[1, 2, 3, 4, 5].map((dayNum) => {
            const dayGames = summerSchedule.filter((g) => g.day === dayNum)
            if (dayGames.length === 0) return null

            const dayLabel =
              dayNum === 5 ? "決賽" : `Day ${dayNum} · ${dayGames[0].date}`

            return (
              <div key={dayNum} className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground border-b border-white/10 pb-2">
                  {dayLabel}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayGames.map((game) => {
                    const winds = ["東", "南", "西", "北"]

                    return (
                      <div
                        key={game.gameNumber}
                        className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
                      >
                        <div className="bg-primary/10 px-3 py-2 border-b border-white/10 flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">
                            Game {game.gameNumber} {game.location}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">{game.date}</span>
                        </div>

                        <div className="p-3 space-y-1.5">
                          {game.teams.map((teamData, idx) => {
                            const playerName = getPlayerName(teamData.teamName, game.gameNumber)
                            const isFinal = game.day === 5

                            return (
                              <div key={idx} className="flex items-center justify-between text-xs gap-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/10 rounded text-muted-foreground flex-shrink-0">
                                    {winds[idx]}
                                  </span>
                                  <span className="text-foreground truncate">{teamData.teamName}</span>
                                </div>
                                {!isFinal && (
                                  <span
                                    className={`flex-shrink-0 ${
                                      playerName ? "text-green-300 font-medium" : "text-muted-foreground/50"
                                    }`}
                                  >
                                    {playerName || "未報"}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Lineups Tab */}
      {currentTab === "edit-lineups" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground">編輯陣容（第1-36場）</h3>

          {PRELIM_GAMES.map((gameNum) => {
            const game = summerSchedule.find((g) => g.gameNumber === gameNum)
            if (!game) return null

            return (
              <div key={gameNum} className="border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground">Game {gameNum} - {game.location}</h4>
                  <span className="text-xs text-muted-foreground">{game.date}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {game.teams.map((teamData) => {
                    const winds = ["東", "南", "西", "北"]
                    const windIdx = game.teams.findIndex((t) => t.teamName === teamData.teamName)
                    const currentPlayer = getPlayerName(teamData.teamName, gameNum)
                    const isEditing =
                      editingLineup?.team === teamData.teamName && editingLineup?.game === gameNum

                    return (
                      <div
                        key={teamData.teamName}
                        className={`rounded-lg border p-3 ${
                          isEditing
                            ? "border-primary/50 bg-primary/5"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 bg-white/10 rounded">
                            {winds[windIdx]}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {teamData.teamName}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <select
                              value={tempLineupPlayer}
                              onChange={(e) => setTempLineupPlayer(e.target.value)}
                              className="w-full px-2 py-1.5 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                              autoFocus
                            >
                              <option value="">-- 選擇選手 --</option>
                              {summerTeams
                                .find((t) => t.chineseName === teamData.teamName)
                                ?.players.map((player) => (
                                  <option key={player.name} value={player.name}>
                                    {player.name}
                                  </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveLineup}
                                className="flex-1 text-sm"
                              >
                                保存
                              </Button>
                              <Button
                                onClick={() => setEditingLineup(null)}
                                variant="outline"
                                className="flex-1 text-sm"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingLineup({
                                team: teamData.teamName,
                                game: gameNum,
                              })
                              setTempLineupPlayer(currentPlayer)
                            }}
                          >
                            <div className="text-sm text-foreground mb-2">
                              {currentPlayer ? (
                                <span className="text-green-300 font-medium">{currentPlayer}</span>
                              ) : (
                                <span className="text-muted-foreground">未設定</span>
                              )}
                            </div>
                            <Button className="w-full text-sm">編輯</Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <h3 className="text-lg font-bold text-foreground mt-8">編輯陣容（決賽 37-40場）</h3>

          {FINALS_GAMES.map((gameNum) => {
            const game = summerSchedule.find((g) => g.gameNumber === gameNum)
            if (!game) return null

            return (
              <div key={gameNum} className="border border-emerald-400/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground">Game {gameNum} - {game.location}</h4>
                  <span className="text-xs text-muted-foreground">{game.date}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {game.teams.map((teamData) => {
                    const winds = ["東", "南", "西", "北"]
                    const windIdx = game.teams.findIndex((t) => t.teamName === teamData.teamName)
                    const currentPlayer = getPlayerName(teamData.teamName, gameNum)
                    const isEditing =
                      editingLineup?.team === teamData.teamName && editingLineup?.game === gameNum

                    return (
                      <div
                        key={teamData.teamName}
                        className={`rounded-lg border p-3 ${
                          isEditing
                            ? "border-emerald-400/50 bg-emerald-400/5"
                            : "border-emerald-400/20 bg-emerald-400/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 bg-emerald-400/20 rounded">
                            {winds[windIdx]}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {teamData.teamName}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <select
                              value={tempLineupPlayer}
                              onChange={(e) => setTempLineupPlayer(e.target.value)}
                              className="w-full px-2 py-1.5 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                              autoFocus
                            >
                              <option value="">-- 選擇選手 --</option>
                              {summerTeams
                                .find((t) => t.chineseName === teamData.teamName)
                                ?.players.map((player) => (
                                  <option key={player.name} value={player.name}>
                                    {player.name}
                                  </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveLineup}
                                className="flex-1 text-sm"
                              >
                                保存
                              </Button>
                              <Button
                                onClick={() => setEditingLineup(null)}
                                variant="outline"
                                className="flex-1 text-sm"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingLineup({
                                team: teamData.teamName,
                                game: gameNum,
                              })
                              setTempLineupPlayer(currentPlayer)
                            }}
                          >
                            <div className="text-sm text-foreground mb-2">
                              {currentPlayer ? (
                                <span className="text-emerald-300 font-medium">{currentPlayer}</span>
                              ) : (
                                <span className="text-muted-foreground">未設定</span>
                              )}
                            </div>
                            <Button className="w-full text-sm">編輯</Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Scores Tab */}
      {currentTab === "scores" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">成績輸入（第1-36場）</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRELIM_GAMES.map((game) => {
              const gameScores = scores[game] || { e: 0, s: 0, w: 0, n: 0 }
              const isEditing = editingGame === game

              return (
                <div
                  key={game}
                  className={`rounded-lg border p-4 ${
                    isEditing
                      ? "border-primary/50 bg-primary/5"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-foreground">Game {game}</h4>
                    {!isEditing && gameScores.e !== 0 && (
                      <span className="text-xs font-semibold text-green-400">✓ 已輸入</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {["e", "s", "w", "n"].map((wind) => (
                          <div key={wind}>
                            <label className="text-xs text-muted-foreground block mb-1">
                              {wind.toUpperCase()}
                            </label>
                            <input
                              type="number"
                              value={(tempScores as any)[wind]}
                              onChange={(e) =>
                                setTempScores((prev) => ({
                                  ...prev,
                                  [wind]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        總和: {tempScores.e + tempScores.s + tempScores.w + tempScores.n}/1000
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveScore(game)}
                          className="flex-1 text-sm"
                        >
                          保存
                        </Button>
                        <Button
                          onClick={() => setEditingGame(null)}
                          variant="outline"
                          className="flex-1 text-sm"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="space-y-2 cursor-pointer"
                      onClick={() => {
                        setEditingGame(game)
                        setTempScores(gameScores)
                      }}
                    >
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div className="text-muted-foreground">{gameScores.e}</div>
                        <div className="text-muted-foreground">{gameScores.s}</div>
                        <div className="text-muted-foreground">{gameScores.w}</div>
                        <div className="text-muted-foreground">{gameScores.n}</div>
                      </div>
                      <Button className="w-full text-sm">編輯</Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Finals Scores */}
          <h3 className="text-lg font-bold text-emerald-400 pt-6">決賽成績輸入（第37-40場）</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FINALS_GAMES.map((game) => {
              const gameScores = scores[game] || { e: 0, s: 0, w: 0, n: 0 }
              const isEditing = editingGame === game
              const scheduleGame = summerSchedule.find((g) => g.gameNumber === game)
              const seatTeams = scheduleGame?.teams.map((t) => t.teamName) || []

              return (
                <div
                  key={game}
                  className={`rounded-lg border p-4 ${
                    isEditing
                      ? "border-emerald-400/50 bg-emerald-400/5"
                      : "border-emerald-400/20 bg-emerald-400/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-foreground">Game {game}</h4>
                    {!isEditing && gameScores.e !== 0 && (
                      <span className="text-xs font-semibold text-green-400">✓ 已輸入</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {["e", "s", "w", "n"].map((wind, widx) => (
                          <div key={wind}>
                            <label className="text-xs text-muted-foreground block mb-1">
                              {["東", "南", "西", "北"][widx]}
                              <span className="block text-[10px] text-emerald-300/70 truncate">
                                {seatTeams[widx]}
                              </span>
                            </label>
                            <input
                              type="number"
                              value={(tempScores as any)[wind]}
                              onChange={(e) =>
                                setTempScores((prev) => ({
                                  ...prev,
                                  [wind]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        總和: {tempScores.e + tempScores.s + tempScores.w + tempScores.n}/1000
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveScore(game)}
                          className="flex-1 text-sm"
                        >
                          保存
                        </Button>
                        <Button
                          onClick={() => setEditingGame(null)}
                          variant="outline"
                          className="flex-1 text-sm"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="space-y-2 cursor-pointer"
                      onClick={() => {
                        setEditingGame(game)
                        setTempScores(gameScores)
                      }}
                    >
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        {["e", "s", "w", "n"].map((wind, widx) => (
                          <div key={wind}>
                            <div className="text-[10px] text-emerald-300/70 truncate">{seatTeams[widx]}</div>
                            <div className="text-muted-foreground">{(gameScores as any)[wind]}</div>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full text-sm">編輯</Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Player Penalties Section */}
          <h3 className="text-lg font-bold text-red-400 pt-6">選手罰分管理 (Game 37-40)</h3>
          
          {FINALS_GAMES.map((gameNum) => {
            const winds = ["東", "南", "西", "北"]
            const finalsTeams = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]
            
            return (
              <div key={gameNum} className="border border-red-400/30 rounded-lg p-4 space-y-4">
                <h4 className="font-bold text-foreground text-lg">Game {gameNum}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {finalsTeams.map((teamName, idx) => {
                    const seat = winds[idx]
                    const playerName = getPlayerName(teamName, gameNum)
                    const penaltyKey = `${gameNum}-${teamName}-${playerName}`
                    const penalty = penalties[penaltyKey]
                    const isEditing = editingPenalty?.game === gameNum && editingPenalty?.seat === seat
                    
                    return (
                      <div
                        key={seat}
                        className={`rounded-lg border p-3 transition-colors ${
                          isEditing
                            ? "border-red-400/50 bg-red-400/10"
                            : penalty
                              ? "border-orange-400/30 bg-orange-400/5"
                              : "border-red-400/20 bg-red-400/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold px-1.5 py-0.5 bg-red-400/20 rounded text-red-300">
                            {seat}
                          </span>
                          <span className="text-sm font-medium text-foreground">{teamName}</span>
                          <span className="text-xs text-muted-foreground">{playerName}</span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">罰分 (負數表示扣分)</label>
                              <input
                                type="number"
                                value={tempPenaltyScore}
                                onChange={(e) => setTempPenaltyScore(parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                                placeholder="例如: -5"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">罰分原因</label>
                              <textarea
                                value={tempPenaltyReason}
                                onChange={(e) => setTempPenaltyReason(e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-foreground text-sm resize-none"
                                rows={2}
                                placeholder="輸入罰分原因"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSavePenalty(gameNum, teamName, playerName)}
                                className="flex-1 text-sm bg-red-500 hover:bg-red-600"
                              >
                                保存
                              </Button>
                              <Button
                                onClick={() => setEditingPenalty(null)}
                                variant="outline"
                                className="flex-1 text-sm"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer space-y-1"
                            onClick={() => {
                              setEditingPenalty({ game: gameNum, seat })
                              setTempPenaltyScore(penalty?.penaltyScore || 0)
                              setTempPenaltyReason(penalty?.reason || "")
                            }}
                          >
                            {penalty ? (
                              <>
                                <div className="text-sm font-semibold text-orange-300">
                                  罰分: {penalty.penaltyScore}
                                </div>
                                {penalty.reason && (
                                  <div className="text-xs text-orange-200/70 break-words">
                                    原因: {penalty.reason}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-muted-foreground text-center py-2">
                                點擊新增罰分
                              </div>
                            )}
                            <Button className="w-full text-sm mt-2" size="sm">
                              {penalty ? "編輯罰分" : "新增罰分"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}


      {/* Finals Photos Tab */}
      {currentTab === "finals-photos" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground">決賽照片上傳 (Game 37-40)</h3>
          
          {[37, 38, 39, 40].map((gameNum) => {
            const winds = ["東", "南", "西", "北"]
            const finalsTeams = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]
            
            return (
              <div key={gameNum} className="border border-emerald-400/30 rounded-lg p-4 space-y-4">
                <h4 className="font-bold text-foreground text-lg">Game {gameNum}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {finalsTeams.map((teamName, idx) => {
                    const seat = winds[idx]
                    const photo = finalsPhotos.find(p => p.game_number === gameNum && p.seat === seat)
                    const isEditing = editingPhoto?.game === gameNum && editingPhoto?.seat === seat
                    
                    return (
                      <div 
                        key={seat}
                        className={`rounded-lg border p-3 transition-colors ${
                          isEditing
                            ? "border-emerald-400/50 bg-emerald-400/10"
                            : "border-emerald-400/20 bg-emerald-400/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold px-1.5 py-0.5 bg-emerald-400/20 rounded text-emerald-300">
                            {seat}
                          </span>
                          <span className="text-sm font-medium text-foreground">{teamName}</span>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">照片URL</label>
                              <input
                                type="text"
                                value={tempPhotoUrl}
                                onChange={(e) => setTempPhotoUrl(e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                                className="w-full px-2 py-1.5 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">選手名稱（可選）</label>
                              <input
                                type="text"
                                value={tempPlayerName}
                                onChange={(e) => setTempPlayerName(e.target.value)}
                                placeholder="選手名稱"
                                className="w-full px-2 py-1.5 rounded bg-white/10 border border-white/20 text-foreground text-sm"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={handleSavePhoto}
                                size="sm"
                                className="flex-1"
                              >
                                保存
                              </Button>
                              <Button
                                onClick={() => setEditingPhoto(null)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingPhoto({ game: gameNum, seat, teamName })
                              setTempPhotoUrl(photo?.photo_url || "")
                              setTempPlayerName(photo?.player_name || "")
                            }}
                          >
                            {photo?.photo_url ? (
                              <div className="space-y-2">
                                <div className="aspect-square rounded bg-white/10 overflow-hidden flex items-center justify-center border border-emerald-400/30">
                                  <img
                                    src={photo.photo_url}
                                    alt={teamName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                      e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-muted-foreground">圖片載入失敗</span>'
                                    }}
                                  />
                                </div>
                                {photo.player_name && (
                                  <div className="text-xs text-emerald-300 font-medium text-center">{photo.player_name}</div>
                                )}
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  編輯
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="aspect-square rounded bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">未上傳照片</span>
                                </div>
                                <Button size="sm" className="w-full text-xs">
                                  上傳照片
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
