"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { readResults, calcTotalChips, calcBestRound, SCORES_KEY } from "@/lib/scores-store"

interface PlayerEntry {
  rank: number
  name: string
  team: string
  score: number
  avatarInitial: string
  avatarColor: string
}

const TEAM_COLORS: Record<string, string> = {
  "海陸胸墊隊":   "#3b82f6",
  "邪魔外道":     "#ef4444",
  "無雙 Leaguer": "#22d3ee",
  "呀達有隊未":   "#f59e0b",
}

function toEntries(map: Record<string, { team: string; total?: number; best?: number }>, key: "total" | "best"): PlayerEntry[] {
  return Object.entries(map)
    .map(([name, v]) => ({
      rank: 0,
      name,
      team: v.team,
      score: (key === "total" ? (v as any).total : (v as any).best) ?? 0,
      avatarInitial: name.slice(0, 2),
      avatarColor: TEAM_COLORS[v.team] ?? "#888",
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

// Fallback placeholder entries shown before any scores are submitted
const PLACEHOLDER: PlayerEntry[] = [
  { rank: 1, name: "---", team: "---", score: 0, avatarInitial: "-", avatarColor: "#444" },
  { rank: 2, name: "---", team: "---", score: 0, avatarInitial: "-", avatarColor: "#444" },
  { rank: 3, name: "---", team: "---", score: 0, avatarInitial: "-", avatarColor: "#444" },
]

const RANK_BADGE: Record<number, React.CSSProperties> = {
  1: { background: "#e53e3e", color: "#fff" },
  2: { background: "#38a169", color: "#fff" },
  3: { background: "#38a169", color: "#fff" },
}

function PlayerRow({ entry }: { entry: PlayerEntry }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border/40 last:border-b-0 hover:bg-primary/5 transition-colors">
      {/* Rank badge */}
      <span
        className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold shrink-0"
        style={RANK_BADGE[entry.rank] ?? { background: "#38a169", color: "#fff" }}
      >
        {entry.rank}
      </span>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
        style={{
          borderColor: entry.avatarColor + "60",
          backgroundColor: entry.avatarColor + "18",
          color: entry.avatarColor,
        }}
      >
        {entry.avatarInitial}
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight truncate">{entry.name}</p>
        <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{entry.team}</p>
      </div>

      {/* Score */}
      <span className={cn(
        "text-base font-mono font-bold tabular-nums shrink-0",
        entry.score >= 0 ? "text-green-400" : "text-red-400"
      )}>
        {entry.score >= 0 ? `+${entry.score}` : `${entry.score}`}
      </span>
    </div>
  )
}

interface PlayerBoardProps {
  title: string
  subtitle: string
  data: PlayerEntry[]
  scoreLabel?: string
}

function PlayerBoard({ title, subtitle, data, scoreLabel = "枚數" }: PlayerBoardProps) {
  return (
    <div
      className="flex-1 border border-border overflow-hidden relative"
      style={{ boxShadow: "inset 0 0 60px oklch(0 0 0 / 0.4)" }}
    >
      {/* Scanline */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs font-mono text-muted-foreground mt-0.5 tracking-widest">{subtitle}</p>
        )}
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[44px_44px_1fr_56px] gap-x-2 px-5 py-2 border-y border-border/60 bg-secondary/60">
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">{"順位"}</span>
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">{"選手"}</span>
        <span />
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground text-right">{scoreLabel}</span>
      </div>

      {/* Rows */}
      <div className="relative">
        {data.map((entry) => (
          <PlayerRow key={entry.rank} entry={entry} />
        ))}
      </div>
    </div>
  )
}

export function PlayerScoreboards() {
  const [totalChipsData, setTotalChipsData] = useState<PlayerEntry[]>(PLACEHOLDER)
  const [bestRoundData, setBestRoundData] = useState<PlayerEntry[]>(PLACEHOLDER)

  useEffect(() => {
    const refresh = () => {
      const results = readResults()
      const totals = toEntries(calcTotalChips(results) as any, "total")
      const bests  = toEntries(calcBestRound(results)  as any, "best")
      setTotalChipsData(totals.length ? totals : PLACEHOLDER)
      setBestRoundData(bests.length  ? bests  : PLACEHOLDER)
    }
    refresh()
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-3 h-px bg-primary" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">INDIVIDUAL RANKINGS</p>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            {"個人排行榜"}
            <span className="ml-3 text-xs font-mono text-muted-foreground font-normal">/ PLAYER STATS</span>
          </h2>
        </div>
      </div>

      {/* Two boards side by side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <PlayerBoard
          title="個人枚數"
          subtitle="TOTAL CHIPS // ALL ROUNDS"
          data={totalChipsData}
          scoreLabel="枚數"
        />
        <PlayerBoard
          title="個人單輪最多枚數"
          subtitle="BEST SINGLE ROUND CHIPS"
          data={bestRoundData}
          scoreLabel="枚數"
        />
      </div>
    </section>
  )
}
