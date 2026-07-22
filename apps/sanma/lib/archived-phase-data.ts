// Static archived data from 初賽 (Preliminary Phase)
// This file calculates team standings from the static match results

import { calculateTeamStandingsFromStaticData } from "./static-match-results"

export interface PlayerResult {
  seat: "東" | "南" | "西"
  score: number
  penalty: number
  rawChips: number
  teamName: string
  yakumans: any[]
  finalChips: number
  playerName: string
  penaltyReason: string
  calculatedChips: number
}

export interface GameResults {
  game1: PlayerResult[]
  game2: PlayerResult[]
  game3: PlayerResult[]
}

export interface MatchResult {
  id: number
  match_id: string
  round: string
  date: string
  results: GameResults
}

// Calculate team stats from all preliminary match results using static data
// Returns ALL 15 teams sorted by maisuu
export function getArchivedPhaseTeamStats() {
  try {
    const standings = calculateTeamStandingsFromStaticData()
    if (!standings || standings.length === 0) {
      console.warn("[v0] No standings calculated")
      return []
    }
    return standings.map((team) => ({
      name: team.teamName,
      maisuu: team.maisuu,
      firstPlaces: team.firstPlaces,
      secondPlaces: team.secondPlaces,
      thirdPlaces: team.thirdPlaces,
      hanChanPlayed: team.hanChanPlayed,
      highestSingleGame: team.highestSingleGame,
    }))
  } catch (error) {
    console.error("[v0] Error in getArchivedPhaseTeamStats:", error)
    return []
  }
}

// Hardcoded semi-finals starting 枚數 (preliminary maisuu halved and confirmed)
// Sorted by starting score descending
const SEMI_FINALS_STARTING_SCORES: { name: string; initialSemiFinalsScore: number }[] = [
  { name: "魔法葉",      initialSemiFinalsScore: 179 },
  { name: "邪魔外道",    initialSemiFinalsScore: 178 },
  { name: "缺五五番",    initialSemiFinalsScore: 177 },
  { name: "剛滿20歲",    initialSemiFinalsScore: 150 },
  { name: "大西北3兄弟", initialSemiFinalsScore: 136 },
  { name: "吸金魔術師",  initialSemiFinalsScore:  96 },
  { name: "卡比瘦",      initialSemiFinalsScore:  67 },
  { name: "老友鬼鬼",    initialSemiFinalsScore:  -6 },
  { name: "無敵推土機",  initialSemiFinalsScore: -28 },
]

// Get top 9 teams for semi-finals with their confirmed starting scores
export function getTopNineTeamsForSemiFinals() {
  return SEMI_FINALS_STARTING_SCORES.map((entry) => {
    const allStats = getArchivedPhaseTeamStats()
    const stat = allStats.find((t) => t.name === entry.name)
    return {
      name: entry.name,
      maisuu: stat?.maisuu || 0,
      firstPlaces: stat?.firstPlaces || 0,
      secondPlaces: stat?.secondPlaces || 0,
      thirdPlaces: stat?.thirdPlaces || 0,
      hanChanPlayed: stat?.hanChanPlayed || 0,
      highestSingleGame: stat?.highestSingleGame || 0,
      initialSemiFinalsScore: entry.initialSemiFinalsScore,
    }
  })
}
