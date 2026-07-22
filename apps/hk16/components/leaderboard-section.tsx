"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { readResults, calcTeamStandings, SCORES_KEY } from "@/lib/scores-store"

export interface TeamEntry {
  rank: number
  prevRank: number
  id: number
  name: string
  color: string
  logo: string
  points: number
  gamesPlayed: number
  gamesTotal: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  fourthPlaces: number
  highestGame: number
  qualifyGap: number
  trend: "up" | "down" | "same"
}

const BASE_TEAMS = [
  { id: 1, name: "邪魔外道",     color: "#facc15", logo: "/logos/tw1.png"       },
  { id: 2, name: "新蒲崗蕃茄黨", color: "#ef4444", logo: "/logos/tw2.png"       },
  { id: 3, name: "海陸胸墊隊",   color: "#87CEEB", logo: "/logos/tw3.jpeg"      },
  { id: 4, name: "無雙大雅",     color: "#22d3ee", logo: "/logos/wushuang.png"  },
]

const LOGO_MAP: Record<string, string> = {
  "邪魔外道": "/logos/tw1.png",
  "新蒲崗蕃茄黨": "/logos/tw2.png",
  "海陸胸墊隊": "/logos/tw3.jpeg",
  "無雙大雅": "/logos/wushuang.png",
}

function buildTeams(results: ReturnType<typeof readResults>): TeamEntry[] {
  const standings = calcTeamStandings(results)
  const teams: TeamEntry[] = BASE_TEAMS.map((base) => {
    const s = standings[base.name]
    return {
      rank: 0, prevRank: 0, id: base.id,
      name: base.name, color: base.color, logo: base.logo,
      points:       s?.points       ?? 0,
      gamesPlayed:  s?.gamesPlayed  ?? 0,
      gamesTotal:   6,
      firstPlaces:  s?.firstPlaces  ?? 0,
      secondPlaces: s?.secondPlaces ?? 0,
      thirdPlaces:  s?.thirdPlaces  ?? 0,
      fourthPlaces: s?.fourthPlaces ?? 0,
      highestGame:  s?.highestGame  ?? 0,
      qualifyGap:   0,
      trend:        "same" as const,
    }
  })
  teams.sort((a, b) => b.points - a.points)
  teams.forEach((t, i) => { t.rank = i + 1; t.prevRank = i + 1 })
  teams.forEach((t, i) => { t.qualifyGap = i === 0 ? 0 : t.points - teams[i - 1].points })
  return teams
}

interface TeamDetailModalProps {
  team: TeamEntry | null
  onClose: () => void
}

