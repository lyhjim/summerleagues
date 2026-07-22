"use client"

import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { schedule } from "@/components/schedule-data"
import { teamsData, type Player } from "@/lib/teams-data"
import { useGameLineups, saveGameLineup } from "@/lib/game-lineups"

// Resolve a schedule team name (e.g. "Bad Beat" or "牌道") to its roster in teamsData
function getTeamRoster(teamName: string): { players: Player[]; logo: string } | null {
  const entry = Object.values(teamsData).find(
    (t) => t.chineseName === teamName || (teamName === "Bad Beat" && t.chineseName === "壞拍子"),
  )
  if (!entry) return null
  return { players: entry.players, logo: entry.logo }
}

// Build a flat list of games from the schedule: gameNumber = dayIndex * 2 + matchIndex + 1
function buildGameList() {
  const games: { gameNumber: number; date: string; day: string; teams: string[] }[] = []
  schedule.forEach((matchDay, dayIndex) => {
    matchDay.matches.forEach((match, matchIndex) => {
      const gameNumber = dayIndex * 2 + matchIndex + 1
      games.push({
        gameNumber,
        date: matchDay.date,
        day: matchDay.day,
        // teams in seat order East/South/West/North; for selection we just need the 4 teams
        teams: match.teams,
      })
    })
  })
  return games
}

export function LineupSettings() {
  const games = useMemo(() => buildGameList(), [])
  const savedLineups = useGameLineups()

  const [selectedGame, setSelectedGame] = useState<number>(games[0]?.gameNumber ?? 1)
  // assignments: teamName -> playerName
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const currentGame = games.find((g) => g.gameNumber === selectedGame)

  // The 4 unique teams playing in this game (seat order, deduped just in case)
  const teamsInGame = useMemo(() => {
    if (!currentGame) return []
    const seen = new Set<string>()
    const unique: string[] = []
    for (const t of currentGame.teams) {
      if (!seen.has(t)) {
        seen.add(t)
        unique.push(t)
      }
    }
    return unique
  }, [currentGame])

  // Load existing assignments whenever the selected game (or saved data) changes
  useEffect(() => {
    const existing = savedLineups.find((l) => l.gameNumber === selectedGame)
    setAssignments(existing?.players ? { ...existing.players } : {})
    setMessage(null)
  }, [selectedGame, savedLineups])

  const handleSelectPlayer = (teamName: string, playerName: string) => {
    setAssignments((prev) => {
      const next = { ...prev }
      // Toggle off if clicking the already-selected player
      if (next[teamName] === playerName) {
        delete next[teamName]
      } else {
        next[teamName] = playerName
      }
      return next
    })
    setMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await saveGameLineup(selectedGame, assignments)
      setMessage({ type: "success", text: "已儲存！主頁「下場賽事」將顯示選定選手。" })
    } catch (e) {
      console.error("[v0] Failed to save lineup:", e)
      setMessage({ type: "error", text: "儲存失敗，請稍後再試。" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Game Selector */}
      <div className="space-y-3">
        <label htmlFor="game-select" className="block text-sm font-semibold text-foreground">
          選擇場次
        </label>
        <select
          id="game-select"
          value={selectedGame}
          onChange={(e) => setSelectedGame(Number(e.target.value))}
          className="w-full md:max-w-md rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {games.map((g) => (
            <option key={g.gameNumber} value={g.gameNumber} className="bg-background text-foreground">
              Game {g.gameNumber} · {g.date}（{g.day}）· {Array.from(new Set(g.teams)).join(" / ")}
            </option>
          ))}
        </select>
      </div>

      {/* Team Player Selectors */}
      {currentGame && (
        <div className="space-y-6">
          {teamsInGame.map((teamName) => {
            const roster = getTeamRoster(teamName)
            const selected = assignments[teamName]

            return (
              <div key={teamName} className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  {roster?.logo && (
                    <Image
                      src={roster.logo}
                      alt={teamName}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <h3 className="text-lg font-bold text-foreground">{teamName}</h3>
                  {selected && (
                    <span className="ml-auto text-sm text-primary font-semibold">出戰：{selected}</span>
                  )}
                </div>

                {roster ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {roster.players.map((player) => {
                      const isSelected = selected === player.name
                      return (
                        <button
                          key={player.name}
                          type="button"
                          onClick={() => handleSelectPlayer(teamName, player.name)}
                          aria-pressed={isSelected}
                          className={`relative rounded-lg overflow-hidden aspect-square group transition-all ${
                            isSelected
                              ? "ring-2 ring-primary scale-[1.02]"
                              : "ring-1 ring-white/10 hover:ring-white/30 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={player.photoUrl || "/placeholder.svg"}
                            alt={player.name}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <span className="text-xs font-bold text-white drop-shadow">{player.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                              已選
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">找不到此隊伍的選手資料。</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Save Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
        >
          {saving ? "儲存中..." : "儲存陣容"}
        </button>
        {message && (
          <p
            className={`text-sm font-medium ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
