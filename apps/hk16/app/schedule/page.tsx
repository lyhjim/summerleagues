"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, X, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEAMS, FULL_SCHEDULE, formatDateLabel, type MatchCard, type TeamKey } from "@/lib/schedule-data"
import { CircuitBg } from "@/components/circuit-bg"
import { readResults, SCORES_KEY, type RoundResult } from "@/lib/scores-store"
import { readTeamColors, TEAM_COLORS_KEY, type TeamColors } from "@/lib/team-colors-store"

// Modal to show match results
function MatchResultModal({
  match,
  results,
  teamColors,
  onClose,
}: {
  match: MatchCard
  results: RoundResult[]
  teamColors: TeamColors
  onClose: () => void
}) {
  const { shortDate, dayEn } = formatDateLabel(match.date)
  const winnerKey = match.winner
  const winnerTeam = winnerKey ? TEAMS[winnerKey] : null
  const winnerColor = winnerTeam ? (teamColors[winnerTeam.name] || winnerTeam.color) : "#87CEEB"

  // Get results for this match
  const matchResults = results.filter((r) => r.matchId === match.id)

  // Build player scores sorted by points (highest first)
  const playerScores: { playerName: string; team: string; teamKey: TeamKey; rawPts: number }[] = []
  for (const r of matchResults) {
    for (const s of r.scores) {
      const existing = playerScores.find((p) => p.playerName === s.playerName)
      if (existing) {
        existing.rawPts += s.rawPts
      } else {
        // Find team key from team name
        const teamKey = (Object.entries(TEAMS).find(([_, t]) => t.name === s.team)?.[0] || "xiemo") as TeamKey
        playerScores.push({ playerName: s.playerName, team: s.team, teamKey, rawPts: s.rawPts })
      }
    }
  }
  playerScores.sort((a, b) => b.rawPts - a.rawPts)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-card border-2 rounded-md w-full max-w-md overflow-hidden"
        style={{ borderColor: winnerColor, boxShadow: `0 0 30px ${winnerColor}40` }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-widest mb-1">MATCH RESULT</p>
            <h2 className="font-display text-xl font-bold text-primary">
              {shortDate} <span className="text-muted-foreground font-mono text-sm">({dayEn})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Winner highlight */}
        {winnerTeam && (
          <div
            className="p-4 flex items-center gap-4"
            style={{ backgroundColor: `${winnerColor}15` }}
          >
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-2 p-1 bg-card"
              style={{ borderColor: winnerColor, boxShadow: `0 0 16px ${winnerColor}80` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={winnerTeam.logo} alt={winnerTeam.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" style={{ color: winnerColor }} />
                <span className="text-xs font-mono tracking-widest" style={{ color: winnerColor }}>WINNER</span>
              </div>
              <h3 className="font-display text-lg font-bold" style={{ color: winnerColor }}>
                {winnerTeam.name}
              </h3>
            </div>
          </div>
        )}

        {/* Player scores table */}
        <div className="p-4">
          <p className="text-xs font-mono text-muted-foreground tracking-widest mb-3">PLAYER SCORES</p>
          <div className="space-y-2">
            {playerScores.map((p, idx) => {
              const team = TEAMS[p.teamKey]
              const color = teamColors[team.name] || team.color
              const isWinner = idx === 0

              return (
                <div
                  key={p.playerName}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-sm",
                    isWinner ? "bg-secondary/80" : "bg-secondary/30"
                  )}
                >
                  {/* Rank */}
                  <span
                    className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono font-bold",
                      isWinner ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </span>

                  {/* Team logo */}
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden border bg-card shrink-0"
                    style={{ borderColor: `${color}60` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-0.5" />
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.playerName}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{p.team}</p>
                  </div>

                  {/* Score */}
                  <span
                    className={cn(
                      "font-mono text-sm font-bold",
                      p.rawPts > 0 ? "text-green-400" : p.rawPts < 0 ? "text-red-400" : "text-muted-foreground"
                    )}
                  >
                    {p.rawPts > 0 ? "+" : ""}{p.rawPts}
                  </span>
                </div>
              )
            })}
          </div>

          {playerScores.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">No scores recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchCardCompact({ match, results, teamColors, onClick }: { match: MatchCard; results: RoundResult[]; teamColors: TeamColors; onClick?: () => void }) {
  const { shortDate, dayEn } = formatDateLabel(match.date)

  // Use match.winner from static data (set when match is completed)
  const isComplete = match.status === "completed"
  const winnerKey = match.winner ?? null
  const winnerColor = winnerKey ? (teamColors[TEAMS[winnerKey].name] || TEAMS[winnerKey].color) : null

  return (
    <div
      onClick={isComplete ? onClick : undefined}
      className={cn(
        "relative bg-card border-2 rounded-sm p-4 flex flex-col gap-3 transition-all duration-300",
        !isComplete && match.status !== "live" && "border-border",
        match.status === "live" && "border-primary/50 ring-1 ring-primary/20",
        isComplete && "cursor-pointer hover:scale-[1.02]"
      )}
      style={
        isComplete && winnerColor
          ? {
              borderColor: winnerColor,
              boxShadow: `0 0 18px ${winnerColor}30, inset 0 0 30px ${winnerColor}08`,
            }
          : undefined
      }
    >
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-primary">
            {shortDate}
          </span>
          <span className="text-sm font-mono text-muted-foreground">
            ({dayEn})
          </span>
        </div>
        {match.status === "live" && (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-destructive text-white tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}
        {isComplete && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm tracking-widest" style={{ color: winnerColor ?? undefined, borderColor: winnerColor ?? undefined, border: "1px solid" }}>
            COMPLETED
          </span>
        )}
      </div>

      {/* Teams grid - 4 in a row */}
      <div className="grid grid-cols-4 gap-2">
        {match.teams.map((key, idx) => {
          const team = TEAMS[key]
          const teamColor = teamColors[team.name] || team.color
          const isWinner = isComplete && winnerKey === key
          const isFaded = isComplete && winnerKey !== null && winnerKey !== key

          return (
            <div key={`${key}-${idx}`} className="flex flex-col items-center gap-1">
              {/* Outer glow ring for winner */}
              <div
                className={cn(
                  "rounded-full p-[3px] transition-all duration-300",
                  isWinner && "ring-2 ring-offset-2 ring-offset-card"
                )}
                style={
                  isWinner
                    ? {
                        background: `conic-gradient(from 0deg, ${teamColor}, #fff8, ${teamColor}cc, #fff4, ${teamColor})`,
                        boxShadow: `0 0 16px ${teamColor}cc, 0 0 32px ${teamColor}66`,
                        ringColor: teamColor,
                      }
                    : undefined
                }
              >
                <div
                  className={cn(
                    "relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 bg-card",
                    !isComplete && "border-border",
                    isFaded && "opacity-25 grayscale border-border",
                    isWinner && "border-transparent"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Team names in a row */}
      <div className="text-[10px] font-mono text-muted-foreground/70 text-center truncate">
        {match.teams.map((key) => TEAMS[key].name).join(" / ")}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const [results, setResults] = useState<RoundResult[]>([])
  const [teamColors, setTeamColors] = useState<TeamColors>({})
  const [selectedMatch, setSelectedMatch] = useState<MatchCard | null>(null)

  useEffect(() => {
    setResults(readResults())
    setTeamColors(readTeamColors())
    const handler = (e: StorageEvent) => {
      if (e.key === SCORES_KEY || !e.key) setResults(readResults())
      if (e.key === TEAM_COLORS_KEY || !e.key) setTeamColors(readTeamColors())
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  // Get unique months from schedule
  const months = [...new Set(FULL_SCHEDULE.map(day => {
    const d = new Date(day.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }))]

  return (
    <div className="min-h-screen bg-background relative">
      <CircuitBg />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="h-px w-full bg-primary opacity-80" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO HOME
            </Link>
            <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
              FULL SCHEDULE
            </h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Month tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {months.map((month) => {
            const [year, m] = month.split("-")
            const monthNum = parseInt(m)
            const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
            const isCurrentMonth = month === "2026-03" // Hardcoded for demo
            
            return (
              <button
                key={month}
                className={cn(
                  "px-4 py-2 text-sm font-mono tracking-wide rounded-sm transition-colors shrink-0",
                  isCurrentMonth
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {monthNames[monthNum]}
              </button>
            )
          })}
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FULL_SCHEDULE.flatMap(day => day.matches).map((match) => (
            <MatchCardCompact
              key={match.id}
              match={match}
              results={results}
              teamColors={teamColors}
              onClick={() => setSelectedMatch(match)}
            />
          ))}
        </div>

        {/* 25/04 Match VOD Banner */}
        <div className="mt-4">
          <a
            href="https://www.youtube.com/watch?v=DN8zkqYmu9A&t=11983s"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-sm overflow-hidden border border-border hover:border-primary/50 transition-colors group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banners/2504-banner.png"
              alt="HKPM TWMJ 雲龍盃 25/04 SAT 19:00 - 點擊觀看直播回放"
              className="w-full object-cover transition-opacity group-hover:opacity-90"
            />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-center">
          <p className="text-[10px] font-mono tracking-widest text-muted-foreground/50">
            2025 TAIWAN MAHJONG TOURNAMENT // ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>

      {/* Match result modal */}
      {selectedMatch && selectedMatch.status === "completed" && (
        <MatchResultModal
          match={selectedMatch}
          results={results}
          teamColors={teamColors}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}
