// Calculate final points for a player's score
export function calculateFinalPoints(
  rawScore: number,
  windRanking: number // 1st, 2nd, 3rd, or 4th
) {
  // Step 1: Multiply by 100
  const step1 = rawScore * 100

  // Step 2: Calculate difference from 30,000
  const step2 = step1 - 30000

  // Step 3: Add ranking points
  const rankingPoints: Record<number, number> = {
    1: 50000,  // 1st place
    2: 10000,  // 2nd place
    3: -10000, // 3rd place
    4: -30000, // 4th place
  }

  const step3 = step2 + rankingPoints[windRanking]

  // Step 4: Divide by 1,000
  const finalPoints = step3 / 1000

  return finalPoints
}

// Get ranking based on scores
export function getRankings(scores: { e: number; s: number; w: number; n: number }) {
  const winds = [
    { wind: "E", score: scores.e },
    { wind: "S", score: scores.s },
    { wind: "W", score: scores.w },
    { wind: "N", score: scores.n },
  ]

  // Sort by score descending to get rankings
  const sorted = [...winds].sort((a, b) => b.score - a.score)

  const rankings: Record<string, number> = {}
  sorted.forEach((item, index) => {
    rankings[item.wind] = index + 1
  })

  return rankings
}

// Format score for display
export function formatScore(rawScore: number) {
  return (rawScore * 100).toLocaleString()
}
