// Shared utility functions across all leagues

export function formatPoints(points: number): string {
  const sign = points > 0 ? '+' : ''
  return `${sign}${points.toFixed(1)}`
}

export function getRankBadge(position: number): string {
  const badges = ['🥇', '🥈', '🥉', '4️⃣']
  return badges[position - 1] || '❓'
}

export function getRankLabel(position: number): string {
  const labels = ['First', 'Second', 'Third', 'Fourth']
  return labels[position - 1] || 'Unknown'
}

export function calculateAveragePoints(totalPoints: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0
  return Math.round((totalPoints / gamesPlayed) * 10) / 10
}

export function sortTeamsByPoints(teams: Array<{ totalPoints: number; positions: { first: number } }>): typeof teams {
  return [...teams].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    return b.positions.first - a.positions.first
  })
}

export function sortPlayersByPoints(players: Array<{ points: number }>): typeof players {
  return [...players].sort((a, b) => b.points - a.points)
}

export const LEAGUE_NAMES: Record<string, string> = {
  musou: 'Musou League (4p Riichi)',
  sanma: '3ma League (3p Riichi)',
  hk16: 'HK16 League (TWMJ)',
}

export const LEAGUE_COLORS: Record<string, { primary: string; secondary: string }> = {
  musou: { primary: '#3b82f6', secondary: '#dbeafe' },
  sanma: { primary: '#ec4899', secondary: '#fce7f3' },
  hk16: { primary: '#10b981', secondary: '#d1fae5' },
}
