"use client"

// Shared localStorage key for persisting submitted scores
export const SCORES_KEY = "tw_mahjong_scores"
// Bump this version whenever seeded data changes — forces a re-seed
const SEED_VERSION = "v7"
const SEED_VERSION_KEY = "tw_mahjong_seed_version"

export interface PlayerScore {
  playerName: string
  team: string
  rawPts: number
}

export interface RoundResult {
  matchId: string   // e.g. "r1"
  round: 1 | 2      // R1 or R2 for the day
  matchDate: string // e.g. "2026-04-12"
  scores: PlayerScore[]
  submittedAt: number
}

// Seeded results for completed matches
const SEEDED_RESULTS: RoundResult[] = [
  // 25/04 (SAT) — Match r1, Round 1 only
  {
    matchId: "r1",
    round: 1,
    matchDate: "2026-04-25",
    submittedAt: 1745596800000,
    scores: [
      { playerName: "啤啤",   team: "邪魔外道",     rawPts: -753 },
      { playerName: "肥手手", team: "新蒲崗蕃茄黨", rawPts: -111 },
      { playerName: "何Sir",  team: "無雙大雅",      rawPts: -30  },
      { playerName: "Elvan",  team: "海陸胸墊隊",    rawPts: 894  },
    ],
  },
  // 26/04 (SUN) — Match r2, Round 2
  {
    matchId: "r2",
    round: 2,
    matchDate: "2026-04-26",
    submittedAt: 1745690400000,
    scores: [
      { playerName: "純真",    team: "海陸胸墊隊",    rawPts: 273  },
      { playerName: "毛毛爸爸", team: "新蒲崗蕃茄黨", rawPts: 93   },
      { playerName: "皇詐俠",  team: "邪魔外道",      rawPts: 8    },
      { playerName: "Krystal", team: "無雙大雅",      rawPts: -374 },
    ],
  },
  // 02/05 (SAT) — Match r3, R1+R2 combined
  {
    matchId: "r3",
    round: 2,
    matchDate: "2026-05-02",
    submittedAt: 1746201600000,
    scores: [
      { playerName: "Elvan",   team: "海陸胸墊隊",    rawPts: 552  },
      { playerName: "何Sir",   team: "無雙大雅",      rawPts: 439  },
      { playerName: "邪魔肥仔", team: "邪魔外道",      rawPts: -110 },
      { playerName: "肥手手",  team: "新蒲崗蕃茄黨", rawPts: -881 },
    ],
  },
  // 03/05 (SUN) — Match r4, R1+R2 combined
  {
    matchId: "r4",
    round: 2,
    matchDate: "2026-05-03",
    submittedAt: 1746288000000,
    scores: [
      { playerName: "啤啤",    team: "邪魔外道",      rawPts: 99   },
      { playerName: "Kazuha",  team: "新蒲崗蕃茄黨", rawPts: 44   },
      { playerName: "Krystal", team: "無雙大雅",      rawPts: -2   },
      { playerName: "Leona",   team: "海陸胸墊隊",    rawPts: -141 },
    ],
  },
  // 16/05 (SAT) — Match r5, R1+R2 combined
  {
    matchId: "r5",
    round: 2,
    matchDate: "2026-05-16",
    submittedAt: 1747411200000,
    scores: [
      { playerName: "Leona",   team: "海陸胸墊隊",    rawPts: 1348 },
      { playerName: "皇詐俠",  team: "邪魔外道",      rawPts: -165 },
      { playerName: "Koko",    team: "無雙大雅",      rawPts: -462 },
      { playerName: "Kazuha",  team: "新蒲崗蕃茄黨", rawPts: -721 },
    ],
  },
]

// Read all results from localStorage, falling back to seeded data.
// If the seed version has changed, overwrite stale cached data with fresh seeds.
export function readResults(): RoundResult[] {
  if (typeof window === "undefined") return SEEDED_RESULTS
  try {
    const storedVersion = localStorage.getItem(SEED_VERSION_KEY)
    if (storedVersion !== SEED_VERSION) {
      // Seed version changed — overwrite with latest seeded data
      localStorage.setItem(SCORES_KEY, JSON.stringify(SEEDED_RESULTS))
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
      return SEEDED_RESULTS
    }
    const raw = localStorage.getItem(SCORES_KEY)
    return raw ? (JSON.parse(raw) as RoundResult[]) : SEEDED_RESULTS
  } catch {
    return SEEDED_RESULTS
  }
}

