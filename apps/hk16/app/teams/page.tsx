"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { TEAMS, PLAYERS_BY_TEAM, TeamKey } from "@/lib/schedule-data"
import { CircuitBg } from "@/components/circuit-bg"

// Team descriptions (brief placeholders for editing later)
const TEAM_DESCRIPTIONS: Record<TeamKey, { tagline: string; description: string }> = {
  xiemo: {
    tagline: "邪氣凜然 魔道至尊",
    description: "邪魔外道是一支以攻擊性打法聞名的隊伍，隊員們擅長險中求勝，常有出人意料的牌局逆轉。他們的座右銘：「寧可錯殺，不可放過。」",
  },
  spkt: {
    tagline: "火紅熱情 蕃茄至上",
    description: "新蒲崗蕃茄黨是一支充滿活力的隊伍，以團隊合作和穩定發揮著稱。他們的目標是在雲龍盃中展現實力。",
  },
  hailuk: {
    tagline: "海陸空三棲精英",
    description: "海陸胸墊隊由三位經驗豐富的牌手組成，以穩健的防守和精準的判斷著稱。隊伍迅速在本地麻將圈中嶄露頭角。",
  },
  wushuang: {
    tagline: "無人能敵 大雅風範",
    description: "無雙大雅是本屆聯賽的奪冠熱門，隊中成員均為資深牌手，擁有多年比賽經驗。他們以細膩的技術和團隊默契見長。",
  },
}

// Sample player stats (placeholder - will be replaced with real data later)
interface PlayerStats {
  season: string
  score: number
  avgScore: number
  highScore: number
  rounds: number // games * 4
}

interface PlayerData {
  name: string
  team: TeamKey
  stats: PlayerStats[]
}

