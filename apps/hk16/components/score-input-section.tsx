"use client"

import { useState } from "react"
import { Trash2, CheckCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { FULL_SCHEDULE, formatDateLabel } from "@/lib/schedule-data"
import { writeResult, readResults, deleteResult, type RoundResult } from "@/lib/scores-store"

// Team list
const TEAMS = ["邪魔外道", "新蒲崗蕃茄黨", "海陸胸墊隊", "無雙大雅"] as const
type TeamName = (typeof TEAMS)[number]

// Players grouped by team (3 members each)
const PLAYERS_BY_TEAM: Record<TeamName, string[]> = {
  "邪魔外道":     ["邪魔肥仔", "啤啤", "皇詐俠"],
  "新蒲崗蕃茄黨": ["毛毛爸爸", "肥手手", "Kazuha"],
  "海陸胸墊隊":   ["真寶", "Leona", "Elvan"],
  "無雙大雅":     ["Krystal", "Koko", "何Sir"],
}

interface PlayerRow {
  id: number
  team: string
  playerName: string
  rawPts: string
}

const defaultRow = (id: number): PlayerRow => ({
  id,
  team: "",
  playerName: "",
  rawPts: "",
})

// Flatten all matches for the selector
const ALL_MATCHES = FULL_SCHEDULE.flatMap((day) => day.matches)

export function ScoreInputSection() {
  const [selectedMatchId, setSelectedMatchId] = useState("")
  const [selectedRound, setSelectedRound] = useState<1 | 2>(1)
  const [players, setPlayers] = useState<PlayerRow[]>([
    defaultRow(1),
    defaultRow(2),
    defaultRow(3),
    defaultRow(4),
  ])
  const [submitted, setSubmitted] = useState(false)

  const updateRow = (id: number, field: keyof PlayerRow, value: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        if (field === "team") return { ...p, team: value, playerName: "" }
        return { ...p, [field]: value }
      })
    )
  }

  const removeRow = (id: number) => {
    if (players.length <= 2) return
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  const selectedNames = players.map((p) => p.playerName).filter(Boolean)
  const hasDuplicates = selectedNames.length !== new Set(selectedNames).size
  const rawPtsSum = players.reduce((sum, p) => sum + (parseFloat(p.rawPts) || 0), 0)
  const sumIsZero = Math.abs(rawPtsSum) < 0.001

  const isValid =
    !!selectedMatchId &&
    players.every((p) => p.team && p.playerName && p.rawPts !== "") &&
    !hasDuplicates &&
    sumIsZero

  const selectedMatch = ALL_MATCHES.find((m) => m.id === selectedMatchId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !selectedMatch) return

    writeResult({
      matchId: selectedMatch.id,
      round: selectedRound,
      matchDate: selectedMatch.date,
      scores: players.map((p) => ({
        playerName: p.playerName,
        team: p.team,
        rawPts: parseFloat(p.rawPts),
      })),
      submittedAt: Date.now(),
    })

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedMatchId("")
      setSelectedRound(1)
      setPlayers([defaultRow(1), defaultRow(2), defaultRow(3), defaultRow(4)])
    }, 2500)
  }

  return (
    <section id="submit" className="scroll-mt-20">
      {/* Section header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-3 h-px bg-primary" />
          <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">
            GAME INPUT
          </p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {"輸入成績"}
          <span className="ml-3 text-sm font-mono text-muted-foreground font-normal">
            / SUBMIT SCORE
          </span>
        </h2>
      </div>

      <div
        className="border border-border relative"
        style={{ boxShadow: "inset 0 0 60px oklch(0 0 0 / 0.4)" }}
      >
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 pointer-events-none" />

        <form onSubmit={handleSubmit}>
          {/* Match selector row */}
          <div className="px-4 py-3 border-b border-border bg-secondary/60 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                Select Match
              </span>
            </div>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className={cn(
                "h-9 bg-secondary border text-sm font-mono text-foreground px-3 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[260px]",
                selectedMatchId ? "border-primary/50 text-primary" : "border-border"
              )}
            >
              <option value="" disabled>{"--- 選擇比賽場次 / Choose Round ---"}</option>
              {ALL_MATCHES.map((m) => {
                const { dateTimeFull } = formatDateLabel(m.date)
                return (
                  <option key={m.id} value={m.id}>
                    {`Round ${m.id.replace("r", "")}  ·  ${dateTimeFull}`}
                  </option>
                )
              })}
            </select>
            {/* Round selector (R1 / R2) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedRound(1)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest border transition-all",
                  selectedRound === 1
                    ? "bg-amber-500 text-black border-amber-500"
                    : "bg-secondary text-muted-foreground border-border hover:border-amber-500/50"
                )}
              >
                R1
              </button>
              <button
                type="button"
                onClick={() => setSelectedRound(2)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest border transition-all",
                  selectedRound === 2
                    ? "bg-amber-500 text-black border-amber-500"
                    : "bg-secondary text-muted-foreground border-border hover:border-amber-500/50"
                )}
              >
                R2
              </button>
            </div>

            {selectedMatch && (
              <span className="text-[10px] font-mono text-primary/60 tracking-wide">
                {`ID: ${selectedMatch.id.toUpperCase()}-R${selectedRound}`}
              </span>
            )}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr_100px_36px] gap-2 px-4 py-2.5 bg-secondary/80 border-b border-border text-[10px] font-mono font-medium text-muted-foreground tracking-widest">
            <div>TEAM</div>
            <div>PLAYER</div>
            <div className="text-right">RAW PTS</div>
            <div />
          </div>

          {/* Player rows */}
          <div className="divide-y divide-border/50">
            {players.map((player) => {
              const availablePlayers = player.team
                ? PLAYERS_BY_TEAM[player.team as TeamName] ?? []
                : []

              return (
                <div
                  key={player.id}
                  className="grid grid-cols-[1fr_1fr_100px_36px] gap-2 px-4 py-2.5 items-center hover:bg-primary/[0.03] transition-colors"
                >
                  {/* Team select */}
                  <select
                    value={player.team}
                    onChange={(e) => updateRow(player.id, "team", e.target.value)}
                    className="h-9 bg-secondary border border-border text-sm text-foreground px-3 focus:outline-none focus:border-primary/60 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>{"選擇隊伍"}</option>
                    {TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* Player select */}
                  <select
                    value={player.playerName}
                    onChange={(e) => updateRow(player.id, "playerName", e.target.value)}
                    disabled={!player.team}
                    className={cn(
                      "h-9 bg-secondary border border-border text-sm text-foreground px-3 focus:outline-none focus:border-primary/60 transition-colors appearance-none cursor-pointer",
                      !player.team && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <option value="" disabled>{"選擇選手"}</option>
                    {availablePlayers.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>

                  {/* Raw points */}
                  <input
                    type="number"
                    placeholder="---"
                    value={player.rawPts}
                    onChange={(e) => updateRow(player.id, "rawPts", e.target.value)}
                    className={cn(
                      "h-9 bg-secondary border text-sm font-mono text-right px-3 placeholder:text-muted-foreground/30 focus:outline-none transition-colors tabular-nums",
                      parseFloat(player.rawPts) > 0
                        ? "text-green-400 border-green-500/40"
                        : parseFloat(player.rawPts) < 0
                          ? "text-red-400 border-red-500/40"
                          : "text-foreground border-border focus:border-primary/60"
                    )}
                  />

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeRow(player.id)}
                    disabled={players.length <= 2}
                    className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer bar */}
          <div className="px-4 py-3 bg-secondary/50 border-t border-border flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground">SUM:</span>
                <span className={cn("text-sm font-mono font-bold tabular-nums", sumIsZero ? "text-green-400" : "text-red-400")}>
                  {rawPtsSum > 0 ? `+${rawPtsSum}` : rawPtsSum}
                </span>
                {!sumIsZero && (
                  <span className="text-[10px] font-mono text-red-400/70">{"(MUST = 0)"}</span>
                )}
              </div>
              {hasDuplicates && (
                <span className="text-[11px] font-mono tracking-wide text-destructive">
                  DUPLICATE PLAYER SELECTED
                </span>
              )}
              {!selectedMatchId && (
                <span className="text-[11px] font-mono tracking-wide text-yellow-500/80">
                  SELECT A MATCH FIRST
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || submitted}
              className={cn(
                "relative px-5 py-2 text-[11px] font-mono tracking-widest font-semibold transition-all",
                submitted
                  ? "bg-primary/10 text-primary border border-primary/30 cursor-default"
                  : isValid
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
                    : "bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-50"
              )}
            >
              {submitted ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  SUBMITTED
                </span>
              ) : (
                "SUBMIT SCORE"
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="text-[10px] font-mono tracking-wide text-muted-foreground/50 mt-2 px-1">
        {"// TAIWAN MAHJONG 4-PLAYER FORMAT"}
      </p>
    </section>
  )
}
