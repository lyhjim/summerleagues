import { neon } from "@neondatabase/serverless"
import { summerSchedule } from "@/lib/summer-selection/schedule"
import { calculateFinalPoints, getRankings } from "@/lib/summer-selection/score-calculator"

const sql = neon(process.env.DATABASE_URL as string)

export async function GET() {
  try {
    // Fetch all game scores for finals (Games 37-40)
    const gamesResult = await sql`
      SELECT game_number, e_score, s_score, w_score, n_score
      FROM game_scores
      WHERE game_number >= 37 AND game_number <= 40
      ORDER BY game_number
    `

    // Fetch player lineups for finals
    const lineupsResult = await sql`
      SELECT team_name, game_number, player_1
      FROM summer_team_lineups
      WHERE game_number >= 37 AND game_number <= 40
    `

    const lineupsMap: Record<string, string> = {}
    lineupsResult.forEach((row: any) => {
      const key = `${row.game_number}_${row.team_name}`
      lineupsMap[key] = row.player_1 || ""
    })

    // Fetch penalties for finals
    const penaltiesResult = await sql`
      SELECT game_number, team_name, player_name, penalty_score
      FROM player_penalties
      WHERE game_number >= 37 AND game_number <= 40
    `

    const penaltiesMap: Record<string, number> = {}
    penaltiesResult.forEach((row: any) => {
      const key = `${row.game_number}_${row.team_name}_${row.player_name}`
      penaltiesMap[key] = row.penalty_score || 0
    })

    // Use in-memory schedule for finals games
    const schedule = summerSchedule
      .filter((game) => game.gameNumber >= 37 && game.gameNumber <= 40)
      .flatMap((game) =>
        game.teams.map((team, idx) => {
          const playerName = lineupsMap[`${game.gameNumber}_${team.teamName}`]
          return {
            game_number: game.gameNumber,
            seat: ["東", "南", "西", "北"][idx],
            team_name: team.teamName,
            player_name: playerName || "",
          }
        })
      )

    // Calculate standings for each game
    const teamScores: Record<
      string,
      { points: number; first: number; second: number; third: number; fourth: number; games: number }
    > = {}
    const playerScores: Record<
      string,
      {
        teamName: string
        points: number
        first: number
        second: number
        third: number
        fourth: number
        games: number
      }
    > = {}

    // Initialize teams
    const finalsTeams = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]
    finalsTeams.forEach((team) => {
      teamScores[team] = { points: 0, first: 0, second: 0, third: 0, fourth: 0, games: 0 }
    })

    // Process each game
    gamesResult.forEach((game: any) => {
      const gameNum = game.game_number
      const scores = {
        e: game.e_score,
        s: game.s_score,
        w: game.w_score,
        n: game.n_score,
      }

      const rankings = getRankings(scores)
      const winds = ["E", "S", "W", "N"]
      const windToSeat = { E: "東", S: "南", W: "西", N: "北" }

      // Get game schedule
      const gameSchedule = schedule.filter((s: any) => s.game_number === gameNum)

      winds.forEach((wind, idx) => {
        const rank = rankings[wind]
        const rawScore = scores[wind.toLowerCase() as keyof typeof scores]
        let points = calculateFinalPoints(rawScore, rank)
        const seat = windToSeat[wind as keyof typeof windToSeat]

        // Find team for this wind
        const scheduleEntry = gameSchedule.find((s: any) => s.seat === seat)
        if (scheduleEntry) {
          const teamName = scheduleEntry.team_name
          const playerName = scheduleEntry.player_name

          // Apply player penalty if exists
          const penaltyKey = `${gameNum}_${teamName}_${playerName}`
          const penalty = penaltiesMap[penaltyKey] || 0
          points += penalty

          if (teamScores[teamName]) {
            teamScores[teamName].points += points
            teamScores[teamName].games += 1
            if (rank === 1) teamScores[teamName].first += 1
            else if (rank === 2) teamScores[teamName].second += 1
            else if (rank === 3) teamScores[teamName].third += 1
            else teamScores[teamName].fourth += 1
          }

          if (playerName) {
            if (!playerScores[playerName]) {
              playerScores[playerName] = {
                teamName,
                points: 0,
                first: 0,
                second: 0,
                third: 0,
                fourth: 0,
                games: 0,
              }
            }
            playerScores[playerName].points += points
            playerScores[playerName].games += 1
            if (rank === 1) playerScores[playerName].first += 1
            else if (rank === 2) playerScores[playerName].second += 1
            else if (rank === 3) playerScores[playerName].third += 1
            else playerScores[playerName].fourth += 1
          }
        }
      })
    })

    // Sort teams and players
    const sortFn = (a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.first !== a.first) return b.first - a.first
      return a.games - b.games
    }

    const teams = finalsTeams
      .map((name) => ({
        teamName: name,
        ...teamScores[name],
      }))
      .sort(sortFn)

    const players = Object.entries(playerScores)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort(sortFn)

    return Response.json({ teams, players })
  } catch (error) {
    console.error("[v0] Error calculating finals standings:", error)
    return Response.json({ teams: [], players: [], error: "Failed to calculate standings" }, { status: 500 })
  }
}
