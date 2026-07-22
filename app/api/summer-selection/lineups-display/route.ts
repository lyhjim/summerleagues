import { query } from "@/lib/db/neon"

export async function GET() {
  try {
    // Fetch all submitted lineups
    const result = await query(
      `SELECT team_name, game_number, player_1, player_2
       FROM summer_team_lineups
       ORDER BY team_name, game_number`
    )

    // Transform the data into a more usable format
    // Key format: "TeamName_GameNumber_PlayerNum"
    const lineups: Record<string, { player1: string; player2: string }> = {}

    result.rows.forEach((row: any) => {
      const { team_name, game_number, player_1, player_2 } = row
      // Store both player 1 and 2 together for this game
      lineups[`${team_name}_${game_number}_1`] = {
        player1: player_1,
        player2: player_2,
      }
      lineups[`${team_name}_${game_number}_2`] = {
        player1: player_1,
        player2: player_2,
      }
    })

    return Response.json(lineups, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching lineups:", error)
    return Response.json({})
  }
}
