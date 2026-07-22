import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { neon } from "@neondatabase/serverless"
import { schedule, teamLogos, type MatchDay, type Match } from "@/components/schedule-data"

// Normalize team names for matching
const teamNameMap: Record<string, string> = {
  "壞拍子": "Bad Beat",
  "Bad Beat": "Bad Beat",
}

// Map of gameNumber -> { teamName: playerName }
type GameLineups = Record<number, Record<string, string>>

async function fetchGameLineups(): Promise<GameLineups> {
  try {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!connectionString) return {}
    const sql = neon(connectionString)
    const rows = await sql`SELECT game_number, players FROM game_lineups`
    const lineups: GameLineups = {}
    rows.forEach((row: any) => {
      lineups[row.game_number] = row.players || {}
    })
    return lineups
  } catch {
    return {}
  }
}

// Look up an assigned player for a team, accounting for name normalization
function getAssignedPlayer(players: Record<string, string> | undefined, team: string): string | undefined {
  if (!players) return undefined
  return players[team] || players[normalizeTeamName(team)] || (team === "Bad Beat" ? players["壞拍子"] : undefined)
}

interface ApiMatch {
  matchday: number
  round: string
  date: string
  players: ApiPlayer[]
  penalties?: Penalty[]
  rounds: unknown[]
}

interface ApiPlayer {
  name: string
  team: string
  rank: number
  points: number
}

interface Penalty {
  playerName: string
  teamName: string
  points: number
  reason: string
}

async function fetchMatches(): Promise<ApiMatch[]> {
  try {
    const res = await fetch("https://majhong-supreme.web.app/api/league/matches", {
      next: { revalidate: 300 },
    })
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

function normalizeTeamName(teamName: string): string {
  return teamNameMap[teamName] || teamName
}

// Flatten schedule to get matchday index
function getScheduleMatchByIndex(matchdayIndex: number): Match | null {
  let currentMatchdayIndex = 0
  for (const day of schedule) {
    for (const match of day.matches) {
      if (currentMatchdayIndex === matchdayIndex) {
        return match
      }
      currentMatchdayIndex++
    }
  }
  return null
}

function ScheduleMatchCard({ match, matchdayIndex, apiMatches, gameLineups }: { match: Match; matchdayIndex: number; apiMatches: ApiMatch[]; gameLineups: GameLineups }) {
  // Match by matchday index (session number 1-56)
  const apiMatch = apiMatches.find(m => m.matchday === matchdayIndex + 1)
  
  const winnerTeam = apiMatch?.players.find(p => p.rank === 1)?.team
  const lineupPlayers = gameLineups[matchdayIndex + 1]

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-2">
        Game {matchdayIndex + 1}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {match.teams.map((team) => {
          const info = teamLogos[team]
          const isWinner = apiMatch ? team === winnerTeam : true
          const playerResult = apiMatch?.players.find(p => p.team === team)
          const rank = playerResult?.rank
          const points = playerResult?.points
          // Show assigned lineup player for upcoming (not-yet-played) games
          const assignedPlayer = !apiMatch ? getAssignedPlayer(lineupPlayers, team) : undefined

          return (
            <div
              key={team}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 border transition-colors ${
                isWinner
                  ? "border-yellow-400/40 bg-yellow-400/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {rank && (
                <span className={`absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rankColors[rank]}`}>
                  {rank}位
                </span>
              )}
              {info ? (
                <Image
                  src={info.logo}
                  alt={team}
                  width={48}
                  height={48}
                  className={`team-logo object-contain w-12 h-12 transition-all ${!isWinner && apiMatch ? "grayscale opacity-50" : ""}`}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-foreground">
                  {team[0]}
                </div>
              )}
              <span className={`text-[11px] font-bold text-center leading-tight ${isWinner ? "text-yellow-300" : !apiMatch ? "text-white" : "text-foreground/60"}`}>
                {team}
              </span>
              {assignedPlayer && (
                <span className="text-[11px] font-semibold text-primary text-center leading-tight">
                  {assignedPlayer}
                </span>
              )}
              {points !== undefined && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-[11px] font-bold ${points >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {points > 0 ? "+" : ""}{points.toFixed(1)}
                  </span>
                  {apiMatch && playerResult && (
                    (() => {
                      const penalty = apiMatch.penalties?.find(
                        p => p.playerName === playerResult.name && p.teamName === normalizeTeamName(team)
                      )
                      return penalty ? (
                        <span className="text-[10px] text-red-400">({penalty.points > 0 ? "+" : ""}{penalty.points}, {penalty.reason})</span>
                      ) : null
                    })()
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {apiMatch && (
        <div className="mt-1 text-right">
          <Link
            href={`/matches/${apiMatch.date}-${apiMatch.matchday}-t${match.table}`}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            查看詳情 →
          </Link>
        </div>
      )}
    </div>
  )
}

function ScheduleDayCard({ day, dayIndex, apiMatches, gameLineups }: { day: MatchDay; dayIndex: number; apiMatches: ApiMatch[]; gameLineups: GameLineups }) {
  let matchdayCounter = dayIndex * 2  // Each day has 2 matches
  
  const hasResults = day.matches.some(m => {
    const apiMatch = apiMatches.find(am => am.matchday === matchdayCounter + 1)
    matchdayCounter++
    return !!apiMatch
  })
  matchdayCounter = dayIndex * 2  // Reset

  return (
    <div className={`rounded-xl border border-white/10 overflow-hidden bg-card/60 backdrop-blur-sm ${!hasResults ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3 flex-wrap gap-y-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasResults ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
          <span className="font-bold text-base text-foreground">{day.date}（{day.day}）</span>
          <span className="text-xs text-muted-foreground font-mono border border-white/10 px-2 py-0.5 rounded-full">
            Game {dayIndex * 2 + 1} - {dayIndex * 2 + 2}
          </span>
          {hasResults && (
            <span className="text-xs text-green-400 font-mono border border-green-400/30 px-2 py-0.5 rounded-full">
              已完成
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground font-mono">19:30</span>
      </div>

      <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
        {day.matches.map((match, mi) => {
          const currentMatchdayIndex = dayIndex * 2 + mi
          return <ScheduleMatchCard key={mi} match={match} matchdayIndex={currentMatchdayIndex} apiMatches={apiMatches} gameLineups={gameLineups} />
        })}
      </div>
    </div>
  )
}

export async function FullSchedule() {
  const [apiMatches, gameLineups] = await Promise.all([fetchMatches(), fetchGameLineups()])
  
  // Ensure schedule is an array before filtering
  if (!Array.isArray(schedule)) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-muted-foreground">賽程表暫不可用</p>
        </div>
      </section>
    )
  }

  const completedCount = schedule.filter((day, dayIndex) => {
    let matchdayCounter = dayIndex * 2
    return day.matches.some(m => {
      const apiMatch = apiMatches.find(am => am.matchday === matchdayCounter + 1)
      matchdayCounter++
      return !!apiMatch
    })
  }).length

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-foreground">
            賽程表
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <span className="text-xs text-muted-foreground border border-primary/30 px-3 py-1 rounded-full font-mono">
            已完成 {completedCount * 2} / 56 半莊
          </span>
        </div>

        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/#schedule"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="size-4" /> 返回主頁
          </Link>
        </div>

        <div className="space-y-3">
          {schedule.map((day, i) => (
            <ScheduleDayCard key={i} day={day} dayIndex={i} apiMatches={apiMatches} gameLineups={gameLineups} />
          ))}
        </div>
      </div>
    </section>
  )
}
