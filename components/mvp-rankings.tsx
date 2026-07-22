import Image from "next/image"
import { teamsData } from "@/lib/teams-data"

interface LeagueMatch {
  matchday: number
  round: string
  date: string
  players: Array<{
    name: string
    team: string
    seat: string
    finalScore: number
    rank: 1 | 2 | 3 | 4
    points: number
  }>
}

interface PlayerStat {
  rank: number
  name: string
  team: string
  points: number
  matches: number
  first: number
  second: number
  third: number
  fourth: number
  photoUrl?: string
  highestGameScore?: number
  highestGameRawScore?: number
  highestGameDate?: string
}

const teamDisplayName: Record<string, string> = {
  "天月麻雀": "天月麻雀",
  "狂戰士": "狂戰士",
  "壞拍子": "Bad Beat",
  "Bad Beat": "Bad Beat",
  "牌道": "牌道",
  "易和團": "易和團",
  "愚形上等": "愚形上等",
  "錦鯉咪好勁": "錦鯉咪好勁",
  "御無礼": "御無礼",
}
// Note: Removed WRPM, JPML and other teams from other leagues - only original 8 teams

const rankColors = ["text-yellow-300", "text-slate-200", "text-orange-400", "text-muted-foreground"]
const rankBgColors = [
  "border-l-yellow-400 bg-slate-900/30",
  "border-l-slate-300 bg-slate-900/30",
  "border-l-amber-600 bg-slate-900/30",
  "border-l-transparent",
]

// Helper to get player photo from teams data
function getPlayerPhoto(playerName: string): string | undefined {
  for (const team of Object.values(teamsData)) {
    const player = team.players.find(p => p.name === playerName)
    if (player) return player.photoUrl
  }
  return undefined
}

// Helper to get team logo
function getTeamLogo(teamName: string): string | undefined {
  const normalizedName = teamName === "壞拍子" ? "Bad Beat" : teamName
  // Direct lookup in teamsData
  for (const [key, team] of Object.entries(teamsData)) {
    if (team.chineseName === teamName || team.englishName === normalizedName) {
      return team.logo
    }
  }
  return undefined
}

async function fetchMatches(): Promise<LeagueMatch[]> {
  try {
    const response = await fetch("https://majhong-supreme.web.app/api/league/matches", {
      next: { revalidate: 60 }, // Refresh every 60 seconds for penalty updates
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.matches || []
  } catch {
    return []
  }
}

function calculatePlayerStandings(matches: LeagueMatch[]): { totalPoints: PlayerStat[], singleHighest: PlayerStat[] } {
  const stats: Record<string, { team: string; points: number; matches: number; first: number; second: number; third: number; fourth: number; highestGameScore: number; highestGameRawScore: number; originalTeamName: string }> = {}
  
  // Original 8 teams - STRICT WHITELIST (both Chinese names and aliases)
  const originalTeams = new Set([
    "天月麻雀",
    "狂戰士",
    "壞拍子",
    "Bad Beat",
    "牌道",
    "易和團",
    "愚形上等",
    "錦鯉咪好勁",
    "御無礼",
  ])

  matches.forEach(match => {
    match.players.forEach(player => {
      // ACTIVELY CHECK: player.team must be in whitelist
      const displayTeam = teamDisplayName[player.team] || player.team
      
      if (!originalTeams.has(player.team) && !originalTeams.has(displayTeam)) {
        // Skip WRPM, JPML, and any other external team
        return
      }
      
      if (!stats[player.name]) {
        stats[player.name] = {
          team: displayTeam,
          points: 0, matches: 0, first: 0, second: 0, third: 0, fourth: 0,
          highestGameScore: 0,
          highestGameRawScore: 0,
          originalTeamName: player.team,
        }
      }
      stats[player.name].points += player.points
      stats[player.name].matches += 1
      stats[player.name].highestGameScore = Math.max(stats[player.name].highestGameScore, player.points)
      // Track the highest raw score (finalScore)
      const rawScore = (player as any).finalScore || 0
      if (rawScore > stats[player.name].highestGameRawScore) {
        stats[player.name].highestGameRawScore = rawScore
      }
      switch (player.rank) {
        case 1: stats[player.name].first += 1; break
        case 2: stats[player.name].second += 1; break
        case 3: stats[player.name].third += 1; break
        case 4: stats[player.name].fourth += 1; break
      }
    })
  })

  // FINAL FILTER: Only include players from original 8 teams
  const players: PlayerStat[] = Object.entries(stats)
    .filter(([_, s]) => originalTeams.has(s.originalTeamName))
    .map(([name, s]) => ({
    rank: 0,
    name,
    team: s.team,
    points: Math.round(s.points * 10) / 10,
    matches: s.matches,
    first: s.first,
    second: s.second,
    third: s.third,
    fourth: s.fourth,
    photoUrl: getPlayerPhoto(name),
    highestGameScore: Math.round(s.highestGameScore * 10) / 10,
    highestGameRawScore: s.highestGameRawScore,
  }))

  // Total Points ranking - create separate ranked arrays with deep copies
  const totalPointsRanking = players.map(p => ({ ...p })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.first !== a.first) return b.first - a.first
    return (a.second + a.third + a.fourth) - (b.second + b.third + b.fourth)
  })
  totalPointsRanking.forEach((p, i) => { p.rank = i + 1 })

  // Single Game Highest Score ranking - separate instance with own ranks
  const singleHighestRanking = players.map(p => ({ ...p })).sort((a, b) => {
    if ((b.highestGameRawScore || 0) !== (a.highestGameRawScore || 0)) return (b.highestGameRawScore || 0) - (a.highestGameRawScore || 0)
    return b.points - a.points
  })
  singleHighestRanking.forEach((p, i) => { p.rank = i + 1 })

  return { totalPoints: totalPointsRanking, singleHighest: singleHighestRanking }
}

