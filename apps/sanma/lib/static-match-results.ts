// Static match results data loader
// This loads match results from static JSON files instead of Supabase
// to reduce database costs after the preliminary round ended

import part1 from "@/data/match-results-part1.json"
import part2 from "@/data/match-results-part2.json"
import part3 from "@/data/match-results-part3.json"

export interface MatchResult {
  match_id: string
  round: string
  date: string
  results: {
    game1?: PlayerResult[]
    game2?: PlayerResult[]
    game3?: PlayerResult[]
  }
}

export interface PlayerResult {
  seat: string
  score: number
  penalty: number
  rawChips: number
  teamName: string
  yakumans: YakumanData[]
  finalChips: number
  playerName: string
  penaltyReason: string
  calculatedChips: number
}

export interface YakumanData {
  types: string[]
  photoUrl?: string
}

// Combine all parts into a single array
const allMatchResults: MatchResult[] = []

try {
  const part1Results = (part1 as any).matchResults || []
  const part2Results = (part2 as any).matchResults || []
  const part3Results = (part3 as any).matchResults || []
  
  allMatchResults.push(...part1Results, ...part2Results, ...part3Results)
  console.log("[v0] Loaded match results:", {
    part1: part1Results.length,
    part2: part2Results.length,
    part3: part3Results.length,
    total: allMatchResults.length
  })
} catch (error) {
  console.error("[v0] Error loading match results:", error)
}

// Export the combined results
export function getStaticMatchResults(): MatchResult[] {
  return allMatchResults
}

// Get total count
export function getStaticMatchResultsCount(): number {
  return allMatchResults.length
}

// Get results for a specific match
export function getStaticMatchResultsByMatchId(matchId: string): MatchResult[] {
  return allMatchResults.filter((r) => r.match_id === matchId)
}

// Get results for a specific date
export function getStaticMatchResultsByDate(date: string): MatchResult[] {
  return allMatchResults.filter((r) => r.date === date)
}

// Extract all yakuman data from match results
export function getAllYakumansFromStaticData(): Array<{
  matchId: string
  date: string
  game: string
  playerName: string
  teamName: string
  types: string[]
  photoUrl?: string
}> {
  const yakumans: Array<{
    matchId: string
    date: string
    game: string
    playerName: string
    teamName: string
    types: string[]
    photoUrl?: string
  }> = []

  allMatchResults.forEach((result) => {
    const games = ["game1", "game2", "game3"] as const
    games.forEach((gameKey) => {
      const game = result.results?.[gameKey]
      if (!game || !Array.isArray(game)) return

      game.forEach((player) => {
        if (player.yakumans && Array.isArray(player.yakumans)) {
          player.yakumans.forEach((yakuman) => {
            if (yakuman.types && yakuman.types.length > 0) {
              yakumans.push({
                matchId: result.match_id,
                date: result.date,
                game: gameKey,
                playerName: player.playerName,
                teamName: player.teamName,
                types: yakuman.types,
                photoUrl: yakuman.photoUrl,
              })
            }
          })
        }
      })
    })
  })

  return yakumans
}

// Calculate team standings from static data
export function calculateTeamStandingsFromStaticData(): Array<{
  teamName: string
  maisuu: number
  hanChanPlayed: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  highestSingleGame: number
}> {
  const teamStats: Record<
    string,
    {
      maisuu: number
      hanChanPlayed: number
      firstPlaces: number
      secondPlaces: number
      thirdPlaces: number
      highestSingleGame: number
    }
  > = {}

  allMatchResults.forEach((result) => {
    const games = [result.results?.game1, result.results?.game2, result.results?.game3].filter(Boolean)

    games.forEach((game) => {
      if (!game || !Array.isArray(game) || game.length !== 3) return

      // Sort by score to determine ranking (East > South > West for tiebreaker)
      const seatOrder: { [key: string]: number } = { 東: 0, 南: 1, 西: 2 }
      const sorted = [...game].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (seatOrder[a.seat] || 0) - (seatOrder[b.seat] || 0)
      })

      game.forEach((player) => {
        const teamName = player.teamName
        if (!teamStats[teamName]) {
          teamStats[teamName] = {
            maisuu: 0,
            hanChanPlayed: 0,
            firstPlaces: 0,
            secondPlaces: 0,
            thirdPlaces: 0,
            highestSingleGame: Number.NEGATIVE_INFINITY,
          }
        }

        const stats = teamStats[teamName]
        const chips = player.finalChips || 0
        stats.maisuu += chips
        stats.hanChanPlayed += 1

        if (chips > stats.highestSingleGame) {
          stats.highestSingleGame = chips
        }

        // Determine placement
        const rank = sorted.findIndex((p) => p.playerName === player.playerName) + 1
        if (rank === 1) stats.firstPlaces++
        else if (rank === 2) stats.secondPlaces++
        else if (rank === 3) stats.thirdPlaces++
      })
    })
  })

  return Object.entries(teamStats)
    .map(([teamName, stats]) => ({
      teamName,
      ...stats,
      highestSingleGame: stats.highestSingleGame === Number.NEGATIVE_INFINITY ? 0 : stats.highestSingleGame,
    }))
    .sort((a, b) => {
      if (b.maisuu !== a.maisuu) return b.maisuu - a.maisuu
      if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces
      return b.highestSingleGame - a.highestSingleGame
    })
}
