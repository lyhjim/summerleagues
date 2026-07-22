import { TeamRankingsClient, Team } from "./team-rankings-client"

interface LeagueMatch {
  matchday: number
  round: "第一節" | "第二節"
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

// Team name mapping from API to canonical names
const teamNameMapping: Record<string, string> = {
  "愚形上等": "愚形上等",
  "愚型上等": "愚形上等",
  "壞拍子": "壞拍子",
  "Bad Beat": "壞拍子",
  "天月麻雀": "天月麻雀",
  "牌道": "牌道",
  "易和團": "易和團",
  "錦鯉咪好勁": "錦鯉咪好勁",
  "狂戰士": "狂戰士",
  "御無礼": "御無礼",
}

function getCanonicalTeamName(apiTeamName: string): string {
  return teamNameMapping[apiTeamName] || apiTeamName
}
const teamMeta: Record<string, { name: string; nameEn: string; logo: string }> = {
  "天月麻雀": { name: "天月麻雀", nameEn: "Amatsuki Mahjong", logo: "/images/amatsuki-logo.png" },
  "狂戰士": { name: "狂戰士", nameEn: "BGT Berserker", logo: "/images/berserker-logo.png" },
  "壞拍子": { name: "壞拍子", nameEn: "Bad Beat", logo: "/images/4bb.png" },
  "Bad Beat": { name: "壞拍子", nameEn: "Bad Beat", logo: "/images/4bb.png" },
  "牌道": { name: "牌道", nameEn: "", logo: "/images/paidao-logo.png" },
  "易和團": { name: "易和團", nameEn: "E-Ron Must", logo: "/images/eron-logo.png" },
  "愚形上等": { name: "愚形上等", nameEn: "", logo: "/images/guxing-logo.jpeg" },
  "錦鯉咪好勁": { name: "錦鯉咪好勁", nameEn: "Nishikigoi", logo: "/images/koi-logo.jpeg" },
  "御無礼": { name: "御無礼", nameEn: "GoBuRe", logo: "/images/gobure-logo.jpeg" },
}
// Note: Removed WRPM, JPML, and other teams from other leagues

async function fetchMatches(): Promise<LeagueMatch[]> {
  try {
    const response = await fetch("https://majhong-supreme.web.app/api/league/matches", {
      next: { revalidate: 300 },
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.matches || []
  } catch (error) {
    console.error("Error fetching matches:", error)
    return []
  }
}

function calculateTeamStandings(matches: LeagueMatch[]): Team[] {
  // Original 8 teams - WHITELIST ONLY
  const originalTeams = new Set([
    "天月麻雀",
    "狂戰士",
    "壞拍子",
    "牌道",
    "易和團",
    "愚形上等",
    "錦鯉咪好勁",
    "御無礼",
  ])
  
  // Initialize standings for original 8 teams only
  const standings: Record<string, { points: number; matches: number; first: number; second: number; third: number; fourth: number }> = {}
  
  originalTeams.forEach(teamName => {
    standings[teamName] = { points: 0, matches: 0, first: 0, second: 0, third: 0, fourth: 0 }
  })
  
  // Calculate standings from matches - strictly only count original 8 teams
  matches.forEach(match => {
    match.players.forEach(player => {
      // FIRST check: is the raw player.team in the original teams (before any mapping)
      if (!originalTeams.has(player.team)) {
        // SECOND check: try canonical name mapping
        const canonicalName = getCanonicalTeamName(player.team)
        if (!originalTeams.has(canonicalName)) {
          // THIRD check: try the display name from teamMeta
          const displayName = teamMeta[canonicalName]?.name || canonicalName
          if (!originalTeams.has(displayName)) {
            // SKIP - this team is not in the original 8
            return
          }
        }
      }
      
      const canonicalName = getCanonicalTeamName(player.team)
      const teamName = teamMeta[canonicalName]?.name || canonicalName
      
      standings[teamName].points += player.points
      standings[teamName].matches += 1
      
      switch (player.rank) {
        case 1: standings[teamName].first += 1; break
        case 2: standings[teamName].second += 1; break
        case 3: standings[teamName].third += 1; break
        case 4: standings[teamName].fourth += 1; break
      }
    })
  })
  
  // Convert to array and ONLY include original 8 teams
  const teamsArray: Team[] = Array.from(originalTeams).map(teamName => {
    const stats = standings[teamName]
    return {
      rank: 0,
      name: teamName,
      nameEn: teamMeta[teamName]?.nameEn || "",
      points: Math.round(stats.points * 10) / 10, // Round to 1 decimal
      matches: stats.matches,
      first: stats.first,
      second: stats.second,
      third: stats.third,
      fourth: stats.fourth,
      logo: teamMeta[teamName]?.logo || null,
    }
  })
  
  // Sort by points descending, then by first place count
  teamsArray.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.first !== a.first) return b.first - a.first
    return b.second - a.second
  })
  
  // Assign ranks
  teamsArray.forEach((team, index) => {
    team.rank = index + 1
  })
  
  return teamsArray
}

export async function TeamRankings() {
  const matches = await fetchMatches()
  const teams = calculateTeamStandings(matches)

  return <TeamRankingsClient teams={teams} />
}