// Player stats updated after Round 1 (2026-04-25)
const PLAYER_STATS: Record<string, PlayerStats[]> = {
  // 邪魔外道 — 啤啤 played R1, others sat out
  "邪魔肥仔": [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  "啤啤":     [{ season: "S0", score: -753,  avgScore: -753, highScore: 0,   rounds: 1 }],
  "皇詐俠":   [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  // 新蒲崗蕃茄黨 — 肥手手 played R1
  "毛毛爸爸": [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  "肥手手":   [{ season: "S0", score: -111,  avgScore: -111, highScore: 0,   rounds: 1 }],
  "Kazuha":   [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  // 海陸胸墊隊 — Elvan played R1
  "真寶":     [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  "Leona":    [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  "Elvan":    [{ season: "S0", score: 894,   avgScore: 894,  highScore: 894, rounds: 1 }],
  // 無雙大雅 — 何Sir played R1
  "Krystal":  [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  "Koko":     [{ season: "S0", score: 0,    avgScore: 0,    highScore: 0,   rounds: 0 }],
  "何Sir":    [{ season: "S0", score: -30,   avgScore: -30,  highScore: 0,   rounds: 1 }],
}

function PlayerStatsTable({ stats }: { stats: PlayerStats[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary/30 text-primary">
            <th className="px-3 py-2 text-left font-mono text-xs">{"對戰"}</th>
            <th className="px-3 py-2 text-right font-mono text-xs">{"個人分數"}</th>
            <th className="px-3 py-2 text-right font-mono text-xs">{"平均分數"}</th>
            <th className="px-3 py-2 text-right font-mono text-xs">{"最高分數"}</th>
            <th className="px-3 py-2 text-right font-mono text-xs">{"圈數"}</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-primary/5">
              <td className="px-3 py-2 font-mono text-muted-foreground">{row.season}</td>
              <td className={cn(
                "px-3 py-2 text-right font-mono tabular-nums",
                row.score >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {row.score >= 0 ? `+${row.score}` : row.score}
              </td>
              <td className={cn(
                "px-3 py-2 text-right font-mono tabular-nums",
                row.avgScore >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {row.avgScore >= 0 ? `+${row.avgScore.toFixed(1)}` : row.avgScore.toFixed(1)}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                {row.highScore}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                {row.rounds}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PlayerCard({ player, teamColor }: { player: string; teamColor: string }) {
  const stats = PLAYER_STATS[player] || [{ season: "S1", score: 0, avgScore: 0, highScore: 0, rounds: 0 }]

  return (
    <div className="bg-background/80 border border-border rounded-lg overflow-hidden">
      {/* Player header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ backgroundColor: teamColor }}
        >
          {player.slice(0, 2)}
        </div>
        <div>
          <h4 className="text-xl font-bold text-foreground">{player}</h4>
          <p className="text-xs font-mono text-muted-foreground">{"PLAYER STATS"}</p>
        </div>
      </div>
      {/* Stats table */}
      <div className="p-4">
        <PlayerStatsTable stats={stats} />
      </div>
    </div>
  )
}

function TeamModal({
  teamKey,
  onClose,
}: {
  teamKey: TeamKey
  onClose: () => void
}) {
  const team = TEAMS[teamKey]
  const players = PLAYERS_BY_TEAM[teamKey]
  const info = TEAM_DESCRIPTIONS[teamKey]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-card border border-border rounded-lg my-8 panel-corners"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none rounded-lg" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-md bg-background/50 border border-border hover:border-primary/50 hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal content */}
        <div className="relative">
          {/* Team header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-b border-border">
            <div
              className="relative w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0"
              style={{ borderColor: team.color }}
            >
              <Image
                src={team.logo}
                alt={team.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3
                className="font-display text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: team.color }}
              >
                {team.name}
              </h3>
              <p className="text-sm font-mono text-muted-foreground tracking-wide mb-2">
                {info.tagline}
              </p>
              <p className="text-foreground/70 text-sm max-w-xl">
                {info.description}
              </p>
            </div>
          </div>

          {/* Players section */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-px bg-primary" />
              <p className="text-[10px] font-mono tracking-[0.2em] text-primary/70 uppercase">
                {"TEAM ROSTER // 陣容"}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {players.map((player) => (
                <PlayerCard key={player} player={player} teamColor={team.color} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null)
  const teamKeys = Object.keys(TEAMS) as TeamKey[]

  return (
    <div className="min-h-screen bg-background relative">
      <CircuitBg />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {"BACK TO HOME"}
          </Link>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            {"隊伍介紹"}
            <span className="ml-2 text-xs font-mono text-muted-foreground font-normal">/ TEAMS</span>
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page title */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-px bg-primary" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">
              SYS // 2026 TAIWAN MAHJONG LEAGUE
            </p>
            <span className="w-8 h-px bg-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {"參賽隊伍"}
          </h2>
          <p className="text-muted-foreground font-mono text-sm">
            {"// 4 TEAMS // 12 CONTESTANTS"}
          </p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-2">
            {"點擊隊伍標誌查看陣容 // CLICK LOGO TO VIEW ROSTER"}
          </p>
        </div>

        {/* Teams grid */}
        <div className="flex flex-col gap-16">
          {teamKeys.map((key) => {
            const team = TEAMS[key]

            return (
              <section
                key={key}
                id={key}
                className="scroll-mt-24 relative bg-card border border-border rounded-lg overflow-hidden panel-corners"
              >
                {/* Scanline overlay */}
                <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row">
                  {/* Team logo section - clickable */}
                  <button
                    onClick={() => setSelectedTeam(key)}
                    className="relative w-full lg:w-72 h-48 lg:h-auto min-h-48 shrink-0 group cursor-pointer bg-black/20"
                    style={{ borderRight: `3px solid ${team.color}` }}
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                      fill
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 288px"
                    />
                    <div
                      className="absolute inset-0 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${team.color}20 0%, transparent 60%)`,
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-mono text-sm tracking-wider">
                        {"VIEW ROSTER"}
                      </span>
                    </div>
                  </button>

                  {/* Team info */}
                  <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
                    {/* Team name */}
                    <h3
                      className="font-display text-2xl sm:text-3xl font-bold mb-4"
                      style={{ color: team.color }}
                    >
                      {team.name}
                    </h3>

                    {/* View roster button */}
                    <button
                      onClick={() => setSelectedTeam(key)}
                      className="w-fit px-4 py-2 border border-primary/50 rounded-md text-primary text-sm font-mono hover:bg-primary/10 transition-colors"
                    >
                      {"查看陣容 // VIEW ROSTER"}
                    </button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-16 py-8 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-mono tracking-widest text-muted-foreground/40">
            {"TAIWAN MAHJONG TOURNAMENT // ALL RIGHTS RESERVED"}
          </p>
        </div>
      </footer>

      {/* Team modal */}
      {selectedTeam && (
        <TeamModal teamKey={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  )
}
