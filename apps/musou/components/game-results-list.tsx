import Image from "next/image"
import Link from "next/link"
import { teamLogos } from "@/components/schedule-data"
import { teamsData } from "@/lib/teams-data"

interface ApiPlayer {
  name: string
  team: string
  seat: string
  finalScore: number
  rank: 1 | 2 | 3 | 4
  points: number
  penaltyPoints?: number
  penaltyReason?: string
}

interface ApiMatch {
  matchday: number
  round: string
  date: string
  players: ApiPlayer[]
  rounds: unknown[]
}

async function fetchMatches(): Promise<ApiMatch[]> {
  try {
    const res = await fetch("https://majhong-supreme.web.app/api/league/matches", {
      next: { revalidate: 60 }, // Refresh every 60 seconds for penalty updates
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.matches || []
  } catch {
    return []
  }
}

const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-slate-300 text-black",
  3: "bg-orange-500 text-white",
  4: "bg-zinc-600 text-white",
}

const rankBorder: Record<number, string> = {
  1: "border-yellow-400/40",
  2: "border-slate-400/30",
  3: "border-orange-500/30",
  4: "border-white/10",
}

export default async function GameResultsList() {
  const matches = await fetchMatches()
  const sorted = [...matches].sort((a, b) =>
    b.date.localeCompare(a.date) || b.matchday - a.matchday
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-foreground/50">
        尚無比賽結果
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">比賽結果</h2>
      {sorted.map((match, idx) => {
        const matchKey = `${match.date}-md${match.matchday}`
        const playersSorted = [...match.players].sort((a, b) => a.rank - b.rank)
        const winner = playersSorted[0]

        return (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 bg-white/5 border-b border-white/10">
              {/* Header on desktop */}
              <div className="hidden md:flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">{match.round}</span>
                  <span className="text-xs text-muted-foreground font-mono border border-white/10 px-2 py-0.5 rounded-full">
                    第 {match.matchday} 輪
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-mono">{match.date}</span>
              </div>

              {/* Mobile header with 4-team logos top right */}
              <div className="md:hidden flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">{match.round}</span>
                  <div className="text-xs text-muted-foreground font-mono border border-white/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    第 {match.matchday} 輪
                  </div>
                </div>
                {/* 4-team logos top right on mobile */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {playersSorted.map((player) => {
                    const info = teamLogos[player.team]
                    const isWinner = player.rank === 1
                    return (
                      <div key={player.name} className="flex flex-col items-center gap-0.5">
                        <div className="relative">
                          <span className={`absolute -top-1.5 -right-1.5 text-[7px] font-bold px-0.5 py-0 rounded-full z-10 ${rankColors[player.rank]}`}>
                            {player.rank}
                          </span>
                          {info ? (
                            <Image
                              src={info.logo}
                              alt={player.team}
                              width={24}
                              height={24}
                              className={`team-logo object-contain w-6 h-6 ${!isWinner ? "grayscale opacity-50" : ""}`}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                              {player.team[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Desktop: 4-team logo grid */}
              <div className="hidden md:grid grid-cols-4 gap-3">
                {playersSorted.map((player) => {
                  const info = teamLogos[player.team]
                  const isWinner = player.rank === 1

                  return (
                    <div key={player.name} className={`flex flex-col items-center gap-1.5 rounded-lg p-2 border ${rankBorder[player.rank]} ${isWinner ? "bg-yellow-400/5" : "bg-white/5"}`}>
                      <div className="relative">
                        <span className={`absolute -top-1 -right-1 text-[8px] font-bold px-0.5 py-0.5 rounded-full z-10 ${rankColors[player.rank]}`}>
                          {player.rank}
                        </span>
                        {info ? (
                          <Image
                            src={info.logo}
                            alt={player.team}
                            width={32}
                            height={32}
                            className={`team-logo object-contain w-8 h-8 ${!isWinner ? "grayscale opacity-50" : ""}`}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                            {player.team[0]}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold text-center leading-tight ${isWinner ? "text-yellow-300" : "text-foreground/50"}`}>
                        {player.team}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Mobile date below header */}
              <div className="md:hidden text-xs text-muted-foreground font-mono mt-2">
                {match.date}
              </div>
            </div>

            {/* 4-team logo row - desktop only backup */}
            <div className="hidden md:block px-5 pt-4 pb-2"></div>

            {/* Player results */}
            <div className="px-5 pb-4 space-y-3">
              {playersSorted.map((player) => {
                const isWinner = player.rank === 1
                return (
                  <div key={player.name} className={`rounded-lg p-3 relative ${isWinner ? "bg-yellow-400/8" : ""}`}>
                    {/* Rank badge - top right corner */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full inline-block ${rankColors[player.rank]}`}>
                        {player.rank}位
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Player name and team */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-foreground truncate">{player.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{player.team}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score - bottom right with shadow background */}
                    <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm rounded px-2 py-1.5">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-foreground/70 font-mono">{player.finalScore.toLocaleString()}</span>
                          <span className={`text-xs font-bold ${player.points >= 0 ? "text-green-300" : "text-red-300"}`}>
                            {player.points > 0 ? "+" : ""}{player.points.toFixed(1)}
                          </span>
                        </div>
                        {/* Penalty info if exists */}
                        {player.penaltyPoints && player.penaltyReason && (
                          <span className="text-[10px] text-red-300">({player.penaltyPoints > 0 ? "+" : ""}{player.penaltyPoints.toFixed(1)} {player.penaltyReason})</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Detail link */}
            <div className="px-5 pb-4 text-right">
              <Link
                href={`/matches/${matchKey}`}
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                查看回合詳情 →
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
