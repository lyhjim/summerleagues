// Common types shared across all leagues

export type League = 'musou' | 'sanma' | 'hk16'

export interface Team {
  teamName: string
  chineseName: string
  nameEn?: string
  logo?: string
  players: Player[]
}

export interface Player {
  name: string
  team: string
}

export interface GameResult {
  gameId: string
  gameNumber: number
  leagueId: League
  date: string
  location: string
  players: PlayerResult[]
}

export interface PlayerResult {
  name: string
  team: string
  points: number
  position: 1 | 2 | 3 | 4
  rank?: number
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

export interface LineupSubmission {
  teamName: string
  gameNumber: number
  leagueId: League
  player1?: string
  player2?: string
  player3?: string
  player4?: string
  submittedAt: Date
}