// Reset localStorage to seeded results (useful for admin)
export function resetToSeeded(): void {
  localStorage.setItem(SCORES_KEY, JSON.stringify(SEEDED_RESULTS))
  window.dispatchEvent(new StorageEvent("storage", { key: SCORES_KEY }))
}

// Write a new result (replaces existing entry for same matchId + round combo)
export function writeResult(result: RoundResult): void {
  const existing = readResults().filter(
    (r) => !(r.matchId === result.matchId && r.round === result.round)
  )
  localStorage.setItem(SCORES_KEY, JSON.stringify([...existing, result]))
  // Dispatch storage event so other tabs/windows update immediately
  window.dispatchEvent(new StorageEvent("storage", { key: SCORES_KEY }))
}

// Delete a result by matchId + round
export function deleteResult(matchId: string, round: 1 | 2): void {
  const existing = readResults().filter(
    (r) => !(r.matchId === matchId && r.round === round)
  )
  localStorage.setItem(SCORES_KEY, JSON.stringify(existing))
  window.dispatchEvent(new StorageEvent("storage", { key: SCORES_KEY }))
}

// Derived: total chips per player across all rounds
export function calcTotalChips(results: RoundResult[]): Record<string, { team: string; total: number }> {
  const map: Record<string, { team: string; total: number }> = {}
  for (const r of results) {
    for (const s of r.scores) {
      if (!map[s.playerName]) map[s.playerName] = { team: s.team, total: 0 }
      map[s.playerName].total += s.rawPts
    }
  }
  return map
}

// Derived: best single-round chips per player
export function calcBestRound(results: RoundResult[]): Record<string, { team: string; best: number }> {
  const map: Record<string, { team: string; best: number }> = {}
  for (const r of results) {
    for (const s of r.scores) {
      if (!map[s.playerName] || s.rawPts > map[s.playerName].best) {
        map[s.playerName] = { team: s.team, best: s.rawPts }
      }
    }
  }
  return map
}

// Derived: calculate winner for a specific match day (R1 + R2 combined)
// Returns the team name with highest total points, or null if not both rounds submitted
export function calcMatchDayWinner(
  results: RoundResult[],
  matchId: string
): { winner: string | null; teamTotals: Record<string, number>; isComplete: boolean } {
  const r1 = results.find((r) => r.matchId === matchId && r.round === 1)
  const r2 = results.find((r) => r.matchId === matchId && r.round === 2)

  const teamTotals: Record<string, number> = {}

  // Sum up team scores from both rounds
  for (const round of [r1, r2]) {
    if (!round) continue
    for (const s of round.scores) {
      if (!teamTotals[s.team]) teamTotals[s.team] = 0
      teamTotals[s.team] += s.rawPts
    }
  }

  const isComplete = !!(r1 && r2)
  if (!isComplete || Object.keys(teamTotals).length === 0) {
    return { winner: null, teamTotals, isComplete }
  }

  // Find team with highest total
  let winner: string | null = null
  let maxPts = -Infinity
  for (const [team, pts] of Object.entries(teamTotals)) {
    if (pts > maxPts) {
      maxPts = pts
      winner = team
    }
  }

  return { winner, teamTotals, isComplete }
}

// Derived: team standings from all results
export interface TeamStanding {
  name: string
  points: number
  gamesPlayed: number
  firstPlaces: number
  secondPlaces: number
  thirdPlaces: number
  fourthPlaces: number
  highestGame: number
}

export function calcTeamStandings(results: RoundResult[]): Record<string, TeamStanding> {
  const map: Record<string, TeamStanding> = {}

  for (const r of results) {
    // Sort players by rawPts desc to determine placement
    const sorted = [...r.scores].sort((a, b) => b.rawPts - a.rawPts)

    sorted.forEach((s, idx) => {
      if (!map[s.team]) {
        map[s.team] = { name: s.team, points: 0, gamesPlayed: 0, firstPlaces: 0, secondPlaces: 0, thirdPlaces: 0, fourthPlaces: 0, highestGame: 0 }
      }
      map[s.team].points += s.rawPts
      map[s.team].gamesPlayed += 1
      map[s.team].highestGame = Math.max(map[s.team].highestGame, s.rawPts)
      if (idx === 0) map[s.team].firstPlaces += 1
      else if (idx === 1) map[s.team].secondPlaces += 1
      else if (idx === 2) map[s.team].thirdPlaces += 1
      else map[s.team].fourthPlaces += 1
    })
  }

  return map
}