function TeamDetailModal({ team, onClose }: TeamDetailModalProps) {
  if (!team) return null

  const stats = [
    { label: "TOTAL PTS",  value: team.points > 0 ? `+${team.points}` : String(team.points), highlight: true },
    { label: "GAMES",      value: `${team.gamesPlayed} / ${team.gamesTotal}` },
    { label: "1ST PLACE",  value: String(team.firstPlaces) },
    { label: "2ND PLACE",  value: String(team.secondPlaces) },
    { label: "3RD PLACE",  value: String(team.thirdPlaces) },
    { label: "4TH PLACE",  value: String(team.fourthPlaces) },
    { label: "PEAK SCORE", value: `+${team.highestGame}` },
    { label: "GAP TO ABOVE", value: team.qualifyGap === 0 ? "—" : team.qualifyGap > 0 ? `+${team.qualifyGap}` : String(team.qualifyGap) },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-card border border-primary/30 p-6 shadow-2xl panel-corners"
        style={{ boxShadow: "0 0 40px oklch(0.80 0.18 195 / 0.1), inset 0 0 40px oklch(0 0 0 / 0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden border bg-white shrink-0 flex items-center justify-center" style={{ borderColor: team.color + "80" }}>
            {LOGO_MAP[team.name] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={LOGO_MAP[team.name]} alt={team.name} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-lg font-bold" style={{ color: team.color }}>{team.name[0]}</span>
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground tracking-wide">{team.name}</p>
            <p className="text-xs font-mono text-primary/70 tracking-widest">RANK #{String(team.rank).padStart(2, "0")}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map(({ label, value, highlight }) => (
            <div key={label} className="border border-border bg-secondary/40 px-4 py-3">
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground mb-1">{label}</p>
              <p className={cn("text-lg font-mono font-bold tabular-nums", highlight ? "text-primary text-glow-cyan" : "text-foreground")}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LeaderboardSection() {
  const [selected, setSelected] = useState<TeamEntry | null>(null)
  const [teams, setTeams] = useState<TeamEntry[]>(BASE_TEAMS.map((base, i) => ({
    rank: i + 1,
    prevRank: i + 1,
    id: base.id,
    name: base.name,
    color: base.color,
    logo: base.logo,
    points: 0,
    gamesPlayed: 0,
    gamesTotal: 6,
    firstPlaces: 0,
    secondPlaces: 0,
    thirdPlaces: 0,
    fourthPlaces: 0,
    highestGame: 0,
    qualifyGap: 0,
    trend: "same" as const,
  })))

  useEffect(() => {
    setTeams(buildTeams(readResults()))
    const handler = () => setTeams(buildTeams(readResults()))
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "font-mono font-bold"
    if (rank === 2) return "font-mono font-bold"
    if (rank === 3) return "font-mono font-bold"
    return "bg-rank-out/30 text-muted-foreground border border-border font-mono"
  }

  const getRankStyle = (rank: number): React.CSSProperties => {
    if (rank === 1) return { background: "oklch(0.84 0.17 85)", color: "oklch(0.08 0.004 220)" }
    if (rank === 2) return { background: "linear-gradient(135deg, #9ba8b4 0%, #c8d4dc 50%, #9ba8b4 100%)", color: "#0d1117" }
    if (rank === 3) return { background: "linear-gradient(135deg, #8b5e3c 0%, #cd9b6a 50%, #8b5e3c 100%)", color: "#0d1117" }
    return {}
  }

  return (
    <>
      <section>
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-3 h-px bg-primary" />
                <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">FIRST STAGE</p>
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                {"隊伍排行榜"}
                <span className="ml-3 text-xs font-mono text-muted-foreground font-normal">/ STANDINGS</span>
              </h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-primary/30 px-3 py-1.5 bg-primary/5">
            <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-primary/80">LIVE</span>
          </div>
        </div>

        {/* Table panel */}
        <div
          className="border border-border overflow-hidden relative"
          style={{ boxShadow: "inset 0 0 60px oklch(0 0 0 / 0.4)" }}
        >
          {/* Column headers */}
          <div className="grid grid-cols-[44px_1fr_80px] sm:grid-cols-[44px_1fr_80px_72px_80px_44px_44px_44px_44px] gap-x-2 px-4 py-2.5 bg-secondary/80 text-[10px] font-mono font-medium text-muted-foreground border-b border-border tracking-widest">
            <div>RNK</div>
            <div>TEAM</div>
            <div className="text-right">PTS</div>
            <div className="text-right hidden sm:block">GAP</div>
            <div className="text-right hidden sm:block">GAMES</div>
            <div className="text-right hidden sm:block">1ST</div>
            <div className="text-right hidden sm:block">2ND</div>
            <div className="text-right hidden sm:block">3RD</div>
            <div className="text-right hidden sm:block">4TH</div>
          </div>

          {teams.map((team) => {
            return (
              <div key={team.id}>
                <div
                  onClick={() => setSelected(team)}
                  className={cn(
                    "grid grid-cols-[44px_1fr_80px] sm:grid-cols-[44px_1fr_80px_72px_80px_44px_44px_44px_44px] gap-x-2 px-4 py-2.5 items-center cursor-pointer transition-colors hover:bg-primary/5 group border-b border-border/50",
                    team.rank === 1 ? "bg-rank-gold/[0.04]" : team.rank === 2 ? "bg-white/[0.02]" : team.rank === 3 ? "bg-orange-900/[0.06]" : "bg-transparent"
                  )}
                >
                  {/* Rank */}
                  <div>
                    <span
                      className={cn("w-7 h-7 flex items-center justify-center text-xs shrink-0", getRankBadge(team.rank))}
                      style={getRankStyle(team.rank)}
                    >
                      {String(team.rank).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Team name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden border bg-white flex items-center justify-center" style={{ borderColor: team.color + "80" }}>
                      {LOGO_MAP[team.name] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={LOGO_MAP[team.name]} alt={team.name} className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span className="text-xs font-bold" style={{ color: team.color }}>{team.name[0]}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                      <span className="hidden sm:inline shrink-0">
                        {team.trend === "up"   && <TrendingUp   className="w-3 h-3 text-primary" />}
                        {team.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                        {team.trend === "same" && <Minus        className="w-3 h-3 text-muted-foreground/40" />}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex justify-end">
                    <span className={cn(
                      "text-sm font-mono font-bold tabular-nums",
                      team.points >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {team.points > 0 ? "+" : ""}{team.points}
                    </span>
                  </div>

                  {/* Gap */}
                  <div className="hidden sm:flex justify-end">
                    <span className="text-xs font-mono tabular-nums text-green-400">
                      {team.qualifyGap === 0 ? "—" : team.qualifyGap > 0 ? `+${team.qualifyGap}` : team.qualifyGap}
                    </span>
                  </div>

                  {/* Games */}
                  <div className="hidden sm:flex justify-end">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {team.gamesPlayed}/{team.gamesTotal}
                    </span>
                  </div>

                  {/* Place counts */}
                  {[team.firstPlaces, team.secondPlaces, team.thirdPlaces].map((val, i) => (
                    <div key={i} className="hidden sm:flex justify-end">
                      <span className="text-sm font-mono text-foreground tabular-nums">{val}</span>
                    </div>
                  ))}
                  <div className="hidden sm:flex justify-end">
                    <span className="text-sm font-mono text-muted-foreground tabular-nums">{team.fourthPlaces}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
          {[
            { style: { background: "oklch(0.84 0.17 85)" },                                                              label: "1ST — GOLD"   },
            { style: { background: "linear-gradient(135deg, #9ba8b4 0%, #c8d4dc 50%, #9ba8b4 100%)" },                   label: "2ND — SILVER" },
            { style: { background: "linear-gradient(135deg, #8b5e3c 0%, #cd9b6a 50%, #8b5e3c 100%)" },                   label: "3RD — BRONZE" },
            { style: { background: "oklch(0.32 0.008 220)", border: "1px solid oklch(0.22 0.01 220)" },                  label: "4TH & BELOW"  },
          ].map(({ style, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 shrink-0" style={style} />
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <TeamDetailModal team={selected} onClose={() => setSelected(null)} />
    </>
  )
}