export async function MvpRankings() {
  const matches = await fetchMatches()
  const { totalPoints, singleHighest } = calculatePlayerStandings(matches)

  return (
    <section className="py-16 px-4 bg-white/[0.02]" id="mvp">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-secondary rounded-full" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-foreground">
            MVP 排名
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-secondary/50 to-transparent" />
          <span className="text-xs text-muted-foreground border border-secondary/30 px-3 py-1 rounded-full font-mono">
            MVP 榜
          </span>
        </div>

        {totalPoints.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 border border-white/10 rounded-xl bg-card/60">
            暫無數據，賽事開始後更新
          </div>
        ) : (
          <>
            {/* Total Points Ranking */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">累計積分榜</h3>
              
              {/* Desktop Table - Scrollable */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase w-12">排名</th>
                              <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase">選手</th>
                              <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase">隊伍</th>
                              <th className="text-center py-4 px-3 text-xs font-bold text-muted-foreground tracking-widest uppercase">成績</th>
                              <th className="text-right py-4 px-5 text-xs font-bold text-primary tracking-widest uppercase">積分</th>
                            </tr>
                          </thead>
                          <tbody>
                            {totalPoints.map((player, index) => (
                              <tr key={`total-desktop-${player.name}-${index}`} className={`border-b border-white/5 border-l-4 hover:bg-white/5 transition-all duration-200 ${rankBgColors[Math.min(index, 3)]}`}>
                                <td className="py-4 px-5">
                                  <span className={`text-2xl font-black ${rankColors[Math.min(index, 3)]}`}>
                                    {index < 3 ? ["①", "②", "③"][index] : player.rank}
                                  </span>
                                </td>
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-3">
                                    {player.photoUrl && (
                                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                                <Image
                                  src={player.photoUrl}
                                  alt={player.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-base text-white">{player.name}</div>
                                    </div>
                                  </div>
                                </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            {getTeamLogo(player.team) && (
                              <div className="w-9 h-9 flex-shrink-0">
                                <Image
                                  src={getTeamLogo(player.team) || ""}
                                  alt={player.team}
                                  width={18}
                                  height={18}
                                  className="team-logo w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <span className="text-muted-foreground text-sm">{player.team}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center font-bold font-mono text-white">
                          {player.first}/{player.second}/{player.third}/{player.fourth}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className={`text-xl font-black font-mono ${player.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {player.points > 0 ? '+' : ''}{player.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Scrollable */}
              <div className="md:hidden overflow-y-auto max-h-[600px] space-y-2 pr-2">
                {totalPoints.map((player, index) => (
                  <div
                    key={`total-mobile-${player.name}-${index}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-l-4 border-white/10 bg-card/60 ${rankBgColors[Math.min(index, 3)]}`}
                  >
                    <span className={`text-xl font-black w-8 text-center flex-shrink-0 ${rankColors[Math.min(index, 3)]}`}>
                      {player.rank}
                    </span>
                    {player.photoUrl && (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                        <Image
                          src={player.photoUrl}
                          alt={player.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}
                    {getTeamLogo(player.team) && (
                      <div className="w-9 h-9 flex-shrink-0">
                        <Image
                          src={getTeamLogo(player.team) || ""}
                          alt={player.team}
                          width={18}
                          height={18}
                          className="team-logo w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-xs text-muted-foreground">{player.team}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-black font-mono ${player.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {player.points > 0 ? '+' : ''}{player.points}
                      </div>
                      <div className="text-xs text-muted-foreground">{player.first}/{player.second}/{player.third}/{player.fourth} · {player.matches}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Single Game Highest Score Ranking */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">單局最高分</h3>
              
              {/* Desktop Table - Scrollable */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase w-12">排名</th>
                      <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase">選手</th>
                      <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground tracking-widest uppercase">隊伍</th>
                      <th className="text-center py-4 px-3 text-xs font-bold text-muted-foreground tracking-widest uppercase">參賽次數</th>
                      <th className="text-right py-4 px-5 text-xs font-bold text-secondary tracking-widest uppercase">最高分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleHighest.map((player, index) => (
                      <tr
                        key={`highest-${player.name}-${index}`}
                        className={`border-b border-white/5 border-l-4 hover:bg-white/5 transition-all duration-200 ${rankBgColors[Math.min(index, 3)]}`}
                      >
                        <td className="py-4 px-5">
                          <span className={`text-2xl font-black ${rankColors[Math.min(index, 3)]}`}>
                            {index < 3 ? ["①", "②", "③"][index] : player.rank}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {player.photoUrl && (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                        <Image
                          src={player.photoUrl}
                          alt={player.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                          loading="lazy"
                        />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-base text-white">{player.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            {getTeamLogo(player.team) && (
                              <div className="w-9 h-9 flex-shrink-0">
                                <Image
                                  src={getTeamLogo(player.team) || ""}
                                  alt={player.team}
                                  width={18}
                                  height={18}
                                  className="team-logo w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <span className="text-muted-foreground text-sm">{player.team}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center font-bold font-mono text-white">
                          {player.matches}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className={`text-xl font-black font-mono ${(player.highestGameRawScore || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {player.highestGameRawScore?.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Scrollable */}
              <div className="md:hidden overflow-y-auto max-h-[600px] space-y-2 pr-2">
                {singleHighest.map((player, index) => (
                  <div
                    key={`highest-mobile-${player.name}-${index}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-l-4 border-white/10 bg-card/60 ${rankBgColors[Math.min(index, 3)]}`}
                  >
                    <span className={`text-xl font-black w-8 text-center flex-shrink-0 ${rankColors[Math.min(index, 3)]}`}>
                      {player.rank}
                    </span>
                    {player.photoUrl && (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                        <Image
                          src={player.photoUrl}
                          alt={player.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}
                    {getTeamLogo(player.team) && (
                      <div className="w-9 h-9 flex-shrink-0">
                        <Image
                          src={getTeamLogo(player.team) || ""}
                          alt={player.team}
                          width={18}
                          height={18}
                          className="team-logo w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-xs text-muted-foreground">{player.team}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-black font-mono ${(player.highestGameRawScore || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {player.highestGameRawScore?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
