export interface GameResult {
  rank: number
  playerName: string
  playerPhoto?: string
  score: number
  endingScore: number
}

export interface Match {
  date: string
  dayOfWeek: string
  table: "T1" | "T2"
  teams: string[]
  isCompleted: boolean
  winnerTeam?: string
  isLivestream?: boolean
  livestreamUrl?: string
  rounds?: {
    round1: GameResult[]
    round2: GameResult[]
  }
}

export const matchSchedule: Match[] = [
  // All preliminary matches have been completed as of May 8, 2026
  // The preliminary round is now archived and no longer accepting new lineups or results
]

export function getMatchesByMonth(month: number): Match[] {
  return matchSchedule.filter((match) => {
    const matchMonth = new Date(match.date).getMonth() + 1
    return matchMonth === month
  })
}

// Week start dates are no longer used (preliminary round is complete)
const WEEK_START_DATES: string[] = []

// All preliminary matches have ended - these functions return empty arrays
function getCurrentWeekIndex(): number {
  return -1
}

export function getCurrentWeekMatches(): Match[] {
  return []
}

export function getNextWeekMatches(): Match[] {
  return []
}
