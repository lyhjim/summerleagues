export interface PlayerRanking {
  rank: number
  playerName: string
  teamName: string
  value: number
  teamId: number
}

// 個人枚數 (Highest individual chips)
export const individualChipsRankings: PlayerRanking[] = [
  { rank: 1, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 2, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 3, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 4, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 5, playerName: "-", teamName: "-", value: 0, teamId: 0 },
]

// 個人單輪最多枚數 (Highest single round chips)
export const singleRoundChipsRankings: PlayerRanking[] = [
  { rank: 1, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 2, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 3, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 4, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 5, playerName: "-", teamName: "-", value: 0, teamId: 0 },
]

// 個人役滿賞 (Highest individual yakuman)
export const yakumanRankings: PlayerRanking[] = [
  { rank: 1, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 2, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 3, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 4, playerName: "-", teamName: "-", value: 0, teamId: 0 },
  { rank: 5, playerName: "-", teamName: "-", value: 0, teamId: 0 },
]
