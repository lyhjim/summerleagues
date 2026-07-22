import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { teamLogos } from "@/components/match-schedule"
import { schedule } from "@/components/schedule-data"
import { ChevronLeft } from "lucide-react"

interface RoundPlayerResult {
  seat: string
  scoreChange: number
  isRiichi?: boolean
  isTenpai?: boolean
  scoreAfter: number
}

interface ApiRound {
  round: string
  honba: number
  resultType: "Ron" | "Tsumo" | "Draw"
  winnerSeat?: string
  loserSeat?: string
  yakuList?: string[]
  han?: number
  fu?: number
  doraCount?: number
  redDoraCount?: number
  uraDoraCount?: number
  isYakuman?: boolean
  riichiSticks?: number
  playerResults: RoundPlayerResult[]
}

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
  rounds: ApiRound[]
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

function resultTypeBadge(type: string) {
  switch (type) {
    case "Tsumo": return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">自摸</span>
    case "Ron":   return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">榮和</span>
    case "Draw":  return <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-600 text-white">流局</span>
    default:      return null
  }
}

function roundLabel(round: string, honba: number) {
  const map: Record<string, string> = {
    "East 1": "東一局", "East 2": "東二局", "East 3": "東三局", "East 4": "東四局",
    "South 1": "南一局", "South 2": "南二局", "South 3": "南三局", "South 4": "南四局",
    "West 1": "西一局", "West 2": "西二局", "West 3": "西三局", "West 4": "西四局",
    "North 1": "北一局", "North 2": "北二局", "North 3": "北三局", "North 4": "北四局",
  }
  const label = map[round] ?? round
  return honba > 0 ? `${label} ${honba}本場` : label
}

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const matches = await fetchMatches()

  let matchday: number
  let date: string | undefined

  // Try different formats:
  // Format 1: Plain matchday number (e.g., "48")
  // Format 2: YYYY-MM-DD-md{matchday} (e.g., "2026-03-09-md1")
  // Format 3: YYYY-MM-DD-{matchday}-t{table} (e.g., "2026-03-09-1-t1")
  
  const plainNumber = parseInt(matchId, 10)
  if (!isNaN(plainNumber) && plainNumber.toString() === matchId) {
    // Format 1: Plain matchday number
    matchday = plainNumber
  } else {
    const mdMatch = matchId.match(/^(\d{4}-\d{2}-\d{2})-md(\d+)$/)
    const tableMatch = matchId.match(/^(\d{4}-\d{2}-\d{2})-(\d+)-t(\d+)$/)
    
    if (mdMatch) {
      // Format 2: 2026-03-09-md1
      date = mdMatch[1]
      matchday = parseInt(mdMatch[2])
    } else if (tableMatch) {
      // Format 3: 2026-03-09-1-t1
      date = tableMatch[1]
      matchday = parseInt(tableMatch[2])
    } else {
      notFound()
    }
  }

  // Find match by matchday (and date if provided)
  let match = matches.find(m => m.matchday === matchday && (!date || m.date === date))
  
  if (!match) notFound()

  const playersSorted = [...match.players].sort((a, b) => a.rank - b.rank)
  
  // Build correct seat assignments from schedule data
  let teamToSeat: Record<string, string> = {}
  const seatWinds = ["E", "S", "W", "N"]
  
  // Find the schedule match for this game to get the correct seating order
  let scheduleIndex = 0
  for (let i = 0; i < schedule.length; i++) {
    for (let j = 0; j < schedule[i].matches.length; j++) {
      scheduleIndex++
      if (scheduleIndex === match.matchday) {
        // Found the schedule match - map teams to seats
        const scheduleMatch = schedule[i].matches[j]
        scheduleMatch.teams.forEach((team, idx) => {
          teamToSeat[team] = seatWinds[idx]
        })
        break
      }
    }
    if (Object.keys(teamToSeat).length > 0) break
  }
  
  // Create playerBySeat mapping using correct seat assignments from schedule
  const playerBySeat: Record<string, typeof match.players[0]> = {}
  match.players.forEach(player => {
    const correctSeat = teamToSeat[player.team] || player.seat
    playerBySeat[correctSeat] = { ...player, seat: correctSeat }
  })
  
  // Always display players by wind position: E (East), S (South), W (West), N (North)
  const seats = ["E", "S", "W", "N"]

  const drawnCount = match.rounds.filter(r => r.resultType === "Draw").length

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Back */}
        <Link href="/schedule" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="size-4" /> 返回賽程表
        </Link>

        {/* Match header */}
        <div className="rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">{match.round}</span>
              <span className="text-xs text-muted-foreground font-mono border border-white/10 px-2 py-0.5 rounded-full">
                第 {match.matchday} 輪
              </span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">{match.date}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 px-5 py-3 border-b border-white/10 text-sm text-muted-foreground">
            <span>總局數: <strong className="text-foreground">{match.rounds.length}</strong></span>
            <span>流局數: <strong className="text-foreground">{drawnCount}</strong></span>
          </div>

          {/* Player header row */}
          <div className="grid grid-cols-5 divide-x divide-white/10">
            <div className="px-4 py-4" />
            {seats.map(seat => {
              const player = playerBySeat[seat]
              if (!player) return <div key={seat} />
              const info = teamLogos[player.team]
              const isWinner = player.rank === 1
              return (
                <div key={seat} className="flex flex-col items-center gap-1.5 px-3 py-4">
                  {info ? (
                    <Image
                      src={info.logo}
                      alt={player.team}
                      width={44}
                      height={44}
                      className={`team-logo object-contain w-11 h-11 ${!isWinner ? "grayscale opacity-60" : ""}`}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{player.team[0]}</div>
                  )}
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{player.team}</span>
                  <span className="font-bold text-sm text-foreground">{player.name}</span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rankColors[player.rank]}`}>{player.rank}位</span>
                    <span className={`text-sm font-bold ${player.points >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {player.points > 0 ? "+" : ""}{player.points.toFixed(1)}
                    </span>
                    {(() => {
                      const penalty = match.penalties?.find(
                        p => p.playerName === player.name && p.teamName === player.team
                      )
                      return penalty ? (
                        <span className="text-xs text-red-400">({penalty.points > 0 ? "+" : ""}{penalty.points}, {penalty.reason})</span>
                      ) : null
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Round-by-round transactions */}
        <div className="rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 bg-white/5 border-b border-white/10">
            <h2 className="font-bold text-foreground">回合詳情</h2>
          </div>

          <div className="divide-y divide-white/5">
            {match.rounds.map((r, i) => {
              const label = roundLabel(r.round, r.honba)
              return (
                <div key={i} className="grid grid-cols-5 divide-x divide-white/5 hover:bg-white/[0.02] transition-colors">
                  {/* Round label */}
                  <div className="px-4 py-4 flex flex-col justify-start gap-1.5">
                    <span className="text-sm font-bold text-foreground">{label}</span>
                    {resultTypeBadge(r.resultType)}
                    {r.yakuList && r.yakuList.length > 0 && (
                      <span className="text-[10px] text-muted-foreground leading-snug">{r.yakuList.join(" ")}</span>
                    )}
                    {(r.han !== undefined && r.fu !== undefined) && (
                      <span className="text-[10px] text-muted-foreground">{r.han}翻 {r.fu}符</span>
                    )}
                    {(r.doraCount || r.redDoraCount || r.uraDoraCount) ? (
                      <span className="text-[10px] text-muted-foreground">
                        {r.doraCount ? `寶牌${r.doraCount} ` : ""}
                        {r.redDoraCount ? `赤${r.redDoraCount} ` : ""}
                        {r.uraDoraCount ? `裏${r.uraDoraCount}` : ""}
                      </span>
                    ) : null}
                  </div>

                  {/* Per-player cells */}
                  {seats.map(seat => {
                    const pr = r.playerResults.find(x => x.seat === seat)
                    if (!pr) return <div key={seat} className="px-3 py-4" />

                    const isWinner = r.winnerSeat === seat
                    const isLoser = r.loserSeat === seat

                    let actionBadge = null
                    if (isWinner && r.resultType === "Tsumo") actionBadge = <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white mb-1">自摸</span>
                    else if (isWinner && r.resultType === "Ron") actionBadge = <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-600 text-white mb-1">榮和</span>
                    else if (isLoser) actionBadge = <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-600 text-white mb-1">放銃</span>
                    else if (r.resultType === "Draw" && pr.isTenpai) actionBadge = <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-700 text-white mb-1">{pr.isRiichi ? "立直聽牌" : "聽牌"}</span>
                    else if (r.resultType === "Draw" && !pr.isTenpai) actionBadge = <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-700 text-white mb-1">不聽</span>

                    return (
                      <div key={seat} className="px-3 py-4 flex flex-col items-center gap-0.5">
                        {actionBadge}
                        <span className={`text-base font-bold ${pr.scoreChange > 0 ? "text-green-400" : pr.scoreChange < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                          {pr.scoreChange > 0 ? "+" : ""}{pr.scoreChange.toLocaleString()}
                        </span>
                        {pr.isRiichi && r.resultType !== "Draw" && (
                          <span className="text-[9px] text-muted-foreground">立直</span>
                        )}
                        <span className="text-[11px] text-muted-foreground font-mono mt-1">{pr.scoreAfter.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Final scores row */}
          <div className="grid grid-cols-5 divide-x divide-white/10 border-t border-white/10 bg-white/5">
            <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">最終</div>
            {seats.map(seat => {
              const player = playerBySeat[seat]
              if (!player) return <div key={seat} />
              return (
                <div key={seat} className="px-3 py-3 flex flex-col items-center gap-0.5">
                  <span className="font-bold text-foreground text-base font-mono">{player.finalScore.toLocaleString()}</span>
                  <span className={`text-sm font-bold ${player.points >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {player.points > 0 ? "+" : ""}{player.points.toFixed(1)}
                  </span>
                  {(() => {
                    const penalty = match.penalties?.find(
                      p => p.playerName === player.name && p.teamName === player.team
                    )
                    return penalty ? (
                      <span className="text-xs text-red-400">({penalty.points > 0 ? "+" : ""}{penalty.points}, {penalty.reason})</span>
                    ) : null
                  })()}
                </div>
              )
            })}
          </div>

          {/* Duplicate header row for easy reference when scrolling */}
          <div className="grid grid-cols-5 divide-x divide-white/10 bg-white/5 border-t border-white/10">
            <div className="px-4 py-4"></div>
            {seats.map(seat => {
              const player = playerBySeat[seat]
              const info = teamLogos[player.team]
              const isWinner = player.rank === 1
              if (!player) return <div key={seat} className="px-3 py-4" />
              return (
                <div key={seat} className="flex flex-col items-center gap-1.5 px-3 py-4">
                  {info ? (
                    <Image
                      src={info.logo}
                      alt={player.team}
                      width={44}
                      height={44}
                      className={`team-logo object-contain w-11 h-11 ${!isWinner ? "grayscale opacity-60" : ""}`}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{player.team[0]}</div>
                  )}
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{player.team}</span>
                  <span className="font-bold text-sm text-foreground">{player.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
