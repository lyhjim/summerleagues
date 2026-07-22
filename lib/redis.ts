import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Keys
const GAME_RESULTS_KEY = "game_results"
const TEAM_STANDINGS_KEY = "team_standings"

// Types
export type ActionType = "tsumo" | "ron" | "deal_in" | "no_ten" | "tenpai" | "riichi_deposit" | "none"

export interface RoundTransaction {
  roundName: string // e.g., "東一局", "東一局1本場", "東二局"
  players: {
    action: ActionType // what happened to this player
    pointChange: number // +14300, -4100, etc.
    riichiInfo?: string // e.g., "立直 (-1,000)"
    yaku?: string // e.g., "立直 門前清自摸和 平和 赤寶牌1 裏寶牌1"
    runningScore: number // score after this round
  }[]
}

export interface GameResult {
  gameId: string
  date: string
  round: string // e.g., "第一節", "第二節", etc.
  matchday: number // 1-14
  players: {
    name: string
    team: string // team id
    score: number // final score (e.g., 45000)
    position: 1 | 2 | 3 | 4
    points: number // league points (+50, +10, -10, -30, etc.)
  }[]
  // Transaction summary (optional)
  totalRounds?: number // 總局數
  drawnGames?: number // 流局數
  transactions?: RoundTransaction[] // round-by-round details
}

export interface TeamStanding {
  teamId: string
  totalPoints: number
  gamesPlayed: number
  positions: {
    first: number
    second: number
    third: number
    fourth: number
  }
}

// Get all game results
export async function getGameResults(): Promise<GameResult[]> {
  const results = await redis.get<GameResult[]>(GAME_RESULTS_KEY)
  return results || []
}

// Add a new game result
export async function addGameResult(result: GameResult): Promise<void> {
  const results = await getGameResults()
  
  // Check if game already exists (update if so)
  const existingIndex = results.findIndex((r) => r.gameId === result.gameId)
  if (existingIndex >= 0) {
    results[existingIndex] = result
  } else {
    results.push(result)
  }
  
  await redis.set(GAME_RESULTS_KEY, results)
  
  // Recalculate standings
  await recalculateStandings(results)
}

// Get team standings
export async function getTeamStandings(): Promise<Record<string, TeamStanding>> {
  // Original 8 teams - STRICT WHITELIST
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
  
  const standings = await redis.get<Record<string, TeamStanding>>(TEAM_STANDINGS_KEY)
  if (!standings) return {}
  
  // Filter to ONLY include original 8 teams
  const filtered: Record<string, TeamStanding> = {}
  for (const [teamId, standing] of Object.entries(standings)) {
    if (originalTeams.has(teamId)) {
      filtered[teamId] = standing
    }
  }
  
  return filtered
}

// Recalculate standings from all game results
async function recalculateStandings(results: GameResult[]): Promise<void> {
  // Original 8 teams - STRICT WHITELIST
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
  
  const standings: Record<string, TeamStanding> = {}
  
  for (const game of results) {
    for (const player of game.players) {
      // ONLY process players from original 8 teams
      if (!originalTeams.has(player.team)) {
        continue
      }
      
      if (!standings[player.team]) {
        standings[player.team] = {
          teamId: player.team,
          totalPoints: 0,
          gamesPlayed: 0,
          positions: { first: 0, second: 0, third: 0, fourth: 0 },
        }
      }
      
      const team = standings[player.team]
      team.totalPoints += player.points
      team.gamesPlayed += 1
      
      if (player.position === 1) team.positions.first += 1
      else if (player.position === 2) team.positions.second += 1
      else if (player.position === 3) team.positions.third += 1
      else if (player.position === 4) team.positions.fourth += 1
    }
  }
  
  await redis.set(TEAM_STANDINGS_KEY, standings)
}

// Delete a game result
export async function deleteGameResult(gameId: string): Promise<boolean> {
  const results = await getGameResults()
  const filteredResults = results.filter((r) => r.gameId !== gameId)
  
  if (filteredResults.length === results.length) {
    return false // Game not found
  }
  
  await redis.set(GAME_RESULTS_KEY, filteredResults)
  await recalculateStandings(filteredResults)
  return true
}

// Clear team standings cache and recalculate from game results
export async function clearAndRecalculateStandings(): Promise<void> {
  await redis.del(TEAM_STANDINGS_KEY)
  const results = await getGameResults()
  await recalculateStandings(results)
}
